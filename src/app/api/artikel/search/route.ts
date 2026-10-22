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
};

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
  const validation = validasiRequestPencarian(
    await request.text(),
    request.headers.get("content-length"),
  );
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }
  const { query } = validation;

  try {
    const hasil = await dependencies.cari(query);

    return NextResponse.json({ query, artikel: petakanHasilPencarian(hasil.chunks) });
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
