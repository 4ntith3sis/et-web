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
import type { BlokIsi } from "@/lib/artikel/toc";
import type { ItemNavigasi } from "@/types";
import type { Media, PengaturanSitus } from "@/payload-types";

/* ==========================================================================
   Lapisan data CMS.

   Semua pembacaan Payload dibungkus `use cache` agar hasilnya ikut masuk
   "static shell" (Next.js Cache Components) dan tidak menandai halaman
   sebagai dinamis. Setiap fungsi punya fallback ke data statis di
   `src/data/*` supaya situs tetap tampil walau database kosong/belum
   di-seed — sehingga migrasi ke CMS bisa bertahap tanpa memutus halaman.
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

/** URL gambar dari relasi media, dengan dukungan ukuran bawaan Payload. */
function mediaUrl(
  nilai: Media | number | null | undefined,
  ukuran?: keyof NonNullable<Media["sizes"]>,
): string | undefined {
  if (!nilai || typeof nilai !== "object") return undefined;
  if (ukuran && nilai.sizes?.[ukuran]?.url) return nilai.sizes[ukuran]!.url!;
  return nilai.url ?? undefined;
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
  } catch {
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
    whatsappUrl: g.whatsappUrl || situsStatis.whatsappUrl,
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
    if (res.docs.length === 0) return layananStatis;

    return res.docs.map((d) => {
      const statik = layananStatis.find(
        (s) => s.slug.toLowerCase() === d.slug.toLowerCase(),
      );
      return {
        slug: d.slug,
        judul: d.judul,
        subjudul: d.subjudul ?? statik?.subjudul ?? "",
        ringkasan: d.ringkasan,
        gambar:
          mediaUrl(d.gambar, "sampul") ||
          statik?.gambar ||
          FALLBACK_GAMBAR_LAYANAN,
      } satisfies LayananBeranda;
    });
  } catch {
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

    if (!d) return cariDetailLayanan(cleanSlug);

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

    if (paket.length === 0 && faq.length === 0) {
      const statik = cariDetailLayanan(cleanSlug);
      if (statik) return statik;
      return { slug: d.slug, paket: [], faq: [] };
    }

    return { slug: d.slug, paket, faq };
  } catch {
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
    if (res.docs.length === 0) return artikelStatis;

    return res.docs.map((a) => {
      const statik = artikelStatis.find(
        (s) => s.slug.toLowerCase() === a.slug.toLowerCase(),
      );
      const kategori =
        typeof a.kategori === "object" && a.kategori
          ? a.kategori.nama
          : (statik?.kategori ?? "Perpajakan");
      return {
        slug: a.slug,
        judul: a.judul,
        ringkasan: a.ringkasan,
        kategori,
        tanggal: formatTanggal(a.tanggalTerbit) || statik?.tanggal || "",
        waktuBaca: a.waktuBaca ?? statik?.waktuBaca ?? "5 mnt baca",
        gambar:
          mediaUrl(a.sampul) ||
          statik?.gambar ||
          FALLBACK_GAMBAR_ARTIKEL,
      } satisfies ArtikelBeranda;
    });
  } catch {
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

    if (!a) return cariArtikelDetail(cleanSlug);

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

    if (blok.length === 0) return cariArtikelDetail(cleanSlug);

    const penulis =
      typeof a.penulis === "object" && a.penulis
        ? a.penulis.nama || a.penulis.email
        : undefined;

    return {
      slug: a.slug,
      penulis: penulis || "Tim Konsultan EasyTax",
      tags: (a.tag ?? []).map((t) => t.teks),
      blok,
    };
  } catch {
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
    if (res.docs.length === 0) return testimoniStatis;

    return res.docs.map((t) => ({
      nama: t.nama,
      peran: t.peran,
      kutipan: t.kutipan,
      inisial: t.inisial ?? t.nama.slice(0, 2).toUpperCase(),
      rating: t.rating ?? 5,
    }));
  } catch {
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
    if (res.docs.length === 0) return timStatis;

    return res.docs.map((o) => {
      const statik = timStatis.find(
        (s) => s.nama.toLowerCase() === o.nama.toLowerCase(),
      );
      return {
        nama: o.nama,
        jabatan: o.jabatan,
        lisensi: o.lisensi ?? statik?.lisensi ?? "BKP",
        level: o.level ?? statik?.level ?? "C",
        foto:
          mediaUrl(o.foto, "kartu") ||
          statik?.foto ||
          FALLBACK_FOTO_TIM,
        bio: o.bio ?? statik?.bio ?? "",
      } satisfies AnggotaTim;
    });
  } catch {
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
    if (res.docs.length === 0) {
      return logoMitra.map((file) => ({
        nama: namaMitra[file] ?? "Mitra EasyTax",
        src: `/images/clients/${file}`,
      }));
    }

    const hasil = res.docs
      .map((m) => ({ nama: m.nama, src: mediaUrl(m.logo) ?? "" }))
      .filter((m) => m.src.length > 0);

    if (hasil.length === 0) {
      return logoMitra.map((file) => ({
        nama: namaMitra[file] ?? "Mitra EasyTax",
        src: `/images/clients/${file}`,
      }));
    }

    return hasil;
  } catch {
    return logoMitra.map((file) => ({
      nama: namaMitra[file] ?? "Mitra EasyTax",
      src: `/images/clients/${file}`,
    }));
  }
}
