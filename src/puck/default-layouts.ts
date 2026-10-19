import { DEFAULT_CTA, DEFAULT_HERO, DEFAULT_JUMLAH } from "./default-props";
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
  { type: "Keunggulan", props: { id: "keunggulan-beranda" } },
  {
    type: "Layanan",
    props: { id: "layanan-beranda", jumlah: DEFAULT_JUMLAH.Layanan },
  },
  { type: "CaraKerja", props: { id: "carakerja-beranda" } },
  {
    type: "Artikel",
    props: { id: "artikel-beranda", jumlah: DEFAULT_JUMLAH.Artikel },
  },
  { type: "Mitra", props: { id: "mitra-beranda", jumlah: DEFAULT_JUMLAH.Mitra } },
  { type: "MediaNasional", props: { id: "medianasional-beranda" } },
  {
    type: "Testimoni",
    props: { id: "testimoni-beranda", jumlah: DEFAULT_JUMLAH.Testimoni },
  },
  { type: "CTA", props: { id: "cta-beranda", ...DEFAULT_CTA } },
];

/** Layout awal untuk sebuah halaman, atau `null` bila belum ada. */
export function layoutDefault(pageKey: string): LayoutPuck | null {
  if (pageKey === HALAMAN_PUCK.beranda.key) {
    return {
      root: rootPropsHalaman(HALAMAN_PUCK.beranda),
      content: structuredClone(KONTEN_BERANDA),
    } as LayoutPuck;
  }
  return null;
}

export function semuaHalaman(): HalamanPuck[] {
  return Object.values(HALAMAN_PUCK);
}
