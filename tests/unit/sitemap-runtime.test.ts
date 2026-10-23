import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it } from "node:test";

import { buatSitemap } from "@/lib/sitemap";

it("menunggu request sebelum mengakses CMS agar prerender tidak menjalankan query", async () => {
  const source = await readFile(new URL("../../src/app/sitemap.ts", import.meta.url), "utf8");
  assert.match(source, /await connection\(\);\s*return buatSitemap\(\{ ambilArtikel, ambilLayanan \}\);/);
  assert.ok(source.indexOf("await connection()") < source.indexOf("buatSitemap({"));
});

it("mempertahankan URL kanonis statis dan memasukkan slug artikel/layanan yang diberikan saat request", async () => {
  const artikel = {
    slug: "artikel-published",
    judul: "Artikel",
    ringkasan: "Ringkasan",
    kategori: "Perpajakan",
    tanggal: "23 Okt 2026",
    waktuBaca: "5 mnt baca",
    gambar: "/images/placeholder-artikel.svg",
  };
  const layanan = {
    slug: "layanan-published",
    judul: "Layanan",
    subjudul: "",
    ringkasan: "Ringkasan",
    gambar: "/images/placeholder-layanan.svg",
  };
  const sitemap = await buatSitemap(
    {
      ambilArtikel: async () => [artikel],
      ambilLayanan: async () => [layanan],
    },
    "https://example.test/",
  );

  const urls = sitemap.map(({ url }) => url);
  assert.ok(urls.includes("https://example.test/"));
  assert.ok(urls.includes("https://example.test/tulisan-pajak"));
  assert.ok(urls.includes("https://example.test/tulisan-pajak/artikel-published"));
  assert.ok(urls.includes("https://example.test/layanan/layanan-published"));
  assert.ok(!urls.some((url) => url.includes("/artikel/")));
  assert.equal(sitemap.find(({ url }) => url === "https://example.test/")?.priority, 1);
});

it("menunggu kedua penyedia data dan mempropagasikan error CMS, bukan menyamarkannya sebagai sitemap kosong", async () => {
  let artikelCalled = false;
  let layananCalled = false;
  const sitemap = await buatSitemap(
    {
      ambilArtikel: async () => { artikelCalled = true; return []; },
      ambilLayanan: async () => { layananCalled = true; return []; },
    },
    "https://example.test",
  );
  assert.equal(artikelCalled, true);
  assert.equal(layananCalled, true);
  assert.ok(sitemap.length > 0);

  const failure = new Error("CMS unavailable");
  await assert.rejects(
    buatSitemap({ ambilArtikel: async () => { throw failure; }, ambilLayanan: async () => [] }),
    failure,
  );
});
