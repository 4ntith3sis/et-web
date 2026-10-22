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
  let published: typeof doc | null = null;
  try {
    published = await payload.findByID({
      collection: "artikel",
      id: doc.id,
      draft: false,
      overrideAccess: true,
    }) as typeof doc;
  } catch {
    // Tidak ada versi publik: fail closed dengan menghapus index lama.
  }

  if (published?._status === "published" && published.slug && published.judul) {
    const { indexArtikel } = await import("./article-indexing");
    await indexArtikel({
      id: published.id as number,
      judul: published.judul as string,
      slug: published.slug as string,
      ringkasan: published.ringkasan as string | undefined,
      blok: published.blok as Parameters<typeof indexArtikel>[0]["blok"],
    });
  } else {
    const { hapusIndexArtikel } = await import("./article-indexing");
    await hapusIndexArtikel(doc.id as number);
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
