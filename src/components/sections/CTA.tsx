import { Email, Obrolan } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";
import { situs } from "@/data/situs";
import { DEFAULT_CTA } from "@/puck/default-props";
import type { PropsCta } from "@/puck/types";

/**
 * Banner CTA penutup di atas footer: panel navy membulat (rounded-xl) di
 * atas section putih — bentuknya disamakan dengan CTA penutup halaman
 * /tulisan-pajak. Berisi badge, judul, deskripsi, dan sepasang tombol aksi.
 */
export function CTA(props: Partial<PropsCta> = {}) {
  const { lencana, judul, deskripsi, ctaLabel, ctaHref, emailLabel } = {
    ...DEFAULT_CTA,
    ...props,
  };

  return (
    <section id="kontak" className="bg-white py-[clamp(48px,6.4vw,72px)]">
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <div className="relative overflow-hidden rounded-xl bg-navy-900 px-10 py-[50px] text-center max-sm:px-5 max-sm:py-8">
          {/* Sorotan kuning di sudut kanan bawah, seperti v1. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -bottom-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)_0%,transparent_65%)]"
          />

          <span className="relative inline-flex items-center gap-2 rounded-full border border-yellow-500/45 bg-yellow-500/15 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-yellow-500 uppercase">
            <Obrolan className="h-3.5 w-3.5" />
            {lencana}
          </span>

          <h2 className="relative mx-auto mt-6 max-w-[760px] font-heading text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-white text-balance">
            {judul}
          </h2>

          <p className="relative mx-auto mt-4 max-w-[680px] text-[1.05rem] leading-[1.7] text-white/75">
            {deskripsi}
          </p>

          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4.5">
            {!ctaHref || ctaHref.includes("mauorder") || ctaHref.startsWith("/api/konsultasi/whatsapp") ? (
              <ConsultationButton
                sumber="cta"
                ukuran="sedang"
                ikonKiri={<Obrolan className="h-4 w-4" />}
                className="h-[54px] rounded-full px-8 text-[0.98rem]"
              >
                {ctaLabel}
              </ConsultationButton>
            ) : (
              <Tombol
                href={ctaHref}
                external
                ukuran="sedang"
                ikonKiri={<Obrolan className="h-4 w-4" />}
                className="h-[54px] rounded-full px-8 text-[0.98rem]"
              >
                {ctaLabel}
              </Tombol>
            )}

            <Tombol
              href={`mailto:${situs.kontak.email}`}
              varian="garisPutih"
              ukuran="sedang"
              ikonKiri={<Email className="h-4 w-4" />}
              className="h-[54px] rounded-full px-8 text-[0.98rem]"
            >
              {emailLabel}
            </Tombol>
          </div>
        </div>
      </div>
    </section>
  );
}
