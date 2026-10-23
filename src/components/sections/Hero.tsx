import Image from "next/image";

import { Centang, Medali, PanahKanan, Perisai } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";
import { DEFAULT_HERO } from "@/puck/default-props";
import type { PropsHero } from "@/puck/types";

const FOTO_HERO =
  "/images/external/photo-1531482615713-2afd69097998.webp";

/**
 * Hero v1 EasyTax: latar navy penuh, dua kolom (55/45). Kolom kiri berisi
 * tag pill, judul, deskripsi, dua CTA, dan baris bukti; kolom kanan foto
 * dengan gradien kiri serta badge sertifikat mengambang.
 */
export function Hero(props: Partial<PropsHero> = {}) {
  const {
    lencana,
    judul,
    sorotan,
    deskripsi,
    poin,
    ctaLabel,
    ctaHref,
    cta2Label,
    cta2Href,
  } = { ...DEFAULT_HERO, ...props };

  return (
    <section
      id="hero"
      aria-labelledby="hero-judul"
      className="relative overflow-hidden bg-navy-900 text-white"
    >
      <div className="grid w-full grid-cols-1 items-stretch lg:grid-cols-[minmax(0,55%)_minmax(0,45%)]">
        {/* Kolom teks */}
        <div className="z-3 flex flex-col justify-center px-6 pt-[clamp(52px,6vw,92px)] pb-[clamp(48px,5vw,72px)] md:px-8 lg:pr-9 lg:pl-[max(24px,calc((100vw_-_var(--container-maks))/2_+_24px))]">
          <p className="inline-flex w-max max-w-full items-center gap-2.5 rounded-full border border-white/16 bg-white/6 px-4 py-2.5 text-[0.78rem] font-extrabold tracking-[0.13em] text-yellow-500 uppercase">
            <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-yellow-500" />
            {lencana}
          </p>

          <h1
            id="hero-judul"
            className="mt-5.5 mb-6 max-w-[640px] font-heading text-[clamp(2.6rem,4vw,3.4rem)] leading-[1.08] font-black tracking-[-0.03em] text-white uppercase 2xl:max-w-[700px] 2xl:text-[3.8rem]"
          >
            {judul}{" "}
            <span className="text-yellow-500">{sorotan}</span>
          </h1>

          <p className="mb-8 max-w-[520px] text-[1.08rem] leading-[1.7] text-teks-terang">
            {deskripsi}
          </p>

          <div className="mb-[30px] flex flex-wrap gap-4">
            {!ctaHref || ctaHref.includes("mauorder") || ctaHref.startsWith("/api/konsultasi/whatsapp") || /konsultasi|whatsapp/i.test(ctaLabel) ? (
              <ConsultationButton
                sumber="hero"
                ukuran="sedang"
                ikonKanan={<PanahKanan className="h-4 w-4" />}
                className="h-[54px] rounded-full px-9 text-[1rem]"
              >
                {ctaLabel}
              </ConsultationButton>
            ) : (
              <Tombol
                href={ctaHref}
                external
                ukuran="sedang"
                ikonKanan={<PanahKanan className="h-4 w-4" />}
                className="h-[54px] rounded-full px-9 text-[1rem]"
              >
                {ctaLabel}
              </Tombol>
            )}
            <Tombol
              href={cta2Href}
              varian="garisPutih"
              ukuran="sedang"
              className="h-[54px] rounded-full px-8 text-[1rem]"
            >
              {cta2Label}
            </Tombol>
          </div>

          <ul className="flex flex-wrap items-center gap-x-7 gap-y-3.5">
            {poin.map((item) => (
              <li
                key={item.teks}
                className="flex items-center gap-2 text-[0.92rem] font-bold text-white"
              >
                <Centang className="h-4.5 w-4.5 shrink-0 text-emerald-accent" />
                {item.teks}
              </li>
            ))}
          </ul>
        </div>

        {/* Kolom media */}
        <div className="relative h-[min(52vh,480px)] lg:h-auto">
          <div
            aria-hidden="true"
            className="gradasi-hero-foto absolute inset-y-0 left-0 z-1 w-full lg:w-[40%]"
          />
          <Image
            src={FOTO_HERO}
            alt="EasyTax Konsultan Pajak & Akuntansi"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-x-5 bottom-5 z-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 rounded-xl border border-white/20 bg-navy-900/92 px-6 py-3.5 shadow-lg backdrop-blur-[14px] lg:inset-x-auto lg:right-8 lg:bottom-8 lg:flex-nowrap">
            <span className="flex shrink-0 items-center gap-2 text-[0.8rem] leading-none font-extrabold text-white whitespace-nowrap">
              <Medali className="h-5.5 w-5.5 shrink-0 text-yellow-500" />
              Konsultan Berizin Resmi
            </span>
            <span className="hidden h-[30px] w-px bg-white/20 sm:block" />
            <span className="flex shrink-0 items-center gap-2 text-[0.8rem] leading-none font-extrabold text-white whitespace-nowrap">
              <Perisai className="h-5.5 w-5.5 shrink-0 text-emerald-accent" />
              Terdaftar Resmi Kemenkeu/DJP
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
