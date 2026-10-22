import { sql } from "@payloadcms/db-postgres";
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";

/**
 * Model switch requires a clean article-only vector table. Old 1536-d vectors
 * cannot be reused; re-embedding is a separate, explicitly approved operation.
 * This migration intentionally fails if the table is not the expected legacy
 * shape rather than silently dropping or transforming user data.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$
    BEGIN
      IF to_regclass('public.artikel_embeddings') IS NULL THEN
        RAISE EXCEPTION 'Expected legacy artikel_embeddings table is missing';
      END IF;
      -- information_schema.columns does not expose atttypmod. Read the
      -- attribute directly and let format_type include the pgvector dimension.
      IF NOT EXISTS (
        SELECT 1
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = 'artikel_embeddings'
          AND a.attname = 'embedding'
          AND NOT a.attisdropped
          AND format_type(a.atttypid, a.atttypmod) = 'vector(1536)'
      ) THEN
        RAISE EXCEPTION 'artikel_embeddings is not confirmed vector(1536); manual review required';
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public' AND table_name = 'artikel_embeddings'
          AND constraint_name = 'fk_artikel' AND constraint_type = 'FOREIGN KEY'
      ) THEN
        RAISE EXCEPTION 'Expected artikel foreign key is missing; manual review required';
      END IF;
    END $$
  `);

  await db.execute(sql`DROP INDEX IF EXISTS idx_artikel_embeddings_vector`);
  // All existing vectors belong to the old embedding space and are unusable.
  // This deliberately clears only the derived article vector index; approved
  // re-embedding must repopulate it after the migration.
  await db.execute(sql`DELETE FROM artikel_embeddings`);
  await db.execute(sql`ALTER TABLE artikel_embeddings ALTER COLUMN embedding TYPE vector(1024)`);
  await db.execute(sql`
    CREATE INDEX idx_artikel_embeddings_vector
    ON artikel_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Vectors created by the local model cannot be converted back to OpenAI space.
  // Refuse a destructive rollback; restore from a separately prepared reindex.
  await db.execute(sql`DO $$ BEGIN RAISE EXCEPTION 'Rollback requires restoring 1536-d OpenAI embeddings from a verified backup'; END $$`);
}
