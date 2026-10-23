/**
 * Payload hooks untuk indexing RAG artikel.
 *
 * Hook-hook ini dipasang pada collection `artikel` untuk
 * menjaga sinkronisasi embedding saat artikel berubah.
 *
 * Indexing ditunggu oleh hook agar perubahan berurutan tidak race dan tidak
 * meninggalkan job fire-and-forget. Error provider ditangani service indexing.
 */

import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from "payload";
import { RAG_CONFIG } from "./config";

/**
 * afterChange hook: index atau hapus embedding berdasarkan status artikel.
 */
export const hookIndexArtikelRAG: CollectionAfterChangeHook = async ({
  doc,
}) => {
  if (!RAG_CONFIG.enabled) return doc;
  const payload = await (await import("@/lib/payload/client")).getClient();
  let published: typeof doc | null;
  try {
    published = await payload.findByID({
      collection: "artikel",
      id: doc.id,
      draft: false,
      overrideAccess: true,
    }) as typeof doc;
  } catch (error) {
    // A failed/ambiguous read is never evidence that an article is unpublished.
    // Keep the previous public index until a successful read confirms status.
    console.error("[RAG] Gagal memeriksa versi terbit artikel; index lama dipertahankan", {
      artikelId: doc.id,
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return doc;
  }

  if (published?._status === "published" && published.slug && published.judul) {
    const { indexArtikel } = await import("./article-indexing");
    const hasil = await indexArtikel({
      id: published.id as number,
      judul: published.judul as string,
      slug: published.slug as string,
      ringkasan: published.ringkasan as string | undefined,
      blok: published.blok as Parameters<typeof indexArtikel>[0]["blok"],
    });
    if (hasil.status === "error") {
      console.error("[RAG] Index artikel gagal diperbarui; index lama mungkin basi", {
        artikelId: hasil.artikelId,
        slug: hasil.slug,
      });
    }
  } else if (published?._status === "draft" || doc._status === "draft") {
    const { hapusIndexArtikel } = await import("./article-indexing");
    const hasil = await hapusIndexArtikel(doc.id as number);
    if (hasil.status === "error") {
      console.error("[RAG] Index artikel gagal dihapus", { artikelId: doc.id });
    }
  } else {
    // Missing status/slug is ambiguous. Do not make public content disappear
    // because of a malformed read result.
    console.error("[RAG] Status publik artikel tidak dapat dipastikan; index lama dipertahankan", {
      artikelId: doc.id,
    });
  }

  return doc;
};

/**
 * afterDelete hook: hapus semua embedding saat artikel dihapus.
 */
export const hookHapusArtikelRAG: CollectionAfterDeleteHook = async ({
  doc,
}) => {
  if (!RAG_CONFIG.enabled) return doc;
  const { hapusIndexArtikel } = await import("./article-indexing");
  await hapusIndexArtikel(doc.id as number);
  return doc;
};
