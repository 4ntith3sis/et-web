import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Centang, PanahKanan, Rumah } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { tautanKonsultasiWhatsApp } from "@/features/whatsapp/config";

export type RemahHero = { label: string; href?: string };

export type KartuHero = {
  nilai: string;
  label: string;
  ikon: ReactNode;
  posisi: "kiri-atas" | "kanan-bawah";
};

export type TombolHero = {
  label: string;
  href: string;
  eksternal?: boolean;
};

type PropsHeroPanel = {
  /** Remah breadcrumb; tanpa `href` berarti halaman saat ini. */
  remah: RemahHero[];
  judul: ReactNode;
  deskripsi: string;
  tombolUtama: TombolHero;
  tombolSekunder?: TombolHero;
  bukti?: string[];
  gambar: { src: string; alt: string };
  kartu?: KartuHero[];
};

/**
 * Hero panel bersama untuk halaman /layanan dan /tentang-kami.
 *
 * Meniru `AboutHero` easytax-demo: latar navy, breadcrumb, judul dengan
 * satu bagian kuning, dua tombol, baris bukti, dan foto dengan kartu
 * statistik melayang. Dipisah dari konten supaya kedua halaman seragam.
 */
export function HeroPanel({
  remah,
  judul,
  deskripsi,
  tombolUtama,
  tombolSekunder,
  bukti = [],
  gambar,
  kartu = [],
}: PropsHeroPanel) {
  return (
    <section className="border-b border-white/10 bg-navy-900 px-6 pt-[clamp(48px,6vw,60px)] pb-[clamp(48px,6.4vw,70px)] text-white md:px-8">
      <div className="mx-auto grid w-full max-w-maks grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-2 text-[0.9rem] text-teks-terang"
          >
            {remah.map((r, i) => (
              <span key={r.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">&gt;</span>}
                {r.href ? (
                  <Link
                    href={r.href}
                    className="flex items-center gap-2 no-underline"
                  >
                    {i === 0 && <Rumah className="h-3.5 w-3.5" />}
                    {r.label}
                  </Link>
                ) : (
                  <span className="font-bold text-yellow-500">{r.label}</span>
                )}
              </span>
            ))}
          </nav>

          <h1 className="my-[18px] font-heading text-[clamp(1.9rem,3.4vw,2.8rem)] leading-[1.15] font-black tracking-[-0.03em] text-white 2xl:text-[3.1rem]">
            {judul}
          </h1>

          <p className="max-w-[620px] text-[1.05rem] leading-[1.7] text-teks-terang">
            {deskripsi}
          </p>

          <div className="mt-7 flex w-fit flex-wrap items-center gap-4">
            <Tombol
              href={tombolUtama.href.startsWith("/api/konsultasi/whatsapp") ? tautanKonsultasiWhatsApp(undefined, "hero-panel") : tombolUtama.href}
              {...(tombolUtama.href.startsWith("/api/konsultasi/whatsapp") ? {} : tombolUtama.eksternal ? { external: true } : {})}
              ukuran="sedang"
              ikonKanan={<PanahKanan className="h-4 w-4" />}
              className="w-fit rounded-md py-[13px] px-7 text-[0.95rem]"
            >
              {tombolUtama.label}
            </Tombol>

            {tombolSekunder && (
              <Tombol
                href={tombolSekunder.href}
                varian="garisPutih"
                ukuran="sedang"
                className="w-fit rounded-md py-[13px] px-7 text-[0.95rem]"
              >
                {tombolSekunder.label}
              </Tombol>
            )}
          </div>

          {bukti.length > 0 && (
            <ul className="mt-[18px] flex flex-wrap items-center gap-x-9 gap-y-3">
              {bukti.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[0.9rem] font-semibold whitespace-nowrap text-white"
                >
                  <Centang className="h-4 w-4 shrink-0 text-emerald-accent" />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative min-h-[352px] overflow-hidden rounded-[28px] border border-garis bg-navy-900 shadow-lg">
          <Image
            src={gambar.src}
            alt={gambar.alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-center"
          />

          {kartu.map((k) => (
            <div
              key={k.label}
              className={
                k.posisi === "kiri-atas"
                  ? "absolute top-5 left-4 flex items-center gap-3 rounded-2xl bg-white/95 px-4.5 py-3 shadow-md"
                  : "absolute right-4 bottom-5 flex items-center gap-3 rounded-2xl bg-white/95 px-4.5 py-3 shadow-md"
              }
            >
              <span className="shrink-0 text-yellow-500">{k.ikon}</span>
              <span className="font-heading text-[1.1rem] leading-none font-bold text-navy-900">
                {k.nilai}
                <small className="mt-1 block font-body text-[0.76rem] font-bold text-teks-redup">
                  {k.label}
                </small>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
