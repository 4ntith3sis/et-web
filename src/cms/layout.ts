import { cacheLife, cacheTag } from "next/cache";

import {
  ambilArtikel,
  ambilArtikelDetail,
  ambilDetailLayanan,
  ambilJamOperasional,
  ambilLayanan,
  ambilMitra,
  ambilTestimoni,
  ambilTim,
  ambilTopikKonsultasi,
} from "@/cms/konten";
import { getClient } from "@/lib/payload";
import { ekstrakHeading, type BlokIsi } from "@/lib/artikel/toc";
import { lengkapiLayoutDefaultProps } from "@/puck/default-props";
import type { KonteksHalaman, LayoutPuck, MetadataPuck } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";

/**
 * Pembacaan layout Page Builder untuk halaman publik.
 *
 * Mengikuti pola `src/cms/konten.ts`: dibungkus `use cache` agar ikut masuk
 * static shell, dan di-tag per halaman (`layout:<pageKey>`) supaya bisa
 * diinvalidasi saat tombol Publish ditekan. Bila dokumen belum ada, belum
 * diterbitkan, atau isinya tidak valid, fungsi mengembalikan `null` sehingga
 * halaman memakai implementasi lamanya.
 */
export async function ambilLayoutTerbit(
  pageKey: string,
): Promise<{
  layout: LayoutPuck | null;
  source: "published" | "fallback";
  revision?: number;
  reason?: "snapshot_missing" | "validation_error";
}> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`layout:${pageKey}`);

  try {
    const payload = await getClient();
    /* A collection `find({ draft: false })` reads the main row, which can be
       draft even while a published snapshot remains in version history.
       Query the official versions API; collection readVersions access limits
       anonymous requests to published snapshots, and we re-check status. */
    const res = await payload.findVersions({
      collection: "page-layouts",
      where: {
        "version.pageKey": { equals: pageKey },
        "version._status": { equals: "published" },
      },
      limit: 100,
      sort: "-version.revision",
      depth: 0,
      overrideAccess: false,
    });
    const selection = detailPemilihanSnapshot(res.docs);
    const selected = selection.layout;
    if (selected) {
      const layoutSiap = lengkapiLayoutDefaultProps(selected, pageKey);
      if (process.env.EASYTAX_LAYOUT_TRACE === "1") {
        console.info("[layout-trace]", {
          pageKey,
          source: "published",
          status: "published_found",
          revision: selection.revision,
        });
      }
      return {
        layout: layoutSiap,
        source: "published",
        revision: selection.revision,
      };
    }
    if (process.env.EASYTAX_LAYOUT_TRACE === "1") {
      console.info("[layout-trace]", {
        pageKey,
        source: "fallback",
        status: selection.reason,
      });
    }
    return hasilTanpaSnapshot(selection.reason);
  } catch (error) {
    console.error("[layout-read-error]", {
      pageKey,
      status: klasifikasikanQueryLayout(error),
      errorType: error instanceof Error ? error.name : "unknown",
    });
    return hasilTanpaSnapshot("snapshot_missing");
  }
}

/** Isolated selector for version snapshots; public reads never accept drafts. */
export function pilihLayoutSnapshotTerbit(
  snapshots: unknown[],
): LayoutPuck | null {
  return detailPemilihanSnapshot(snapshots).layout;
}

export function klasifikasikanQueryLayout(
  error: unknown,
): "access_denied" | "query_error" {
  const status = (error as { status?: unknown } | null)?.status;
  return status === 401 || status === 403 ? "access_denied" : "query_error";
}

export function hasilTanpaSnapshot(
  reason: "snapshot_missing" | "validation_error",
): {
  layout: null;
  source: "fallback";
  reason: "snapshot_missing" | "validation_error";
} {
  return { layout: null, source: "fallback", reason };
}

function detailPemilihanSnapshot(snapshots: unknown[]): {
  layout: LayoutPuck | null;
  revision?: number;
  reason: "snapshot_missing" | "validation_error";
} {
  const published = snapshots
    .map((snapshot) => {
      if (!snapshot || typeof snapshot !== "object") return null;
      const version = (snapshot as { version?: unknown }).version;
      if (!version || typeof version !== "object") return null;
      const row = version as { _status?: unknown; revision?: unknown; layout?: unknown };
      return row._status === "published" ? row : null;
    })
    .filter((version): version is NonNullable<typeof version> => version !== null)
    .sort((a, b) => Number(b.revision ?? 0) - Number(a.revision ?? 0));

  const selected = published.find((version) => {
    const result = validasiLayoutPuck(version.layout);
    return result.ok && result.data.content.length > 0;
  });
  if (!published.length) return { layout: null, reason: "snapshot_missing" };
  if (!selected) return { layout: null, reason: "validation_error" };
  const result = validasiLayoutPuck(selected.layout);
  if (!result.ok || result.data.content.length === 0) {
    return { layout: null, reason: "validation_error" };
  }
  return {
    layout: result.data,
    revision: typeof selected.revision === "number" ? selected.revision : undefined,
    reason: "snapshot_missing",
  };
}


/**
 * Metadata (konten CMS) yang dikirim ke komponen saat render.
 *
 * Dipakai baik oleh renderer publik di server maupun oleh editor di klien
 * (diserialisasi sebagai props), sehingga komponen selalu menampilkan isi
 * terkini tanpa harus disimpan di dalam JSON layout.
 *
 * `konteks` opsional dipakai halaman dinamis (`/layanan/[slug]`,
 * `/tulisan-pajak/[slug]`): item yang sedang dibuka tidak ikut tersimpan di
 * layout, melainkan disuplikasi per-request.
 */
export async function ambilMetadataPuck(
  konteks: KonteksHalaman = {},
): Promise<MetadataPuck> {
  const [layanan, artikel, testimoni, mitra, tim, topikKonsultasi, jamOperasional] =
    await Promise.all([
      ambilLayanan(),
      ambilArtikel(),
      ambilTestimoni(),
      ambilMitra(),
      ambilTim(),
      ambilTopikKonsultasi(),
      ambilJamOperasional(),
    ]);
  return {
    layanan,
    artikel,
    testimoni,
    mitra,
    tim,
    topikKonsultasi,
    jamOperasional,
    konteks,
  };
}

/**
 * Konteks representatif untuk kanvas editor & halaman pratinjau template.
 *
 * Template detail dipakai bersama oleh banyak slug, sedangkan editor dan
 * pratinjau hanya tahu `pageKey` (tanpa slug aktif). Agar kanvas
 * memperlihatkan STRUKTUR template tanpa mengklaim data milik salah satu slug
 * yang sedang dibuka:
 *
 *  - `template-layanan-detail` memakai teks contoh representatif sesuai skema
 *    koleksi Layanan di Payload ("Nama Layanan", "Subjudul", dst.);
 *  - `template-artikel-detail` memakai artikel NYATA dari CMS (artikel
 *    pertama yang tersedia) supaya komponen hero/badan artikel dapat
 *    dirender utuh.
 *
 * Data ini murni untuk tampilan dan TIDAK pernah disimpan di JSON layout;
 * saat halaman publik dirender, konteks selalu dibangun dari slug yang
 * benar-benar dibuka (data Payload asli).
 */
export async function konteksRepresentatif(
  pageKey: string,
): Promise<KonteksHalaman | undefined> {
  if (pageKey === "template-layanan-detail") {
    return {
      layanan: {
        layanan: {
          slug: "",
          judul: "Nama Layanan",
          subjudul: "Subjudul",
          ringkasan: "Deskripsi Layanan",
          gambar: "/images/placeholder-layanan.svg",
        },
        paket: [
          {
            nama: "Nama Paket",
            deskripsi: "Deskripsi Paket",
            harga: "Harga",
            satuan: "/unit",
            fitur: ["Keunggulan 1"],
          },
        ],
        faq: [],
      },
    };
  }

  if (pageKey === "template-artikel-detail") {
    const semua = await ambilArtikel();
    const contoh = semua[0];
    if (!contoh) return undefined;

    const detail = await ambilArtikelDetail(contoh.slug);
    const blok: BlokIsi[] = detail?.blok?.length
      ? detail.blok
      : [{ kind: "paragraph", text: contoh.ringkasan }];

    const lain = semua.filter((a) => a.slug !== contoh.slug);
    const seKategori = lain.filter((a) => a.kategori === contoh.kategori);
    const lainnya = lain.filter((a) => a.kategori !== contoh.kategori);

    return {
      artikel: {
        artikel: contoh,
        penulis: detail?.penulis ?? "Tim Konsultan EasyTax",
        blok,
        tags: detail?.tags ?? [],
        headings: ekstrakHeading(blok),
        terkait: [...seKategori, ...lainnya].slice(0, 3),
      },
    };
  }

  return undefined;
}

/**
 * URL konkret untuk tombol Preview di Page Manager.
 *
 * Rute template (`/layanan/[slug]`, `/tulisan-pajak/[slug]`) adalah *pola*,
 * bukan URL yang bisa dibuka. Fungsi ini memetakan page type ke URL nyata:
 * halaman statis memakai rutenya sendiri, sedangkan template memakai slug
 * record pertama yang benar-benar ada di Payload (tanpa data dummy). Bila
 * belum ada record, mengembalikan `null` agar UI menampilkan empty state.
 */
export async function urlPratinjauHalaman(
  pageKey: string,
  rute: string,
): Promise<string | null> {
  if (!rute.includes("[")) return rute;

  if (pageKey === "template-layanan-detail") {
    const [contoh] = await ambilLayanan();
    return contoh ? `/layanan/${contoh.slug}` : null;
  }
  if (pageKey === "template-artikel-detail") {
    const [contoh] = await ambilArtikel();
    return contoh ? `/tulisan-pajak/${contoh.slug}` : null;
  }
  return null;
}
