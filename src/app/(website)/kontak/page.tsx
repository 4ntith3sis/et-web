import type { Metadata } from "next";

import { FaqKontak } from "@/components/sections/FaqKontak";
import { FormPertanyaan } from "@/components/sections/FormPertanyaan";
import { KontakHero } from "@/components/sections/KontakHero";
import { LokasiKantor } from "@/components/sections/LokasiKantor";
import { ambilJamOperasional, ambilTopikKonsultasi } from "@/cms/konten";

export const metadata: Metadata = {
  title: "Hubungi Kami | EasyTax",
  description:
    "Hubungi tim konsultan pajak dan akuntansi EasyTax. Chat WhatsApp, email, telepon, atau kirim pertanyaan lewat form. Kantor pusat di Jakarta Selatan.",
  openGraph: {
    title: "Hubungi Kami | EasyTax",
    description:
      "Hubungi tim konsultan pajak dan akuntansi EasyTax — WhatsApp, email, telepon, atau form pertanyaan.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
  },
};

/**
 * Halaman /kontak. Struktur disamakan dengan easytax-demo (v1):
 * hero + 3 kartu kontak, form pertanyaan dengan side info, lokasi kantor
 * (hanya satu kantor pusat), dan FAQ. Visual memakai design system v2.
 */
export default async function KontakPage() {
  const [topikKonsultasi, jamOperasional] = await Promise.all([
    ambilTopikKonsultasi(),
    ambilJamOperasional(),
  ]);

  return (
    <>
      <KontakHero />
      <FormPertanyaan
        topikKonsultasi={topikKonsultasi}
        jamOperasional={jamOperasional}
      />
      <LokasiKantor />
      <FaqKontak />
    </>
  );
}
