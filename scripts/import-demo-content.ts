import fs from "node:fs/promises";
import path from "node:path";
import { getPayload, type Payload } from "payload";

import config from "../src/payload.config";
import { artikelBeranda } from "../src/data/artikel";
import { artikelDetail } from "../src/data/artikel-detail";
import { layananBeranda } from "../src/data/layanan";
import { detailLayanan } from "../src/data/layanan-detail";
import { logoMitra } from "../src/data/mitra";
import { testimoni } from "../src/data/testimoni";
import { timKonsultan } from "../src/data/tim";
import { jamOperasional, topikKonsultasi } from "../src/data/kontak";
import { menuNavigasi, situs } from "../src/data/situs";
import { layoutDefault } from "../src/puck/default-layouts";
import { halamanDariKey } from "../src/puck/types";
import { validasiLayoutPuck } from "../src/puck/validation";

const root = process.cwd();
const payload = await getPayload({ config });
const counts = { layanan: 0, artikel: 0, kategori: 0, testimoni: 0, tim: 0, global: 0, layout: 0 };

function wajib(teks: string, nama: string): string {
  const value = teks.trim();
  if (!value) throw new Error(`Validasi gagal: ${nama} kosong`);
  return value;
}

function tanggalIso(value: string): string {
  const m = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) throw new Error(`Tanggal sumber tidak valid: ${value}`);
  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
    jul: 6, agu: 7, ags: 7, sep: 8, okt: 9, nov: 10, des: 11,
  };
  const month = months[m[2].toLowerCase().slice(0, 3)];
  if (month === undefined) throw new Error(`Bulan sumber tidak valid: ${value}`);
  return new Date(Date.UTC(Number(m[3]), month, Number(m[1]))).toISOString();
}

async function existing(collection: string, field: string, value: string) {
  const result = await payload.find({
    collection: collection as never,
    where: { [field]: { equals: value } } as never,
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  return result.docs[0] as ({ id: number } & Record<string, unknown>) | undefined;
}

async function createOnly(collection: string, field: string, key: string, data: Record<string, unknown>) {
  if (await existing(collection, field, key)) return false;
  await payload.create({ collection: collection as never, data: data as never, overrideAccess: true });
  return true;
}

function normalize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(normalize).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).filter(([key]) => !["id", "createdAt", "updatedAt", "_status"].includes(key)).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${normalize(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function articleBlocks(blocks: (typeof artikelDetail)[number]["blok"]) {
  return blocks.map((block) => {
    if (block.kind === "paragraph") return { blockType: "paragraf", teks: block.text };
    if (block.kind === "heading") return { blockType: "judul-bagian", teks: block.text, level: String(block.level) };
    return { blockType: "daftar", terurut: block.ordered, item: block.items.map((teks) => ({ teks })) };
  });
}

try {
  const kategoriIds = new Map<string, number>();
  for (const nama of [...new Set(artikelBeranda.map((a) => a.kategori))]) {
    wajib(nama, "kategori.nama");
    const slug = wajib(nama.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), "kategori.slug");
    const prior = await existing("kategori", "slug", slug);
    if (prior) kategoriIds.set(nama, prior.id);
    else {
      const doc = await payload.create({ collection: "kategori", data: { nama, slug }, overrideAccess: true });
      kategoriIds.set(nama, doc.id as number);
      counts.kategori++;
    }
  }

  for (const [i, item] of layananBeranda.entries()) {
    wajib(item.judul, `layanan[${i}].judul`);
    wajib(item.slug, `layanan[${i}].slug`);
    wajib(item.ringkasan, `layanan[${i}].ringkasan`);
    const detail = detailLayanan.find((d) => d.slug === item.slug);
    const data = {
      judul: item.judul, slug: item.slug, subjudul: item.subjudul, ringkasan: item.ringkasan,
      urutan: i + 1,
      paket: (detail?.paket ?? []).map((p) => ({ nama: p.nama, deskripsi: p.deskripsi, harga: p.harga, satuan: p.satuan, fitur: p.fitur.map((teks) => ({ teks })) })),
      faq: (detail?.faq ?? []).map((f) => ({ pertanyaan: f.pertanyaan, jawaban: f.jawaban })),
      _status: "published",
    };
    if (await createOnly("layanan", "slug", item.slug, data)) counts.layanan++;
  }

  for (const item of artikelBeranda) {
    wajib(item.judul, `artikel.${item.slug}.judul`);
    wajib(item.slug, "artikel.slug");
    wajib(item.ringkasan, `artikel.${item.slug}.ringkasan`);
    wajib(item.kategori, `artikel.${item.slug}.kategori`);
    tanggalIso(item.tanggal);
    const category = kategoriIds.get(item.kategori);
    if (!category) throw new Error(`Kategori tidak tersedia: ${item.kategori}`);
    const detail = artikelDetail.find((d) => d.slug === item.slug);
    const data = {
      judul: item.judul, slug: item.slug, ringkasan: item.ringkasan,
      kategori: category, tanggalTerbit: tanggalIso(item.tanggal), waktuBaca: item.waktuBaca,
      tag: (detail?.tags ?? []).map((teks) => ({ teks })), blok: articleBlocks(detail?.blok ?? []),
      _status: "published",
    };
    if (await createOnly("artikel", "slug", item.slug, data)) counts.artikel++;
  }

  for (const [i, item] of testimoni.entries()) {
    wajib(item.nama, `testimoni[${i}].nama`);
    wajib(item.peran, `testimoni[${i}].peran`);
    wajib(item.kutipan, `testimoni[${i}].kutipan`);
    if (await createOnly("testimoni", "nama", item.nama, { ...item, urutan: i + 1 })) counts.testimoni++;
  }

  for (const [i, item] of timKonsultan.entries()) {
    wajib(item.nama, `tim[${i}].nama`);
    wajib(item.jabatan, `tim[${i}].jabatan`);
    const prior = await existing("tim", "nama", item.nama);
    if (!prior) {
      await payload.create({
        collection: "tim",
        data: { nama: item.nama, jabatan: item.jabatan, lisensi: item.lisensi, level: item.level, bio: item.bio, urutan: i + 1 },
        overrideAccess: true,
      });
      counts.tim++;
    }
  }

  const globalData = {
    nama: situs.nama,
    subjudul: situs.subjudul,
    deskripsi: situs.deskripsi,
    whatsappUrl: situs.whatsappUrl,
    telepon: situs.kontak.telepon,
    email: situs.kontak.email,
    alamat: situs.kontak.alamat,
    jamOperasional: jamOperasional.map((j) => ({ hari: j.hari, jam: j.jam })),
    topikKonsultasi: topikKonsultasi.map((teks) => ({ teks })),
    navigasi: menuNavigasi.map((n) => ({ label: n.label, href: n.href })),
  };
  const globalCurrent = await payload.findGlobal({ slug: "pengaturan-situs", depth: 0, overrideAccess: true });
  const currentGlobal = globalCurrent as unknown as Record<string, unknown>;
  const hasGlobalData = Object.keys(globalData).some((key) => {
    const value = currentGlobal[key];
    return typeof value === "string" ? value.length > 0 : Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null;
  });
  if (!hasGlobalData) {
    await payload.updateGlobal({ slug: "pengaturan-situs", data: globalData, overrideAccess: true });
    counts.global++;
  } else if (Object.entries(globalData).some(([key, value]) => normalize(currentGlobal[key]) !== normalize(value))) {
    throw new Error("Global pengaturan-situs berisi data berbeda; migrasi dihentikan tanpa menimpa.");
  }

  const homepage = halamanDariKey("beranda");
  const homeLayout = homepage && layoutDefault(homepage.key);
  if (!homepage || !homeLayout) throw new Error("Layout beranda sumber tidak tersedia.");
  const validLayout = validasiLayoutPuck(homeLayout);
  if (!validLayout.ok) throw new Error(`Layout beranda tidak lolos validasi: ${validLayout.error}`);
  const savedLayout = await existing("page-layouts", "pageKey", homepage.key);
  if (!savedLayout) {
    await payload.create({
      collection: "page-layouts",
      data: { pageKey: homepage.key, judul: homepage.judul, rute: homepage.rute, layout: validLayout.data, revision: 0 },
      draft: true,
      overrideAccess: true,
    });
    counts.layout++;
  } else if (normalize(savedLayout.layout) !== normalize(validLayout.data)) {
    console.warn("Layout beranda existing berbeda; tidak diubah.");
  }

  for (const filename of logoMitra) {
    const image = path.resolve(root, "public", "images", "clients", filename);
    if (!(await fs.stat(image)).isFile()) throw new Error(`Logo lokal tidak ditemukan: ${filename}`);
  }

  console.log("Demo content import completed (existing records were left unchanged):", {
    ...counts,
    globalAlreadyPresent: hasGlobalData,
    layoutAlreadyPresent: Boolean(savedLayout),
    mitraAssetsValidated: logoMitra.length,
    mitraNote: "Logo rows require media uploads; deferred to protect the existing media mount.",
  });
} finally {
  await payload.destroy();
}
