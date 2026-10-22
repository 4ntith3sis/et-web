/**
 * Unit tests: RAG Artikel — Konfigurasi
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { RAG_CONFIG } from "@/rag/config";

describe("unit test: RAG — Konfigurasi", () => {
  it("memiliki nilai default yang masuk akal", () => {
    assert.equal(typeof RAG_CONFIG.enabled, "boolean");
    assert.equal(RAG_CONFIG.embeddingDimension, 1024);
    assert.equal(typeof RAG_CONFIG.chunkSize, "number");
    assert.ok(RAG_CONFIG.chunkSize > 0);
    assert.equal(typeof RAG_CONFIG.chunkOverlap, "number");
    assert.ok(RAG_CONFIG.chunkOverlap >= 0);
    assert.ok(RAG_CONFIG.chunkOverlap < RAG_CONFIG.chunkSize);
    assert.equal(typeof RAG_CONFIG.retrievalLimit, "number");
    assert.ok(RAG_CONFIG.retrievalLimit > 0);
    assert.equal(typeof RAG_CONFIG.similarityThreshold, "number");
    assert.ok(RAG_CONFIG.similarityThreshold > 0);
    assert.ok(RAG_CONFIG.similarityThreshold <= 1);
    assert.equal(typeof RAG_CONFIG.maxQueryLength, "number");
    assert.ok(RAG_CONFIG.maxQueryLength > 0);
  });

  it("overlap lebih kecil dari chunk size", () => {
    assert.ok(
      RAG_CONFIG.chunkOverlap < RAG_CONFIG.chunkSize,
      `Overlap (${RAG_CONFIG.chunkOverlap}) harus < chunk size (${RAG_CONFIG.chunkSize})`,
    );
  });

  it("model embedding menggunakan nama yang valid", () => {
    assert.ok(RAG_CONFIG.embeddingModel.length > 0);
    assert.equal(RAG_CONFIG.embeddingModel, "Horizon-Labs/multilingual-embedding-small");
  });

  it("default nonaktif saat RAG_ARTIKEL_ENABLED tidak diset", (t) => {
    if (process.env.RAG_ARTIKEL_ENABLED !== undefined) {
      t.skip("RAG_ARTIKEL_ENABLED diset di environment");
      return;
    }
    assert.equal(RAG_CONFIG.enabled, false);
  });
});
