import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { PengantarArtikel } from "@/components/sections/PengantarArtikel";
import { DaftarArtikel } from "@/components/sections/DaftarArtikel";
import { Obrolan } from "@/components/ikon";
import { Tombol } from "@/components/ui/Tombol";
import { ConsultationButton } from "@/features/whatsapp/components/ConsultationButton";
import { ambilArtikel, ambilSitus } from "@/cms/konten";
import { hitungDaftarArtikel } from "@/lib/artikel/daftar";

export const metadata: Metadata = {
  title: "Artikel & Edukasi Perpajakan | EasyTax",
  description:
    "Pusat artikel dan edukasi perpajakan EasyTax: panduan praktis SPT, PKP, pembukuan, dan strategi pajak untuk bisnis.",
  alternates: { canonical: "/tulisan-pajak" },
  openGraph: {
    title: "Artikel & Edukasi Perpajakan | EasyTax",
    description:
      "Panduan praktis SPT, PKP, pembukuan, dan strategi pajak untuk bisnis.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/tulisan-pajak",
  },
};

type SearchParams = Promise<{ page?: string; kategori?: string; q?: string }>;

/**
 * `searchParams` hanya boleh dibaca di dalam <Suspense> (Next.js dengan
 * cacheComponents), jadi halaman membungkus seluruh isinya dengan
 * fallback ringan.
 */
export default function TulisanPajakPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<FallbackArtikel />}>
      <IsiTulisanPajak searchParams={searchParams} />
    </Suspense>
  );
}

function FallbackArtikel() {
  return <div className="min-h-[60vh] bg-white" aria-busy="true" />;
}

async function IsiTulisanPajak({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;

  const [artikelBeranda, situs] = await Promise.all([
    ambilArtikel(),
    ambilSitus(),
  ]);

  const daftar = hitungDaftarArtikel(params, artikelBeranda);

  return (
    <>
      <PengantarArtikel />

      <DaftarArtikel
        artikel={daftar.artikel}
        kategori={daftar.kategori}
        kategoriAktif={daftar.kategoriAktif}
        page={daftar.halamanAman}
        totalPages={daftar.totalPages}
        totalDocs={daftar.totalDocs}
        kueri={daftar.kueri}
      />

      {/* CTA penutup — desain & warna disamakan dengan CTA beranda:
          panel navy rounded-xl + sorotan kuning, badge berikon, tipografi
          dan tombol pill kuning. */}
      <section className="bg-white py-[clamp(48px,6.4vw,72px)]">
        <div className="mx-auto w-full max-w-maks px-6 md:px-8">
          <div className="relative overflow-hidden rounded-xl bg-navy-900 px-10 py-[50px] text-center max-sm:px-5 max-sm:py-8">
            {/* Sorotan kuning di sudut kanan bawah, seperti CTA beranda. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-32 -bottom-40 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand-yellow)_15%,transparent)_0%,transparent_65%)]"
            />

            <span className="relative inline-flex items-center gap-2 rounded-full border border-yellow-500/45 bg-yellow-500/15 px-5 py-2 text-[0.85rem] font-bold tracking-[0.04em] text-yellow-500 uppercase">
              <Obrolan className="h-3.5 w-3.5" />
              Konsultasi Gratis
            </span>

            <h2 className="relative mx-auto mt-6 max-w-[760px] font-heading text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.25] font-extrabold tracking-[-0.03em] text-white text-balance">
              Ingin Diskusi Langsung Mengenai Pajak Bisnis Anda?
            </h2>

            <p className="relative mx-auto mt-4 max-w-[680px] text-[1.05rem] leading-[1.7] text-white/75">
              Tim konsultan pajak resmi EasyTax siap membantu menganalisis
              laporan keuangan dan strategi efisiensi bebas denda.
            </p>

            <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4.5">
              <ConsultationButton
                sumber="artikel-listing"
                ukuran="sedang"
                ikonKiri={<Obrolan className="h-4 w-4" />}
                className="h-[54px] rounded-full px-8 text-[0.98rem]"
              >
                Chat Konsultan via WhatsApp
              </ConsultationButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
