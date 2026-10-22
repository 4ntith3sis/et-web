import { sql } from "@payloadcms/db-postgres";
import type { MigrateUpArgs, MigrateDownArgs } from "@payloadcms/db-postgres";

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Aktifkan pgvector extension
  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector`);

  // Buat tabel embedding khusus artikel
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS artikel_embeddings (
      id SERIAL PRIMARY KEY,
      artikel_id INTEGER NOT NULL,
      slug VARCHAR(255) NOT NULL,
      judul TEXT NOT NULL,
      chunk_index INTEGER NOT NULL DEFAULT 0,
      teks TEXT NOT NULL,
      embedding vector(1536) NOT NULL,
      content_hash VARCHAR(16) NOT NULL,
      indexed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

      CONSTRAINT fk_artikel
        FOREIGN KEY (artikel_id)
        REFERENCES artikel(id)
        ON DELETE CASCADE
    )
  `);

  // Indeks untuk pencarian vektor (IVFFlat — cocok untuk dataset kecil-menengah)
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_artikel_embeddings_vector
    ON artikel_embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 10)
  `);

  // Indeks untuk lookup per artikel
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_artikel_embeddings_artikel_id
    ON artikel_embeddings (artikel_id)
  `);

  // Indeks untuk content hash lookup
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_artikel_embeddings_content_hash
    ON artikel_embeddings (artikel_id, content_hash)
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS artikel_embeddings CASCADE`);
  // Jangan hapus extension vector karena mungkin dipakai oleh fitur lain
}
