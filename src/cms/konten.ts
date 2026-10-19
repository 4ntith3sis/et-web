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

/** Urutkan dokumen CMS mengikuti urutan data statis (agar tidak berubah). */
function urutSepertiStatis<T extends { slug: string }>(
  hasil: T[],
  statis: { slug: string }[],
): T[] {
  const urutan = new Map(statis.map((s, i) => [s.slug, i]));
  return [...hasil].sort(
    (a, b) => (urutan.get(a.slug) ?? 9999) - (urutan.get(b.slug) ?? 9999),
  );
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

    const hasil = res.docs.map((d) => {
      const statik = layananStatis.find((s) => s.slug === d.slug);
      return {
        slug: d.slug,
        judul: d.judul,
        subjudul: d.subjudul ?? statik?.subjudul ?? "",
        ringkasan: d.ringkasan,
        gambar: mediaUrl(d.gambar, "sampul") ?? statik?.gambar ?? "",
      } satisfies LayananBeranda;
    });

    return urutSepertiStatis(hasil, layananStatis);
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

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "layanan",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
      draft: false,
      overrideAccess: false,
    });
    const d = res.docs[0];
    if (!d) return cariDetailLayanan(slug);

    const paket: PaketLayanan[] = (d.paket ?? []).map((p) => ({
      nama: p.nama,
      deskripsi: p.deskripsi ?? "",
      harga: p.harga,
      satuan: p.satuan ?? undefined,
      fitur: (p.fitur ?? []).map((f) => f.teks),
    }));
    const faq: FaqLayanan[] = (d.faq ?? []).map((f) => ({
      pertanyaan: f.pertanyaan,
      jawaban: f.jawaban,
    }));

    if (paket.length === 0 && faq.length === 0) return cariDetailLayanan(slug);
    return { slug, paket, faq };
  } catch {
    return cariDetailLayanan(slug);
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

    const hasil = res.docs.map((a) => {
      const statik = artikelStatis.find((s) => s.slug === a.slug);
      const kategori =
        typeof a.kategori === "object" && a.kategori
          ? a.kategori.nama
          : (statik?.kategori ?? "");
      return {
        slug: a.slug,
        judul: a.judul,
        ringkasan: a.ringkasan,
        kategori,
        tanggal: formatTanggal(a.tanggalTerbit) || statik?.tanggal || "",
        waktuBaca: a.waktuBaca ?? statik?.waktuBaca ?? "",
        gambar: mediaUrl(a.sampul) ?? statik?.gambar ?? "",
      } satisfies ArtikelBeranda;
    });

    return urutSepertiStatis(hasil, artikelStatis);
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

  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "artikel",
      where: { slug: { equals: slug } },
      depth: 1,
      limit: 1,
      draft: false,
      overrideAccess: false,
    });
    const a = res.docs[0];
    if (!a) return cariArtikelDetail(slug);

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

    if (blok.length === 0) return cariArtikelDetail(slug);

    const penulis =
      typeof a.penulis === "object" && a.penulis
        ? a.penulis.nama || a.penulis.email
        : undefined;

    return {
      slug,
      penulis: penulis || "Tim Konsultan EasyTax",
      tags: (a.tag ?? []).map((t) => t.teks),
      blok,
    };
  } catch {
    return cariArtikelDetail(slug);
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

    const hasil = res.docs.map((t) => ({
      nama: t.nama,
      peran: t.peran,
      kutipan: t.kutipan,
      inisial: t.inisial ?? t.nama.slice(0, 2).toUpperCase(),
      rating: t.rating ?? 5,
    }));

    const urutan = new Map(testimoniStatis.map((s, i) => [s.nama, i]));
    return hasil.sort(
      (a, b) => (urutan.get(a.nama) ?? 9999) - (urutan.get(b.nama) ?? 9999),
    );
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

    const hasil = res.docs.map((o) => {
      const statik = timStatis.find((s) => s.nama === o.nama);
      return {
        nama: o.nama,
        jabatan: o.jabatan,
        lisensi: o.lisensi ?? statik?.lisensi ?? "BKP",
        level: o.level ?? statik?.level ?? "C",
        foto: mediaUrl(o.foto, "kartu") ?? statik?.foto ?? "",
        bio: o.bio ?? statik?.bio ?? "",
      } satisfies AnggotaTim;
    });

    const urutan = new Map(timStatis.map((s, i) => [s.nama, i]));
    return hasil.sort(
      (a, b) => (urutan.get(a.nama) ?? 9999) - (urutan.get(b.nama) ?? 9999),
    );
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

    return res.docs
      .map((m) => ({ nama: m.nama, src: mediaUrl(m.logo) ?? "" }))
      .filter((m) => m.src.length > 0);
  } catch {
    return logoMitra.map((file) => ({
      nama: namaMitra[file] ?? "Mitra EasyTax",
      src: `/images/clients/${file}`,
    }));
  }
}
