import { cacheLife, cacheTag } from "next/cache";

import { artikelBeranda as artikelStatis, type ArtikelBeranda } from "@/data/artikel";
import { cariArtikelDetail, type ArtikelDetail } from "@/data/artikel-detail";
import {
  jamOperasional as jamStatis,
  topikKonsultasi as topikStatis,
} from "@/data/kontak";
import {
  layananBeranda as layananStatis,
  type LayananBeranda,
} from "@/data/layanan";
import {
  cariDetailLayanan,
  type DetailLayanan,
  type FaqLayanan,
  type PaketLayanan,
} from "@/data/layanan-detail";
import { logoMitra, namaMitra } from "@/data/mitra";
import { menuNavigasi as navigasiStatis, situs as situsStatis } from "@/data/situs";
import { testimoni as testimoniStatis, type Testimoni as UjiTestimoni } from "@/data/testimoni";
import { timKonsultan as timStatis, type AnggotaTim } from "@/data/tim";
import { getClient } from "@/lib/payload";
import { formatHargaRupiah, formatSatuan } from "@/lib/format-harga";
import { mediaUrlRelatif } from "@/lib/media-url";
import type { BlokIsi } from "@/lib/artikel/toc";
import type { ItemNavigasi } from "@/types";
import type { Media, PengaturanSitus } from "@/payload-types";

/* ==========================================================================
   Lapisan data CMS.

   Semua pembacaan Payload dibungkus `use cache` agar hasilnya ikut masuk
   "static shell" (Next.js Cache Components) dan tidak menandai halaman
   sebagai dinamis.

   Kueri yang berhasil tetapi kosong adalah keadaan CMS yang sah: koleksi
   kosong berarti konten memang belum ada atau sudah di-unpublish/dihapus.
   Data statis di `src/data/*` hanya dipakai sebagai jaring darurat ketika
   database benar-benar gagal dibaca, dan kegagalannya selalu dicatat di
   server agar tidak tersembunyi.
   ========================================================================== */

type Situs = {
  nama: string;
  subjudul: string;
  deskripsi: string;
  whatsappUrl: string;
  kontak: { telepon: string; email: string; alamat: string };
};

const FMT_TANGGAL = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export const FALLBACK_GAMBAR_LAYANAN = "/images/placeholder-layanan.svg";
export const FALLBACK_GAMBAR_ARTIKEL = "/images/placeholder-artikel.svg";
export const FALLBACK_FOTO_TIM = "/images/placeholder-avatar.svg";

function formatTanggal(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : FMT_TANGGAL.format(d);
}

// Aset statis dipakai sebagai cadangan HANYA ketika dokumen CMS ada tetapi
// relasi gambarnya kosong. Ini menjaga halaman publik tetap lengkap saat
// migrasi media belum dijalankan, tanpa menghidupkan kembali konten yang
// sudah dihapus/unpublish dari CMS.
const GAMBAR_LAYANAN_STATIS = new Map(layananStatis.map((l) => [l.slug, l.gambar]));
const GAMBAR_ARTIKEL_STATIS = new Map(artikelStatis.map((a) => [a.slug, a.gambar]));
const FOTO_TIM_STATIS = new Map(timStatis.map((o) => [o.nama, o.foto]));

/** URL gambar dari relasi media, dengan dukungan ukuran bawaan Payload. */
function mediaUrl(
  nilai: Media | number | null | undefined,
  ukuran?: keyof NonNullable<Media["sizes"]>,
): string | undefined {
  if (!nilai || typeof nilai !== "object") return undefined;
  const mentah =
    ukuran && nilai.sizes?.[ukuran]?.url
      ? nilai.sizes[ukuran]!.url
      : nilai.url;
  return mediaUrlRelatif(mentah);
}

/** Sanitasi detail exception sebelum dicatat di log server. */
function sanitasiDetailError(value: string): string {
  return value
    .replace(/(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'`]+/gi, "[REDACTED_DATABASE_URL]")
    .replace(/\b(password|passwd|token|secret|authorization|cookie|api[-_]?key)(\s*[=:]\s*)([^\s,;]+)/gi, "$1$2[REDACTED]")
    .slice(0, 12_000);
}

/** Catat exception CMS yang telah disanitasi; detail hanya masuk log server. */
function catatKegagalanCms(operasi: string, error: unknown): void {
  const exception = error instanceof Error ? error : undefined;
  const safeMessage = exception?.message ?? String(error);
  console.error("[cms] pembacaan gagal", {
    operasi,
    errorName: exception?.name ?? "unknown",
    errorMessage: sanitasiDetailError(safeMessage),
    errorStack: exception?.stack ? sanitasiDetailError(exception.stack) : undefined,
  });
}

/** Build prerender requires authoritative CMS data; never cache a fallback as build output. */
function propagarKegagalanCmsSaatBuild(error: unknown): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    throw error;
  }
}

/* ---------------------------------------------------------------- Global */

export async function ambilPengaturan(): Promise<PengaturanSitus | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pengaturan-situs");
  try {
    const payload = await getClient();
    return (await payload.findGlobal({
      slug: "pengaturan-situs",
      depth: 0,
      overrideAccess: false,
    })) as PengaturanSitus;
  } catch (error) {
    catatKegagalanCms("pengaturan", error);
    propagarKegagalanCmsSaatBuild(error);
    return null;
  }
}

/** Identitas + kontak global; fallback ke `src/data/situs.ts`. */
export async function ambilSitus(): Promise<Situs> {
  const g = await ambilPengaturan();
  if (!g) return situsStatis;

  return {
    nama: g.nama || situsStatis.nama,
    subjudul: g.subjudul || situsStatis.subjudul,
    deskripsi: g.deskripsi || situsStatis.deskripsi,
    // Nomor utama halaman Kontak wajib berasal dari CMS; jangan fallback ke
    // URL/nomor statis yang dapat mengarah ke nomor konsultasi lain.
    whatsappUrl: g.whatsappUrl || "",
    kontak: {
      telepon: g.telepon || situsStatis.kontak.telepon,
      email: g.email || situsStatis.kontak.email,
      alamat: g.alamat || situsStatis.kontak.alamat,
    },
  };
}

export async function ambilNavigasi(): Promise<ItemNavigasi[]> {
  const g = await ambilPengaturan();
  if (!g?.navigasi?.length) return navigasiStatis;
  return g.navigasi.map((n) => ({ label: n.label, href: n.href }));
}

export async function ambilJamOperasional(): Promise<{ hari: string; jam: string }[]> {
  const g = await ambilPengaturan();
  if (!g?.jamOperasional?.length) return jamStatis;
  return g.jamOperasional.map((j) => ({ hari: j.hari, jam: j.jam }));
}

export async function ambilTopikKonsultasi(): Promise<string[]> {
  const g = await ambilPengaturan();
  if (!g?.topikKonsultasi?.length) return topikStatis;
  return g.topikKonsultasi.map((t) => t.teks);
}

export async function ambilSosmed(): Promise<
  { platform: string; url: string }[]
> {
  const g = await ambilPengaturan();
  if (!g?.sosial?.length) return [];
  return g.sosial.map((s) => ({ platform: s.platform, url: s.url }));
}

/* ============================== Layanan ================================= */

export async function ambilLayanan(): Promise<LayananBeranda[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("layanan");

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "layanan",
      depth: 1,
      limit: 100,
      sort: "urutan",
      draft: false,
      overrideAccess: false,
    });
    // Kueri berhasil tetapi kosong berarti CMS memang tidak punya layanan
    // terbit. Jangan hidupkan lagi data statis: itu membuat layanan yang
    // sudah dihapus/di-unpublish muncul kembali.
    if (res.docs.length === 0) return [];

    return res.docs.map((d) => ({
      slug: d.slug,
      judul: d.judul,
      subjudul: d.subjudul ?? "",
      ringkasan: d.ringkasan,
      gambar:
        mediaUrl(d.gambar, "sampul") ||
        GAMBAR_LAYANAN_STATIS.get(d.slug) ||
        FALLBACK_GAMBAR_LAYANAN,
    }));
  } catch (error) {
    catatKegagalanCms("layanan", error);
    propagarKegagalanCmsSaatBuild(error);
    return layananStatis;
  }
}

export async function ambilDetailLayanan(
  slug: string,
): Promise<DetailLayanan | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("layanan");

  const cleanSlug = slug.toLowerCase();

  try {
    const payload = await getClient();
    let res = await payload.find({
      collection: "layanan",
      where: { slug: { equals: cleanSlug } },
      depth: 1,
      limit: 1,
      draft: false,
      overrideAccess: false,
    });

    let d = res.docs[0] as (typeof res.docs)[number] | undefined;
    if (!d) {
      const all = await payload.find({
        collection: "layanan",
        depth: 1,
        limit: 100,
        draft: false,
        overrideAccess: false,
      });
      d = all.docs.find((doc) => doc.slug.toLowerCase() === cleanSlug);
    }

    // Tidak ditemukan setelah kueri berhasil = memang tidak terbit/terhapus.
    if (!d) return undefined;

    const paket: PaketLayanan[] = (d.paket ?? []).map((p) => ({
      nama: p.nama,
      deskripsi: p.deskripsi ?? "",
      harga: formatHargaRupiah(p.harga),
      satuan: formatSatuan(p.satuan),
      fitur: (p.fitur ?? []).map((f) => f.teks),
    }));
    const faq: FaqLayanan[] = (d.faq ?? []).map((f) => ({
      pertanyaan: f.pertanyaan,
      jawaban: f.jawaban,
    }));

    // Dokumen CMS yang sengaja dikosongkan tetap harus tercermin kosong;
    // fallback statis hanya dipakai saat CMS benar-benar gagal dibaca.
    return { slug: d.slug, paket, faq };
  } catch (error) {
    catatKegagalanCms("layanan-detail", error);
    propagarKegagalanCmsSaatBuild(error);
    return cariDetailLayanan(cleanSlug);
  }
}

/* ============================== Artikel ================================= */

export async function ambilArtikel(): Promise<ArtikelBeranda[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artikel");

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "artikel",
      depth: 1,
      limit: 200,
      sort: "-tanggalTerbit",
      draft: false,
      overrideAccess: false,
    });
    // CMS kosong adalah keadaan yang sah (belum ada atau semua di-unpublish),
    // bukan alasan menampilkan kembali artikel statis yang mungkin sudah
    // dihapus dari CMS.
    if (res.docs.length === 0) return [];

    return res.docs.map((a) => ({
      slug: a.slug,
      judul: a.judul,
      ringkasan: a.ringkasan,
      kategori:
        typeof a.kategori === "object" && a.kategori
          ? a.kategori.nama
          : "Perpajakan",
      kategoriSlug:
        typeof a.kategori === "object" && a.kategori
          ? a.kategori.slug
          : undefined,
      tanggal: formatTanggal(a.tanggalTerbit),
      waktuBaca: a.waktuBaca ?? "5 mnt baca",
      gambar:
        mediaUrl(a.sampul) ||
        GAMBAR_ARTIKEL_STATIS.get(a.slug) ||
        FALLBACK_GAMBAR_ARTIKEL,
    }));
  } catch (error) {
    catatKegagalanCms("artikel", error);
    propagarKegagalanCmsSaatBuild(error);
    return artikelStatis;
  }
}

export async function ambilArtikelDetail(
  slug: string,
): Promise<ArtikelDetail | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("artikel");

  const cleanSlug = slug.toLowerCase();

  try {
    const payload = await getClient();
    let res = await payload.find({
      collection: "artikel",
      where: { slug: { equals: cleanSlug } },
      depth: 1,
      limit: 1,
      draft: false,
      overrideAccess: false,
    });

    let a = res.docs[0] as (typeof res.docs)[number] | undefined;
    if (!a) {
      const all = await payload.find({
        collection: "artikel",
        depth: 1,
        limit: 200,
        draft: false,
        overrideAccess: false,
      });
      a = all.docs.find((doc) => doc.slug.toLowerCase() === cleanSlug);
    }

    // Tidak ditemukan setelah kueri berhasil = memang tidak terbit/terhapus.
    if (!a) return undefined;

    const blok: BlokIsi[] = (a.blok ?? []).map((b) => {
      if (b.blockType === "paragraf") {
        return { kind: "paragraph", text: b.teks };
      }
      if (b.blockType === "judul-bagian") {
        return {
          kind: "heading",
          level: Number(b.level) as 2 | 3 | 4,
          text: b.teks,
        };
      }
      return {
        kind: "list",
        ordered: Boolean(b.terurut),
        items: (b.item ?? []).map((i) => i.teks),
      };
    });

    const penulis =
      typeof a.penulis === "object" && a.penulis
        ? a.penulis.nama || a.penulis.email
        : undefined;

    // Blok kosong tetap kosong. Halaman detail dapat menampilkan ringkasan
    // sebagai isi cadangan, tetapi tidak boleh memunculkan kembali naskah
    // statis yang sudah dihapus dari CMS.
    return {
      slug: a.slug,
      penulis: penulis || "Tim Konsultan EasyTax",
      tags: (a.tag ?? []).map((t) => t.teks),
      blok,
    };
  } catch (error) {
    catatKegagalanCms("artikel-detail", error);
    propagarKegagalanCmsSaatBuild(error);
    return cariArtikelDetail(cleanSlug);
  }
}

/* ====================== Testimoni / Tim / Mitra ========================= */

export async function ambilTestimoni(): Promise<UjiTestimoni[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("testimoni");

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "testimoni",
      limit: 100,
      sort: "urutan",
      draft: false,
      overrideAccess: false,
    });
    if (res.docs.length === 0) return [];

    return res.docs.map((t) => ({
      nama: t.nama,
      peran: t.peran,
      kutipan: t.kutipan,
      inisial: t.inisial ?? t.nama.slice(0, 2).toUpperCase(),
      rating: t.rating ?? 5,
      fotoProfil: mediaUrl(t.fotoProfil, "kartu") || undefined,
      deskripsi: t.deskripsi ?? undefined,
    }));
  } catch (error) {
    catatKegagalanCms("testimoni", error);
    return testimoniStatis;
  }
}

export async function ambilTim(): Promise<AnggotaTim[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("tim");

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "tim",
      depth: 1,
      limit: 100,
      sort: "urutan",
      draft: false,
      overrideAccess: false,
    });
    if (res.docs.length === 0) return [];

    return res.docs.map((o) => ({
      nama: o.nama,
      jabatan: o.jabatan,
      lisensi: o.lisensi ?? "BKP",
      level: o.level ?? "C",
      foto:
        mediaUrl(o.foto, "kartu") ||
        FOTO_TIM_STATIS.get(o.nama) ||
        FALLBACK_FOTO_TIM,
      bio: o.bio ?? "",
    }));
  } catch (error) {
    catatKegagalanCms("tim", error);
    return timStatis;
  }
}

export async function ambilMitra(): Promise<{ nama: string; src: string }[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("mitra");

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "mitra",
      depth: 1,
      limit: 100,
      sort: "urutan",
      draft: false,
      overrideAccess: false,
    });
    if (res.docs.length === 0) return [];

    // Logo yang belum diunggah tidak diisi dengan logo statis: editor dapat
    // menghapus mitra dari CMS dan hasilnya harus benar-benar kosong.
    return res.docs
      .map((m) => ({ nama: m.nama, src: mediaUrl(m.logo) ?? "" }))
      .filter((m) => m.src.length > 0);
  } catch (error) {
    catatKegagalanCms("mitra", error);
    return logoMitra.map((file) => ({
      nama: namaMitra[file] ?? "Mitra EasyTax",
      src: `/images/clients/${file}`,
    }));
  }
}
