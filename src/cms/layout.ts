import { cacheLife, cacheTag } from "next/cache";

import { ambilArtikel, ambilLayanan, ambilMitra, ambilTestimoni } from "@/cms/konten";
import { getClient } from "@/lib/payload";
import type { LayoutPuck, MetadataPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";

/**
 * Pembacaan layout Page Builder untuk halaman publik.
 *
 * Mengikuti pola `src/cms/konten.ts`: dibungkus `use cache` agar ikut masuk
 * static shell, dan di-tag per halaman (`layout:<pageKey>`) supaya bisa
 * diinvalidasi saat tombol Publish ditekan. Bila dokumen belum ada, belum
 * diterbitkan, atau isinya tidak valid, fungsi mengembalikan `null` sehingga
 * halaman memakai implementasi lamanya.
 */
export async function ambilLayoutTerbit(
  pageKey: string,
): Promise<LayoutPuck | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`layout:${pageKey}`);

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "page-layouts",
      where: { pageKey: { equals: pageKey } },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: false,
    });
    const doc = res.docs[0] as { layout?: unknown } | undefined;
    if (!doc) return null;

    const hasil = validasiLayoutPuck(doc.layout);
    if (!hasil.ok || hasil.data.content.length === 0) return null;
    return hasil.data;
  } catch {
    return null;
  }
}

/**
 * Metadata (konten CMS) yang dikirim ke komponen saat render.
 *
 * Dipakai baik oleh renderer publik di server maupun oleh editor di klien
 * (diserialisasi sebagai props), sehingga komponen selalu menampilkan isi
 * terkini tanpa harus disimpan di dalam JSON layout.
 */
export async function ambilMetadataPuck(): Promise<MetadataPuck> {
  const [layanan, artikel, testimoni, mitra] = await Promise.all([
    ambilLayanan(),
    ambilArtikel(),
    ambilTestimoni(),
    ambilMitra(),
  ]);
  return { layanan, artikel, testimoni, mitra };
}
