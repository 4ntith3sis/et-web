import type { Data } from "@puckeditor/core";

import type { ArtikelBeranda } from "../data/artikel";
import type { LayananBeranda } from "../data/layanan";
import type { Testimoni as ItemTestimoni } from "../data/testimoni";

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

export type PropsPuck = {
  /** Hero navy dua kolom di puncak beranda. */
  Hero: PropsHero;
  /** Blok keunggulan bergradasi (statis). */
  Keunggulan: Record<string, never>;
  /** Grid kartu layanan; jumlah menentukan berapa kartu ditampilkan. */
  Layanan: { jumlah: number };
  /** Langkah alur kerja (statis). */
  CaraKerja: Record<string, never>;
  /** Carousel artikel; jumlah menentukan berapa artikel dimuat. */
  Artikel: { jumlah: number };
  /** Carousel logo mitra; jumlah menentukan berapa logo dimuat. */
  Mitra: { jumlah: number };
  /** Baris liputan media (statis). */
  MediaNasional: Record<string, never>;
  /** Marquee testimoni; jumlah menentukan berapa testimoni dimuat. */
  Testimoni: { jumlah: number };
  /** Banner CTA penutup di atas footer. */
  CTA: PropsCta;
};

export type NamaKomponenPuck = keyof PropsPuck;

/** Daftar nama komponen yang sah — dipakai validator server. */
export const NAMA_KOMPONEN_PUCK: NamaKomponenPuck[] = [
  "Hero",
  "Keunggulan",
  "Layanan",
  "CaraKerja",
  "Artikel",
  "Mitra",
  "MediaNasional",
  "Testimoni",
  "CTA",
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
};

/** Ambil metadata dari objek `puck` dengan aman (selalu ada saat render). */
export function metadataDari(puck: { metadata: Record<string, unknown> }): MetadataPuck {
  return puck.metadata as MetadataPuck;
}
