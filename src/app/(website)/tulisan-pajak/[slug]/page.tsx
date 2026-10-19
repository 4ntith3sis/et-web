import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArtikelDetailHero } from "@/components/sections/ArtikelDetailHero";
import { ArtikelTerkait } from "@/components/sections/ArtikelTerkait";
import { BadanArtikel } from "@/components/sections/BadanArtikel";
import { CTA } from "@/components/sections/CTA";
import { ambilArtikel, ambilArtikelDetail } from "@/cms/konten";
import { artikelBeranda } from "@/data/artikel";
import { ekstrakHeading, type BlokIsi } from "@/lib/artikel/toc";

type Params = Promise<{ slug: string }>;

/** Prerender semua slug artikel yang ada di data statis. */
export function generateStaticParams() {
  return artikelBeranda.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const artikel = (await ambilArtikel()).find((a) => a.slug === slug);
  if (!artikel) return { title: "Artikel Tidak Ditemukan | EasyTax" };

  return {
    title: `${artikel.judul} | EasyTax`,
    description: artikel.ringkasan,
    openGraph: {
      title: artikel.judul,
      description: artikel.ringkasan,
      images: [artikel.gambar],
      type: "article",
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
  const { slug } = await params;
  const [artikelBeranda, detail] = await Promise.all([
    ambilArtikel(),
    ambilArtikelDetail(slug),
  ]);

  const artikel = artikelBeranda.find((a) => a.slug === slug);
  if (!artikel) notFound();

  const blok: BlokIsi[] = detail?.blok ?? [
    { kind: "paragraph", text: artikel.ringkasan },
  ];
  const headings = ekstrakHeading(blok);

  /* Terkait: satu kategori dulu, sisanya diisi artikel lain. */
  const lain = artikelBeranda.filter((a) => a.slug !== slug);
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
