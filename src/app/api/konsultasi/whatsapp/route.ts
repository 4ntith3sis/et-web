import { NextResponse } from "next/server";
import { prosesRoutingKonsultasi } from "@/features/whatsapp/router";
import { validasiQueryKonsultasi } from "@/features/whatsapp/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { pesanKustom, sumber, konteks } = validasiQueryKonsultasi(url.searchParams);

  // Cegah browser atau CDN meng-cache response redirect agar rotasi round-robin/random berjalan di setiap klik
  const headers = new Headers();
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");

  try {
    const hasil = await prosesRoutingKonsultasi({
      pesanKustom: pesanKustom || null,
      sumber: sumber || null,
      konteks,
    });

    if (hasil.success) {
      return NextResponse.redirect(hasil.targetUrl, {
        status: 307,
        headers,
      });
    }

    return NextResponse.json(
      { error: hasil.reason || "Routing WhatsApp tidak tersedia." },
      { status: 503, headers },
    );
  } catch {
    // Jangan membocorkan detail internal/log kredensial ke browser dan jangan
    // mengubah kegagalan routing konsultasi menjadi navigasi ke halaman Kontak.
    return NextResponse.json(
      { error: "Routing WhatsApp sementara tidak tersedia." },
      { status: 503, headers },
    );
  }
}
