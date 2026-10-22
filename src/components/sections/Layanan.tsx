"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { PanahKanan, PanahKiri } from "@/components/ikon";
import type { LayananBeranda } from "@/data/layanan";

/**
 * Section "Layanan Pajak & Keuangan" di beranda, diport dari easytax-demo:
 * judul terpusat + carousel kartu layanan yang bisa digeser horizontal.
 *
 * Data layanan diambil oleh server (halaman) dari CMS lalu dikirim sebagai
 * prop agar komponen ini tetap dapat berjalan di klien.
 */
export function Layanan({ layanan }: { layanan: LayananBeranda[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const geser = (arah: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: arah * track.clientWidth * 0.82,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="layanan"
      aria-labelledby="layanan-judul"
      className="relative overflow-hidden bg-white py-[clamp(44px,7vw,64px)] text-navy-900"
    >
      {/* Dekorasi radial lembut ala v1 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[150px] -right-[100px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-yellow)_10%,transparent)_0%,transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[150px] -left-[100px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-navy)_12%,transparent)_0%,transparent_70%)]"
      />

      <div className="relative mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="mx-auto mb-10 max-w-[680px] text-center">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-yellow-500/60 bg-yellow-500/12 px-4 py-1.5 text-[0.85rem] font-bold tracking-[0.04em] text-navy-900 uppercase">
            Layanan yang tersedia
          </span>
          <h2
            id="layanan-judul"
            className="mb-3.5 font-heading text-[clamp(1.7rem,3vw,2.35rem)] leading-[1.25] font-bold text-navy-900"
          >
            Layanan Pajak &amp; Keuangan EasyTax
          </h2>
          <p className="text-[1.05rem] leading-[1.7] text-teks-sekunder">
            Solusi komprehensif untuk segala kepatuhan perpajakan badan usaha dan
            perorangan.
          </p>
        </div>

        <div className="relative">
          <div className="mb-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => geser(-1)}
              aria-label="Geser layanan ke kiri"
              className="grid h-[42px] w-[42px] shrink-0 cursor-pointer place-items-center rounded-full border border-garis bg-white text-navy-900 shadow-sm transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-yellow-500"
            >
              <PanahKiri className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => geser(1)}
              aria-label="Geser layanan ke kanan"
              className="grid h-[42px] w-[42px] shrink-0 cursor-pointer place-items-center rounded-full border border-garis bg-white text-navy-900 shadow-sm transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-yellow-500"
            >
              <PanahKanan className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {layanan.map((layanan) => (
              <article
                key={layanan.slug}
                className="group flex min-w-0 flex-[0_0_calc((100%-72px)/4)] flex-col overflow-hidden rounded-xl border border-garis bg-white shadow-sm transition-[var(--transition-base)] hover:shadow-xl max-lg:flex-[0_0_calc((100%-48px)/3)] max-sm:flex-[0_0_86%]"
              >
                <div className="relative h-[200px] w-full shrink-0 overflow-hidden border-b border-garis bg-netral-lat">
                  <Image
                    src={layanan.gambar || "/images/placeholder-layanan.svg"}
                    alt={layanan.judul}
                    fill
                    sizes="(max-width: 640px) 86vw, (max-width: 1024px) 30vw, 22vw"
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}