import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { FaqKontak } from "@/components/sections/FaqKontak";
import { FormPertanyaan } from "@/components/sections/FormPertanyaan";
import { KontakHero } from "@/components/sections/KontakHero";
import { LokasiKantor } from "@/components/sections/LokasiKantor";
import { ambilJamOperasional, ambilPengaturan, ambilTopikKonsultasi } from "@/cms/konten";

export const metadata: Metadata = {
  title: "Kontak & Konsultasi Pajak | EasyTax",
  description:
    "Hubungi konsultan pajak EasyTax untuk konsultasi SPT, pembukuan, PKP, restitusi, dan kebutuhan perpajakan bisnis Anda.",
  alternates: { canonical: "/kontak" },
  openGraph: {
    title: "Kontak & Konsultasi Pajak | EasyTax",
    description:
      "Hubungi konsultan pajak EasyTax untuk konsultasi perpajakan dan keuangan bisnis Anda.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/kontak",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

async function NotifikasiOffline({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = searchParams ? await searchParams : {};
  if (sp.notif !== "whatsapp-offline") return null;

  return (
    <section
      aria-label="Informasi Layanan Konsultasi"
      className="bg-amber-50/90 border-y border-amber-200/80 px-6 py-4"
    >
      <div className="mx-auto flex max-w-maks items-center gap-3.5 text-amber-900">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold">
          ℹ
        </span>
        <p className="text-[0.94rem] leading-relaxed">
          <strong>Layanan WhatsApp Sedang Tidak Tersedia:</strong> Saat ini tim konsultan kami belum dapat menerima obrolan langsung via WhatsApp. Silakan tinggalkan pesan melalui formulir kontak di bawah ini dan kami akan segera menghubungi Anda kembali.
        </p>
      </div>
    </section>
  );
}

/**
 * Halaman /kontak.
 * Dirender langsung menggunakan komponen native dan data CMS.
 */
export default function KontakPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
      <KontakRuntime searchParams={searchParams} />
    </Suspense>
  );
}

async function KontakRuntime({ searchParams }: { searchParams?: SearchParams }) {
  await connection();
  const [topikKonsultasi, jamOperasional, pengaturan] = await Promise.all([
    ambilTopikKonsultasi(),
    ambilJamOperasional(),
    ambilPengaturan(),
  ]);

  return (
    <>
          <KontakHero nomorWhatsAppUtama={pengaturan?.whatsappUrl} teleponKantor={pengaturan?.telepon} />
      <Suspense fallback={null}>
        <NotifikasiOffline searchParams={searchParams} />
      </Suspense>
      <FormPertanyaan
        topikKonsultasi={topikKonsultasi}
        jamOperasional={jamOperasional}
      />
      <LokasiKantor />
      <FaqKontak />
    </>
  );
}
