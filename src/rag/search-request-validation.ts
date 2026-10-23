import { RAG_CONFIG } from "./config";

export type HasilValidasiRequestPencarian =
  | { ok: true; query: string }
  | { ok: false; status: 400 | 413; error: string };

const BATAS_BODY_BYTE = 4096;

export function validasiRequestPencarian(
  bodyText: string,
  contentLength: string | null,
): HasilValidasiRequestPencarian {
  // Header bisa hilang/dipalsukan; ukur isi yang benar-benar diterima.
  const lengthHeader = Number(contentLength || 0);
  const lengthAktual = new TextEncoder().encode(bodyText).byteLength;
  if (lengthHeader > BATAS_BODY_BYTE || lengthAktual > BATAS_BODY_BYTE) {
    return { ok: false, status: 413, error: "Ukuran request terlalu besar." };
  }

  let body: { query?: unknown };
  try {
    body = JSON.parse(bodyText) as { query?: unknown };
  } catch {
    return { ok: false, status: 400, error: "Request body tidak valid." };
  }

  if (typeof body.query !== "string") {
    return { ok: false, status: 400, error: "Query harus berupa teks." };
  }
  const query = body.query.trim();
  if (!query) {
    return { ok: false, status: 400, error: "Query wajib diisi." };
  }
  if (query.length > RAG_CONFIG.maxQueryLength) {
    return { ok: false, status: 400, error: `Query maksimal ${RAG_CONFIG.maxQueryLength} karakter.` };
  }
  return { ok: true, query };
}
