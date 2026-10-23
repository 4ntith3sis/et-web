import type { Metadata } from "next";

import { outfit, plusJakarta } from "@/lib/fonts";

import "./globals.css";

/**
 * 404 global untuk URL yang tidak cocok dengan route mana pun.
 *
 * Aplikasi ini punya beberapa root layout (frontend, admin-tools, payload),
 * sehingga `(frontend)/not-found.tsx` tidak dipakai untuk URL liar. File ini
 * dirender di luar layout, jadi harus memuat stylesheet dan font sendiri.
 */
export const metadata: Metadata = {
  title: "Halaman Tidak Ditemukan | EasyTax",
  description:
    "Halaman yang Anda cari tidak ditemukan. Kembali ke beranda atau lihat layanan EasyTax.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-navy-900">
        <main className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mx-auto max-w-md">
            <span className="inline-block rounded-full bg-navy-900/5 px-4 py-1.5 text-xs font-bold tracking-wider text-navy-900 uppercase">
              Error 404
            </span>
            <h1 className="mt-4 font-heading text-4xl font-extrabold tracking-tight text-navy-900 sm:text-5xl">
              Halaman Tidak Ditemukan
            </h1>
            <p className="mt-4 text-base leading-relaxed text-neutral-600">
              Maaf, halaman yang Anda tuju tidak ditemukan atau alamat URL yang
              Anda masukkan salah.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="/"
                className="inline-flex h-12 items-center justify-center rounded-full bg-yellow-500 px-6 font-semibold text-navy-900 transition hover:bg-yellow-400"
              >
                Kembali ke Beranda
              </a>
              <a
                href="/layanan"
                className="inline-flex h-12 items-center justify-center rounded-full border border-navy-900/20 px-6 font-semibold text-navy-900 transition hover:bg-navy-900/5"
              >
                Lihat Layanan
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
