import type { ArtikelBeranda } from "@/data/artikel";

export type KategoriArtikel = { slug: string; nama: string };

/**
 * Turunkan daftar kategori unik dari data artikel. Aman dipakai di server
 * maupun client. Slug dari relasi CMS dipakai bila tersedia; data statis
 * memakai nama huruf kecil seperti sebelumnya.
 */
export function ambilKategori(artikel: ArtikelBeranda[]): KategoriArtikel[] {
  const peta = new Map<string, { nama: string; slug: string }>();
  for (const item of artikel) {
    const slug = item.kategoriSlug ?? item.kategori.toLowerCase();
    if (!peta.has(slug)) peta.set(slug, { nama: item.kategori, slug });
  }
  return [...peta.values()];
}
