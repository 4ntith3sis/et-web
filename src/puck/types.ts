import type { Data } from "@puckeditor/core";

import type { ArtikelBeranda } from "../data/artikel";
import type { LayananBeranda } from "../data/layanan";
import type {
  FaqLayanan as ItemFaqLayanan,
  PaketLayanan as ItemPaketLayanan,
} from "../data/layanan-detail";
import type { Testimoni as ItemTestimoni } from "../data/testimoni";
import type { AnggotaTim } from "../data/tim";
import type { BlokIsi, HeadingToc } from "../lib/artikel/toc";
import { NAMA_KOMPONEN_GENERIC, type PropsGeneric } from "./komponen/tipe";

/**
 * Kontrak bersama untuk Page Builder (Puck).
 *
 * File ini sengaja bebas React/DOM supaya bisa diimpor dari mana saja:
 * komponen editor (klien), server component, hook koleksi, maupun validator
 * Payload di CLI. Registry halaman & tipe props menjadi satu-satunya sumber
 * kebenaran agar editor dan renderer publik tidak pernah berbeda.
 */

/* ------------------------------------------------- Behind page registry */

export type HalamanPuck = {
  /** Kunci stabil yang dipakai sebagai `pageKey` di database & URL admin. */
  key: string;
  /** Judul yang tampil di pemilih halaman dan header editor. */
  judul: string;
  /** Rute publik yang dirender oleh layout ini. */
  rute: string;
  /** Deskripsi singkat pada pemilih halaman. */
  keterangan: string;
};

/**
 * Daftar halaman yang boleh dikelola lewat Page Builder.
 *
 * Vertical slice fase 3 hanya membuka beranda; menambah halaman cukup
 * menambah entri di sini lalu mendaftarkan default layout-nya di
 * `default-layouts.ts`.
 */
export const HALAMAN_PUCK = {
  beranda: {
    key: "beranda",
    judul: "Beranda",
    rute: "/",
    keterangan: "Landing page utama EasyTax.",
  },
  "tentang-kami": {
    key: "tentang-kami",
    judul: "Tentang Kami",
    rute: "/tentang-kami",
    keterangan: "Profil perusahaan, visi misi, dan tim.",
  },
  kontak: {
    key: "kontak",
    judul: "Kontak",
    rute: "/kontak",
    keterangan: "Form kontak dan informasi kantor.",
  },
  "layanan-listing": {
    key: "layanan-listing",
    judul: "Layanan (Halaman Utama)",
    rute: "/layanan",
    keterangan: "Halaman listing katalog layanan.",
  },
  "tulisan-pajak-listing": {
    key: "tulisan-pajak-listing",
    judul: "Tulisan Pajak (Halaman Utama)",
    rute: "/tulisan-pajak",
    keterangan: "Halaman listing artikel pajak.",
  },
  "template-layanan-detail": {
    key: "template-layanan-detail",
    judul: "Template Detail Layanan",
    rute: "/layanan/[slug]",
    keterangan: "Template bersama untuk semua halaman detail layanan.",
  },
  "template-artikel-detail": {
    key: "template-artikel-detail",
    judul: "Template Detail Artikel",
    rute: "/tulisan-pajak/[slug]",
    keterangan: "Template bersama untuk semua halaman detail artikel.",
  },
} as const satisfies Record<string, HalamanPuck>;

export type KunciHalaman = keyof typeof HALAMAN_PUCK;

export const DAFTAR_HALAMAN: HalamanPuck[] = Object.values(HALAMAN_PUCK);

export function halamanDariKey(key: string): HalamanPuck | undefined {
  return (HALAMAN_PUCK as Record<string, HalamanPuck>)[key];
}

/* ------------------------------------------------------ Page-level props */

/**
 * Props tingkat halaman (root Puck).
 *
 * Puck mendefinisikan `title` bawaan pada root panel; dengan mendeklarasikan
 * field kita sendiri, field bawaan itu tersembunyi dan panel "Page"
 * menampilkan identitas halaman yang benar-benar dipakai renderer.
 */
export type PropsRootPuck = {
  title: string;
  rute: string;
  kunci: string;
};

export type RootPuck = {
  props: PropsRootPuck;
  readOnly: Record<keyof PropsRootPuck, boolean>;
};

/**
 * Root props yang valid untuk sebuah halaman.
 *
 * Nilainya diturunkan dari registry (`HALAMAN_PUCK`), bukan diketik manual,
 * sehingga tidak ada sumber kedua yang bisa menyimpang. Semua field ditandai
 * `readOnly`: identitas halaman bukan konten yang boleh diubah dari kanvas.
 */
export function rootPropsHalaman(halaman: HalamanPuck): RootPuck {
  return {
    props: { title: halaman.judul, rute: halaman.rute, kunci: halaman.key },
    readOnly: { title: true, rute: true, kunci: true },
  };
}

/** Selalu sinkronkan root sebuah layout dengan registry halaman. */
export function terapkanRoot(layout: LayoutPuck, halaman: HalamanPuck): LayoutPuck {
  return { ...layout, root: { ...(layout.root ?? {}), ...rootPropsHalaman(halaman) } };
}

/* ------------------------------------------------------ Component props */

export type PoinHero = { teks: string };

/** Teks Hero yang dapat diedit lewat Page Builder. */
export type PropsHero = {
  lencana: string;
  judul: string;
  sorotan: string;
  deskripsi: string;
  poin: PoinHero[];
  ctaLabel: string;
  ctaHref: string;
  cta2Label: string;
  cta2Href: string;
};

/** Teks banner CTA yang dapat diedit lewat Page Builder. */
export type PropsCta = {
  lencana: string;
  judul: string;
  deskripsi: string;
  ctaLabel: string;
  ctaHref: string;
  emailLabel: string;
};

/**
 * Properti desain Hero Detail Layanan yang dapat diedit lewat Page Builder.
 *
 * Penting: yang disimpan di layout HANYA atribut desain/statis (lencana,
 * label tombol, tautan, perataan). Nama layanan, subjudul, deskripsi, dan
 * gambar SELALU berasal dari record CMS slug yang sedang dibuka — tidak
 * pernah ditanam di JSON layout. Dengan begitu satu template tetap melayani
 * semua slug tanpa mencampurkan data masing-masing.
 */
export type PropsLayananDetailHero = {
  lencana: string;
  judul?: string;
  subjudul?: string;
  ringkasan?: string;
  teksGambar?: string;
  breadcrumbBeranda?: string;
  breadcrumbLayanan?: string;
  ctaLabel: string;
  ctaHref: string;
  perataan: "kiri" | "tengah";
};

/**
 * Properti desain section Keunggulan "Mengapa EasyTax?" yang dapat diedit.
 *
 * Hanya teks statis/label dan perataan yang dapat diubah; daftar kartu
 * keunggulan tetap bagian dari desain final (bukan data CMS per-record).
 */
export type PropsKeunggulan = {
  lencana: string;
  judul: string;
  deskripsi: string;
  perataan: "kiri" | "tengah";
};

/**
 * Struktur satu kartu harga representatif + properti section.
 *
 * Editor Puck menampilkan SATU kartu contoh sebagai struktur template
 * (label + urutan bagian). Renderer publik mengulang kartu ini untuk SETIAP
 * paket dari record CMS slug yang sedang dibuka; nama paket, deskripsi,
 * harga, satuan, dan daftar keunggulan aktual selalu berasal dari CMS.
 *
 * `labelKeunggulan` wajib tampil di setiap kartu publik (default
 * "Keunggulan"). Field contoh (nama/deskripsi/harga) hanya untuk pratinjau
 * struktur di editor dan TIDAK pernah dipakai publik.
 */
export type PropsHargaLayanan = {
  lencana: string;
  judul: string;
  deskripsi: string;
  labelKeunggulan: string;
  labelTombol: string;
  tombolHref: string;
  perataan: "kiri" | "tengah";
  batas: number;
};

/**
 * Konteks halaman dinamis (per-slug) yang dikirim ke komponen template.
 *
 * Halaman detail layanan/artikel memakai SATU template bersama untuk semua
 * slug. Karena itu item yang sedang dibuka tidak disimpan di dalam JSON
 * layout, melainkan di suplai per-request lewat `MetadataPuck.konteks`.
 */
export type KonteksLayanan = {
  layanan: LayananBeranda;
  paket: ItemPaketLayanan[];
  faq: ItemFaqLayanan[];
};

export type KonteksArtikel = {
  artikel: ArtikelBeranda;
  penulis: string;
  blok: BlokIsi[];
  tags: string[];
  headings: HeadingToc[];
  terkait: ArtikelBeranda[];
};

/**
 * Konteks daftar artikel untuk halaman listing /tulisan-pajak.
 *
 * Halaman ini menyimpan state di URL (`q`, `kategori`, `page`). State itu
 * dihitung di server per-request lalu dikirim ke komponen lewat konteks,
 * sehingga render dari layout Page Builder tetap sama dengan render
 * fallback: pencarian, filter kategori, dan paginasi tetap bekerja.
 */
export type KonteksDaftarArtikel = {
  /** Artikel hasil filter + paginasi untuk halaman yang sedang dibuka. */
  daftar: ArtikelBeranda[];
  /** Slug kategori aktif, bila URL memfilter kategori tertentu. */
  kategoriAktif?: string;
  /** Halaman yang sedang dibuka (1-based). */
  page: number;
  /** Total halaman setelah filter. */
  totalPages: number;
  /** Total artikel setelah filter. */
  totalDocs: number;
  /** Kata kunci pencarian dari URL ("" bila kosong). */
  kueri: string;
};

export type KonteksHalaman = {
  layanan?: KonteksLayanan;
  artikel?: KonteksArtikel;
  daftarArtikel?: KonteksDaftarArtikel;
};

export type PropsPuck = PropsGeneric & {
  /** Hero navy dua kolom di puncak beranda. */
  Hero: PropsHero;
  /** Blok keunggulan bergradasi (teks statis dapat diedit). */
  Keunggulan: PropsKeunggulan;
  /** Grid kartu layanan; jumlah menentukan berapa kartu ditampilkan. */
  Layanan: { jumlah: number };
  /** Langkah alur kerja dengan teks section yang dapat disesuaikan. */
  CaraKerja: { lencana?: string; judul?: string };
  /** Carousel artikel; jumlah menentukan berapa artikel dimuat. */
  Artikel: { jumlah: number };
  /** Carousel logo mitra; jumlah logo + teks section. */
  Mitra: {
    jumlah: number;
    lencana?: string;
    judul?: string;
    deskripsi?: string;
  };
  /** Baris liputan media dengan judul section. */
  MediaNasional: { judul?: string };
  /** Marquee testimoni; jumlah menentukan berapa testimoni dimuat + teks section. */
  Testimoni: {
    jumlah: number;
    lencana?: string;
    judul?: string;
    deskripsi?: string;
  };
  /** Banner CTA penutup di atas footer. */
  CTA: PropsCta;

  /* ---- Hero halaman statis (HeroPanel bersama) ---- */
  /** Hero /tentang-kami. */
  TentangHero: Record<string, never>;
  /** Hero /layanan. */
  LayananHero: Record<string, never>;
  /** Hero /kontak. */
  KontakHero: Record<string, never>;

  /* ---- Halaman Tentang Kami ---- */
  /** Narasi cerita & nilai perusahaan (statis). */
  CeritaKami: Record<string, never>;
  /** Grid kartu tim konsultan (data dari koleksi Tim). */
  TimKonsultan: Record<string, never>;

  /* ---- Halaman Kontak ---- */
  /** Form pertanyaan + kartu info (topik & jam dari koleksi). */
  FormPertanyaan: Record<string, never>;
  /** Lokasi kantor pusat + jam operasional. */
  LokasiKantor: Record<string, never>;
  /** Akordeon FAQ kontak (data statis). */
  FaqKontak: Record<string, never>;

  /* ---- Halaman listing ---- */
  /** Grid katalog layanan dengan pencarian; jumlah kartu. */
  DaftarLayanan: { jumlah: number };
  /** Pengantar editorial /tulisan-pajak (statis). */
  PengantarArtikel: Record<string, never>;
  /** Grid artikel + filter kategori + paginasi; jumlah per halaman. */
  DaftarArtikel: { perHalaman: number };

  /* ---- Template detail layanan (per-slug) ---- */
  /** Hero detail layanan; struktur/label dari Puck, isi dari konteks slug. */
  LayananDetailHero: PropsLayananDetailHero;
  /** Tabel paket harga; struktur satu kartu + jumlah paket ditampilkan. */
  HargaLayanan: PropsHargaLayanan;
  /** Akordeon FAQ per layanan; jumlah FAQ ditampilkan + teks section. */
  FaqLayanan: { batas: number; lencana?: string; judul?: string };

  /* ---- Template detail artikel (per-slug) ---- */
  /** Hero artikel; data dari konteks slug. */
  ArtikelDetailHero: Record<string, never>;
  /** Badan artikel + daftar isi; data dari konteks slug. */
  BadanArtikel: Record<string, never>;
  /** Grid artikel terkait; jumlah kartu. */
  ArtikelTerkait: { jumlah: number };
};

export type NamaKomponenPuck = keyof PropsPuck;

/** Komponen section khas EasyTax (desain final). */
export const NAMA_KOMPONEN_WEBSITE: NamaKomponenPuck[] = [
  "Hero",
  "Keunggulan",
  "Layanan",
  "CaraKerja",
  "Artikel",
  "Mitra",
  "MediaNasional",
  "Testimoni",
  "CTA",
  "TentangHero",
  "LayananHero",
  "KontakHero",
  "CeritaKami",
  "TimKonsultan",
  "FormPertanyaan",
  "LokasiKantor",
  "FaqKontak",
  "DaftarLayanan",
  "PengantarArtikel",
  "DaftarArtikel",
  "LayananDetailHero",
  "HargaLayanan",
  "FaqLayanan",
  "ArtikelDetailHero",
  "BadanArtikel",
  "ArtikelTerkait",
];

/** Daftar nama komponen yang sah — dipakai validator server. */
export const NAMA_KOMPONEN_PUCK: NamaKomponenPuck[] = [
  ...NAMA_KOMPONEN_WEBSITE,
  ...NAMA_KOMPONEN_GENERIC,
];

/* ----------------------------------------------------------- Rendering */

/** Payload JSON layout yang tersimpan di CMS. */
export type LayoutPuck = Data;

/**
 * Data pendamping yang dikirim ke komponen saat render.
 *
 * Di editor, nilai ini diserialisasi dari server component ke klien; di
 * renderer publik diambil langsung oleh `PuckRender`. `puck.metadata`
 * membuat komponen tetap murni (hanya bergantung pada props) sementara isi
 * dinamisnya tetap berasal dari koleksi CMS.
 */
export type MetadataPuck = {
  layanan: LayananBeranda[];
  artikel: ArtikelBeranda[];
  testimoni: ItemTestimoni[];
  mitra: { nama: string; src: string }[];
  /** Anggota tim konsultan (koleksi Tim). */
  tim: AnggotaTim[];
  /** Topik dropdown pada form kontak (koleksi Pengaturan). */
  topikKonsultasi: string[];
  /** Jam operasional pada kartu kontak (koleksi Pengaturan). */
  jamOperasional: { hari: string; jam: string }[];
  /** Item slug aktif untuk template halaman dinamis. */
  konteks: KonteksHalaman;
};

/** Ambil metadata dari objek `puck` dengan aman (selalu ada saat render). */
export function metadataDari(puck: { metadata: Record<string, unknown> }): MetadataPuck {
  return puck.metadata as MetadataPuck;
}
