import type { Metadata } from "next";

import { CTA } from "@/components/sections/CTA";
import { CeritaKami } from "@/components/sections/CeritaKami";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Testimoni } from "@/components/sections/Testimoni";
import { TentangHero } from "@/components/sections/TentangHero";
import { TimKonsultan } from "@/components/sections/TimKonsultan";

export const metadata: Metadata = {
  title: "Tentang EasyTax | Konsultan Pajak Profesional",
  description:
    "Kenali EasyTax: tim konsultan pajak bersertifikat yang membantu bisnis di Indonesia tumbuh dengan tata kelola pajak dan keuangan yang rapi.",
  alternates: { canonical: "/tentang-kami" },
  openGraph: {
    title: "Tentang EasyTax | Konsultan Pajak Profesional",
    description:
      "Tim konsultan pajak bersertifikat yang membantu bisnis tumbuh dengan tata kelola pajak dan keuangan yang rapi.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/tentang-kami",
  },
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
