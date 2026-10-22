import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { petakanHasilPencarian } from "@/rag/article-search-response";
import type { HasilRetrieval } from "@/rag/vector-store";

function chunk(overrides: Partial<HasilRetrieval> = {}): HasilRetrieval {
  return {
    artikelId: 1,
    slug: "panduan-pajak",
    judul: "Panduan Pajak",
    ringkasan: "Ringkasan artikel.",
    kategori: "Pajak",
    similarity: 0.8,
    ...overrides,
  };
}

describe("article search response mapping", () => {
  it("deduplicates chunks by article and keeps the highest similarity", () => {
    const result = petakanHasilPencarian([
      chunk({ similarity: 0.7 }),
      chunk({ similarity: 0.93 }),
      chunk({ artikelId: 2, slug: "ppn", judul: "PPN", similarity: 0.6 }),
    ]);

    assert.equal(result.length, 2);
    assert.equal(result[0].id, 1);
    assert.equal(result[0].relevansi, 0.93);
    assert.equal(result[1].relevansi, 0.6);
  });

  it("limits the summary and encodes the article URL", () => {
    const [article] = petakanHasilPencarian([
      chunk({ ringkasan: "a".repeat(400), slug: "pajak & usaha" }),
    ]);

    assert.equal(article.ringkasan.length, 280);
    assert.equal(article.url, "/tulisan-pajak/pajak%20%26%20usaha");
  });

  it("returns only public fields and never leaks embeddings or internal metadata", () => {
    const internal = {
      ...chunk(),
      teks: "isi chunk internal",
      embedding: [0.1, 0.2],
      contentHash: "hash-rahasia",
      indexedAt: "2026-01-01",
    } as HasilRetrieval;

    const [article] = petakanHasilPencarian([internal]);

    assert.deepEqual(Object.keys(article).sort(), [
      "id",
      "judul",
      "kategori",
      "relevansi",
      "ringkasan",
      "slug",
      "url",
    ]);
    assert.deepEqual(article, {
      id: 1,
      judul: "Panduan Pajak",
      slug: "panduan-pajak",
      ringkasan: "Ringkasan artikel.",
      kategori: "Pajak",
      url: "/tulisan-pajak/panduan-pajak",
      relevansi: 0.8,
    });
  });

  it("returns an empty list for empty retrieval output", () => {
    assert.deepEqual(petakanHasilPencarian([]), []);
  });
});
