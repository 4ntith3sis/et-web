import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { RAG_CONFIG } from "@/rag/config";
import { lolosThreshold, validasiEmbedding } from "@/rag/vector-store";

describe("semantic article search safeguards", () => {
  it("validates query vectors against the configured embedding dimension", () => {
    assert.equal(validasiEmbedding(Array(RAG_CONFIG.embeddingDimension).fill(0.1)), true);
    assert.equal(validasiEmbedding([0.1]), false);
    assert.equal(validasiEmbedding(Array(RAG_CONFIG.embeddingDimension).fill(Number.NaN)), false);
  });

  it("applies similarity threshold consistently, not merely result count", () => {
    assert.equal(lolosThreshold(0.8, 0.72), true);
    assert.equal(lolosThreshold(0.71, 0.72), false);
    assert.equal(lolosThreshold(Number.NaN, 0.72), false);
  });

  it("retrieval configuration is bounded", () => {
    assert.ok(RAG_CONFIG.retrievalLimit >= 1 && RAG_CONFIG.retrievalLimit <= 50);
    assert.ok(RAG_CONFIG.similarityThreshold >= 0 && RAG_CONFIG.similarityThreshold <= 1);
  });
});
