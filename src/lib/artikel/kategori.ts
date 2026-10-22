import type { ArtikelBeranda } from "@/data/artikel";

export type KategoriArtikel = { slug: string; nama: string };

/** Turunkan daftar kategori unik dari data artikel. Aman dipakai di server maupun client. */
export function ambilKategori(artikel: ArtikelBeranda[]): KategoriArtikel[] {
  const peta = new Map<string, string>();
  for (const item of artikel) peta.set(item.kategori, item.kategori.toLowerCase());
  return [...peta].map(([nama, slug]) => ({ nama, slug }));
}
