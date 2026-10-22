import { Suspense } from "react";
import { headers } from "next/headers";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";

import { PuckRender } from "@/components/puck/PuckRender";
import { ambilArtikel, ambilArtikelDetail, ambilDetailLayanan, ambilLayanan } from "@/cms/konten";
import { getClient } from "@/lib/payload";
import { hitungDaftarArtikel, perHalamanDariLayout } from "@/lib/artikel/daftar";
import { ekstrakHeading, type BlokIsi } from "@/lib/artikel/toc";
import type { KonteksHalaman, LayoutPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";
import { punyaPeranStaf } from "@/components/admin/page-builder/role";
import { halamanDariKey } from "@/puck/types";

/**
 * RUTE SEMENTARA AUDIT PHASE 2A — HAPUS SEBELUM SERAH-TERIMA.
 *
 * Merender layout DRAFT Page Builder untuk sebuah pageKey memakai konteks
 * yang sama persis dengan halaman publiknya, sehingga hasil render bisa
 * dibandingkan dengan HTML publik saat ini (fallback). Tidak menulis ke
 * database: hanya membaca.
 */

type Params = Promise<{ pageKey: string }>;
type SearchParams = Promise<{ slug?: string; page?: string; kategori?: string; q?: string }>;

export const metadata = {
  robots: { index: false, follow: false },
};

export default function Audit({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<div data-audit="pending" />}>
      <Isi params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Isi({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await connection();
  const { pageKey } = await params;
  if (!halamanDariKey(pageKey)) notFound();
  const paramUrl = await searchParams;
  const { slug } = paramUrl;

  const payload = await getClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!punyaPeranStaf(user)) {
    redirect(`/admin/login?redirect=${encodeURIComponent(`/audit-phase2a/${pageKey}`)}`);
  }

  const res = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: pageKey } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const doc = res.docs[0] as { layout?: unknown } | undefined;
  const tervalidasi = doc ? validasiLayoutPuck(doc.layout) : { ok: false as const };
  if (!tervalidasi.ok) {
    return <div data-audit="invalid">{pageKey}</div>;
  }
  const layout = tervalidasi.data as LayoutPuck;

  let konteks: KonteksHalaman | undefined;

  /* Halaman listing: samakan state URL dengan halaman publik. */
  if (pageKey === "tulisan-pajak-listing") {
    const semua = await ambilArtikel();
    const daftar = hitungDaftarArtikel(paramUrl, semua, perHalamanDariLayout(layout));
    konteks = {
      daftarArtikel: {
        daftar: daftar.artikel,
        kategoriAktif: daftar.kategoriAktif,
        page: daftar.halamanAman,
        totalPages: daftar.totalPages,
        totalDocs: daftar.totalDocs,
        kueri: daftar.kueri,
      },
    };
  }

  if (pageKey === "template-layanan-detail" && slug) {
    const layanan = await ambilLayanan();
    const ini = layanan.find((l) => l.slug === slug);
    if (ini) {
      const detail = await ambilDetailLayanan(slug);
      konteks = {
        layanan: { layanan: ini, paket: detail?.paket ?? [], faq: detail?.faq ?? [] },
      };
    }
  }

  if (pageKey === "template-artikel-detail" && slug) {
    const semua = await ambilArtikel();
    const artikel = semua.find((a) => a.slug === slug);
    if (artikel) {
      const detail = await ambilArtikelDetail(slug);
      const blok: BlokIsi[] = detail?.blok ?? [{ kind: "paragraph", text: artikel.ringkasan }];
      const headings = ekstrakHeading(blok);
      const lain = semua.filter((a) => a.slug !== slug);
      const seKategori = lain.filter((a) => a.kategori === artikel.kategori);
      const lainnya = lain.filter((a) => a.kategori !== artikel.kategori);
      konteks = {
        artikel: {
          artikel,
          penulis: detail?.penulis ?? "Tim Konsultan EasyTax",
          blok,
          tags: detail?.tags ?? [],
          headings,
          terkait: [...seKategori, ...lainnya].slice(0, 3),
        },
      };
    }
  }

  return <div data-audit={pageKey}><PuckRender layout={layout} konteks={konteks} /></div>;
}
