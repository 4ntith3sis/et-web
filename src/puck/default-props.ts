import { situs } from "../data/situs";
import type { PropsCta, PropsHero } from "./types";

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
 * Jumlah item default tiap section yang mengambil data dari koleksi.
 * Nilainya >= jumlah konten yang di-seed sehingga beranda default menampilkan
 * seluruh item, sama seperti implementasi sebelumnya.
 */
export const DEFAULT_JUMLAH = {
  Layanan: 8,
  Artikel: 12,
  Mitra: 24,
  Testimoni: 12,
} as const;
