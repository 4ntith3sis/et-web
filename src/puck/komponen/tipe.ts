import type { Slot } from "@puckeditor/core";

import type { NamaIkon } from "@/types";

/**
 * Tipe props untuk komponen generik Page Builder.
 *
 * Komponen generik melengkapi section website bawaan EasyTax: admin dapat
 * menyusun layout sendiri (Section/Grid/Row), menaruh konten (Heading, Text,
 * Image), dan membentuk kartu tanpa menulis kode. Semua satuan panjang yang
 * ditampilkan ke admin memakai px; nilainya di-clamp saat render.
 */

export type MediaTerpilih = {
  id?: string | number;
  url: string;
  alt: string;
  width?: number;
  height?: number;
};

export type NadaLatar = "putih" | "latar" | "alt" | "navy" | "transparan";
export type WarnaTeks = "otomatis" | "navy" | "kuning" | "putih" | "sekunder" | "redup";
export type Rata = "kiri" | "tengah" | "kanan";
export type Tebal = "400" | "500" | "600" | "700" | "800" | "900";

export type PropsSection = {
  latar: NadaLatar;
  paddingAtas: number;
  paddingBawah: number;
  paddingX: number;
  lebar: "konten" | "penuh";
  konten: Slot;
};

export type PropsContainer = {
  lebarMaks: number;
  paddingX: number;
  konten: Slot;
};

export type PropsGrid = {
  kolom: number;
  gap: number;
  rata: "atas" | "tengah" | "bawah";
  konten: Slot;
};

export type PropsRow = {
  gap: number;
  sejajar: "kiri" | "tengah" | "kanan" | "spasi";
  rata: "atas" | "tengah" | "bawah";
  bungkus: boolean;
  konten: Slot;
};

export type PropsColumn = {
  lebar: number;
  konten: Slot;
};

export type PropsStack = {
  gap: number;
  rata: Rata;
  konten: Slot;
};

export type PropsSpacer = {
  tinggi: number;
};

export type PropsDivider = {
  warna: WarnaTeks;
  ketebalan: number;
  lebar: number;
  margin: number;
};

export type PropsHeading = {
  teks: string;
  tingkat: "h1" | "h2" | "h3" | "h4";
  ukuran: number;
  tebal: Tebal;
  warna: WarnaTeks;
  rata: Rata;
  lebarMaks: number;
};

export type PropsText = {
  teks: string;
  ukuran: number;
  tebal: Tebal;
  tinggiBaris: number;
  warna: WarnaTeks;
  rata: Rata;
  lebarMaks: number;
};

export type PropsImage = {
  media: MediaTerpilih;
  rasio: "asli" | "16-9" | "4-3" | "1-1" | "3-4";
  pasFit: "cover" | "contain";
  radius: number;
  lebarMaks: number;
  rata: Rata;
  keterangan: string;
};

export type PropsBadge = {
  teks: string;
  nada: "kuning" | "navy" | "hijau" | "terang" | "putih";
};

export type ItemDaftar = { teks: string };

export type PropsList = {
  item: ItemDaftar[];
  penanda: "bullet" | "centang" | "angka";
  warna: WarnaTeks;
  ukuran: number;
};

export type PropsQuote = {
  teks: string;
  penulis: string;
  jabatan: string;
  nada: NadaLatar;
};

export type PropsIcon = {
  nama: NamaIkon;
  ukuran: number;
  warna: WarnaTeks;
  rata: Rata;
};

export type PropsButton = {
  label: string;
  href: string;
  varian: "utama" | "sekunder" | "garis" | "garisPutih" | "halus";
  ukuran: "kecil" | "sedang" | "besar";
  rata: Rata;
  tabBaru: boolean;
};

export type ItemTombol = {
  label: string;
  href: string;
  varian: PropsButton["varian"];
};

export type PropsButtonGroup = {
  tombol: ItemTombol[];
  gap: number;
  rata: Rata;
};

export type PropsLink = {
  teks: string;
  href: string;
  eksternal: boolean;
  warna: WarnaTeks;
  ukuran: number;
};

export type PropsCard = {
  judul: string;
  deskripsi: string;
  media: MediaTerpilih;
  ikon: NamaIkon | "";
  tautanLabel: string;
  tautanHref: string;
  latar: NadaLatar;
  padding: number;
  radius: number;
  garis: boolean;
  bayangan: "tidak" | "kecil" | "sedang" | "besar";
  rata: Rata;
};

export type PropsFeatureCard = {
  ikon: NamaIkon;
  judul: string;
  deskripsi: string;
  nada: "kuning" | "navy" | "hijau" | "terang";
  rata: Rata;
};

export type PropsStatCard = {
  angka: string;
  label: string;
  deskripsi: string;
  warnaAngka: WarnaTeks;
  rata: Rata;
};

export type PropsGeneric = {
  Section: PropsSection;
  Container: PropsContainer;
  Grid: PropsGrid;
  Row: PropsRow;
  Column: PropsColumn;
  Stack: PropsStack;
  Spacer: PropsSpacer;
  Divider: PropsDivider;
  Heading: PropsHeading;
  Text: PropsText;
  Image: PropsImage;
  Badge: PropsBadge;
  List: PropsList;
  Quote: PropsQuote;
  Icon: PropsIcon;
  Button: PropsButton;
  ButtonGroup: PropsButtonGroup;
  Link: PropsLink;
  Card: PropsCard;
  FeatureCard: PropsFeatureCard;
  StatCard: PropsStatCard;
};

export type NamaKomponenGeneric = keyof PropsGeneric;

export const NAMA_KOMPONEN_GENERIC: NamaKomponenGeneric[] = [
  "Section",
  "Container",
  "Grid",
  "Row",
  "Column",
  "Stack",
  "Spacer",
  "Divider",
  "Heading",
  "Text",
  "Image",
  "Badge",
  "List",
  "Quote",
  "Icon",
  "Button",
  "ButtonGroup",
  "Link",
  "Card",
  "FeatureCard",
  "StatCard",
];

/** Slot hanya boleh berisi komponen isi; container tetap di level atas. */
export const KOMPONEN_ISI: NamaKomponenGeneric[] = [
  "Heading",
  "Text",
  "Image",
  "Badge",
  "List",
  "Quote",
  "Icon",
  "Button",
  "ButtonGroup",
  "Link",
  "Card",
  "FeatureCard",
  "StatCard",
  "Grid",
  "Row",
  "Column",
  "Stack",
  "Spacer",
  "Divider",
];

export const KOMPONEN_AKAR: NamaKomponenGeneric[] = [
  "Section",
  "Container",
  "Spacer",
  "Divider",
  "Heading",
  "Text",
  "Image",
  "Grid",
  "Row",
  "Stack",
];
