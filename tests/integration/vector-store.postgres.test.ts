import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";
import { Client } from "pg";
import {
  cariChunkRelevan,
  hapusEmbeddingArtikel,
  simpanEmbeddingArtikel,
  type ChunkEmbeddingRecord,
} from "@/rag/vector-store";

const databaseUrl = process.env.TEST_DATABASE_URL;
const expectedDatabase = "easytax_semantic_test";
const dialect = new PgDialect();
let client: Client | undefined;

function assertIsolatedTarget(rawUrl: string): URL {
  const url = new URL(rawUrl);
  const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
  if (!loopbackHosts.has(url.hostname.replace(/^\[|\]$/g, "")) || decodeURIComponent(url.pathname.slice(1)) !== expectedDatabase) {
    throw new Error(`Refusing integration test target; require loopback host and database ${expectedDatabase}`);
  }
  if (url.searchParams.has("sslmode") && url.searchParams.get("sslmode") !== "disable") {
    throw new Error("Refusing integration test target with remote/TLS connection configuration");
  }
  return url;
}

function adapter(connection: Client) {
  const execute = async (query: unknown) => {
    const compiled = dialect.sqlToQuery(query as Parameters<PgDialect["sqlToQuery"]>[0]);
    const result = await connection.query(compiled.sql, compiled.params);
    return result;
  };
  return {
    drizzle: {
      execute,
      transaction: async <T>(callback: (tx: { execute: typeof execute }) => Promise<T>) => {
        await connection.query("BEGIN");
        try {
          const result = await callback({ execute });
          await connection.query("COMMIT");
          return result;
        } catch (error) {
          await connection.query("ROLLBACK");
          throw error;
        }
      },
    },
  };
}

describe("PostgreSQL/pgvector vector-store integration (isolated DB only)", { skip: !databaseUrl }, () => {
  let db: ReturnType<typeof adapter>;
  const vectorA = Array.from({ length: 1024 }, (_, index) => index === 0 ? 1 : 0);
  // Mirip vectorA (cosine ≈ 0,894) supaya threshold longgar 0,4 benar-benar
  // mengembalikan dua artikel, sementara threshold ketat 0,9 tetap satu.
  const vectorB = Array.from({ length: 1024 }, (_, index) => {
    if (index === 0) return 1;
    if (index === 1) return 0.5;
    return 0;
  });
  const record = (artikelId: number, embedding: number[], suffix = "a", overrides: Partial<ChunkEmbeddingRecord> = {}): ChunkEmbeddingRecord => ({
    artikelId,
    slug: `fixture-${artikelId}`,
    judul: `Fixture ${artikelId}`,
    chunkIndex: 0,
    teks: `Konten fixture ${suffix}`,
    embedding,
    contentHash: `hash-${suffix}`,
    ...overrides,
  });

  before(async () => {
    const url = assertIsolatedTarget(databaseUrl!);
    client = new Client({ connectionString: url.toString(), ssl: false });
    await client.connect();
    db = adapter(client);

    const extensions = await client.query("SELECT 1 FROM pg_extension WHERE extname = 'vector'");
    if (extensions.rowCount !== 1) throw new Error("pgvector must already be installed; this test will not create extensions");

    // Session-local tables disappear when the test connection closes. No
    // persistent application tables, migrations, or ledger are touched.
    await client.query(`
      CREATE TEMP TABLE artikel (
        id integer PRIMARY KEY,
        slug text NOT NULL,
        judul text NOT NULL,
        ringkasan text,
        kategori_id integer,
        _status text NOT NULL
      );
      CREATE TEMP TABLE kategori (id integer PRIMARY KEY, nama text NOT NULL);
      CREATE TEMP TABLE artikel_embeddings (
        id serial PRIMARY KEY,
        artikel_id integer NOT NULL,
        slug varchar(255) NOT NULL,
        judul text NOT NULL,
        chunk_index integer NOT NULL DEFAULT 0,
        teks text NOT NULL,
        embedding vector(1024) NOT NULL,
        content_hash varchar(16) NOT NULL,
        indexed_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_artikel FOREIGN KEY (artikel_id) REFERENCES artikel(id) ON DELETE CASCADE
      );
      INSERT INTO kategori VALUES (1, 'Pajak');
      INSERT INTO artikel VALUES
        (101, 'published-a', 'Published A', 'A', 1, 'published'),
        (102, 'published-b', 'Published B', 'B', 1, 'published'),
        (103, 'draft-c', 'Draft C', 'C', 1, 'draft');
    `);
  });

  after(async () => {
    await client?.end();
  });

  it("stores and replaces embeddings atomically; rejects invalid vector dimensions", async () => {
    await simpanEmbeddingArtikel(db, 101, [record(101, vectorA, "old")]);
    await simpanEmbeddingArtikel(db, 101, [record(101, vectorB, "new")]);
    const rows = await client!.query("SELECT teks, content_hash, vector_dims(embedding) AS dimensions FROM artikel_embeddings WHERE artikel_id = 101");
    assert.equal(rows.rowCount, 1);
    assert.equal(rows.rows[0].teks, "Konten fixture new");
    assert.equal(rows.rows[0].content_hash, "hash-new");
    assert.equal(rows.rows[0].dimensions, 1024);
    await assert.rejects(() => simpanEmbeddingArtikel(db, 101, [record(101, [1], "bad")]), /invalid dimensions/);
    assert.equal((await client!.query("SELECT count(*)::int AS n FROM artikel_embeddings WHERE artikel_id = 101")).rows[0].n, 1);
  });

  it("retrieves cosine matches above threshold, only published rows, and respects limit", async () => {
    await simpanEmbeddingArtikel(db, 101, [record(101, vectorA, "a")]);
    await simpanEmbeddingArtikel(db, 102, [record(102, vectorB, "b")]);
    await simpanEmbeddingArtikel(db, 103, [record(103, vectorA, "draft")]);

    const exact = await cariChunkRelevan(db, vectorA, 1, 0.9);
    assert.equal(exact.length, 1);
    assert.equal(exact[0].artikelId, 101);
    assert.ok(Number(exact[0].similarity) >= 0.9);
    const strict = await cariChunkRelevan(db, vectorA, 10, 0.9);
    assert.deepEqual(strict.map((row) => row.artikelId), [101]);
    const loose = await cariChunkRelevan(db, vectorA, 10, 0.4);
    assert.deepEqual(new Set(loose.map((row) => row.artikelId)), new Set([101, 102]));
    assert.ok(!loose.some((row) => row.artikelId === 103));
  });

  it("rolls back a failed replacement and clears embeddings for deletion/unpublish paths", async () => {
    await simpanEmbeddingArtikel(db, 101, [record(101, vectorA, "keep")]);
    await assert.rejects(() => simpanEmbeddingArtikel(db, 101, [
      record(101, vectorB, "replacement"),
      record(101, vectorA, "rollback", { slug: "x".repeat(300) }),
    ]));
    assert.equal((await client!.query("SELECT content_hash FROM artikel_embeddings WHERE artikel_id = 101")).rows[0].content_hash, "hash-keep");

    // Unpublish is the application lifecycle path: remove the article from the
    // published result set, then invoke the same vector-store delete operation.
    await client!.query("UPDATE artikel SET _status = 'draft' WHERE id = 101");
    await hapusEmbeddingArtikel(db, 101);
    assert.equal((await client!.query("SELECT count(*)::int AS n FROM artikel_embeddings WHERE artikel_id = 101")).rows[0].n, 0);

    // Article deletion is also protected by the schema FK's ON DELETE CASCADE.
    await simpanEmbeddingArtikel(db, 102, [record(102, vectorA, "delete")]);
    await client!.query("DELETE FROM artikel WHERE id = 102");
    assert.equal((await client!.query("SELECT count(*)::int AS n FROM artikel_embeddings WHERE artikel_id = 102")).rows[0].n, 0);
  });
});
