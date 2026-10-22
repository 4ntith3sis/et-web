import type { Metadata } from "next";

import { CTA } from "@/components/sections/CTA";
import { CeritaKami } from "@/components/sections/CeritaKami";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Testimoni } from "@/components/sections/Testimoni";
import { TentangHero } from "@/components/sections/TentangHero";
import { TimKonsultan } from "@/components/sections/TimKonsultan";

export const metadata: Metadata = {
  title: "Tentang Kami | EasyTax",
  description:
    "Kenali EasyTax: jasa konsultan pajak dan akuntansi dengan tim konsultan bersertifikat BKP yang mendampingi UMKM dan perusahaan.",
};

/**
 * Halaman /tentang-kami.
 * Dirender langsung menggunakan komponen native dan data CMS.
 */
export default function TentangKamiPage() {
  return (
    <>
      <TentangHero />
      <CeritaKami />
      <TimKonsultan />
      <MediaNasional />
      <Testimoni />
      <CTA />
    </>
  );
}
