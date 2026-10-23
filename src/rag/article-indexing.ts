/**
 * Service indexing artikel — mengelola pembuatan dan pembaruan embedding.
 *
 * Bertanggung jawab untuk:
 * - Mengekstrak teks dari artikel published
 * - Memecah menjadi chunk
 * - Membuat embedding
 * - Menyimpan ke vector store
 * - Menghapus embedding saat artikel di-unpublish/dihapus
 *
 * Proses embedding berjalan asinkron (tidak memblokir penyimpanan artikel).
 */

import { RAG_CONFIG } from "./config";
import { chunkTeksArtikel } from "./chunker";
import { buatEmbeddingBatch } from "./embedding-provider";
import { ekstrakTeksArtikel } from "./text-extractor";
import type { ArtikelUntukEkstraksi } from "./text-extractor";
import { tentukanAksiLifecycleArtikel } from "./article-lifecycle";
import {
  simpanEmbeddingArtikel,
  hapusEmbeddingArtikel,
  ambilContentHash,
  type ChunkEmbeddingRecord,
} from "./vector-store";

export interface HasilIndexing {
  artikelId: number;
  slug: string;
  status: "indexed" | "skipped" | "removed" | "error";
  chunks?: number;
  error?: string;
}

/**
 * Index satu artikel yang sudah dipastikan published oleh pemanggil.
 * Idempotent — cek content hash untuk skip jika tidak berubah.
 */
export interface DependensiIndexingArtikel {
  getDatabase: () => Promise<{
    drizzle: {
      execute: (q: unknown) => Promise<unknown[]>;
      transaction: <T>(callback: (tx: { execute: (q: unknown) => Promise<unknown[]> }) => Promise<T>) => Promise<T>;
    };
  }>;
  enabled: boolean;
  embedBatch: typeof buatEmbeddingBatch;
  hapus: typeof hapusEmbeddingArtikel;
  contentHash: typeof ambilContentHash;
  simpan: typeof simpanEmbeddingArtikel;
  extract: typeof ekstrakTeksArtikel;
  chunk: typeof chunkTeksArtikel;
}

const dependensiDefault: DependensiIndexingArtikel = {
  getDatabase: async () => (await (await import("@/lib/payload/client")).getClient()).db as never,
  enabled: RAG_CONFIG.enabled,
  embedBatch: buatEmbeddingBatch,
  hapus: hapusEmbeddingArtikel,
  contentHash: ambilContentHash,
  simpan: simpanEmbeddingArtikel,
  extract: ekstrakTeksArtikel,
  chunk: chunkTeksArtikel,
};

export async function indexArtikelDenganDependensi(
  artikel: ArtikelUntukEkstraksi,
  dependencies: DependensiIndexingArtikel,
  forceReindex = false,
): Promise<HasilIndexing> {
  if (!dependencies.enabled) {
    return { artikelId: artikel.id, slug: artikel.slug, status: "skipped" };
  }

  try {
    // Ekstrak teks
    const hasil = await dependencies.extract(artikel);
    if (!hasil) {
      const db = await dependencies.getDatabase();
      await dependencies.hapus(db, artikel.id);
      return { artikelId: artikel.id, slug: artikel.slug, status: "removed" };
    }

    const nextHash = hasil.contentHash;
    const db = await dependencies.getDatabase();
    const indexedHash = forceReindex ? null : await dependencies.contentHash(db, artikel.id);
    const aksi = tentukanAksiLifecycleArtikel({
      published: true,
      hasIndexableContent: Boolean(hasil),
      previousContentHash: indexedHash,
      nextContentHash: nextHash,
      forceReindex,
    });

    if (aksi === "skip") {
      return { artikelId: artikel.id, slug: artikel.slug, status: "skipped" };
    }

    // Chunk teks
    const chunks = dependencies.chunk({
      artikelId: hasil.artikelId,
      slug: hasil.slug,
      judul: hasil.judul,
      teksLengkap: hasil.teksLengkap,
      contentHash: nextHash,
    });

    if (chunks.length === 0) {
      await dependencies.hapus(db, artikel.id);
      return { artikelId: artikel.id, slug: artikel.slug, status: "removed" };
    }

    // Buat embedding
    const embeddings = await dependencies.embedBatch(chunks.map((c) => c.teks));
    if (embeddings.length !== chunks.length || embeddings.some((e) =>
      e.length !== RAG_CONFIG.embeddingDimension || e.some((value) => !Number.isFinite(value))
    )) {
      throw new Error("Embedding provider returned an unexpected vector shape");
    }

    // Gabungkan chunk dengan embedding
    const records: ChunkEmbeddingRecord[] = chunks.map((chunk, i) => ({
      ...chunk,
      embedding: embeddings[i],
    }));

    // Simpan (atomik: hapus lama, masukkan baru)
    await dependencies.simpan(db, artikel.id, records);

    return {
      artikelId: artikel.id,
      slug: artikel.slug,
      status: "indexed",
      chunks: records.length,
    };
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[RAG] Gagal mengindex artikel ${artikel.id} (${artikel.slug}):`,
      pesan,
    );
    return {
      artikelId: artikel.id,
      slug: artikel.slug,
      status: "error",
      error: pesan,
    };
  }
}

/** Production wrapper uses Payload, local ONNX, and PostgreSQL dependencies. */
export function indexArtikel(
  artikel: ArtikelUntukEkstraksi,
  forceReindex = false,
): Promise<HasilIndexing> {
  return indexArtikelDenganDependensi(artikel, dependensiDefault, forceReindex);
}

/**
 * Hapus embedding untuk satu artikel.
 */
export async function hapusIndexArtikel(
  artikelId: number,
): Promise<HasilIndexing> {
  if (!RAG_CONFIG.enabled) {
    return { artikelId, slug: "", status: "skipped" };
  }

  try {
    const db = await dependensiDefault.getDatabase();

    await hapusEmbeddingArtikel(db, artikelId);

    return { artikelId, slug: "", status: "removed" };
  } catch (err) {
    const pesan = err instanceof Error ? err.message : "Unknown error";
    console.error(
      `[RAG] Gagal menghapus embedding artikel ${artikelId}:`,
      pesan,
    );
    return { artikelId, slug: "", status: "error", error: pesan };
  }
}

/**
 * Reindex semua artikel published secara berhalaman agar tidak berhenti di 500.
 * Untuk penggunaan saat setup awal atau saat model embedding berubah.
 */
export async function reindexSemuaArtikel(
  forceReindex = false,
): Promise<HasilIndexing[]> {
  if (!RAG_CONFIG.enabled) return [];

  const { getClient } = await import("@/lib/payload/client");
  const payload = await getClient();

  const hasil: HasilIndexing[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const result = await payload.find({
      collection: "artikel",
      limit: 100,
      page,
      depth: 1,
      draft: false,
      overrideAccess: true,
      where: { _status: { equals: "published" } },
      sort: "id",
    });
    totalPages = result.totalPages;
    for (const doc of result.docs) {
      const d = doc as unknown as Record<string, unknown>;
      const artikel: ArtikelUntukEkstraksi = {
        id: doc.id as number,
        judul: d.judul as string,
        slug: d.slug as string,
        ringkasan: d.ringkasan as string | undefined,
        blok: d.blok as ArtikelUntukEkstraksi["blok"],
      };

      if (!artikel.id || !artikel.slug || !artikel.judul) {
        hasil.push({ artikelId: artikel.id, slug: artikel.slug, status: "skipped" });
        continue;
      }

      const hasilSatu = await indexArtikel(artikel, forceReindex);
      hasil.push(hasilSatu);
    }
    page++;
  } while (page <= totalPages);

  return hasil;
}
