import { sql } from "@payloadcms/db-postgres";
import type { MigrateDownArgs, MigrateUpArgs } from "@payloadcms/db-postgres";

/** Draft only: do not apply to an active/project database without approval. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`CREATE TABLE "media_cleanup_outbox" (
    "id" bigserial PRIMARY KEY,
    "media_id" integer NOT NULL,
    "filename" varchar NOT NULL,
    "managed_path" text NOT NULL,
    "idempotency_key" varchar NOT NULL,
    "status" varchar NOT NULL DEFAULT 'pending',
    "enqueued_at" timestamptz NOT NULL DEFAULT now(),
    "attempts" integer NOT NULL DEFAULT 0,
    "available_at" timestamptz NOT NULL DEFAULT now(),
    "locked_at" timestamptz,
    "last_error" varchar,
    "completed_at" timestamptz,
    CONSTRAINT "media_cleanup_outbox_status_check" CHECK ("status" IN ('pending', 'processing', 'retained', 'done', 'failed')),
    CONSTRAINT "media_cleanup_outbox_idempotency_key_unique" UNIQUE ("idempotency_key")
  );
  CREATE INDEX "media_cleanup_outbox_claim_idx" ON "media_cleanup_outbox" ("status", "available_at", "id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "media_cleanup_outbox";`);
}
