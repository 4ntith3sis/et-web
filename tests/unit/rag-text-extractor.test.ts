/**
 * Unit tests: RAG Artikel — Ekstraksi Teks
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { ekstrakTeksArtikel, buatContentHash } from "@/rag/text-extractor";

describe("unit test: RAG — Ekstraksi Teks Artikel", () => {
  it("mengekstrak judul, ringkasan, dan paragraf menjadi teks lengkap", async () => {
    const hasil = await ekstrakTeksArtikel({
      id: 1,
      judul: "Panduan PPh 21",
      slug: "panduan-pph-21",
      ringkasan: "Ringkasan tentang PPh 21 bagi karyawan.",
      blok: [
        { blockType: "paragraf", teks: "PPh 21 adalah pajak penghasilan." },
        { blockType: "judul-bagian", teks: "Cara Menghitung", level: "2" },
        {
          blockType: "paragraf",
          teks: "Langkah pertama adalah menentukan PTKP.",
        },
      ],
    });

    assert.ok(hasil);
    assert.equal(hasil.artikelId, 1);
    assert.equal(hasil.slug, "panduan-pph-21");
    assert.ok(hasil.teksLengkap.includes("Panduan PPh 21"));
    assert.ok(hasil.teksLengkap.includes("Ringkasan tentang PPh 21"));
    assert.ok(hasil.teksLengkap.includes("PPh 21 adalah pajak"));
    assert.ok(hasil.teksLengkap.includes("Cara Menghitung"));
    assert.ok(hasil.teksLengkap.includes("menentukan PTKP"));
    assert.ok(hasil.contentHash.length === 16);
  });

  it("mengekstrak item daftar dengan bullet", async () => {
    const hasil = await ekstrakTeksArtikel({
      id: 2,
      judul: "Syarat PKP",
      slug: "syarat-pkp",
      blok: [
        {
          blockType: "daftar",
          terurut: false,
          item: [
            { teks: "Omset > 4.8 miliar" },
            { teks: "Memiliki NPWP" },
          ],
        },
      ],
    });

    assert.ok(hasil);
    assert.ok(hasil.teksLengkap.includes("• Omset > 4.8 miliar"));
    assert.ok(hasil.teksLengkap.includes("• Memiliki NPWP"));
  });

  it("mengembalikan null jika konten terlalu pendek", async () => {
    const hasil = await ekstrakTeksArtikel({
      id: 3,
      judul: "Pendek",
      slug: "pendek",
      blok: [],
    });

    assert.equal(hasil, null);
  });

  it("mengembalikan null jika blok kosong atau tidak ada teks", async () => {
    const hasil = await ekstrakTeksArtikel({
      id: 4,
      judul: "Kosong",
      slug: "kosong",
      ringkasan: "",
      blok: [{ blockType: "paragraf", teks: "" }],
    });

    assert.equal(hasil, null);
  });

  it("mendeteksi perubahan konten melalui content hash", async () => {
    const hash1 = await buatContentHash("teks versi satu");
    const hash2 = await buatContentHash("teks versi dua");
    const hash1b = await buatContentHash("teks versi satu");

    assert.notEqual(hash1, hash2);
    assert.equal(hash1, hash1b);
    assert.equal(hash1.length, 16);
  });

  it("hash tetap 16 karakter dan berubah ketika slug berubah", async () => {
    const dasar = {
      id: 6,
      judul: "Panduan Pajak",
      slug: "panduan-pajak",
      ringkasan: "Ringkasan panduan pajak untuk pelaku usaha.",
      blok: [{ blockType: "paragraf" as const, teks: "Konten yang sama untuk kedua artikel." }],
    };
    const lama = await ekstrakTeksArtikel(dasar);
    const baru = await ekstrakTeksArtikel({ ...dasar, slug: "panduan-pajak-baru" });

    assert.ok(lama && baru);
    assert.equal(lama.contentHash.length, 16);
    assert.equal(baru.contentHash.length, 16);
    assert.notEqual(lama.contentHash, baru.contentHash);
  });

  it("menormalisasi whitespace berlebihan", async () => {
    const hasil = await ekstrakTeksArtikel({
      id: 5,
      judul: "Normalisasi",
      slug: "normalisasi",
      ringkasan: "  Ringkasan   dengan  spasi   berlebih  ",
      blok: [
        {
          blockType: "paragraf",
          teks: "Paragraf\n\n\n\n\ndengan banyak baris kosong.",
        },
      ],
    });

    assert.ok(hasil);
    assert.ok(!hasil.teksLengkap.includes("   "));
    assert.ok(!hasil.teksLengkap.includes("\n\n\n"));
  });
});
