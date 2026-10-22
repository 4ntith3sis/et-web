import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Definisi font situs (satu sumber kebenaran).
 *
 * Diimpor oleh SETIAP root layout: `(website)` (menerapkan class variabelnya ke
 * `<html>`) dan `(payload)` (agar `@font-face` ikut terbit di dokumen admin).
 *
 * Penting: kanvas Puck (`syncHostStyles`) menyalin `style`/`link[rel=stylesheet]`
 * dari dokumen ADMIN ke iframe. Bila dokumen admin tidak memuat `@font-face`
 * Outfit/Plus Jakarta Sans, kanvas jatuh ke font sistem — berbeda dari halaman
 * publik. Karena itu font juga dimuat di layout admin walau keluarannya sama
 * sekali tidak dipakai untuk teks admin itu sendiri.
 */
export const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});
