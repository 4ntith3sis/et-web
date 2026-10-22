import Image from "next/image";
import Link from "next/link";

import { Dokumen, Jam, Pengguna, Rumah } from "@/components/ikon";
import type { ArtikelBeranda } from "@/data/artikel";

/**
 * Hero halaman detail artikel /tulisan-pajak/[slug].
 *
 * Berbeda dari easytax-demo (v1) yang memakai header terpusat di latar
 * putih: di sini judul dan meta di atas latar navy, lalu foto artikel
 * di bawahnya saling menumpuk dengan section isi (foto menjorok ke
 * bawah melewati batas hero).
 */
export function ArtikelDetailHero({
  artikel,
  penulis,
}: {
  artikel: ArtikelBeranda;
  penulis: string;
}) {
  return (
    <section className="bg-navy-900 px-6 pt-[clamp(48px,6vw,60px)] text-white md:px-8">
      <div className="mx-auto w-full max-w-maks">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-[0.88rem] text-teks-terang"
        >
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Rumah className="h-3.5 w-3.5" />
            Beranda
          </Link>
          <span aria-hidden="true">&gt;</span>
          <Link href="/tulisan-pajak" className="no-underline">
            Artikel &amp; Edukasi Perpajakan
          </Link>
          <span aria-hidden="true">&gt;</span>
          <span className="font-bold text-yellow-500">{artikel.kategori}</span>
        </nav>

        <span className="inline-flex items-center rounded-full bg-yellow-500 px-3.5 py-1.5 text-[0.75rem] font-extrabold tracking-[0.05em] text-navy-900 uppercase shadow-sm">
          {artikel.kategori}
        </span>

        <h1 className="mt-5 max-w-[880px] font-heading text-[clamp(1.85rem,3.6vw,2.9rem)] leading-[1.18] font-black tracking-[-0.02em] text-white text-balance 2xl:max-w-[960px] 2xl:text-[3.15rem]">
          {artikel.judul}
        </h1>

        <ul className="mt-6 flex flex-wrap items-center gap-3">
          <li className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[0.84rem] text-teks-terang">
            <Pengguna className="h-4 w-4 text-yellow-500" />
            {penulis}
          </li>
          <li className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[0.84rem] text-teks-terang">
            <Dokumen className="h-4 w-4 text-yellow-500" />
            {artikel.tanggal}
          </li>
          <li className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[0.84rem] text-teks-terang">
            <Jam className="h-4 w-4 text-yellow-500" />
            {artikel.waktuBaca}
          </li>
        </ul>
      </div>

      {/* Foto artikel saling menumpuk dengan section isi di bawah. */}
      <div className="relative z-10 mx-auto mt-9 w-full max-w-[1000px] -mb-14 2xl:max-w-[1120px]">
        <div className="relative h-[260px] overflow-hidden rounded-2xl border border-white/15 bg-navy-900 shadow-xl sm:h-[340px] lg:h-[420px] 2xl:h-[460px]">
          <Image
            src={artikel.gambar || "/images/placeholder-artikel.svg"}
            alt={artikel.judul}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, (max-width: 1535px) 1000px, 1120px"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}
