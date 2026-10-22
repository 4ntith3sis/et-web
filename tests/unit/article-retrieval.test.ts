import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cariArtikelSemantikDenganDependensi,
  type DependensiRetrievalArtikel,
} from "@/rag/article-retrieval";
import type { HasilRetrieval } from "@/rag/vector-store";

const CHUNK: HasilRetrieval = {
  artikelId: 3,
  slug: "pajak-usaha",
  judul: "Pajak Usaha",
  ringkasan: "Ringkasan",
  kategori: "Pajak",
  similarity: 0.9,
};

function makeDependencies(overrides: Partial<DependensiRetrievalArtikel> = {}) {
  const calls: string[] = [];
  let retrieveArgs: { embedding: number[]; limit: number; threshold: number } | undefined;
  const dependencies: DependensiRetrievalArtikel = {
    enabled: true,
    embedQuery: async (query) => {
      calls.push(`embed:${query}`);
      return Array(1024).fill(0.5);
    },
    getDatabase: async () => {
      calls.push("database");
      return { drizzle: { execute: async () => [], transaction: async () => undefined } } as never;
    },
    retrieve: async (_db, embedding, limit = 0, threshold = 0) => {
      calls.push("retrieve");
      retrieveArgs = { embedding, limit, threshold };
      return [CHUNK];
    },
    maxQueryLength: 20,
    retrievalLimit: 7,
    similarityThreshold: 0.42,
    ...overrides,
  };
  return { dependencies, calls, getRetrieveArgs: () => retrieveArgs };
}

describe("article semantic retrieval", () => {
  it("validates empty, oversized, and whitespace-only queries before embedding", async () => {
    for (const query of ["", "   ", "x".repeat(21)]) {
      const { dependencies, calls } = makeDependencies();
      const result = await cariArtikelSemantikDenganDependensi(query, dependencies);
      assert.deepEqual(result.chunks, []);
      assert.deepEqual(calls, [], `query ${JSON.stringify(query)} must not touch dependencies`);
    }
  });

  it("returns no results without embedding when the feature flag is off", async () => {
    const { dependencies, calls } = makeDependencies({ enabled: false });
    const result = await cariArtikelSemantikDenganDependensi("pajak usaha", dependencies);
    assert.deepEqual(result.chunks, []);
    assert.deepEqual(calls, []);
  });

  it("embeds the trimmed query and uses configured threshold and limit", async () => {
    const { dependencies, calls, getRetrieveArgs } = makeDependencies();
    const result = await cariArtikelSemantikDenganDependensi("  pajak usaha  ", dependencies);

    assert.deepEqual(calls, ["embed:pajak usaha", "database", "retrieve"]);
    assert.equal(result.query, "pajak usaha");
    assert.deepEqual(result.chunks, [CHUNK]);
    assert.deepEqual(getRetrieveArgs(), {
      embedding: Array(1024).fill(0.5),
      limit: 7,
      threshold: 0.42,
    });
  });

  it("propagates embedding and retrieval failures instead of returning empty success", async () => {
    const embeddingFailure = makeDependencies({
      embedQuery: async () => { throw new Error("model unavailable"); },
    });
    await assert.rejects(
      cariArtikelSemantikDenganDependensi("pajak usaha", embeddingFailure.dependencies),
      /model unavailable/,
    );
    assert.deepEqual(embeddingFailure.calls, []);

    const retrievalFailure = makeDependencies({
      retrieve: async () => { throw new Error("database unavailable"); },
    });
    await assert.rejects(
      cariArtikelSemantikDenganDependensi("pajak usaha", retrievalFailure.dependencies),
      /database unavailable/,
    );
  });
});
