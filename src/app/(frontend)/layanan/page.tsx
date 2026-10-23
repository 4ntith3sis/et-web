import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { CaraKerja } from "@/components/sections/CaraKerja";
import { DaftarLayanan } from "@/components/sections/DaftarLayanan";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { LayananHero } from "@/components/sections/LayananHero";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Mitra } from "@/components/sections/Mitra";
import { Testimoni } from "@/components/sections/Testimoni";
import { ambilLayanan } from "@/cms/konten";

export const metadata: Metadata = {
  title: "Layanan Perpajakan & Akuntansi | EasyTax",
  description:
    "Layanan perpajakan dan akuntansi EasyTax: pelaporan SPT, pembukuan, pengurusan PKP, restitusi pajak, dan pendampingan audit.",
  alternates: { canonical: "/layanan" },
  openGraph: {
    title: "Layanan Perpajakan & Akuntansi | EasyTax",
    description:
      "Pelaporan SPT, pembukuan, pengurusan PKP, restitusi pajak, dan pendampingan audit.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/layanan",
  },
};

/**
 * Halaman /layanan.
 * Dirender langsung menggunakan komponen native dan data CMS.
 */
export default function LayananPage() {
  return <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}><LayananRuntime /></Suspense>;
}

async function LayananRuntime() {
  await connection();
  const layanan = await ambilLayanan();

  return (
    <>
      <LayananHero />
      <Keunggulan />
      <DaftarLayanan layanan={layanan} />
      <CaraKerja />
      <Mitra />
      <MediaNasional />
      <Testimoni />
    </>
  );
}
