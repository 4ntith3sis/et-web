import { ambilKategori } from "@/components/sections/DaftarArtikel";
import type { ArtikelBeranda } from "@/data/artikel";
import type { LayoutPuck } from "@/puck/types";

/**
 * State daftar artikel pada halaman listing /tulisan-pajak.
 *
 * Halaman ini menyimpan state di URL (`q`, `kategori`, `page`). Perhitungan
 * dilakukan sekali di server, lalu dipakai dua kali: render fallback
 * (langsung) dan render Page Builder (lewat konteks `daftarArtikel`), agar
 * keduanya menampilkan daftar yang persis sama.
 */

export type ParamsDaftarArtikel = {
  page?: string;
  kategori?: string;
  q?: string;
};

export type StateDaftarArtikel = {
  /** Artikel hasil filter + paginasi untuk halaman yang sedang dibuka. */
  artikel: ArtikelBeranda[];
  /** Semua kategori yang tersedia (slug + nama). */
  kategori: { slug: string; nama: string }[];
  /** Slug kategori aktif, bila URL memfilter kategori tertentu. */
  kategoriAktif?: string;
  /** Halaman yang sedang dibuka (1-based, sudah dibatasi ke total halaman). */
  halamanAman: number;
  /** Total halaman setelah filter. */
  totalPages: number;
  /** Total artikel setelah filter. */
  totalDocs: number;
  /** Kata kunci pencarian dari URL ("" bila kosong). */
  kueri: string;
};

/** Jumlah artikel per halaman saat layout belum menentukan angka sendiri. */
export const UKURAN_HALAMAN_DEFAULT = 6;

/**
 * Jumlah artikel per halaman yang diatur di layout Page Builder.
 *
 * Server memakai angka yang sama dengan komponen Puck supaya daftar dan
 * paginasi tidak berbeda bila editor mengubah `perHalaman`.
 */
export function perHalamanDariLayout(
  layout: LayoutPuck | null,
): number {
  const komponen = layout?.content?.find((c) => c.type === "DaftarArtikel");
  const nilai = komponen?.props?.perHalaman;
  return typeof nilai === "number" && Number.isFinite(nilai) && nilai > 0
    ? nilai
    : UKURAN_HALAMAN_DEFAULT;
}

/**
 * Hitung daftar artikel yang tampil untuk sebuah URL.
 *
 * Guard terhadap nilai ngawur di URL: nomor halaman dan slug kategori yang
 * tidak dikenal diabaikan (bukan error), dan nomor halaman dibatasi ke
 * total halaman agar tidak menampilkan daftar kosong.
 */
export function hitungDaftarArtikel(
  params: ParamsDaftarArtikel,
  artikelBeranda: ArtikelBeranda[],
  perHalaman: number = UKURAN_HALAMAN_DEFAULT,
): StateDaftarArtikel {
  /* Halaman: guard against nilai ngawur di URL. */
  const mentah = Number.parseInt(params.page ?? "1", 10);
  const page = Number.isFinite(mentah) && mentah > 0 ? mentah : 1;

  /* Kategori: hanya slug yang benar-benar ada yang diterima. */
  const kategori = ambilKategori(artikelBeranda);
  const slugDikenal = new Set(kategori.map((k) => k.slug));
  const kategoriAktif =
    params.kategori && slugDikenal.has(params.kategori)
      ? params.kategori
      : undefined;

  /* Pencarian: cocok di judul maupun ringkasan, case-insensitive. */
  const kueri = (params.q ?? "").trim();
  const q = kueri.toLowerCase();
  const terpilih = artikelBeranda.filter((a) => {
    if (kategoriAktif && a.kategori.toLowerCase() !== kategoriAktif) return false;
    if (!q) return true;
    return (
      a.judul.toLowerCase().includes(q) || a.ringkasan.toLowerCase().includes(q)
    );
  });

  const totalDocs = terpilih.length;
  const totalPages = Math.max(1, Math.ceil(totalDocs / perHalaman));
  const halamanAman = Math.min(page, totalPages);
  const artikel = terpilih.slice(
    (halamanAman - 1) * perHalaman,
    halamanAman * perHalaman,
  );

  return {
    artikel,
    kategori,
    kategoriAktif,
    halamanAman,
    totalPages,
    totalDocs,
    kueri,
  };
}
