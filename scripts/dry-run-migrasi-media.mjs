/**
 * Dry-run migrasi media CMS EasyTax.
 *
 * Sifat: READ-ONLY terhadap database dan filesystem proyek.
 * - Hanya melakukan GET ke API Payload dan membaca file.
 * - Tidak memakai Payload Local API / koneksi tulis.
 * - Satu-satunya penulisan adalah laporan ke OUT_DIR (default /tmp).
 *
 * Jalankan:
 *   node scripts/dry-run-migrasi-media.mjs
 *   EASYTAX_BASE_URL=http://localhost:3004 OUT_DIR=/tmp/easytax-dry-run \
 *     node scripts/dry-run-migrasi-media.mjs
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const BASE = process.env.EASYTAX_BASE_URL ?? "http://localhost:3004";
const OUT_DIR = process.env.OUT_DIR ?? "/tmp/easytax-dry-run";
const EXTERNAL = path.join(ROOT, "public", "images", "external");
const CLIENTS = path.join(ROOT, "public", "images", "clients");
const MEDIA = path.join(ROOT, "media");

const sha256 = async (file) =>
  crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");

const ada = async (file) => {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
};

const relatif = (file) => path.relative(ROOT, file).split(path.sep).join("/");

async function ambilApi(koleksi) {
  const url = `${BASE}/api/${koleksi}?limit=500&depth=0&draft=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> HTTP ${res.status}`);
  return res.json();
}

async function bacaTeks(file) {
  return fs.readFile(path.join(ROOT, file), "utf8");
}

function pasangan(teks, kunciA, kunciB) {
  const pola = new RegExp(`${kunciA}:\\s*"([^"]+)"[\\s\\S]*?${kunciB}:\\s*\\n?\\s*"([^"]+)"`, "g");
  return [...teks.matchAll(pola)].map((m) => ({ kunci: m[1], nilai: m[2] }));
}

async function daftarSumber(dir) {
  const hasil = [];
  for (const entri of await fs.readdir(dir, { withFileTypes: true })) {
    const penuh = path.join(dir, entri.name);
    if (entri.isDirectory()) hasil.push(...(await daftarSumber(penuh)));
    else if (/\.(ts|tsx)$/.test(entri.name)) hasil.push(penuh);
  }
  return hasil;
}

function namaDariRelasi(nilai, mediaById) {
  if (nilai === null || nilai === undefined) return { id: null, filename: null };
  if (typeof nilai === "object") {
    return { id: nilai.id ?? null, filename: nilai.filename ?? null };
  }
  return { id: nilai, filename: mediaById.get(nilai)?.filename ?? null };
}

const [artikelApi, layananApi, timApi, mitraApi, mediaApi] = await Promise.all([
  ambilApi("artikel"),
  ambilApi("layanan"),
  ambilApi("tim"),
  ambilApi("mitra"),
  ambilApi("media"),
]);

const mediaById = new Map(mediaApi.docs.map((m) => [m.id, m]));
const semuaRef = new Set();
for (const file of await daftarSumber(path.join(ROOT, "src"))) {
  const isi = await fs.readFile(file, "utf8");
  for (const m of isi.matchAll(/\/images\/external\/[A-Za-z0-9._-]+\.webp/g)) {
    semuaRef.add(m[0]);
  }
}

const artikelData = pasangan(await bacaTeks("src/data/artikel.ts"), "slug", "gambar");
const layananData = pasangan(await bacaTeks("src/data/layanan.ts"), "slug", "gambar");
const timData = pasangan(await bacaTeks("src/data/tim.ts"), "nama", "foto");

const pemakaianFoto = new Map();
const tambahPemakaian = (pathFoto, label) => {
  if (!pemakaianFoto.has(pathFoto)) pemakaianFoto.set(pathFoto, []);
  pemakaianFoto.get(pathFoto).push(label);
};
for (const x of artikelData) tambahPemakaian(x.nilai, `artikel:${x.kunci} (sampul)`);
for (const x of layananData) tambahPemakaian(x.nilai, `layanan:${x.kunci} (gambar)`);
for (const x of timData) tambahPemakaian(x.nilai, `tim:${x.kunci} (foto)`);

const fotoStatisSaja = [...semuaRef].filter((foto) => !pemakaianFoto.has(foto)).sort();
const fotoTertaut = [...pemakaianFoto.keys()].sort();

const teksMitra = await bacaTeks("src/data/mitra.ts");
const blokLogo = teksMitra.match(/export const logoMitra[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
const logoUrut = [...blokLogo.matchAll(/"([^"]+\.jpg)"/g)].map((m) => m[1]);
const namaMitra = Object.fromEntries(
  [...teksMitra.matchAll(/"([^"]+\.jpg)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]),
);

const targetMedia = new Map(); // filename -> data target
const targetFoto = new Map(); // path foto -> filename target
const targetLogo = new Map(); // file logo -> filename target

async function catatMedia({ filename, jenis, sumber, siapUpload, target, status, linkedTo, catatan = [] }) {
  if (targetMedia.has(filename)) {
    const adaTarget = targetMedia.get(filename);
    for (const item of linkedTo) if (!adaTarget.linkedTo.includes(item)) adaTarget.linkedTo.push(item);
    return adaTarget;
  }
  if (!(await ada(target))) throw new Error(`Target media tidak ditemukan: ${target}`);
  const meta = await sharp(target).metadata();
  const data = {
    filename,
    jenis,
    format: meta.format,
    width: meta.width,
    height: meta.height,
    bytes: (await fs.stat(target)).size,
    source: relatif(sumber),
    siapUpload: relatif(siapUpload),
    target: relatif(target),
    sha256: await sha256(target),
    status,
    linkedTo: [...linkedTo],
    catatan: [...catatan],
  };
  targetMedia.set(filename, data);
  return data;
}

function namaTargetFoto(pathFoto) {
  const id = path.basename(pathFoto, ".webp");
  return `migrasi-${id}.webp`;
}

for (const foto of [...semuaRef].sort()) {
  const id = path.basename(foto, ".webp");
  const sumber = path.join(EXTERNAL, `${id}.jpg`);
  const target = path.join(EXTERNAL, `${id}.webp`);
  let filename = namaTargetFoto(foto);
  if (await ada(path.join(MEDIA, filename))) {
    filename = `migrasi-${id}-${(await sha256(target)).slice(0, 8)}.webp`;
  }
  targetFoto.set(foto, filename);
  const linkedTo = pemakaianFoto.get(foto) ?? [];
  await catatMedia({
    filename,
    jenis: "foto",
    sumber,
    siapUpload: target,
    target,
    status: "create",
    linkedTo,
    catatan: linkedTo.length
      ? []
      : ["Tidak terhubung ke koleksi CMS; hanya dipakai komponen statis (Opsional jika migrasi dibatasi ke aset CMS)."],
  });
}

for (const file of logoUrut) {
  const sumber = path.join(CLIENTS, file);
  const nama = namaMitra[file] ?? path.basename(file, ".jpg");
  const mitraAda = mitraApi.docs.find(
    (m) =>
      String(m.nama).toLowerCase() === nama.toLowerCase() ||
      String(m.nama).toLowerCase() === path.basename(file, ".jpg").toLowerCase(),
  );
  const relasi = namaDariRelasi(mitraAda?.logo, mediaById);

  if (relasi.id && relasi.filename) {
    const target = path.join(MEDIA, relasi.filename);
    targetLogo.set(file, relasi.filename);
    await catatMedia({
      filename: relasi.filename,
      jenis: "logo",
      sumber,
      siapUpload: target,
      target,
      status: "existing",
      linkedTo: [`mitra:${mitraAda.nama} (logo)`],
      catatan: ["Record media sudah ada dan relasi mitra sudah terisi; tidak dibuat ulang."],
    });
    continue;
  }

  let filename = `migrasi-mitra-${file}`;
  if (await ada(path.join(MEDIA, filename))) {
    filename = `migrasi-mitra-${path.basename(file, ".jpg")}-${(await sha256(sumber)).slice(0, 8)}.jpg`;
  }
  targetLogo.set(file, filename);
  await catatMedia({
    filename,
    jenis: "logo",
    sumber,
    siapUpload: sumber,
    target: sumber,
    status: "create",
    linkedTo: [`mitra:${nama} (logo)`],
    catatan: [
      "JPG dipertahankan sesuai kebijakan logo.",
      "Memerlukan bypass konversi WebP yang eksplisit/trusted saat apply; mekanisme belum dijalankan.",
    ],
  });
}

for (const m of mediaApi.docs) {
  if (!targetMedia.has(m.filename)) {
    await catatMedia({
      filename: m.filename,
      jenis: "lain",
      sumber: path.join(MEDIA, m.filename),
      siapUpload: path.join(MEDIA, m.filename),
      target: path.join(MEDIA, m.filename),
      status: "existing",
      linkedTo: [],
      catatan: ["Record media ada tetapi tidak termasuk target migrasi ini; tidak diubah."],
    });
  }
}

const relasi = [];
const relasiKoleksi = {
  artikel: { docs: artikelApi.docs, field: "sampul", kunci: "slug", data: artikelData, target: targetFoto },
  layanan: { docs: layananApi.docs, field: "gambar", kunci: "slug", data: layananData, target: targetFoto },
  tim: { docs: timApi.docs, field: "foto", kunci: "nama", data: timData, target: targetFoto },
};

for (const [koleksi, info] of Object.entries(relasiKoleksi)) {
  for (const dok of info.docs) {
    const pasanganData = info.data.find(
      (x) => x.kunci.toLowerCase() === String(dok[info.kunci]).toLowerCase(),
    );
    const foto = pasanganData?.nilai;
    const filenameTarget = foto ? info.target.get(foto) : null;
    const sekarang = namaDariRelasi(dok[info.field], mediaById);
    relasi.push({
      koleksi,
      id: dok.id,
      kunci: dok[info.kunci],
      field: info.field,
      sekarang: sekarang.filename ?? null,
      target: filenameTarget ?? null,
      aksi: sekarang.id ? "pertahankan" : filenameTarget ? "isi" : "tidak ada target",
      catatan: sekarang.id ? "Relasi sudah terisi; tidak ditimpa." : foto ? "" : "Tidak ada padanan di data statis.",
    });
  }
}

const mitraBaru = [];
let urutanBaru = 2; // akiha existing urutan 1; record baru mulai 2 agar tidak menimpa.
for (const file of logoUrut) {
  const nama = namaMitra[file] ?? path.basename(file, ".jpg");
  const mitraAda = mitraApi.docs.find(
    (m) =>
      String(m.nama).toLowerCase() === nama.toLowerCase() ||
      String(m.nama).toLowerCase() === path.basename(file, ".jpg").toLowerCase(),
  );
  const filenameTarget = targetLogo.get(file) ?? null;
  const sekarang = namaDariRelasi(mitraAda?.logo, mediaById);
  if (mitraAda) {
    mitraBaru.push({
      nama: mitraAda.nama,
      status: "existing",
      id: mitraAda.id,
      urutanSekarang: mitraAda.urutan ?? null,
      urutanRencana: null,
      media: sekarang.filename ?? filenameTarget,
      aksi: "pertahankan",
      catatan: "Record mitra dan relasi logo sudah ada; tidak dibuat ulang.",
    });
    relasi.push({
      koleksi: "mitra",
      id: mitraAda.id,
      kunci: mitraAda.nama,
      field: "logo",
      sekarang: sekarang.filename ?? null,
      target: filenameTarget,
      aksi: sekarang.id ? "pertahankan" : "isi",
      catatan: sekarang.id ? "Relasi logo sudah terisi; tidak ditimpa." : "",
    });
    continue;
  }
  mitraBaru.push({
    nama,
    status: "create",
    id: null,
    urutanSekarang: null,
    urutanRencana: urutanBaru++,
    media: filenameTarget,
    aksi: "buat record mitra + isi logo",
    catatan: "Record mitra belum ada; akan dibuat, bukan menimpa record lama.",
  });
  relasi.push({
    koleksi: "mitra",
    id: null,
    kunci: nama,
    field: "logo",
    sekarang: null,
    target: filenameTarget,
    aksi: "isi",
    catatan: "Record mitra baru.",
  });
}

const semuaMedia = [...targetMedia.values()];
const mediaBaru = semuaMedia.filter((m) => m.status === "create");
const mediaCmsSaja = semuaMedia.filter((m) => m.jenis === "logo" || m.linkedTo.length > 0);
const relasiAda = relasi.filter((r) => r.sekarang);
const relasiBaru = relasi.filter((r) => !r.sekarang && r.target);

const ringkasan = {
  dihasilkan: new Date().toISOString(),
  sumberApi: BASE,
  sebelum: {
    artikel: artikelApi.totalDocs,
    layanan: layananApi.totalDocs,
    tim: timApi.totalDocs,
    mitra: mitraApi.totalDocs,
    media: mediaApi.totalDocs,
  },
  target: {
    mediaTotal: semuaMedia.length,
    mediaBaru: mediaBaru.length,
    mediaCmsSaja: mediaCmsSaja.length,
    mediaBaruCmsSaja: mediaCmsSaja.filter((m) => m.status === "create").length,
    relasiTotal: relasi.length,
    relasiBaru: relasiBaru.length,
    relasiAda: relasiAda.length,
    mitraTotal: mitraBaru.length,
    mitraBaru: mitraBaru.filter((m) => m.status === "create").length,
  },
  sesudah: {
    artikel: artikelApi.totalDocs,
    layanan: layananApi.totalDocs,
    tim: timApi.totalDocs,
    mitra: mitraBaru.length,
    media: semuaMedia.length,
  },
  perKoleksi: {
    artikel: {
      relasiTarget: relasi.filter((r) => r.koleksi === "artikel").length,
      relasiSudahAda: relasi.filter((r) => r.koleksi === "artikel" && r.sekarang).length,
      relasiBaru: relasi.filter((r) => r.koleksi === "artikel" && !r.sekarang && r.target).length,
    },
    layanan: {
      relasiTarget: relasi.filter((r) => r.koleksi === "layanan").length,
      relasiSudahAda: relasi.filter((r) => r.koleksi === "layanan" && r.sekarang).length,
      relasiBaru: relasi.filter((r) => r.koleksi === "layanan" && !r.sekarang && r.target).length,
    },
    tim: {
      relasiTarget: relasi.filter((r) => r.koleksi === "tim").length,
      relasiSudahAda: relasi.filter((r) => r.koleksi === "tim" && r.sekarang).length,
      relasiBaru: relasi.filter((r) => r.koleksi === "tim" && !r.sekarang && r.target).length,
    },
    mitra: {
      relasiTarget: relasi.filter((r) => r.koleksi === "mitra").length,
      relasiSudahAda: relasi.filter((r) => r.koleksi === "mitra" && r.sekarang).length,
      relasiBaru: relasi.filter((r) => r.koleksi === "mitra" && !r.sekarang && r.target).length,
      recordBaru: mitraBaru.filter((m) => m.status === "create").length,
    },
  },
  perbedaan: [
    "44 media = 23 foto unik + 21 logo. Dari jumlah itu 1 media sudah ada (akiha.webp), sehingga media baru = 43, bukan 44.",
    "41 relasi = 20 relasi foto CMS (12 artikel + 4 layanan + 4 tim) + 21 relasi logo mitra. Satu relasi logo sudah terisi (akiha), sehingga relasi baru = 40.",
    "20 record mitra baru = target 21 mitra - 1 record akiha yang sudah ada.",
    "12 relasi artikel memakai 11 foto unik karena photo-1521791136064-7986c2920216 dipakai dua artikel.",
    "Dari 23 foto, 4 hanya dipakai komponen statis (Hero beranda, LayananHero, TentangHero, Kontak) dan tidak punya relasi CMS.",
    "Jika migrasi dibatasi hanya pada aset yang punya relasi CMS, target media menjadi 40 (19 foto unik + 21 logo), bukan 44.",
    "Logo: 1 sudah berupa akiha.webp; 20 logo baru tetap JPG. Upload JPG saat ini akan dikonversi hook ke WebP, jadi apply memerlukan bypass eksplisit agar kebijakan JPG logo tidak berubah.",
    "Record mitra akiha memiliki urutan 1. Record baru direncanakan urutan 2-21 agar tidak menimpa urutan akiha; akibatnya akiha tampil lebih awal sampai urutan diperbarui (perubahan urutan tidak termasuk 20 record baru).",
  ],
};

await fs.mkdir(OUT_DIR, { recursive: true });
const keluaran = { ringkasan, media: semuaMedia, relasi, mitra: mitraBaru };
await fs.writeFile(path.join(OUT_DIR, "dry-run-media.json"), JSON.stringify(keluaran, null, 2));

const esc = (v) => String(v ?? "").replaceAll("|", "\\|");
const md = [];
md.push("# Dry-run migrasi media CMS EasyTax");
md.push("");
md.push(`Dihasilkan: ${ringkasan.dihasilkan}`);
md.push(`Sumber data: GET ${BASE}/api (read-only)`);
md.push("");
md.push("## Ringkasan");
md.push("");
md.push("| Ukuran | Sebelum | Target | Baru dibuat |");
md.push("|---|---:|---:|---:|");
md.push(`| Artikel | ${ringkasan.sebelum.artikel} | ${ringkasan.sesudah.artikel} | 0 |`);
md.push(`| Layanan | ${ringkasan.sebelum.layanan} | ${ringkasan.sesudah.layanan} | 0 |`);
md.push(`| Tim | ${ringkasan.sebelum.tim} | ${ringkasan.sesudah.tim} | 0 |`);
md.push(`| Mitra | ${ringkasan.sebelum.mitra} | ${ringkasan.sesudah.mitra} | ${ringkasan.target.mitraBaru} |`);
md.push(`| Media | ${ringkasan.sebelum.media} | ${ringkasan.target.mediaTotal} | ${ringkasan.target.mediaBaru} |`);
md.push(`| Relasi gambar | ${ringkasan.target.relasiAda} | ${ringkasan.target.relasiTotal} | ${ringkasan.target.relasiBaru} |`);
md.push("");
md.push("## Perbedaan jumlah yang perlu dipahami");
md.push("");
for (const item of ringkasan.perbedaan) md.push(`- ${item}`);
md.push("");
md.push("## Rencana media");
md.push("");
md.push("| Target file | Jenis | Format | Dimensi | Ukuran | Status | Sumber | File saat upload | Terhubung ke | Catatan |");
md.push("|---|---|---|---:|---:|---|---|---|---|---|");
for (const m of semuaMedia) {
  md.push(`| \`${esc(m.filename)}\` | ${m.jenis} | ${m.format} | ${m.width}×${m.height} | ${(m.bytes / 1024).toFixed(1)} KB | ${m.status} | \`${esc(m.source)}\` | \`${esc(m.siapUpload)}\` | ${esc(m.linkedTo.join("<br>"))} | ${esc(m.catatan.join(" "))} |`);
}
md.push("");
md.push("## Rencana relasi per koleksi");
md.push("");
md.push("| Koleksi | ID | Kunci | Field | Sekarang | Target | Aksi |");
md.push("|---|---:|---|---|---|---|---|");
for (const r of relasi) {
  md.push(`| ${r.koleksi} | ${r.id ?? "baru"} | \`${esc(r.kunci)}\` | ${r.field} | ${r.sekarang ? `\`${esc(r.sekarang)}\`` : "kosong"} | ${r.target ? `\`${esc(r.target)}\`` : "—"} | ${r.aksi}${r.catatan ? ` — ${esc(r.catatan)}` : ""} |`);
}
md.push("");
md.push("## Rencana record mitra");
md.push("");
md.push("| Nama | Status | ID | Urutan sekarang | Urutan rencana | Media | Aksi | Catatan |");
md.push("|---|---|---:|---:|---:|---|---|---|");
for (const m of mitraBaru) {
  md.push(`| ${esc(m.nama)} | ${m.status} | ${m.id ?? "baru"} | ${m.urutanSekarang ?? "—"} | ${m.urutanRencana ?? "—"} | \`${esc(m.media)}\` | ${m.aksi} | ${esc(m.catatan)} |`);
}
md.push("");
md.push("## Catatan keamanan dan blocker");
md.push("");
md.push("- Script ini hanya GET API dan membaca file; tidak menulis database atau `media/`.");
md.push("- Belum ada migrasi, seed, admin baru, atau rebuild/restart container.");
md.push("- Upload 20 logo JPG memerlukan bypass konversi WebP yang eksplisit dan trusted. Tanpa itu, hook Media akan mengubahnya menjadi WebP lossy.");
md.push("- Tiga file `.jpg` di `media/` sebenarnya PNG, tetapi tidak dipakai dalam rencana ini.");
md.push("- 263 file media lama tidak dihapus dan tidak dianggap sebagai record migrasi.");
md.push("- Laporan duplikat/orphan terpisah: `docs/audit-media-lama.md`.");

await fs.writeFile(path.join(OUT_DIR, "dry-run-media.md"), md.join("\n"));

console.log(JSON.stringify(ringkasan, null, 2));
console.log(`\nLaporan: ${path.join(OUT_DIR, "dry-run-media.md")}`);
console.log(`JSON   : ${path.join(OUT_DIR, "dry-run-media.json")}`);
