import { NextResponse } from "next/server";
import { prosesRoutingKonsultasi } from "@/features/whatsapp/router";
import { validasiQueryKonsultasi } from "@/features/whatsapp/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { pesanKustom, sumber } = validasiQueryKonsultasi(url.searchParams);

  const hasil = await prosesRoutingKonsultasi({
    pesanKustom: pesanKustom || null,
    sumber: sumber || null,
  });

  // Cegah browser atau CDN meng-cache response redirect agar rotasi round-robin/random berjalan di setiap klik
  const headers = new Headers();
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  if (hasil.success) {
    return NextResponse.redirect(hasil.targetUrl, {
      status: 307,
      headers,
    });
  }

  // Jika gagal / nonaktif: arahkan ke halaman kontak internal yang aman
  const fallbackInternal = new URL("/kontak", url.origin);
  if (hasil.reason) {
    fallbackInternal.searchParams.set("notif", "whatsapp-offline");
  }

  return NextResponse.redirect(fallbackInternal.toString(), {
    status: 307,
    headers,
  });
}
