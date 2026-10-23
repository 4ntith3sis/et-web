import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { CTA } from "@/components/sections/CTA";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { FaqLayanan } from "@/components/sections/FaqLayanan";
import { HargaLayanan } from "@/components/sections/HargaLayanan";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { LayananDetailHero } from "@/components/sections/LayananDetailHero";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { Mitra } from "@/components/sections/Mitra";
import { Testimoni } from "@/components/sections/Testimoni";
import { ambilDetailLayanan, ambilLayanan } from "@/cms/konten";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const layanan = (await ambilLayanan()).find(
    (l) => l.slug.toLowerCase() === cleanSlug,
  );
  if (!layanan) notFound();

  const canonical = `/layanan/${encodeURIComponent(layanan.slug)}`;
  return {
    title: `${layanan.judul} | EasyTax`,
    description: layanan.ringkasan,
    alternates: { canonical },
    openGraph: {
      title: layanan.judul,
      description: layanan.ringkasan,
      images: layanan.gambar ? [layanan.gambar] : [],
      type: "website",
      locale: "id_ID",
      siteName: "EasyTax",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: layanan.judul,
      description: layanan.ringkasan,
      images: layanan.gambar ? [layanan.gambar] : undefined,
    },
  };
}

/**
 * `params` dibaca di dalam <Suspense> agar shell halaman tetap dapat
 * di-stream (cacheComponents). Status 404 untuk slug yang tidak ada ditangani
 * lebih awal oleh proxy, sebelum shell dikirim.
 */
export default function HalamanLayanan({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-navy-900" aria-busy="true" />}>
      <IsiLayanan params={params} />
    </Suspense>
  );
}

async function IsiLayanan({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const [layanan, detail] = await Promise.all([
    ambilLayanan(),
    ambilDetailLayanan(slug),
  ]);

  const ini = layanan.find((l) => l.slug.toLowerCase() === cleanSlug);
  if (!ini) notFound();

  return (
    <>
      <LayananDetailHero layanan={ini} />
      <Keunggulan />
      <HargaLayanan paket={detail?.paket ?? []} />
      <CaraKerja />
      <Mitra />
      <MediaNasional />
      <Testimoni />
      <FaqLayanan faq={detail?.faq ?? []} />
      <CTA />
    </>
  );
}
