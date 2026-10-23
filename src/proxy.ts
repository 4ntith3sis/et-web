import { NextResponse, type NextRequest } from "next/server";

import { slugPublikAda, type JenisKontenPublik } from "@/cms/keberadaan";

/**
 * Preflight 404 untuk route detail.
 *
 * `notFound()` di dalam page detail berjalan setelah shell PPR/streaming
 * dikirim, sehingga response tetap 200. Proxy ini memeriksa slug sebelum
 * render dan menulis status 404 sejak awal, tanpa mengubah URL yang valid.
 */
const RUTE_DETAIL = /^\/(tulisan-pajak|layanan)\/([^/]+)\/?$/;

export async function proxy(request: NextRequest) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return NextResponse.next();
  }

  const cocok = RUTE_DETAIL.exec(request.nextUrl.pathname);
  if (!cocok) return NextResponse.next();

  const segmen = cocok[1];
  let slug: string;
  try {
    slug = decodeURIComponent(cocok[2]!);
  } catch {
    // Biarkan route menangani URL yang encoding-nya rusak; jangan 500 di proxy.
    return NextResponse.next();
  }
  const jenis: JenisKontenPublik =
    segmen === "layanan" ? "layanan" : "artikel";

  const ada = await slugPublikAda(jenis, slug);
  if (ada !== false) return NextResponse.next();

  const tujuan = request.nextUrl.clone();
  tujuan.pathname = "/_not-found";
  tujuan.search = "";
  return NextResponse.rewrite(tujuan, { status: 404 });
}

export const config = {
  matcher: ["/tulisan-pajak/:slug", "/layanan/:slug"],
};
