/**
 * Chunking teks artikel untuk embedding.
 *
 * Memecah teks menjadi potongan berukuran RAG_CONFIG.chunkSize
 * dengan overlap antar chunk untuk menjaga konteks.
 * Pemecahan dilakukan pada batas paragraf bila memungkinkan.
 */

import { RAG_CONFIG } from "./config";

export interface ChunkArtikel {
  artikelId: number;
  slug: string;
  judul: string;
  chunkIndex: number;
  teks: string;
  contentHash: string;
}

/**
 * Pecah teks artikel menjadi chunk-chunk.
 */
export function chunkTeksArtikel(params: {
  artikelId: number;
  slug: string;
  judul: string;
  teksLengkap: string;
  contentHash: string;
  chunkSize?: number;
  chunkOverlap?: number;
}): ChunkArtikel[] {
  const {
    artikelId,
    slug,
    judul,
    teksLengkap,
    contentHash,
    chunkSize = RAG_CONFIG.chunkSize,
    chunkOverlap = RAG_CONFIG.chunkOverlap,
  } = params;

  if (!teksLengkap.trim()) return [];

  const paragraf = teksLengkap.split(/\n\n+/);
  const chunks: ChunkArtikel[] = [];
  let buffer = "";
  let chunkIndex = 0;

  for (const p of paragraf) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    if (buffer && buffer.length + trimmed.length + 2 > chunkSize) {
      chunks.push({
        artikelId,
        slug,
        judul,
        chunkIndex,
        teks: buffer.trim(),
        contentHash,
      });
      chunkIndex++;

      // Overlap: ambil akhir buffer sebelumnya
      if (chunkOverlap > 0 && buffer.length > chunkOverlap) {
        buffer = buffer.slice(-chunkOverlap).trim() + "\n\n" + trimmed;
      } else {
        buffer = trimmed;
      }
    } else {
      buffer = buffer ? buffer + "\n\n" + trimmed : trimmed;
    }
  }

  // Sisa buffer
  if (buffer.trim()) {
    chunks.push({
      artikelId,
      slug,
      judul,
      chunkIndex,
      teks: buffer.trim(),
      contentHash,
    });
  }

  // Jika satu chunk terlalu besar, pecah paksa berdasarkan kalimat
  const hasil: ChunkArtikel[] = [];
  for (const chunk of chunks) {
    if (chunk.teks.length <= chunkSize * 1.5) {
      hasil.push(chunk);
    } else {
      const subChunks = pecahPaksa(chunk.teks, chunkSize, chunkOverlap);
      for (let i = 0; i < subChunks.length; i++) {
        hasil.push({
          ...chunk,
          chunkIndex: hasil.length,
          teks: subChunks[i],
        });
      }
    }
  }

  // Re-index setelah merge/split
  return hasil.map((c, i) => ({ ...c, chunkIndex: i }));
}

function pecahPaksa(
  teks: string,
  chunkSize: number,
  overlap: number,
): string[] {
  const kalimat = teks.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let buffer = "";

  for (const k of kalimat) {
    if (buffer && buffer.length + k.length + 1 > chunkSize) {
      chunks.push(buffer.trim());
      if (overlap > 0 && buffer.length > overlap) {
        buffer = buffer.slice(-overlap).trim() + " " + k;
      } else {
        buffer = k;
      }
    } else {
      buffer = buffer ? buffer + " " + k : k;
    }
  }

  if (buffer.trim()) {
    chunks.push(buffer.trim());
  }

  return chunks;
}
