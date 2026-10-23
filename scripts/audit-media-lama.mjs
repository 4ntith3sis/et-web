/**
 * Audit read-only direktori media/ lama.
 *
 * Tidak menghapus atau memindahkan file. Hanya membaca file dan GET API media.
 * Output:
 *   OUT_DIR/audit-media-lama.md
 *   OUT_DIR/audit-media-lama.json
 *
 * Jalankan:
 *   node scripts/audit-media-lama.mjs
 *   EASYTAX_BASE_URL=http://localhost:3004 OUT_DIR=/tmp/easytax-audit-media \
 *     node scripts/audit-media-lama.mjs
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MEDIA = path.join(ROOT, "media");
const BASE = process.env.EASYTAX_BASE_URL ?? "http://localhost:3004";
const OUT_DIR = process.env.OUT_DIR ?? "/tmp/easytax-audit-media";

const sha256 = async (file) =>
  crypto.createHash("sha256").update(await fs.readFile(file)).digest("hex");

const mimeDariMagic = (buf) => {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 3).toString("ascii") === "GIF") return "image/gif";
  if (buf.subarray(0, 4).toString("ascii") === "%PDF") return "application/pdf";
  if (buf.subarray(0, 5).toString("ascii") === "<?xml") return "image/svg+xml";
  return "application/octet-stream";
};

const ekstensiMime = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf" };

let dbMedia = [];
let dbTersedia = true;
try {
  const res = await fetch(`${BASE}/api/media?limit=500&depth=0&draft=true`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  dbMedia = json.docs ?? [];
} catch (error) {
  dbTersedia = false;
  console.error(`Tidak bisa membaca API media: ${error.message}`);
}

const dbFilenames = new Set(dbMedia.map((m) => m.filename));
const namaFile = (await fs.readdir(MEDIA, { withFileTypes: true }))
  .filter((e) => e.isFile())
  .map((e) => e.name)
  .sort();

const files = [];
for (const nama of namaFile) {
  const penuh = path.join(MEDIA, nama);
  const stat = await fs.stat(penuh);
  const buf = await fs.readFile(penuh);
  const mime = mimeDariMagic(buf);
  const ext = path.extname(nama).toLowerCase();
  files.push({
    nama,
    path: path.relative(ROOT, penuh).split(path.sep).join("/"),
    bytes: stat.size,
    sha256: crypto.createHash("sha256").update(buf).digest("hex"),
    mime,
    ext,
    mismatch: ekstensiMime[ext] ? ekstensiMime[ext] !== mime : true,
    punyaRecord: dbFilenames.has(nama),
  });
}

const perHash = new Map();
for (const f of files) {
  if (!perHash.has(f.sha256)) perHash.set(f.sha256, []);
  perHash.get(f.sha256).push(f);
}

const grupDuplikat = [...perHash.entries()]
  .filter(([, arr]) => arr.length > 1)
  .map(([hash, arr]) => ({
    hash,
    jumlah: arr.length,
    bytesPerFile: arr[0].bytes,
    totalBytes: arr.reduce((n, f) => n + f.bytes, 0),
    redundanBytes: arr.slice(1).reduce((n, f) => n + f.bytes, 0),
    file: arr.map((f) => f.nama),
  }))
  .sort((a, b) => b.redundanBytes - a.redundanBytes || b.jumlah - a.jumlah);

const totalBytes = files.reduce((n, f) => n + f.bytes, 0);
const redundanBytes = grupDuplikat.reduce((n, g) => n + g.redundanBytes, 0);
const fileDalamGrup = grupDuplikat.reduce((n, g) => n + g.jumlah, 0);
const fileRedundan = grupDuplikat.reduce((n, g) => n + g.jumlah - 1, 0);
const tanpaRecord = files.filter((f) => !f.punyaRecord);
const mismatch = files.filter((f) => f.mismatch);

const ringkasan = {
  dihasilkan: new Date().toISOString(),
  sumberApi: BASE,
  dbTersedia,
  recordMediaDb: dbMedia.length,
  totalFile: files.length,
  totalBytes,
  totalMiB: Number((totalBytes / 1024 / 1024).toFixed(2)),
  grupDuplikat: grupDuplikat.length,
  fileDalamGrupDuplikat: fileDalamGrup,
  fileRedundan,
  redundanBytes,
  redundanMiB: Number((redundanBytes / 1024 / 1024).toFixed(2)),
  fileTanpaRecord: tanpaRecord.length,
  filePunyaRecord: files.length - tanpaRecord.length,
  ekstensiTidakCocok: mismatch.length,
  fileTerbesar: [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 10),
};

await fs.mkdir(OUT_DIR, { recursive: true });
await fs.writeFile(path.join(OUT_DIR, "audit-media-lama.json"), JSON.stringify({ ringkasan, grupDuplikat, mismatch, tanpaRecord }, null, 2));

const esc = (v) => String(v ?? "").replaceAll("|", "\\|");
const md = [];
md.push("# Audit media lama EasyTax");
md.push("");
md.push(`Dihasilkan: ${ringkasan.dihasilkan}`);
md.push(`Sumber daftar record: ${ringkasan.dbTersedia ? `GET ${BASE}/api/media` : "tidak tersedia"}`);
md.push("");
md.push("> Laporan ini bersifat read-only. Tidak ada file yang dihapus, dipindahkan, atau diubah.");
md.push("");
md.push("## Ringkasan");
md.push("");
md.push("| Ukuran | Nilai |");
md.push("|---|---:|");
md.push(`| Total file di \`media/\` | ${ringkasan.totalFile} |`);
md.push(`| Total ukuran | ${ringkasan.totalMiB} MiB |`);
md.push(`| Record media di database | ${ringkasan.recordMediaDb} |`);
md.push(`| Grup duplikat (isi byte-identik) | ${ringkasan.grupDuplikat} |`);
md.push(`| File yang berada dalam grup duplikat | ${ringkasan.fileDalamGrupDuplikat} |`);
md.push(`| File duplikat berlebih | ${ringkasan.fileRedundan} |`);
md.push(`| Ruang redundan | ${ringkasan.redundanBytes.toLocaleString("id-ID")} byte (${ringkasan.redundanMiB} MiB / ${(ringkasan.redundanBytes / 1_000_000).toFixed(2)} MB desimal) |`);
md.push(`| File tanpa record media | ${ringkasan.fileTanpaRecord} |`);
md.push(`| File punya record media | ${ringkasan.filePunyaRecord} |`);
md.push(`| Ekstensi tidak cocok dengan isi | ${ringkasan.ekstensiTidakCocok} |`);
md.push("");
md.push("Catatan: angka “file duplikat berlebih” adalah jumlah file yang dapat dihapus per grup tanpa kehilangan satu salinan pun. Angka ini berbeda dari “file dalam grup duplikat”.");
md.push("");
md.push("## File dengan ekstensi tidak cocok");
md.push("");
if (mismatch.length === 0) {
  md.push("Tidak ada.");
} else {
  md.push("| File | Ekstensi | Isi sebenarnya | Ukuran |");
  md.push("|---|---|---|---:|");
  for (const f of mismatch) md.push(`| \`${esc(f.nama)}\` | ${f.ext} | ${f.mime} | ${(f.bytes / 1024).toFixed(1)} KB |`);
}
md.push("");
md.push("## Grup duplikat");
md.push("");
md.push("| # | Hash (8) | Jumlah | Ukuran/file | Redundan | File |");
md.push("|---:|---|---:|---:|---:|---|");
grupDuplikat.forEach((g, i) => {
  md.push(`| ${i + 1} | \`${g.hash.slice(0, 8)}\` | ${g.jumlah} | ${(g.bytesPerFile / 1024).toFixed(1)} KB | ${(g.redundanBytes / 1024).toFixed(1)} KB | ${g.file.map(esc).join("<br>")} |`);
});
md.push("");
md.push("## File tanpa record media");
md.push("");
md.push(`Ada ${tanpaRecord.length} file yang tidak memiliki record di koleksi \`media\`. File-file ini **tidak dihapus** dan tidak dipakai sebagai target migrasi.`);
md.push("");
md.push("<details>");
md.push(`<summary>Daftar ${tanpaRecord.length} file tanpa record</summary>`);
md.push("");
for (const f of tanpaRecord) md.push(`- \`${f.path}\` — ${(f.bytes / 1024).toFixed(1)} KB — ${f.mime}`);
md.push("");
md.push("</details>");
md.push("");
md.push("## Rekomendasi");
md.push("");
md.push("- Jangan hapus apa pun sebelum ada persetujuan terpisah dan backup yang diverifikasi.");
md.push("- Prioritaskan file tanpa record dan duplikat untuk dibersihkan setelah migrasi CMS selesai.");
md.push("- Pertahankan minimal satu salinan dari setiap hash, terutama `akiha.webp` yang sudah punya record dan relasi mitra.");
md.push("- Periksa 3 file berekstensi `.jpg` yang isinya PNG sebelum memutuskan format final.");
md.push("");

await fs.writeFile(path.join(OUT_DIR, "audit-media-lama.md"), md.join("\n"));
console.log(JSON.stringify(ringkasan, null, 2));
console.log(`\nLaporan: ${path.join(OUT_DIR, "audit-media-lama.md")}`);
