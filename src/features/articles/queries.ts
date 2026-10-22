import { ambilArtikel, ambilArtikelDetail } from "@/cms/konten";
import { hitungDaftarArtikel, type ParamsDaftarArtikel } from "./schema";

/**
 * Mengambil ringkasan semua artikel untuk listing dan pencarian.
 */
export async function ambilSemuaArtikel() {
  return ambilArtikel();
}

/**
 * Mengambil detail lengkap artikel berdasarkan slug.
 */
export async function ambilDetailArtikel(slug: string) {
  return ambilArtikelDetail(slug);
}

/**
 * Menghitung daftar artikel terfilter dan terpaginasi berdasarkan search params URL.
 */
export async function ambilDaftarArtikelTerfilter(params: ParamsDaftarArtikel) {
  const semua = await ambilSemuaArtikel();
  return hitungDaftarArtikel(params, semua);
}
