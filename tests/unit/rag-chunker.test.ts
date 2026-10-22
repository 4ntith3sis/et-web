/**
 * Unit tests: RAG Artikel — Chunking
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { chunkTeksArtikel } from "@/rag/chunker";

describe("unit test: RAG — Chunking Teks Artikel", () => {
  it("membuat satu chunk jika teks cukup pendek", () => {
    const chunks = chunkTeksArtikel({
      artikelId: 1,
      slug: "test",
      judul: "Test",
      teksLengkap: "Teks pendek tentang pajak penghasilan.",
      contentHash: "abc123",
      chunkSize: 800,
      chunkOverlap: 150,
    });

    assert.equal(chunks.length, 1);
    assert.equal(chunks[0].chunkIndex, 0);
    assert.equal(chunks[0].artikelId, 1);
    assert.equal(chunks[0].slug, "test");
    assert.equal(chunks[0].contentHash, "abc123");
    assert.ok(chunks[0].teks.includes("pajak penghasilan"));
  });

  it("memecah teks panjang menjadi beberapa chunk", () => {
    const paragraf = Array(20)
      .fill("Ini adalah paragraf panjang tentang peraturan perpajakan yang berlaku di Indonesia saat ini.")
      .join("\n\n");

    const chunks = chunkTeksArtikel({
      artikelId: 2,
      slug: "panjang",
      judul: "Panjang",
      teksLengkap: paragraf,
      contentHash: "def456",
      chunkSize: 200,
      chunkOverlap: 50,
    });

    assert.ok(chunks.length > 1);
    // Setiap chunk harus punya index berurutan
    for (let i = 0; i < chunks.length; i++) {
      assert.equal(chunks[i].chunkIndex, i);
    }
  });

  it("mengembalikan array kosong untuk teks kosong", () => {
    const chunks = chunkTeksArtikel({
      artikelId: 3,
      slug: "kosong",
      judul: "Kosong",
      teksLengkap: "",
      contentHash: "ghi789",
    });

    assert.equal(chunks.length, 0);
  });

  it("mempertahankan metadata artikel pada setiap chunk", () => {
    const chunks = chunkTeksArtikel({
      artikelId: 7,
      slug: "meta-test",
      judul: "Artikel Meta",
      teksLengkap: "Paragraf satu.\n\nParagraf dua.",
      contentHash: "meta123",
    });

    for (const chunk of chunks) {
      assert.equal(chunk.artikelId, 7);
      assert.equal(chunk.slug, "meta-test");
      assert.equal(chunk.judul, "Artikel Meta");
      assert.equal(chunk.contentHash, "meta123");
    }
  });

  it("idempotensi: chunking yang sama menghasilkan output yang sama", () => {
    const params = {
      artikelId: 8,
      slug: "idem",
      judul: "Idem",
      teksLengkap: "Paragraf A.\n\nParagraf B.\n\nParagraf C.",
      contentHash: "idem123",
      chunkSize: 50,
      chunkOverlap: 10,
    };

    const run1 = chunkTeksArtikel(params);
    const run2 = chunkTeksArtikel(params);

    assert.equal(run1.length, run2.length);
    for (let i = 0; i < run1.length; i++) {
      assert.equal(run1[i].teks, run2[i].teks);
      assert.equal(run1[i].chunkIndex, run2[i].chunkIndex);
    }
  });
});
