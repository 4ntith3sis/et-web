import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";

import { Artikel } from "@/components/sections/Artikel";
import { CTA } from "@/components/sections/CTA";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { Hero } from "@/components/sections/Hero";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { Layanan } from "@/components/sections/Layanan";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Mitra } from "@/components/sections/Mitra";
import { Testimoni } from "@/components/sections/Testimoni";
import { PuckRender } from "@/components/puck/PuckRender";
import { ambilArtikel, ambilLayanan } from "@/cms/konten";
import { ambilLayoutTerbit } from "@/cms/layout";

export const metadata: Metadata = {
  title: "EasyTax | Konsultan Pajak & Akuntansi untuk Bisnis",
  description:
    "Jasa konsultan pajak dan akuntansi terpercaya untuk UMKM dan perusahaan di Indonesia. Pelaporan SPT, pembukuan, pengurusan PKP, restitusi, dan pendampingan audit.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "EasyTax | Konsultan Pajak & Akuntansi untuk Bisnis",
    description:
      "Jasa konsultan pajak dan akuntansi terpercaya untuk UMKM dan perusahaan di Indonesia.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/",
  },
};

/**
 * Landing page EasyTax.
 *
 * Bila layout Page Builder untuk beranda sudah diterbitkan dan valid, halaman
 * dirender dari layout tersebut. Jika belum ada (mis. CMS baru di-seed dan
 * belum dipublikasikan), halaman jatuh ke implementasi awal yang identik
 * sehingga URL publik tidak pernah kosong.
 */
export default function HomePage() {
  return <Suspense fallback={<div className="min-h-[70vh] bg-navy-900" aria-busy="true" />}><HomeRuntime /></Suspense>;
}

async function HomeRuntime() {
  await connection();
  const layout = await ambilLayoutTerbit("beranda");
  if (layout.layout) {
    return <PuckRender layout={layout.layout} trace={{ requestId: "home", route: "/", pageKey: "beranda", source: layout.source, revision: layout.revision }} />;
  }

  const [layanan, artikel] = await Promise.all([ambilLayanan(), ambilArtikel()]);

  return (
    <>
      <Hero />
      <Keunggulan />
      <Layanan layanan={layanan} />
      <CaraKerja />
      <Artikel artikel={artikel} />
      <Mitra />
      <MediaNasional />
      <Testimoni />
      <CTA />
    </>
  );
}
