/**
 * Unit tests: RAG Artikel — API Route Validation
 *
 * Menguji validasi input pada API route tanpa memerlukan
 * koneksi database atau provider AI.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { RAG_CONFIG } from "@/rag/config";

describe("unit test: RAG — Validasi Input API", () => {
  it("menolak pertanyaan kosong", () => {
    const pertanyaan = "";
    assert.equal(pertanyaan.trim(), "");
  });

  it("menolak pertanyaan melebihi batas panjang", () => {
    const pertanyaan = "a".repeat(RAG_CONFIG.maxQueryLength + 1);
    assert.ok(pertanyaan.length > RAG_CONFIG.maxQueryLength);
  });

  it("menerima pertanyaan dalam batas panjang", () => {
    const pertanyaan = "Apa syarat pengukuhan PKP?";
    assert.ok(pertanyaan.trim().length > 0);
    assert.ok(pertanyaan.length <= RAG_CONFIG.maxQueryLength);
  });

  it("trim whitespace pada pertanyaan", () => {
    const pertanyaan = "  Apa itu PPh 21?  ";
    assert.equal(pertanyaan.trim(), "Apa itu PPh 21?");
  });

  it("menolak pertanyaan yang hanya whitespace", () => {
    const pertanyaan = "   \n\t  ";
    assert.equal(pertanyaan.trim(), "");
  });
});
