"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Jam, PanahKanan, PanahKiri } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import type { ArtikelBeranda } from "@/data/artikel";

/**
 * Section Artikel di beranda: kolom kiri berisi judul + deskripsi + tombol
 * "Lihat Semua Artikel", kolom kanan carousel kartu artikel (2 per tampilan
 * di sm+, 1 di mobile) dengan tombol navigasi di tepi thumbnail 16:9.
 *
 * Daftar artikel diambil server dari CMS dan dikirim sebagai prop.
 */
export function Artikel({ artikel }: { artikel: ArtikelBeranda[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [bisaKiri, setBisaKiri] = useState(false);
  const [bisaKanan, setBisaKanan] = useState(false);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const perbarui = () => {
      const maks = el.scrollWidth - el.clientWidth;
      setBisaKiri(el.scrollLeft > 4);
      setBisaKanan(el.scrollLeft < maks - 4);
    };

    perbarui();
    el.addEventListener("scroll", perbarui, { passive: true });
    window.addEventListener("resize", perbarui);
    return () => {
      el.removeEventListener("scroll", perbarui);
      window.removeEventListener("resize", perbarui);
    };
  }, [artikel.length]);

  const geser = (arah: number) => {
    const el = viewportRef.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>("[data-slide]");
    const langkah = slide ? slide.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    const kurangiGerak = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: arah * langkah,
      behavior: kurangiGerak ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="artikel"
      aria-labelledby="artikel-judul"
      className="bg-netral-lat py-[clamp(48px,6.4vw,88px)]"
    >
      <div className="mx-auto grid w-full max-w-maks grid-cols-1 gap-10 px-6 lg:grid-cols-[minmax(0,40fr)_minmax(0,60fr)] lg:gap-8 md:px-8">
        {/* Kolom kiri: pengantar */}
        <div className="min-w-0">
          <h2
            id="artikel-judul"
            className="relative pl-6 font-heading text-[clamp(2.1rem,3.4vw,3.1rem)] leading-[1.12] font-extrabold tracking-[-0.01em] text-navy-900 text-balance max-lg:text-[2.4rem] max-sm:pl-[18px] max-sm:text-[2rem]"
          >
            <span
              aria-hidden="true"
              className="absolute top-[0.12em] left-0 h-[1.05em] w-1 rounded-[3px] bg-yellow-500"
            />
            Jelajahi Artikel dan Wawasan Kami
          </h2>

          <p className="mt-7 max-w-[440px] text-[1.05rem] leading-[1.7] text-teks-sekunder">
            Temukan informasi terbaru, panduan perpajakan, dan wawasan praktis
            untuk membantu Anda memahami serta mengelola kebutuhan pajak dengan
            lebih baik.
          </p>

          <Tombol
            href="/tulisan-pajak"
            varian="garisSolid"
            ukuran="sedang"
            ikonKanan={<PanahKanan className="h-4 w-4" />}
            className="mt-8 rounded-full py-3.5 text-[1rem] shadow-none"
          >
            Lihat Semua Artikel
          </Tombol>
        </div>

        {/* Kolom kanan: carousel */}
        <div className="relative min-w-0">
          <div
            ref={viewportRef}
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Artikel dan wawasan terbaru"
            className="overflow-x-auto overflow-y-hidden pt-2.5 pb-3 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex items-stretch gap-6">
              {artikel.map((artikel) => (
                <div
                  key={artikel.slug}
                  data-slide
                  className="flex w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)]"
                >
                  <KartuArtikel artikel={artikel} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => geser(-1)}
            disabled={!bisaKiri}
            aria-label="Artikel sebelumnya"
            className="absolute top-[96px] left-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-garis bg-white text-navy-900 shadow-md transition-colors not-disabled:hover:border-navy-900 not-disabled:hover:bg-navy-900 not-disabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35 max-lg:left-8 max-lg:translate-x-0"
          >
            <PanahKiri className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => geser(1)}
            disabled={!bisaKanan}
            aria-label="Artikel berikutnya"
            className="absolute top-[96px] right-0 grid h-14 w-14 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-garis bg-white text-navy-900 shadow-md transition-colors not-disabled:hover:border-navy-900 not-disabled:hover:bg-navy-900 not-disabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35 max-lg:right-8 max-lg:translate-x-0"
          >
            <PanahKanan className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function KartuArtikel({ artikel }: { artikel: ArtikelBeranda }) {
  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-garis bg-white shadow-sm transition-[var(--transition-base)] hover:-translate-y-2 hover:shadow-lg">
      <div className="group/thumb relative aspect-video shrink-0 overflow-hidden bg-navy-900">
        <Image
          src={artikel.gambar || "/images/placeholder-artikel.svg"}
          alt={artikel.judul}
          fill
          sizes="(max-width: 639px) 92vw, (max-width: 1023px) 50vw, 320px"
          className="object-cover transition-transform duration-300 group-hover/thumb:scale-105"
        />
        <span className="absolute top-4 left-4 z-2 rounded-full bg-yellow-500 px-3 py-1 text-[0.75rem] font-bold shadow-sm tracking-[0.03em] text-navy-900 uppercase">
          {artikel.kategori}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-[18px]">
        <div className="mb-3 flex items-center gap-4 text-[0.82rem] text-teks-redup">
          <span>{artikel.tanggal}</span>
          <span className="flex items-center gap-1.5">
            <Jam className="h-3.5 w-3.5" />
            {artikel.waktuBaca}
          </span>
        </div>

        <h3 className="mb-3 line-clamp-2 font-heading text-[1.22rem] leading-[1.4] font-bold tracking-[-0.02em] text-navy-900">
          <Link href={`/tulisan-pajak/${artikel.slug}`} className="no-underline">
            {artikel.judul}
          </Link>
        </h3>

        <p className="mb-5 line-clamp-3 flex-1 text-[0.9rem] leading-[1.6] text-teks-sekunder">
          {artikel.ringkasan}
        </p>

        <Link
          href={`/tulisan-pajak/${artikel.slug}`}
          className="inline-flex w-fit items-center gap-2 py-1 text-[0.88rem] font-bold text-navy-900 no-underline transition-all hover:gap-3"
        >
          Baca Selengkapnya
          <PanahKanan className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}