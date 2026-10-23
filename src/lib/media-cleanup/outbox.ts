import path from "node:path";
import { sql } from "@payloadcms/db-postgres";
import { PgDialect } from "drizzle-orm/pg-core";

/** Minimal Drizzle/pg-compatible executor bound to one active transaction. */
export type TransactionExecutor = {
  execute: (query: unknown) => Promise<unknown>;
};

/** Convert the exact Drizzle SQL object for a node-postgres isolated test executor. */
export function compilePostgresSQL(query: unknown): { text: string; values: unknown[] } {
  const result = new PgDialect().sqlToQuery(query as Parameters<PgDialect["sqlToQuery"]>[0]);
  return { text: result.sql, values: result.params };
}

export type CleanupCandidate = {
  mediaID: number;
  filename: string;
  managedPath: string;
};

/**
 * Record a candidate in the caller's Payload transaction. This is safe only
 * when `tx` is the live session for req.transactionID. Never pass pool/root DB.
 */
export async function enqueueCandidateInTransaction(
  tx: TransactionExecutor,
  candidate: CleanupCandidate,
  mediaRoot: string,
): Promise<void> {
  if (!Number.isSafeInteger(candidate.mediaID) || candidate.mediaID <= 0) throw new Error("Invalid media ID");
  if (!candidate.filename || path.basename(candidate.filename) !== candidate.filename) throw new Error("Invalid managed filename");
  const root = path.resolve(mediaRoot);
  const resolved = path.resolve(candidate.managedPath);
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error("Managed path escapes media root");
  const txResult = tx as TransactionExecutor & { execute: (query: unknown) => Promise<unknown> };

  await txResult.execute(sql`INSERT INTO public.media_cleanup_outbox
    (media_id, filename, managed_path, idempotency_key, status, enqueued_at, attempts)
    VALUES (${candidate.mediaID}, ${candidate.filename}, ${resolved}, ${`media:${candidate.mediaID}:${candidate.filename}`}, 'pending', now(), 0)
    ON CONFLICT (idempotency_key) DO NOTHING`);
}

/** Per-media transaction-scoped advisory lock; all relation writers must call this before changing references. */
export async function lockMediaForRelationWrite(tx: TransactionExecutor, mediaID: number): Promise<void> {
  if (!Number.isSafeInteger(mediaID) || mediaID <= 0) throw new Error("Invalid media ID");
  await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${"media-reference:" + mediaID}, 0))`);
}

/** Extract the transaction-bound Drizzle session used by Payload 3.91/Postgres. */
export async function payloadTransactionExecutor(req: {
  transactionID?: number | string | Promise<number | string>;
  payload: { db: unknown };
}): Promise<TransactionExecutor> {
  const id = req.transactionID == null ? undefined : String(await req.transactionID);
  const sessions = (req.payload.db as { sessions?: Record<string, { db?: TransactionExecutor }> }).sessions;
  const tx = id ? sessions?.[id]?.db : undefined;
  if (!tx) throw new Error("No active Payload transaction session; refusing outbox or relation write");
  return tx;
}
