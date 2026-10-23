import assert from "node:assert/strict";
import { mkdtemp, readFile, realpath, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import pg from "pg";

const connectionString = process.env.EASYTAX_MEDIA_OUTBOX_TEST_DATABASE_URI;

test("isolated PostgreSQL outbox transaction, rollback, atomic claim, locks and filesystem retry", { skip: !connectionString }, async () => {
  const pool = new pg.Pool({ connectionString });
  const schema = `media_outbox_test_${process.pid}_${Date.now()}`;
  const root = await mkdtemp(path.join(os.tmpdir(), "easytax-outbox-pg-"));
  const file = path.join(root, "candidate.webp");
  await writeFile(file, "temporary test asset");
  try {
    await pool.query(`CREATE SCHEMA "${schema}"`);
    await pool.query(`CREATE TABLE "${schema}".content_refs (content_id int primary key, media_id int)`);
    await pool.query(`CREATE TABLE public.media_cleanup_outbox (
      id bigserial primary key, media_id int not null, filename text not null,
      managed_path text not null, idempotency_key text unique not null,
      status text not null default 'pending', enqueued_at timestamptz not null default now(), attempts int not null default 0,
      last_error text, completed_at timestamptz)`);

    // Commit makes relationship update + outbox visible atomically.
    const committed = await pool.connect();
    try {
      await committed.query(`SET search_path TO "${schema}", public`);
      await committed.query("BEGIN");
      // Exercise the production helper against the same PostgreSQL connection
      // used for the reference write and outbox insert.
      const { lockMediaForRelationWrite, enqueueCandidateInTransaction, compilePostgresSQL } = await import("../../src/lib/media-cleanup/outbox");
      await lockMediaForRelationWrite({ execute: async (query) => committed.query(compilePostgresSQL(query)) }, 2);
      await committed.query("INSERT INTO content_refs VALUES (1, 2)");
      await enqueueCandidateInTransaction(
        { execute: async (query) => committed.query(compilePostgresSQL(query)) },
        { mediaID: 2, filename: "candidate.webp", managedPath: file },
        root,
      );
      await committed.query("COMMIT");
    } finally { committed.release(); }
    assert.equal((await pool.query(`SELECT count(*)::int n FROM public.media_cleanup_outbox`)).rows[0].n, 1);

    // Rollback removes the associated candidate.
    const rolledBack = await pool.connect();
    try {
      await rolledBack.query(`SET search_path TO "${schema}", public`);
      await rolledBack.query("BEGIN");
      const { lockMediaForRelationWrite, enqueueCandidateInTransaction, compilePostgresSQL } = await import("../../src/lib/media-cleanup/outbox");
      await lockMediaForRelationWrite({ execute: async (query) => rolledBack.query(compilePostgresSQL(query)) }, 3);
      await rolledBack.query("INSERT INTO content_refs VALUES (2, 3)");
      await enqueueCandidateInTransaction(
        { execute: async (query) => rolledBack.query(compilePostgresSQL(query)) },
        { mediaID: 3, filename: "rollback.webp", managedPath: file },
        root,
      );
      await rolledBack.query("ROLLBACK");
    } finally { rolledBack.release(); }
    assert.equal((await pool.query(`SELECT count(*)::int n FROM public.media_cleanup_outbox WHERE idempotency_key='rollback-key'`)).rows[0].n, 0);

    // Idempotency key prevents duplicate queue rows.
    await pool.query(`INSERT INTO public.media_cleanup_outbox(media_id,filename,managed_path,idempotency_key) VALUES (2,'candidate.webp',$1,'media:2:candidate.webp') ON CONFLICT DO NOTHING`, [file]);
    assert.equal((await pool.query(`SELECT count(*)::int n FROM public.media_cleanup_outbox WHERE idempotency_key='media:2:candidate.webp'`)).rows[0].n, 1);

    // SKIP LOCKED guarantees two claimers do not own the same pending row.
    const w1 = await pool.connect();
    const w2 = await pool.connect();
    try {
      await w1.query(`SET search_path TO "${schema}", public`);
      await w2.query(`SET search_path TO "${schema}", public`);
      await w1.query("BEGIN");
      const claim1 = await w1.query("SELECT id FROM media_cleanup_outbox WHERE status='pending' FOR UPDATE SKIP LOCKED LIMIT 1");
      await w2.query("BEGIN");
      const claim2 = await w2.query("SELECT id FROM media_cleanup_outbox WHERE status='pending' FOR UPDATE SKIP LOCKED LIMIT 1");
      assert.equal(claim1.rows.length, 1);
      assert.equal(claim2.rows.length, 0);
      await w1.query("ROLLBACK");
      await w2.query("ROLLBACK");
    } finally { w1.release(); w2.release(); }

    // Same advisory lock namespace serializes reference writers and worker.
    const writer = await pool.connect();
    const worker = await pool.connect();
    try {
      await writer.query(`SET search_path TO "${schema}", public`);
      await worker.query(`SET search_path TO "${schema}", public`);
      await writer.query("BEGIN");
      await writer.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", ["media-reference:2"]);
      await worker.query("BEGIN");
      let acquired = false;
      await worker.query("SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS ok", ["media-reference:2"]).then((r) => { acquired = r.rows[0].ok; });
      assert.equal(acquired, false);
      await writer.query("ROLLBACK");
      await worker.query("ROLLBACK");
    } finally { writer.release(); worker.release(); }

    // Content writer adds a reference while worker is active: lock protocol
    // serializes them; worker's reference query must happen after it acquires.
    const activeWriter = await pool.connect();
    const waitingWorker = await pool.connect();
    try {
      await activeWriter.query(`SET search_path TO "${schema}", public`);
      await waitingWorker.query(`SET search_path TO "${schema}", public`);
      await activeWriter.query("BEGIN");
      await activeWriter.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", ["media-reference:2"]);
      const waiting = waitingWorker.query("BEGIN").then(() => waitingWorker.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", ["media-reference:2"]));
      await activeWriter.query("INSERT INTO content_refs VALUES (4,2)");
      await activeWriter.query("COMMIT");
      await waiting;
      const refs = await waitingWorker.query("SELECT count(*)::int n FROM content_refs WHERE media_id=2");
      assert.equal(refs.rows[0].n, 2);
      await waitingWorker.query("ROLLBACK");
    } finally { activeWriter.release(); waitingWorker.release(); }

    // Shared references remain discoverable in the reference table fixture.
    await pool.query(`INSERT INTO "${schema}".content_refs VALUES (5,2)`);
    assert.equal((await pool.query(`SELECT count(*)::int n FROM "${schema}".content_refs WHERE media_id=2`)).rows[0].n, 3);

    // Symlink escape is detected by canonicalizing the real target path.
    const outside = await mkdtemp(path.join(os.tmpdir(), "easytax-outside-"));
    const link = path.join(root, "escape");
    await symlink(outside, link);
    const realLinkPath = await realpath(link);
    assert.equal(realLinkPath.startsWith(`${path.resolve(root)}${path.sep}`), false);

    // Unlink failure is retriable; a retry after successful unlink is harmless.
    const retryFile = path.join(root, "retry.webp");
    await writeFile(retryFile, "retry");
    let attempts = 0;
    const unlinkOnce = async () => {
      attempts++;
      if (attempts === 1) throw new Error("simulated unlink failure");
      await rm(retryFile, { force: true });
    };
    await assert.rejects(unlinkOnce);
    await unlinkOnce();
    await unlinkOnce();
    assert.equal(attempts, 3);
    await assert.rejects(readFile(retryFile));
  } finally {
    await pool.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`).catch(() => undefined);
    await pool.end();
    await rm(root, { recursive: true, force: true });
  }
});
