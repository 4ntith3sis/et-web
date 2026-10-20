"use server";

import { headers } from "next/headers";

import { getClient } from "@/lib/payload";

/**
 * Server action pustaka media untuk field gambar Page Builder.
 *
 * Hanya pengguna admin/editor yang sudah masuk boleh membaca daftar ini;
 * keanggotaan diverifikasi dari cookie Payload, bukan dari klien.
 */

export type MediaRingkas = {
  id: string | number;
  url: string;
  alt: string;
  nama: string;
  width?: number;
  height?: number;
};

const PERAN_DIIZINKAN = new Set(["admin", "editor"]);

export async function daftarMedia(cari = ""): Promise<MediaRingkas[]> {
  const payload = await getClient();
  const { user } = await payload.auth({ headers: (await headers()) as unknown as Headers });
  const peran = (user as { role?: string } | null)?.role;
  if (!user || !peran || !PERAN_DIIZINKAN.has(peran)) {
    throw new Error("Tidak berwenang membaca pustaka media.");
  }

  const res = await payload.find({
    collection: "media",
    limit: 120,
    depth: 0,
    sort: "-createdAt",
    overrideAccess: true,
    where: cari ? { filename: { like: cari } } : undefined,
  });

  return res.docs
    .map((doc) => {
      const d = doc as {
        id: string | number;
        url?: string;
        alt?: string;
        filename?: string;
        width?: number;
        height?: number;
      };
      return {
        id: d.id,
        url: d.url ?? "",
        alt: d.alt ?? "",
        nama: d.filename ?? String(d.id),
        width: d.width,
        height: d.height,
      };
    })
    .filter((m) => Boolean(m.url));
}
