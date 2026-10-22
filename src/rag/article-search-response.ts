/**
 * Pemetaan hasil retrieval chunk menjadi respons endpoint.
 *
 * Fungsi ini sengaja hanya memilih field publik. Embedding, content hash,
 * chunk teks, dan metadata internal lain tidak pernah ikut ke respons.
 */

import type { HasilRetrieval } from "./vector-store";

export interface ArtikelHasilPencarian {
  id: number;
  judul: string;
  slug: string;
  ringkasan: string;
  kategori: string;
  url: string;
  relevansi: number;
}

export function petakanHasilPencarian(
  chunks: readonly HasilRetrieval[],
): ArtikelHasilPencarian[] {
  const artikelMap = new Map<number, ArtikelHasilPencarian>();

  for (const chunk of chunks) {
    const current = artikelMap.get(chunk.artikelId);
    if (current) {
      current.relevansi = Math.max(current.relevansi, Number(chunk.similarity));
      continue;
    }
    artikelMap.set(chunk.artikelId, {
      id: chunk.artikelId,
      judul: chunk.judul,
      slug: chunk.slug,
      ringkasan: (chunk.ringkasan || "").slice(0, 280),
      kategori: chunk.kategori,
      url: `/tulisan-pajak/${encodeURIComponent(chunk.slug)}`,
      relevansi: Number(chunk.similarity),
    });
  }

  return [...artikelMap.values()];
}
