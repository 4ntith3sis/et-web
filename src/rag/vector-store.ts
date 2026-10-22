/**
 * Vector store menggunakan PostgreSQL + pgvector.
 *
 * Tabel `artikel_embeddings` menyimpan chunk embedding khusus artikel.
 * Tidak menyimpan embedding untuk collection lain.
 */

import { sql } from "drizzle-orm";
import { RAG_CONFIG } from "./config";

/**
 * Interface untuk raw SQL query via Payload's drizzle adapter.
 */
interface DrizzleAdapter {
  drizzle: {
    execute: (query: unknown) => Promise<unknown>;
    transaction: <T>(callback: (tx: { execute: (query: unknown) => Promise<unknown> }) => Promise<T>) => Promise<T>;
  };
}

export interface ChunkEmbeddingRecord {
  artikelId: number;
  slug: string;
  judul: string;
  chunkIndex: number;
  teks: string;
  embedding: number[];
  contentHash: string;
}

export interface HasilRetrieval {
  artikelId: number;
  slug: string;
  judul: string;
  ringkasan: string;
  kategori: string;
  similarity: number;
}

export function validasiEmbedding(vector: number[]): boolean {
  return vector.length === RAG_CONFIG.embeddingDimension && vector.every(Number.isFinite);
}

/**
 * Drizzle `db.execute(sql)` mengembalikan `QueryResult` (memiliki `.rows`),
 * bukan array baris. Normalisasi ini mencegah hasil retrieval menjadi objek
 * yang tidak iterable ketika dipakai oleh route handler.
 */
function ambilBaris<T>(hasil: unknown): T[] {
  if (Array.isArray(hasil)) return hasil as T[];
  if (hasil && typeof hasil === "object" && Array.isArray((hasil as { rows?: unknown }).rows)) {
    return (hasil as { rows: T[] }).rows;
  }
  throw new Error("Unexpected database result shape: expected rows array");
}

export function lolosThreshold(similarity: number, threshold = RAG_CONFIG.similarityThreshold): boolean {
  return Number.isFinite(similarity) && Number.isFinite(threshold) && threshold >= 0 && threshold <= 1 && similarity >= threshold;
}

/**
 * Ganti chunk embeddings satu artikel dalam satu transaksi.
 */
export async function simpanEmbeddingArtikel(
  db: DrizzleAdapter,
  artikelId: number,
  chunks: ChunkEmbeddingRecord[],
): Promise<void> {
  if (!Number.isSafeInteger(artikelId) || artikelId <= 0) {
    throw new Error("Article ID must be a positive safe integer");
  }
  // Validate the entire replacement set before deleting existing rows. This
  // also prevents a malformed caller from writing chunks under another ID.
  for (const chunk of chunks) {
    if (chunk.artikelId !== artikelId) {
      throw new Error("Article embedding record does not match target article ID");
    }
    if (!Number.isInteger(chunk.chunkIndex) || chunk.chunkIndex < 0) {
      throw new Error("Article embedding chunk index must be a non-negative integer");
    }
    if (!chunk.slug.trim() || !chunk.judul.trim() || !chunk.teks.trim() || !chunk.contentHash.trim()) {
      throw new Error("Article embedding metadata must not be empty");
    }
    if (chunk.contentHash.length > 16) {
      throw new Error("Article embedding content hash must be at most 16 characters");
    }
    if (!validasiEmbedding(chunk.embedding)) {
      throw new Error("Article embedding has invalid dimensions or values");
    }
  }

  await db.drizzle.transaction(async (tx) => {
    // Serialize concurrent reindex attempts for the same article.
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext('artikel_embeddings'), ${artikelId})`);
    await tx.execute(sql`DELETE FROM artikel_embeddings WHERE artikel_id = ${artikelId}`);
    for (const chunk of chunks) {
      const embeddingStr = `[${chunk.embedding.join(",")}]`;
      await tx.execute(sql`
        INSERT INTO artikel_embeddings
          (artikel_id, slug, judul, chunk_index, teks, embedding, content_hash, indexed_at)
        VALUES
          (${artikelId},
           ${chunk.slug},
           ${chunk.judul},
           ${chunk.chunkIndex},
           ${chunk.teks},
           ${embeddingStr}::vector,
           ${chunk.contentHash},
           NOW())
      `);
    }
  });
}

/**
 * Hapus semua embedding untuk satu artikel.
 */
export async function hapusEmbeddingArtikel(
  db: DrizzleAdapter,
  artikelId: number,
): Promise<void> {
  await db.drizzle.execute(
    sql`DELETE FROM artikel_embeddings WHERE artikel_id = ${artikelId}`,
  );
}

/**
 * Cari chunk yang relevan berdasarkan embedding query.
 * Hanya mengembalikan chunk dari artikel published (join ke tabel artikel).
 */
export async function cariChunkRelevan(
  db: DrizzleAdapter,
  queryEmbedding: number[],
  limit: number = RAG_CONFIG.retrievalLimit,
  threshold: number = RAG_CONFIG.similarityThreshold,
): Promise<HasilRetrieval[]> {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("Retrieval limit must be between 1 and 50");
  }
  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error("Similarity threshold must be between 0 and 1");
  }
  if (!validasiEmbedding(queryEmbedding)) {
    throw new Error("Query embedding has invalid dimensions or values");
  }
  const embeddingStr = `[${queryEmbedding.join(",")}]`;

  const rows = ambilBaris<HasilRetrieval>(await db.drizzle.execute(
    sql`
      SELECT
        ae.artikel_id AS "artikelId",
        a.slug,
        a.judul,
        a.ringkasan,
        k.nama AS kategori,
        MAX(1 - (ae.embedding <=> ${embeddingStr}::vector)) AS similarity
      FROM artikel_embeddings ae
      INNER JOIN artikel a ON a.id = ae.artikel_id
      LEFT JOIN kategori k ON k.id = a.kategori_id
      WHERE a._status = 'published'
        AND 1 - (ae.embedding <=> ${embeddingStr}::vector) >= ${threshold}
      GROUP BY ae.artikel_id, a.slug, a.judul, a.ringkasan, k.nama
      ORDER BY similarity DESC
      LIMIT ${limit}
    `,
  ));

  return rows;
}

/**
 * Periksa content hash untuk mendeteksi apakah artikel sudah berubah.
 */
export async function ambilContentHash(
  db: DrizzleAdapter,
  artikelId: number,
): Promise<string | null> {
  const rows = ambilBaris<{ content_hash: string }>(await db.drizzle.execute(
    sql`SELECT content_hash FROM artikel_embeddings WHERE artikel_id = ${artikelId} LIMIT 1`,
  ));

  return rows.length > 0 ? rows[0].content_hash : null;
}

/**
 * Hitung jumlah chunk embedding yang ada.
 */
export async function hitungEmbedding(
  db: DrizzleAdapter,
): Promise<number> {
  const rows = ambilBaris<{ total: number }>(await db.drizzle.execute(
    sql`SELECT count(*)::int AS total FROM artikel_embeddings`,
  ));

  return rows[0]?.total ?? 0;
}
