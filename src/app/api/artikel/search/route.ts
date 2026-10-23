/** Semantic search khusus artikel yang telah diterbitkan. */

import { NextResponse, type NextRequest } from "next/server";
import { RAG_CONFIG } from "@/rag/config";
import { validasiRequestPencarian } from "@/rag/search-request-validation";
import { petakanHasilPencarian } from "@/rag/article-search-response";
import type { HasilPencarianArtikel } from "@/rag/article-retrieval";

export const maxDuration = 20;

export interface DependensiRoutePencarian {
  enabled: boolean;
  cari: (query: string) => Promise<HasilPencarianArtikel>;
  enrichirSampul?: (items: ReturnType<typeof petakanHasilPencarian>) => Promise<ReturnType<typeof petakanHasilPencarian>>;
}

let peringatanNonaktifSudahDicatat = false;

function catatNonaktif(): void {
  if (peringatanNonaktifSudahDicatat) return;
  peringatanNonaktifSudahDicatat = true;
  console.warn(
    "[Article search] Nonaktif: set RAG_ARTIKEL_ENABLED=true hanya setelah cache model ONNX dan tabel artikel_embeddings (pgvector 1024-d) siap.",
  );
}

const dependensiDefault: DependensiRoutePencarian = {
  enabled: RAG_CONFIG.enabled,
  cari: async (query) => {
    const { cariArtikelSemantik } = await import("@/rag/article-retrieval");
    return cariArtikelSemantik(query);
  },
  enrichirSampul: async (items) => {
    const [{ getClient }, { mediaUrlRelatif }] = await Promise.all([
      import("@/lib/payload"),
      import("@/lib/media-url"),
    ]);
    const payload = await getClient();
    return Promise.all(items.map(async (item) => {
      try {
        const doc = await payload.findByID({ collection: "artikel", id: item.id, depth: 1, draft: false, overrideAccess: false });
        const sampul = doc.sampul;
        const gambar = typeof sampul === "object" && sampul ? mediaUrlRelatif(sampul.url) : undefined;
        return { ...item, ...(gambar ? { gambar } : {}) };
      } catch {
        return item;
      }
    }));
  },
};

/** Baca body dengan batas byte agar request raksasa tidak dibuffer penuh. */
async function bacaBodyTerbatas(
  request: NextRequest,
  maksByte: number,
): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let total = 0;
  let teks = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maksByte) {
        await reader.cancel();
        return null;
      }
      teks += decoder.decode(value, { stream: true });
    }
    return teks + decoder.decode();
  } catch {
    await reader.cancel().catch(() => undefined);
    return null;
  }
}

/** Terapkan deadline aplikasi; maxDuration bukan penegak waktu di self-host. */
async function denganBatasWaktu<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const error = new Error("Pencarian melewati batas waktu.");
      error.name = "TimeoutError";
      reject(error);
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Implementasi handler dipisahkan dari `POST` hanya agar jalur HTTP dapat
 * diuji dengan dependensi palsu. Kontrak HTTP tetap sama.
 */
export async function tanganiPencarian(
  request: NextRequest,
  dependencies: DependensiRoutePencarian,
): Promise<NextResponse> {
  if (!dependencies.enabled) {
    catatNonaktif();
    return NextResponse.json({ error: "Pencarian semantik artikel sedang tidak aktif." }, { status: 503 });
  }
  const body = await bacaBodyTerbatas(request, 4096);
  if (body === null) {
    return NextResponse.json(
      { error: "Ukuran request terlalu besar." },
      { status: 413 },
    );
  }

  const validation = validasiRequestPencarian(
    body,
    request.headers.get("content-length"),
  );
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { query } = validation;

  try {
    const hasil = await denganBatasWaktu(
      dependencies.cari(query),
      RAG_CONFIG.requestTimeoutMs,
    );

    const artikel = petakanHasilPencarian(hasil.chunks);
    if (artikel.length && dependencies.enrichirSampul) {
      try {
        const enriched = await dependencies.enrichirSampul(artikel);
        return NextResponse.json({ query, artikel: enriched });
      } catch {
        // Data semantik tetap dapat ditampilkan dengan gambar placeholder.
        if (process.env.NODE_ENV === "test") {
          // A failed attempt to enrich images must not leak an unhandled
          // Payload initialization promise from tests or request handling.
          return NextResponse.json({ query, artikel });
        }
      }
    }
    return NextResponse.json({ query, artikel });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    // Detail tetap di server; respons HTTP tidak membocorkan pesan internal.
    const detail = error instanceof Error ? `${error.name}: ${error.message}` : "non-error rejection";
    console.error(`[Article search] retrieval failed: ${detail}`);
    return NextResponse.json(
      { error: isTimeout ? "Pencarian melewati batas waktu. Coba lagi." : "Pencarian artikel gagal sementara." },
      { status: isTimeout ? 504 : 503 },
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return tanganiPencarian(request, dependensiDefault);
}
