import { NextResponse } from "next/server";
import { getClient } from "@/lib/payload";
import { validasiDataLead } from "@/features/leads/schema";

/** Ambil nilai dari FormData (form HTML) atau JSON. */
async function bacaBadan(req: Request): Promise<Record<string, string>> {
  const tipe = req.headers.get("content-type") ?? "";
  if (tipe.includes("application/json")) {
    const json = (await req.json()) as Record<string, unknown>;
    const hasil: Record<string, string> = {};
    for (const [k, v] of Object.entries(json)) {
      if (typeof v === "string") hasil[k] = v;
    }
    return hasil;
  }

  const form = await req.formData();
  const hasil: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") hasil[k] = v;
  }
  return hasil;
}

/**
 * Terima kiriman form /kontak dan simpan sebagai dokumen `pesan-kontak`.
 */
export async function POST(req: Request) {
  let badan: Record<string, string>;
  try {
    badan = await bacaBadan(req);
  } catch {
    return NextResponse.json(
      { pesan: "Format permintaan tidak dikenali." },
      { status: 400 },
    );
  }

  const validasi = validasiDataLead(badan);
  if (!validasi.ok) {
    return NextResponse.json(
      { pesan: validasi.error },
      { status: 400 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;

  try {
    const payload = await getClient();
    await payload.create({
      collection: "pesan-kontak",
      overrideAccess: true,
      data: {
        ...validasi.data,
        status: "baru",
        meta: {
          ip: ip ?? undefined,
          userAgent: req.headers.get("user-agent") ?? undefined,
        },
      },
    });

    return NextResponse.json(
      { pesan: "Terima kasih! Pesan Anda sudah kami terima." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { pesan: "Terjadi kesalahan saat menyimpan pesan. Coba lagi nanti." },
      { status: 500 },
    );
  }
}
