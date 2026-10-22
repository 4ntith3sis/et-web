/**
 * API Route: Reindex Semua Artikel (Admin Only)
 *
 * POST /api/artikel/reindex
 *
 * Memulai proses reindex seluruh artikel published.
 * Dilindungi oleh autentikasi Payload (hanya admin).
 */

import { NextResponse, type NextRequest } from "next/server";
import { getClient } from "@/lib/payload/client";
import { RAG_CONFIG } from "@/rag/config";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!RAG_CONFIG.enabled) {
    return NextResponse.json(
      { error: "Fitur RAG artikel tidak aktif." },
      { status: 503 },
    );
  }

  // Autentikasi: hanya admin
  try {
    const payload = await getClient();
    const authHeader = request.headers.get("authorization");

    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
    const sessionCookie = request.cookies.get("payload-token")?.value;
    if (!token && !sessionCookie) {
      return NextResponse.json(
        { error: "Autentikasi diperlukan." },
        { status: 401 },
      );
    }

    const authHeaders = new Headers(request.headers);
    if (token) authHeaders.set("Authorization", `JWT ${token}`);
    else authHeaders.set("Cookie", `payload-token=${sessionCookie}`);
    const { user } = await payload.auth({ headers: authHeaders });

    if (!user || (user as { role?: string }).role !== "admin") {
      return NextResponse.json(
        { error: "Hanya admin yang dapat melakukan reindex." },
        { status: 403 },
      );
    }

    const forceReindex = request.nextUrl.searchParams.get("force") === "true";

    const { reindexSemuaArtikel } = await import("@/rag/article-indexing");
    const hasil = await reindexSemuaArtikel(forceReindex);

    const ringkasan = {
      total: hasil.length,
      indexed: hasil.filter((h) => h.status === "indexed").length,
      skipped: hasil.filter((h) => h.status === "skipped").length,
      removed: hasil.filter((h) => h.status === "removed").length,
      error: hasil.filter((h) => h.status === "error").length,
    };

    return NextResponse.json({ ringkasan, detail: hasil });
  } catch (err) {
    console.error(
      "[API Reindex] Error:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json(
      { error: "Gagal melakukan reindex." },
      { status: 500 },
    );
  }
}
