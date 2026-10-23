import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

import { ArtikelDetailHero } from "@/components/sections/ArtikelDetailHero";
import { ArtikelTerkait } from "@/components/sections/ArtikelTerkait";
import { BadanArtikel } from "@/components/sections/BadanArtikel";
import { CTA } from "@/components/sections/CTA";
import { ambilArtikel, ambilArtikelDetail } from "@/cms/konten";
import { ekstrakHeading, type BlokIsi } from "@/lib/artikel/toc";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const artikel = (await ambilArtikel()).find(
    (a) => a.slug.toLowerCase() === cleanSlug,
  );
  if (!artikel) notFound();

  const canonical = `/tulisan-pajak/${encodeURIComponent(artikel.slug)}`;
  return {
    title: `${artikel.judul} | EasyTax`,
    description: artikel.ringkasan,
    alternates: { canonical },
    openGraph: {
      title: artikel.judul,
      description: artikel.ringkasan,
      images: artikel.gambar ? [artikel.gambar] : [],
      type: "article",
      locale: "id_ID",
      siteName: "EasyTax",
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: artikel.judul,
      description: artikel.ringkasan,
      images: artikel.gambar ? [artikel.gambar] : undefined,
    },
  };
}

/**
 * `params` dibaca di dalam <Suspense> agar shell halaman tetap dapat
 * di-stream (cacheComponents). Status 404 untuk slug yang tidak ada ditangani
 * lebih awal oleh proxy, sebelum shell dikirim.
 */
export default function HalamanArtikel({ params }: { params: Params }) {
  return (
    <Suspense
      fallback={<div className="min-h-[70vh] bg-navy-900" aria-busy="true" />}
    >
      <IsiArtikelHalaman params={params} />
    </Suspense>
  );
}

async function IsiArtikelHalaman({ params }: { params: Params }) {
  await connection();
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const [artikelBeranda, detail] = await Promise.all([
    ambilArtikel(),
    ambilArtikelDetail(slug),
  ]);

  const artikel = artikelBeranda.find((a) => a.slug.toLowerCase() === cleanSlug);
  if (!artikel) notFound();

  const blok: BlokIsi[] = detail?.blok ?? [
    { kind: "paragraph", text: artikel.ringkasan },
  ];
  const headings = ekstrakHeading(blok);

  /* Terkait: satu kategori dulu, sisanya diisi artikel lain. */
  const lain = artikelBeranda.filter((a) => a.slug.toLowerCase() !== cleanSlug);
  const seKategori = lain.filter((a) => a.kategori === artikel.kategori);
  const lainnya = lain.filter((a) => a.kategori !== artikel.kategori);
  const terkait = [...seKategori, ...lainnya].slice(0, 3);

  return (
    <>
      <ArtikelDetailHero
        artikel={artikel}
        penulis={detail?.penulis ?? "Tim Konsultan EasyTax"}
      />
      <BadanArtikel
        blok={blok}
        tags={detail?.tags ?? []}
        headings={headings}
      />
      <ArtikelTerkait artikel={terkait} />
      <CTA />
    </>
  );
}
