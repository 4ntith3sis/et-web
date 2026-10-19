import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
import { layananBeranda } from "@/data/layanan";

type Params = Promise<{ slug: string }>;

/** Prerender semua slug layanan yang ada di data statis. */
export function generateStaticParams() {
  return layananBeranda.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const layanan = (await ambilLayanan()).find((l) => l.slug === slug);
  if (!layanan) return { title: "Layanan Tidak Ditemukan | EasyTax" };

  return {
    title: `${layanan.judul} | EasyTax`,
    description: layanan.ringkasan,
    openGraph: {
      title: layanan.judul,
      description: layanan.ringkasan,
      images: [layanan.gambar],
      type: "website",
      locale: "id_ID",
      siteName: "EasyTax",
    },
  };
}

/**
 * `params` hanya boleh dibaca di dalam <Suspense> (Next.js dengan
 * cacheComponents), jadi halaman membungkus seluruh isinya dengan
 * fallback ringan.
 */
export default function HalamanLayanan({ params }: { params: Params }) {
  return (
    <Suspense fallback={<div className="min-h-[70vh] bg-navy-900" aria-busy="true" />}>
      <IsiLayanan params={params} />
    </Suspense>
  );
}

async function IsiLayanan({ params }: { params: Params }) {
  const { slug } = await params;
  const [layanan, detail] = await Promise.all([
    ambilLayanan(),
    ambilDetailLayanan(slug),
  ]);

  const ini = layanan.find((l) => l.slug === slug);
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