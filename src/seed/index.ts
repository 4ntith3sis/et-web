import fs from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import config from "../payload.config";
import { artikelBeranda } from "../data/artikel";
import { artikelDetail } from "../data/artikel-detail";
import { jamOperasional, topikKonsultasi } from "../data/kontak";
import { layananBeranda } from "../data/layanan";
import { detailLayanan } from "../data/layanan-detail";
import { logoMitra, namaMitra } from "../data/mitra";
import { menuNavigasi, situs } from "../data/situs";
import { testimoni } from "../data/testimoni";
import { timKonsultan } from "../data/tim";
import { layoutDefault } from "../puck/default-layouts";
import { halamanDariKey } from "../puck/types";

/**
 * Seed konten awal dari `src/data/*` ke Payload, plus satu akun admin.
 *
 * Idempoten: setiap entri dicek lewat kunci uniknya (slug/nama/email) lalu
 * dibuat bila belum ada. Gambar dibaca dari aset WebP statis proyek atau
 * `public/images/clients/*`, diunggah ke koleksi `media`, dan ditautkan ke
 * dokumen. Bila pembacaan gagal, relasi dibiarkan kosong sehingga situs
 * memakai fallback statis.
 *
 * Jalankan: npm run cms -- run src/seed/index.ts --disable-transpile
 */

const ROOT = process.cwd();
const PAYLOAD = await getPayload({ config });

const BULAN: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  ags: 7,
  sep: 8,
  okt: 9,
  nov: 10,
  des: 11,
};

/** "7 Okt 2026" → ISO tanggal (UTC). */
function parseTanggal(teks: string): string | undefined {
  const cocok = teks.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!cocok) return undefined;
  const bulan = BULAN[cocok[2].toLowerCase().slice(0, 3)];
  if (bulan === undefined) return undefined;
  return new Date(Date.UTC(Number(cocok[3]), bulan, Number(cocok[1]))).toISOString();
}

const ekstensiDariTipe = (tipe: string): string => {
  if (tipe.includes("png")) return "png";
  if (tipe.includes("webp")) return "webp";
  if (tipe.includes("gif")) return "gif";
  if (tipe.includes("svg")) return "svg";
  return "jpg";
};

const mimeDariEkstensi = (file: string): string => {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  return "image/jpeg";
};

/* ---------------------------------------------------------------- Media */

async function cariMedia(nama: string): Promise<number | undefined> {
  // Nama lama dapat berakhiran .jpg sementara media baru .webp. Cocokkan
  // berdasarkan batang nama agar seed ulang tidak membuat record duplikat.
  const dasar = nama.replace(/\.[^.]+$/, "");
  const ada = await PAYLOAD.find({
    collection: "media",
    where: {
      or: [
        { filename: { equals: nama } },
        { filename: { like: `${dasar}.%` } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  return ada.docs[0]?.id;
}

async function unggahGambar(
  nama: string,
  alt: string,
  muat: () => Promise<{ data: Buffer; mimetype: string }>,
): Promise<number | undefined> {
  const sudahAda = await cariMedia(nama);
  if (sudahAda) return sudahAda;

  try {
    const { data, mimetype } = await muat();
    const dok = await PAYLOAD.create({
      collection: "media",
      data: { alt },
      file: { data, mimetype, name: nama, size: data.length },
      overrideAccess: true,
    });
    return dok.id;
  } catch (err) {
    console.warn(`  ! gagal mengunggah ${nama}:`, (err as Error).message);
    return undefined;
  }
}

function unggahDariSumber(sumber: string, nama: string, alt: string) {
  return unggahGambar(nama, alt, async () => {
    // Aset statis proyek dibaca langsung dari public/ agar seed tidak
    // bergantung pada Unsplash dan tetap memakai file WebP yang sudah ada.
    if (sumber.startsWith("/")) {
      const file = path.join(ROOT, "public", sumber.replace(/^\//, ""));
      const data = await fs.readFile(file);
      return { data, mimetype: mimeDariEkstensi(file) };
    }
    const res = await fetch(sumber);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tipe = res.headers.get("content-type") ?? "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return { data: buf, mimetype: tipe };
  });
}

function unggahDariFile(file: string, nama: string, alt: string) {
  return unggahGambar(nama, alt, async () => {
    const data = await fs.readFile(path.join(ROOT, "public", "images", "clients", file));
    return { data, mimetype: mimeDariEkstensi(file) };
  });
}

/* --------------------------------------------------------------- Bantu */

type HasilUpsert = { id: number; baru: boolean };

async function upsert(
  collection: "layanan" | "artikel" | "kategori" | "testimoni" | "tim" | "mitra",
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<HasilUpsert> {
  const ada = await PAYLOAD.find({
    collection,
    where: where as never,
    limit: 1,
    overrideAccess: true,
    draft: true,
  });
  if (ada.docs[0]) {
    await PAYLOAD.update({
      collection,
      id: ada.docs[0].id,
      data: data as never,
      overrideAccess: true,
    });
    return { id: ada.docs[0].id, baru: false };
  }
  const dok = await PAYLOAD.create({
    collection,
    data: data as never,
    overrideAccess: true,
  });
  return { id: dok.id, baru: true };
}

/* ---------------------------------------------------------------- User */

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@easytax.id";
  const password = process.env.SEED_ADMIN_PASSWORD || "EasyTax#2026";
  const ada = await PAYLOAD.find({
    collection: "users",
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  });
  if (ada.docs[0]) {
    console.log(`· admin sudah ada: ${email}`);
    return ada.docs[0].id;
  }
  const user = await PAYLOAD.create({
    collection: "users",
    data: { nama: "Admin EasyTax", email, password, role: "admin" },
    overrideAccess: true,
  });
  console.log(`+ admin berhasil dibuat: ${email} (kredensial dari konfigurasi environment)`);
  return user.id;
}

/* ---------------------------------------------------------- Page Builder */

/**
 * Seed layout Page Builder untuk beranda sebagai **draft**.
 *
 * Sengaja tidak diterbitkan: halaman publik tetap memakai implementasi lama
 * sampai tim memverifikasi hasilnya di editor lalu menekan Publish.
 */
async function seedLayoutBeranda() {
  const halaman = halamanDariKey("beranda");
  if (!halaman) return;

  const ada = await PAYLOAD.find({
    collection: "page-layouts",
    where: { pageKey: { equals: halaman.key } },
    limit: 1,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  if (ada.docs[0]) {
    console.log("· layout beranda sudah ada");
    return;
  }

  await PAYLOAD.create({
    collection: "page-layouts",
    data: {
      pageKey: halaman.key,
      judul: halaman.judul,
      rute: halaman.rute,
      layout: layoutDefault(halaman.key),
      revision: 0,
    } as never,
    draft: true,
    overrideAccess: true,
  });
  console.log("+ layout beranda (draft) dibuat");
}

/* ----------------------------------------------------------------- Main */

async function main() {
  console.log("→ Seed EasyTax CMS…");
  const adminId = await seedAdmin();

  /* Kategori dari kategori unik artikel. */
  const namaKategori = [...new Set(artikelBeranda.map((a) => a.kategori))];
  const idKategori = new Map<string, number>();
  for (const nama of namaKategori) {
    const { id } = await upsert(
      "kategori",
      { slug: { equals: nama.toLowerCase() } },
      { nama, slug: nama.toLowerCase() },
    );
    idKategori.set(nama, id);
  }
  console.log(`· ${idKategori.size} kategori`);

  /* Layanan. */
  for (const [i, l] of layananBeranda.entries()) {
    const detail = detailLayanan.find((d) => d.slug === l.slug);
    const gambar = await unggahDariSumber(
      l.gambar,
      `seed-layanan-${l.slug}.webp`,
      l.judul,
    );
    await upsert(
      "layanan",
      { slug: { equals: l.slug } },
      {
        judul: l.judul,
        slug: l.slug,
        subjudul: l.subjudul,
        ringkasan: l.ringkasan,
        ...(gambar ? { gambar } : {}),
        urutan: i + 1,
        paket: (detail?.paket ?? []).map((p) => ({
          nama: p.nama,
          deskripsi: p.deskripsi,
          harga: p.harga,
          satuan: p.satuan,
          fitur: p.fitur.map((teks) => ({ teks })),
        })),
        faq: (detail?.faq ?? []).map((f) => ({
          pertanyaan: f.pertanyaan,
          jawaban: f.jawaban,
        })),
        _status: "published",
      },
    );
  }
  console.log(`· ${layananBeranda.length} layanan`);

  /* Artikel. */
  for (const a of artikelBeranda) {
    const detail = artikelDetail.find((d) => d.slug === a.slug);
    const sampul = await unggahDariSumber(
      a.gambar,
      `seed-artikel-${a.slug}.webp`,
      a.judul,
    );
    await upsert(
      "artikel",
      { slug: { equals: a.slug } },
      {
        judul: a.judul,
        slug: a.slug,
        ringkasan: a.ringkasan,
        ...(sampul ? { sampul } : {}),
        kategori: idKategori.get(a.kategori),
        penulis: adminId,
        tanggalTerbit: parseTanggal(a.tanggal),
        waktuBaca: a.waktuBaca,
        tag: (detail?.tags ?? []).map((teks) => ({ teks })),
        blok: (detail?.blok ?? []).map((b) => {
          if (b.kind === "paragraph") {
            return { blockType: "paragraf", teks: b.text };
          }
          if (b.kind === "heading") {
            return {
              blockType: "judul-bagian",
              teks: b.text,
              level: String(b.level),
            };
          }
          return {
            blockType: "daftar",
            terurut: b.ordered,
            item: b.items.map((teks) => ({ teks })),
          };
        }),
        _status: "published",
      },
    );
  }
  console.log(`· ${artikelBeranda.length} artikel`);

  /* Testimoni. */
  for (const [i, t] of testimoni.entries()) {
    await upsert(
      "testimoni",
      { nama: { equals: t.nama } },
      {
        nama: t.nama,
        peran: t.peran,
        kutipan: t.kutipan,
        inisial: t.inisial,
        rating: t.rating,
        urutan: i + 1,
      },
    );
  }
  console.log(`· ${testimoni.length} testimoni`);

  /* Tim. */
  for (const [i, o] of timKonsultan.entries()) {
    const foto = await unggahDariSumber(
      o.foto,
      `seed-tim-${o.nama.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.webp`,
      o.nama,
    );
    await upsert(
      "tim",
      { nama: { equals: o.nama } },
      {
        nama: o.nama,
        jabatan: o.jabatan,
        lisensi: o.lisensi,
        level: o.level,
        ...(foto ? { foto } : {}),
        bio: o.bio,
        urutan: i + 1,
      },
    );
  }
  console.log(`· ${timKonsultan.length} anggota tim`);

  /* Mitra. */
  for (const [i, file] of logoMitra.entries()) {
    const logo = await unggahDariFile(
      file,
      `seed-mitra-${file}`,
      namaMitra[file] ?? "Mitra EasyTax",
    );
    if (!logo) continue;
    await upsert(
      "mitra",
      { nama: { equals: namaMitra[file] ?? file } },
      { nama: namaMitra[file] ?? file, logo, urutan: i + 1 },
    );
  }
  console.log(`· ${logoMitra.length} mitra`);

  /* Global pengaturan situs. */
  await PAYLOAD.updateGlobal({
    slug: "pengaturan-situs",
    data: {
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
      sosial: [
        { platform: "instagram", url: "https://www.instagram.com/easytax.id/" },
        { platform: "tiktok", url: "https://www.tiktok.com/@easytax.id" },
      ],
      seoJudul: `${situs.nama} - Jasa Konsultan Pajak dan Akuntansi Perusahaan`,
      seoDeskripsi: situs.deskripsi,
    },
    overrideAccess: true,
  });
  console.log("· pengaturan situs");

  /* Layout Page Builder (draft). */
  await seedLayoutBeranda();

  console.log("✓ Seed selesai.");
}

try {
  await main();
} catch (err) {
  console.error("Seed gagal:", err);
  process.exitCode = 1;
} finally {
  await PAYLOAD.destroy();
}
