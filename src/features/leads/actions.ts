"use server";

import { headers } from "next/headers";
import { getClient } from "@/lib/payload";
import { validasiDataLead } from "./schema";

export type HasilKirimLead =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Server action untuk mengirim lead / pesan kontak dari form publik.
 */
export async function kirimLeadKontak(formData: FormData): Promise<HasilKirimLead> {
  const input: Record<string, unknown> = {};
  for (const [k, v] of formData.entries()) {
    input[k] = v;
  }

  const validasi = validasiDataLead(input);
  if (!validasi.ok) {
    return { ok: false, error: validasi.error };
  }

  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;
    const userAgent = h.get("user-agent") || undefined;

    const payload = await getClient();
    await payload.create({
      collection: "pesan-kontak",
      overrideAccess: true,
      data: {
        ...validasi.data,
        status: "baru",
        meta: { ip, userAgent },
      },
    });

    return {
      ok: true,
      message: "Terima kasih! Pesan Anda sudah kami terima dan akan segera dihubungi.",
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan pesan.",
    };
  }
}
