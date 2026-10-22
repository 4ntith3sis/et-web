import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PgDialect } from "drizzle-orm/pg-core";
import { ambilContentHash, cariChunkRelevan, hitungEmbedding, simpanEmbeddingArtikel } from "@/rag/vector-store";

const vektor = Array.from({ length: 1024 }, (_, index) => index === 0 ? 1 : 0);
const dialect = new PgDialect();

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    artikelId: 7,
    slug: "panduan-pajak",
    judul: "Panduan Pajak",
    chunkIndex: 0,
    teks: "Informasi perpajakan untuk usaha.",
    embedding: vektor,
    contentHash: "0123456789abcdef",
    ...overrides,
  };
}

describe("vector store", () => {
  it("retrieves only published articles using cosine similarity, threshold, and bounded result count", async () => {
    let statement = "";
    let params: unknown[] = [];
    const db = {
      drizzle: {
        execute: async (query: Parameters<PgDialect["sqlToQuery"]>[0]) => {
          const compiled = dialect.sqlToQuery(query);
          statement = compiled.sql;
          params = compiled.params;
          return { rows: [{ artikelId: 7, slug: "panduan-pajak", judul: "Panduan Pajak", ringkasan: "Ringkasan", kategori: "Pajak", similarity: 0.95 }] };
        },
        transaction: async () => undefined,
      },
    };

    const results = await cariChunkRelevan(db as Parameters<typeof cariChunkRelevan>[0], vektor, 5, 0.7);
    assert.equal(results.length, 1);
    assert.match(statement, /ae\.embedding\s*<=>/);
    assert.match(statement, /a\._status\s*=\s*'published'/);
    assert.match(statement, /ORDER BY similarity DESC/);
    assert.match(statement, /LIMIT/);
    assert.ok(params.includes(5));
    assert.ok(params.includes(0.7));
  });

  it("rejects invalid vectors and unsafe retrieval bounds before querying", async () => {
    let executed = false;
    const db = { drizzle: { execute: async () => { executed = true; return []; }, transaction: async () => undefined } };
    await assert.rejects(() => cariChunkRelevan(db as Parameters<typeof cariChunkRelevan>[0], [1], 5, 0.7), /invalid dimensions/);
    await assert.rejects(() => cariChunkRelevan(db as Parameters<typeof cariChunkRelevan>[0], vektor, 51, 0.7), /between 1 and 50/);
    assert.equal(executed, false);
  });

  it("reads hashes and counts from a Drizzle QueryResult instead of treating it as an array", async () => {
    const db = {
      drizzle: {
        execute: async (query: Parameters<PgDialect["sqlToQuery"]>[0]) => {
          const { sql } = dialect.sqlToQuery(query);
          if (sql.includes("content_hash")) return { rows: [{ content_hash: "0123456789abcdef" }] };
          if (sql.includes("count(*)")) return { rows: [{ total: 3 }] };
          return { rows: [] };
        },
        transaction: async () => undefined,
      },
    };
    const adapter = db as Parameters<typeof ambilContentHash>[0];

    assert.equal(await ambilContentHash(adapter, 7), "0123456789abcdef");
    assert.equal(await hitungEmbedding(adapter), 3);
  });

  it("validates the full replacement before deleting existing rows", async () => {
    let transactionStarted = false;
    const db = { drizzle: { execute: async () => [], transaction: async () => { transactionStarted = true; } } };
    await assert.rejects(() => simpanEmbeddingArtikel(db as Parameters<typeof simpanEmbeddingArtikel>[0], 7, [makeRecord({ artikelId: 8 })] as never), /does not match/);
    await assert.rejects(() => simpanEmbeddingArtikel(db as Parameters<typeof simpanEmbeddingArtikel>[0], 7, [makeRecord({ embedding: [1] })] as never), /invalid dimensions/);
    await assert.rejects(() => simpanEmbeddingArtikel(db as Parameters<typeof simpanEmbeddingArtikel>[0], 7, [makeRecord({ contentHash: "x".repeat(17) })] as never), /at most 16/);
    assert.equal(transactionStarted, false);
  });
});
