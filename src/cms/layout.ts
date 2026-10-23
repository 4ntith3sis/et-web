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
    /*
     * Sumber kebenaran publik adalah baris utama yang berstatus published.
     * Jangan memilih snapshot published dari riwayat versi tanpa memeriksa
     * baris utama: Payload menyimpan snapshot lama saat halaman di-unpublish,
     * sehingga snapshot tersebut bisa terus tampil setelah konten ditarik.
     */
    const res = await payload.find({
      collection: "page-layouts",
      where: { pageKey: { equals: pageKey } },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: false,
    });
    const doc = res.docs[0] as
      | { layout?: unknown; revision?: unknown }
      | undefined;
    if (!doc) return hasilTanpaSnapshot("snapshot_missing");

    const hasil = validasiLayoutPuck(doc.layout);
    if (!hasil.ok || hasil.data.content.length === 0) {
      return hasilTanpaSnapshot("validation_error");
    }

    const layoutSiap = lengkapiLayoutDefaultProps(hasil.data, pageKey);
    const revision =
      typeof doc.revision === "number" ? doc.revision : undefined;
    if (process.env.EASYTAX_LAYOUT_TRACE === "1") {
      console.info("[layout-trace]", {
        pageKey,
        source: "published",
        status: "published_found",
        revision,
      });
    }
    return { layout: layoutSiap, source: "published", revision };
  } catch (error) {
    const exception = error instanceof Error ? error : undefined;
    const sanitasi = (value: string) =>
      value
        .replace(/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'`]+/gi, "[REDACTED_DATABASE_URL]")
        .replace(/\b(password|passwd|token|secret|authorization|cookie|api[-_]?key)(\s*[=:]\s*)([^\s,;]+)/gi, "$1$2[REDACTED]")
        .slice(0, 12_000);
    console.error("[layout-read-error]", {
      operasi: "ambilLayoutTerbit",
      pageKey,
      errorName: exception?.name ?? "unknown",
      errorMessage: sanitasi(exception?.message ?? String(error)),
      errorStack: exception?.stack ? sanitasi(exception.stack) : undefined,
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
 * URL tombol Preview di Page Manager.
 *
 * Preview harus menampilkan layout draft, bukan halaman publik. Halaman statis
 * dan template sama-sama punya route pratinjau staf di `/pratinjau/<pageKey>`.
 */
export async function urlPratinjauHalaman(
  pageKey: string,
  _rute: string,
): Promise<string> {
  return `/pratinjau/${pageKey}`;
}
