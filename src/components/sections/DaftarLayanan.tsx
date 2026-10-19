"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Cari, PanahKanan, TutupLingkar } from "@/components/ikon";
import type { LayananBeranda } from "@/data/layanan";

/**
 * "Daftar Layanan yang Tersedia" — diport dari `ServiceGrid` easytax-demo:
 * judul rata kiri dengan badge, lalu grid tiga kolom kartu layanan.
 *
 * Berbeda dari carousel di beranda, di sini semua layanan tampil penuh dan
 * bisa dicari. Pencarian berjalan di sisi klien (data layanan kecil),
 * sehingga daftar dikirim sebagai prop dari server.
 */
export function DaftarLayanan({ layanan }: { layanan: LayananBeranda[] }) {
  const [kunci, setKunci] = useState("");

  const hasil = useMemo(() => {
    const q = kunci.trim().toLowerCase();
    if (!q) return layanan;
    return layanan.filter(
      (l) =>
        l.judul.toLowerCase().includes(q) ||
        l.subjudul.toLowerCase().includes(q) ||
        l.ringkasan.toLowerCase().includes(q),
    );
  }, [kunci, layanan]);

  return (
    <section
      id="katalog-layanan"
      aria-labelledby="daftar-layanan-judul"
      className="bg-white py-[clamp(44px,6.4vw,64px)]"
    >
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        {/* Judul + pencarian */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col items-start gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
              Daftar Layanan yang Tersedia
            </span>

            <h2
              id="daftar-layanan-judul"
              className="max-w-[700px] font-heading text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2] font-bold tracking-[-0.03em] text-navy-900 text-balance"
            >
              Pilihan Layanan yang Disesuaikan dengan Skala Bisnis Anda
            </h2>
          </div>

          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="w-full shrink-0 lg:w-[360px]"
          >
            <label htmlFor="cari-layanan" className="sr-only">
              Cari layanan
            </label>

            <div className="relative">
              <Cari
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-teks-redup"
              />
              <input
                id="cari-layanan"
                type="search"
                value={kunci}
                onChange={(e) => setKunci(e.target.value)}
                placeholder="Cari layanan, mis. SPT atau PKP"
                autoComplete="off"
                className="h-[52px] w-full rounded-md border border-garis bg-white pr-11 pl-11 text-[0.95rem] text-teks-gelap outline-none transition-[var(--transition-base)] placeholder:text-teks-redup focus:border-navy-900 [&::-webkit-search-cancel-button]:appearance-none"
              />
              {kunci.length > 0 && (
                <button
                  type="button"
                  onClick={() => setKunci("")}
                  aria-label="Bersihkan pencarian"
                  className="absolute top-1/2 right-3 grid h-7 w-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-teks-redup transition-colors hover:bg-netral-lat hover:text-navy-900"
                >
                  <TutupLingkar className="h-4 w-4" />
                </button>
              )}
            </div>

            <p aria-live="polite" className="mt-2.5 text-[0.82rem] text-teks-redup">
              {kunci.trim().length > 0
                ? `${hasil.length} layanan cocok dengan "${kunci.trim()}"`
                : `${layanan.length} layanan tersedia`}
            </p>
          </form>
        </div>

        {/* Hasil */}
        {hasil.length > 0 ? (
          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {hasil.map((layanan) => (
              <li key={layanan.slug}>
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-garis bg-white shadow-sm transition-[var(--transition-base)] hover:shadow-xl">
                  <div className="relative h-[200px] w-full shrink-0 overflow-hidden border-b border-garis bg-netral-lat">
                    <Image
                      src={layanan.gambar}
                      alt={layanan.judul}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex flex-1 flex-col px-5 py-6">
                    <h3 className="mb-2.5 font-heading text-[1.2rem] leading-[1.35] font-bold text-navy-900">
                      {layanan.judul}
                    </h3>
                    <p className="mb-5 flex-1 text-[0.9rem] leading-[1.6] text-teks-sekunder">
                      {layanan.ringkasan}
                    </p>
                    <Link
                      href={`/layanan/${layanan.slug}`}
                      className="inline-flex h-[42px] w-fit items-center gap-2 rounded-md bg-yellow-500 px-5 text-[0.9rem] font-extrabold text-navy-900 no-underline transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-kuning"
                    >
                      <PanahKanan className="h-3.5 w-3.5" />
                      Lihat Detail Layanan
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-dashed border-garis bg-netral-lat px-6 py-16 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white text-teks-redup shadow-sm">
              <Cari className="h-6 w-6" />
            </span>
            <p className="font-heading text-[1.15rem] font-bold text-navy-900">
              Layanan &ldquo;{kunci.trim()}&rdquo; belum ditemukan
            </p>
            <p className="max-w-[420px] text-[0.92rem] leading-[1.6] text-teks-sekunder">
              Coba kata kunci lain seperti SPT, PKP, pembukuan, atau restitusi.
              Kalau kebutuhannya belum ada, tim kami siap menyusun solusi
              khusus.
            </p>
            <button
              type="button"
              onClick={() => setKunci("")}
              className="h-11 cursor-pointer rounded-md bg-navy-900 px-6 text-[0.9rem] font-bold text-white transition-[var(--transition-base)] hover:-translate-y-0.5 hover:shadow-lg"
            >
              Tampilkan semua layanan
            </button>
          </div>
        )}
      </div>
    </section>
  );
}