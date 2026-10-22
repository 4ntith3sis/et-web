import { situs } from "../data/situs";
import type {
  LayoutPuck,
  PropsCta,
  PropsHargaLayanan,
  PropsHero,
  PropsKeunggulan,
  PropsLayananDetailHero,
} from "./types";

/**
 * Nilai default teks untuk komponen berteks.
 *
 * Modul ini SENGAJA bebas React/DOM dan hanya memakai import relatif, karena
 * ikut dimuat oleh seed Payload melalui loader CLI (yang tidak memahami alias
 * `@/`). Semua nilai identik dengan tampilan v1, sehingga render biasa dan
 * render Puck menghasilkan keluaran yang sama.
 */

const BUKTI_HERO =
  "Membantu ribuan UMKM dan perusahaan menyusun laporan keuangan, e-filing SPT Tahunan/Masa, pengukuhan PKP, hingga pendampingan audit pajak 100% online & resmi.";

export const DEFAULT_HERO: PropsHero = {
  lencana: "Konsultan Pajak & Akuntansi",
  judul: "Terpercaya,",
  sorotan: "akurat & bebas denda.",
  deskripsi: BUKTI_HERO,
  poin: [
    { teks: "Pendampingan Audit & SP2DK" },
    { teks: "Konsultan Berizin Resmi" },
    { teks: "Garansi Kerahasiaan 100%" },
  ],
  ctaLabel: "Konsultasi Gratis",
  ctaHref: situs.whatsappUrl,
  cta2Label: "Lihat Layanan Kami",
  cta2Href: "/layanan",
};

export const DEFAULT_CTA: PropsCta = {
  lencana: "Siap Membantu Anda",
  judul:
    "Anda dapat fokus menjalankan bisnis, serahkan urusan perpajakan ke EasyTax",
  deskripsi:
    "Hubungi konsultan kami sekarang untuk mendapatkan konsultasi gratis dan solusi perpajakan terbaik bagi perusahaan Anda.",
  ctaLabel: "Chat WhatsApp Sekarang",
  ctaHref: situs.whatsappUrl,
  emailLabel: `Email: ${situs.kontak.email}`,
};

/**
 * Default desain Hero Detail Layanan.
 *
 * Hanya atribut desain/statis. Nama layanan, subjudul, deskripsi, dan gambar
 * berasal dari record CMS slug yang dibuka, bukan dari sini.
 */
export const DEFAULT_LAYANAN_DETAIL_HERO: PropsLayananDetailHero = {
  lencana: "Tax & Accounting Service",
  judul: "Nama Layanan",
  subjudul: "Subjudul",
  ringkasan: "Deskripsi Layanan",
  teksGambar: "Gambar",
  breadcrumbBeranda: "Beranda",
  breadcrumbLayanan: "Layanan",
  ctaLabel: "Konsultasi Gratis",
  ctaHref: situs.whatsappUrl,
  perataan: "kiri",
};

/** Default teks statis section Cara Kerja. */
export const DEFAULT_CARA_KERJA = {
  lencana: "Cara Kerja",
  judul: "Empat langkah sederhana untuk menyelesaikan urusan pajak yang rumit.",
};

/** Default teks statis section Media Nasional. */
export const DEFAULT_MEDIA_NASIONAL = {
  judul: "Telah Diliput Oleh Media Nasional:",
};

/** Default teks statis section Mitra. */
export const DEFAULT_MITRA = {
  lencana: "Mitra yang sudah percaya",
  judul: "Ribuan UMKM dan perusahaan mempercayakan pajaknya kepada EasyTax",
  deskripsi:
    "Pembukuan, perizinan PKP, sampai pelaporan SPT, semuanya ditangani tenaga ahli berlisensi dengan proses yang aman dan terlacak.",
  jumlah: 24,
};

/** Default teks statis section Testimoni. */
export const DEFAULT_TESTIMONI = {
  lencana: "Testimoni",
  judul: "Pengalaman dari mereka yang sudah kami layani",
  deskripsi:
    "Dari UMKM kuliner, retail, agency, hingga korporasi besar, semuanya mempercayakan urusan pajak dan pembukuan kepada EasyTax.",
  jumlah: 12,
};

/** Default teks statis section Faq Layanan. */
export const DEFAULT_FAQ_LAYANAN = {
  lencana: "FAQ",
  judul: "Pertanyaan Seputar Layanan",
  batas: 12,
};

/** Default teks statis section Keunggulan "Mengapa EasyTax?". */
export const DEFAULT_KEUNGGULAN: PropsKeunggulan = {
  lencana: "Solusi Pajak Terpercaya",
  judul: "Mengapa EasyTax?",
  deskripsi:
    "Solusi perpajakan terstruktur untuk mendampingi bisnis dan individu menghadapi kompleksitas pajak modern, mengelola kewajiban perpajakan, serta mengambil keputusan dengan lebih percaya diri.",
  perataan: "kiri",
};

/**
 * Judul section Keunggulan khusus Template Detail Layanan.
 *
 * Template ini dipakai bersama oleh semua slug, jadi teksnya generik
 * ("Keunggulan Layanan") — bukan nama salah satu layanan.
 */
export const DEFAULT_KEUNGGULAN_TEMPLATE_LAYANAN: PropsKeunggulan = {
  ...DEFAULT_KEUNGGULAN,
  judul: "Keunggulan Layanan",
};

/**
 * Default struktur kartu harga (section + satu kartu representatif).
 *
 * Nilai label di sini dipakai untuk pratinjau struktur di editor; renderer
 * publik mengganti nama/deskripsi/harga/fitur dengan data CMS per paket.
 */
export const DEFAULT_HARGA_LAYANAN: PropsHargaLayanan = {
  lencana: "Harga Transparan",
  judul: "Paket Layanan",
  deskripsi: "Pilih paket yang sesuai kebutuhan bisnis Anda.",
  labelKeunggulan: "Keunggulan",
  labelTombol: "Konsultasi",
  tombolHref: situs.whatsappUrl,
  perataan: "tengah",
  batas: 8,
};

/**
 * Jumlah item default tiap section yang mengambil data dari koleksi.
 * Nilainya >= jumlah konten yang di-seed sehingga beranda default menampilkan
 * seluruh item, sama seperti implementasi sebelumnya.
 */
export const DEFAULT_JUMLAH = {
  Layanan: 8,
  Artikel: 12,
  Mitra: 24,
  Testimoni: 12,
  DaftarLayanan: 24,
  DaftarArtikel: 6,
  HargaLayanan: 8,
  FaqLayanan: 12,
  ArtikelTerkait: 3,
} as const;

/**
 * Mengisi properti yang belum terisi (undefined, null, string kosong, atau array kosong)
 * pada satu komponen Puck dengan nilai bawaan resminya.
 */
export function lengkapiDefaultPropsKomponen(
  type: string,
  props: Record<string, unknown>,
  pageKey?: string,
): Record<string, unknown> {
  const defaults: Record<string, unknown> | null = (() => {
    switch (type) {
      case "LayananDetailHero":
        return DEFAULT_LAYANAN_DETAIL_HERO as unknown as Record<string, unknown>;
      case "Keunggulan":
        return (
          pageKey === "template-layanan-detail"
            ? DEFAULT_KEUNGGULAN_TEMPLATE_LAYANAN
            : DEFAULT_KEUNGGULAN
        ) as unknown as Record<string, unknown>;
      case "HargaLayanan":
        return DEFAULT_HARGA_LAYANAN as unknown as Record<string, unknown>;
      case "CaraKerja":
        return DEFAULT_CARA_KERJA;
      case "Mitra":
        return DEFAULT_MITRA;
      case "MediaNasional":
        return DEFAULT_MEDIA_NASIONAL;
      case "Testimoni":
        return DEFAULT_TESTIMONI;
      case "FaqLayanan":
        return DEFAULT_FAQ_LAYANAN;
      case "CTA":
        return DEFAULT_CTA as unknown as Record<string, unknown>;
      case "Hero":
        return DEFAULT_HERO as unknown as Record<string, unknown>;
      case "Layanan":
        return { jumlah: DEFAULT_JUMLAH.Layanan };
      case "Artikel":
        return { jumlah: DEFAULT_JUMLAH.Artikel };
      case "DaftarLayanan":
        return { jumlah: DEFAULT_JUMLAH.DaftarLayanan };
      case "DaftarArtikel":
        return { perHalaman: DEFAULT_JUMLAH.DaftarArtikel };
      case "ArtikelTerkait":
        return { jumlah: DEFAULT_JUMLAH.ArtikelTerkait };
      default:
        return null;
    }
  })();

  if (!defaults) return props;

  const hasil: Record<string, unknown> = { ...props };
  for (const [kunci, nilaiBawaan] of Object.entries(defaults)) {
    const nilai = hasil[kunci];
    if (nilai === undefined || nilai === null || nilai === "") {
      hasil[kunci] = nilaiBawaan;
    } else if (Array.isArray(nilaiBawaan) && (!Array.isArray(nilai) || nilai.length === 0)) {
      hasil[kunci] = nilaiBawaan;
    }
  }
  return hasil;
}

/**
 * Menjamin bahwa seluruh komponen di dalam LayoutPuck memiliki prop yang lengkap,
 * mencegah form input di sidebar Puck editor berstatus kosong bagi komponen
 * yang tersimpan sebelum field-field baru didaftarkan.
 */
export function lengkapiLayoutDefaultProps(
  layout: LayoutPuck,
  pageKey?: string,
): LayoutPuck {
  const content = (layout.content || []).map((item) => ({
    ...item,
    props: lengkapiDefaultPropsKomponen(
      item.type,
      (item.props || {}) as Record<string, unknown>,
      pageKey,
    ),
  }));

  const zones: Record<string, typeof layout.content> = {};
  if (layout.zones) {
    for (const [namaZone, daftarItem] of Object.entries(layout.zones)) {
      zones[namaZone] = daftarItem.map((item) => ({
        ...item,
        props: lengkapiDefaultPropsKomponen(
          item.type,
          (item.props || {}) as Record<string, unknown>,
          pageKey,
        ),
      }));
    }
  }

  return {
    ...layout,
    content,
    zones: Object.keys(zones).length > 0 ? zones : layout.zones,
  };
}
