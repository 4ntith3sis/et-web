import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";

const ROOT = process.cwd();
const EXTERNAL = path.join(ROOT, "public", "images", "external");

async function daftarSumber(dir: string): Promise<string[]> {
  const hasil: string[] = [];
  for (const entri of await readdir(dir, { withFileTypes: true })) {
    const penuh = path.join(dir, entri.name);
    if (entri.isDirectory()) hasil.push(...(await daftarSumber(penuh)));
    else if (/\.(ts|tsx)$/.test(entri.name)) hasil.push(penuh);
  }
  return hasil;
}

test("semua foto statis yang direferensikan adalah WebP dan file sumber tetap tersedia", async () => {
  const referensi = new Set<string>();
  for (const file of await daftarSumber(path.join(ROOT, "src"))) {
    const isi = await readFile(file, "utf8");
    for (const cocok of isi.matchAll(/\/images\/external\/[A-Za-z0-9._-]+\.webp/g)) {
      referensi.add(cocok[0]);
    }
    assert.doesNotMatch(isi, /\/images\/external\/[A-Za-z0-9._-]+\.(?:jpe?g|png)\b/, `${path.relative(ROOT, file)} masih memakai foto non-WebP`);
  }

  const diDisk = (await readdir(EXTERNAL))
    .filter((file) => file.endsWith(".webp"))
    .map((file) => `/images/external/${file}`)
    .sort();

  assert.equal(diDisk.length, 23);
  assert.deepEqual([...referensi].sort(), diDisk);

  for (const jalur of diDisk) {
    const nama = path.basename(jalur);
    const webp = await sharp(path.join(EXTERNAL, nama)).metadata();
    assert.equal(webp.format, "webp", nama);
    assert.ok(webp.width && webp.height, nama);

    // Sumber JPG asli dipertahankan agar migrasi dapat diulang/diaudit.
    const sumber = await sharp(path.join(EXTERNAL, nama.replace(/\.webp$/, ".jpg"))).metadata();
    assert.deepEqual([webp.width, webp.height], [sumber.width, sumber.height], `${nama} mengubah dimensi`);
  }

  // Berkas ini bernama .jpg tetapi isinya PNG; konversi harus mengikuti isi.
  const salahNama = await sharp(path.join(EXTERNAL, "photo-1434626881859-194d67b2b86f.jpg")).metadata();
  assert.equal(salahNama.format, "png");
});

test("logo mitra tetap JPG dan logo merek tetap PNG transparan", async () => {
  const mitra = (await readdir(path.join(ROOT, "public", "images", "clients"))).filter((file) => file.endsWith(".jpg"));
  assert.equal(mitra.length, 21);
  for (const file of mitra) {
    assert.equal((await sharp(path.join(ROOT, "public", "images", "clients", file)).metadata()).format, "jpeg", file);
  }

  for (const file of ["logo-full.png", "logo-mark.png"]) {
    const meta = await sharp(path.join(ROOT, "public", "images", file)).metadata();
    assert.equal(meta.format, "png", file);
    assert.equal(meta.hasAlpha, true, `${file} kehilangan transparansi`);
  }
});
