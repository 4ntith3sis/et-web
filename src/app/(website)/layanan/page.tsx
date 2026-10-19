import type { Metadata } from "next";

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
};

/**
 * Halaman /layanan. Susunannya: hero, advantages (reuse), katalog layanan,
 * cara kerja, lalu blok kepercayaan yang sama dengan beranda.
 */
export default async function LayananPage() {
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