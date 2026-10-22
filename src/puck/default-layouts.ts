import {
  DEFAULT_CARA_KERJA,
  DEFAULT_CTA,
  DEFAULT_FAQ_LAYANAN,
  DEFAULT_HARGA_LAYANAN,
  DEFAULT_HERO,
  DEFAULT_JUMLAH,
  DEFAULT_KEUNGGULAN,
  DEFAULT_KEUNGGULAN_TEMPLATE_LAYANAN,
  DEFAULT_LAYANAN_DETAIL_HERO,
  DEFAULT_MEDIA_NASIONAL,
  DEFAULT_MITRA,
  DEFAULT_TESTIMONI,
} from "./default-props";
import { HALAMAN_PUCK, rootPropsHalaman, type HalamanPuck, type LayoutPuck } from "./types";

/**
 * Layout bawaan per halaman.
 *
 * Dipakai saat seeding layout pertama kali dan sebagai sumber urutan section
 * yang setara dengan implementasi sebelum Page Builder. Hanya memakai import
 * relatif + data statis supaya bisa dijalankan lewat loader CLI Payload.
 */

const KONTEN_BERANDA: { type: string; props: Record<string, unknown> }[] = [
  { type: "Hero", props: { id: "hero-beranda", ...DEFAULT_HERO } },
  { type: "Keunggulan", props: { id: "keunggulan-beranda", ...DEFAULT_KEUNGGULAN } },
  {
    type: "Layanan",
    props: { id: "layanan-beranda", jumlah: DEFAULT_JUMLAH.Layanan },
  },
  { type: "CaraKerja", props: { id: "carakerja-beranda", ...DEFAULT_CARA_KERJA } },
  {
    type: "Artikel",
    props: { id: "artikel-beranda", jumlah: DEFAULT_JUMLAH.Artikel },
  },
  { type: "Mitra", props: { id: "mitra-beranda", ...DEFAULT_MITRA } },
  { type: "MediaNasional", props: { id: "medianasional-beranda", ...DEFAULT_MEDIA_NASIONAL } },
  {
    type: "Testimoni",
    props: { id: "testimoni-beranda", ...DEFAULT_TESTIMONI },
  },
  { type: "CTA", props: { id: "cta-beranda", ...DEFAULT_CTA } },
];

const KONTEN_TENTANG_KAMI: { type: string; props: Record<string, unknown> }[] = [
  { type: "TentangHero", props: { id: "tentanghero-tentang" } },
  { type: "CeritaKami", props: { id: "ceritakami-tentang" } },
  { type: "TimKonsultan", props: { id: "timkonsultan-tentang" } },
  { type: "MediaNasional", props: { id: "medianasional-tentang", ...DEFAULT_MEDIA_NASIONAL } },
  {
    type: "Testimoni",
    props: { id: "testimoni-tentang", ...DEFAULT_TESTIMONI },
  },
  { type: "CTA", props: { id: "cta-tentang", ...DEFAULT_CTA } },
];

const KONTEN_KONTAK: { type: string; props: Record<string, unknown> }[] = [
  { type: "KontakHero", props: { id: "kontakhero-kontak" } },
  { type: "FormPertanyaan", props: { id: "formpertanyaan-kontak" } },
  { type: "LokasiKantor", props: { id: "lokasikantor-kontak" } },
  { type: "FaqKontak", props: { id: "faqkontak-kontak" } },
];

const KONTEN_LAYANAN_LISTING: { type: string; props: Record<string, unknown> }[] = [
  { type: "LayananHero", props: { id: "layananhero-listing" } },
  { type: "Keunggulan", props: { id: "keunggulan-layanan-listing", ...DEFAULT_KEUNGGULAN } },
  {
    type: "DaftarLayanan",
    props: { id: "daftarlayanan-listing", jumlah: DEFAULT_JUMLAH.DaftarLayanan },
  },
  { type: "CaraKerja", props: { id: "carakerja-layanan-listing", ...DEFAULT_CARA_KERJA } },
  { type: "Mitra", props: { id: "mitra-layanan-listing", ...DEFAULT_MITRA } },
  { type: "MediaNasional", props: { id: "medianasional-layanan-listing", ...DEFAULT_MEDIA_NASIONAL } },
  {
    type: "Testimoni",
    props: { id: "testimoni-layanan-listing", ...DEFAULT_TESTIMONI },
  },
];

const KONTEN_TULISAN_PAJAK_LISTING: { type: string; props: Record<string, unknown> }[] = [
  { type: "PengantarArtikel", props: { id: "pengantar-artikel-listing" } },
  {
    type: "DaftarArtikel",
    props: { id: "daftarartikel-listing", perHalaman: DEFAULT_JUMLAH.DaftarArtikel },
  },
  { type: "CTA", props: { id: "cta-artikel-listing", ...DEFAULT_CTA } },
];

const KONTEN_TEMPLATE_LAYANAN_DETAIL: { type: string; props: Record<string, unknown> }[] = [
  {
    type: "LayananDetailHero",
    props: { id: "layanandetailhero-template-layanan", ...DEFAULT_LAYANAN_DETAIL_HERO },
  },
  { type: "Keunggulan", props: { id: "keunggulan-template-layanan", ...DEFAULT_KEUNGGULAN_TEMPLATE_LAYANAN } },
  {
    type: "HargaLayanan",
    props: { id: "hargalayanan-template-layanan", ...DEFAULT_HARGA_LAYANAN },
  },
  { type: "CaraKerja", props: { id: "carakerja-template-layanan", ...DEFAULT_CARA_KERJA } },
  { type: "Mitra", props: { id: "mitra-template-layanan", ...DEFAULT_MITRA } },
  { type: "MediaNasional", props: { id: "medianasional-template-layanan", ...DEFAULT_MEDIA_NASIONAL } },
  {
    type: "Testimoni",
    props: { id: "testimoni-template-layanan", ...DEFAULT_TESTIMONI },
  },
  {
    type: "FaqLayanan",
    props: { id: "faqlayanan-template-layanan", ...DEFAULT_FAQ_LAYANAN },
  },
  { type: "CTA", props: { id: "cta-template-layanan", ...DEFAULT_CTA } },
];

const KONTEN_TEMPLATE_ARTIKEL_DETAIL: { type: string; props: Record<string, unknown> }[] = [
  { type: "ArtikelDetailHero", props: { id: "artikeldetailhero-template-artikel" } },
  { type: "BadanArtikel", props: { id: "badanartikel-template-artikel" } },
  {
    type: "ArtikelTerkait",
    props: { id: "artikelterkait-template-artikel", jumlah: DEFAULT_JUMLAH.ArtikelTerkait },
  },
  { type: "CTA", props: { id: "cta-template-artikel", ...DEFAULT_CTA } },
];

/** Layout awal untuk sebuah halaman, atau `null` bila belum ada. */
export function layoutDefault(pageKey: string): LayoutPuck | null {
  const p = HALAMAN_PUCK as Record<string, HalamanPuck>;
  if (pageKey === p.beranda.key) {
    return {
      root: rootPropsHalaman(p.beranda),
      content: structuredClone(KONTEN_BERANDA),
    } as LayoutPuck;
  }
  if (pageKey === p["tentang-kami"].key) {
    return {
      root: rootPropsHalaman(p["tentang-kami"]),
      content: structuredClone(KONTEN_TENTANG_KAMI),
    } as LayoutPuck;
  }
  if (pageKey === p.kontak.key) {
    return {
      root: rootPropsHalaman(p.kontak),
      content: structuredClone(KONTEN_KONTAK),
    } as LayoutPuck;
  }
  if (pageKey === p["layanan-listing"].key) {
    return {
      root: rootPropsHalaman(p["layanan-listing"]),
      content: structuredClone(KONTEN_LAYANAN_LISTING),
    } as LayoutPuck;
  }
  if (pageKey === p["tulisan-pajak-listing"].key) {
    return {
      root: rootPropsHalaman(p["tulisan-pajak-listing"]),
      content: structuredClone(KONTEN_TULISAN_PAJAK_LISTING),
    } as LayoutPuck;
  }
  if (pageKey === p["template-layanan-detail"].key) {
    return {
      root: rootPropsHalaman(p["template-layanan-detail"]),
      content: structuredClone(KONTEN_TEMPLATE_LAYANAN_DETAIL),
    } as LayoutPuck;
  }
  if (pageKey === p["template-artikel-detail"].key) {
    return {
      root: rootPropsHalaman(p["template-artikel-detail"]),
      content: structuredClone(KONTEN_TEMPLATE_ARTIKEL_DETAIL),
    } as LayoutPuck;
  }
  return null;
}

export function semuaHalaman(): HalamanPuck[] {
  return Object.values(HALAMAN_PUCK);
}
