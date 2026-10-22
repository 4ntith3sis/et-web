import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { berkasArtifactHilang, buatEmbeddingBatch, buatEmbeddingQuery } from "@/rag/embedding-provider";

const MODEL_ID = "Horizon-Labs/multilingual-embedding-small";

/**
 * Berkas minimum yang harus ada sebelum inference nyata dijalankan.
 * Kelengkapan akhir tetap divalidasi oleh pemuatan tokenizer/model, tetapi
 * daftar ini mencegah "skip" palsu ketika cache yang diminta tidak lengkap.
 */
async function cekArtifact(cacheDir: string): Promise<void> {
  const akar = join(cacheDir, MODEL_ID);
  const wajib = [
    "config.json",
    "tokenizer_config.json",
    "onnx/model_quantized.onnx",
  ];
  const hilang: string[] = [];
  for (const berkas of wajib) {
    try {
      await access(join(akar, berkas));
    } catch {
      hilang.push(join(akar, berkas));
    }
  }

  const punyaTokenizer =
    (await access(join(akar, "tokenizer.json")).then(() => true).catch(() => false)) ||
    (await access(join(akar, "vocab.txt")).then(() => true).catch(() => false));
  if (!punyaTokenizer) hilang.push(join(akar, "tokenizer.json (atau vocab.txt)"));

  if (hilang.length > 0) {
    throw new Error(
      `Artifact ONNX tidak lengkap di cache ${cacheDir}. Berkas yang masih dibutuhkan:\n- ${hilang.join("\n- ")}`,
    );
  }
}

describe("local embedding provider", () => {
  it("reports the exact missing artifact files without loading or downloading a model", async () => {
    const dir = await mkdtemp(join(tmpdir(), "easytax-rag-empty-"));
    try {
      assert.deepEqual(await berkasArtifactHilang(dir), [
        "config.json",
        "tokenizer_config.json",
        "onnx/model_quantized.onnx",
        "tokenizer.json atau vocab.txt",
      ]);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("runs actual ONNX inference with a complete local artifact and returns 1024-d finite vectors", async (context) => {
    const explicitTestCache = process.env.RAG_EMBEDDING_TEST_CACHE_DIR;
    const cacheDir = explicitTestCache || process.env.RAG_EMBEDDING_CACHE_DIR;
    if (!cacheDir) {
      return context.skip("Set RAG_EMBEDDING_TEST_CACHE_DIR to a prepared local model cache");
    }
    // Test cache yang diminta secara eksplisit harus lengkap; jangan
    // menyamarkan artifact yang rusak sebagai skip.
    if (explicitTestCache) {
      await cekArtifact(cacheDir);
    } else {
      try {
        await access(join(cacheDir, MODEL_ID, "onnx/model_quantized.onnx"));
      } catch {
        return context.skip("Prepared local ONNX model cache not found");
      }
    }

    const originalKey = process.env.OPENAI_API_KEY;
    const originalDownload = process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD;
    const originalCache = process.env.RAG_EMBEDDING_CACHE_DIR;
    delete process.env.OPENAI_API_KEY;
    process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD = "false";
    process.env.RAG_EMBEDDING_CACHE_DIR = cacheDir;
    try {
      const [query, ...passages] = await buatEmbeddingBatch([
        "Pajak usaha kecil di Indonesia",
        "Kewajiban pajak bagi usaha mikro",
      ]);
      assert.equal(query.length, 1024);
      assert.ok(query.every(Number.isFinite));
      assert.ok(Math.abs(Math.sqrt(query.reduce((sum, n) => sum + n * n, 0)) - 1) < 1e-3);
      assert.equal(passages.length, 1);

      const queryVector = await buatEmbeddingQuery("Pajak untuk usaha kecil");
      assert.equal(queryVector.length, 1024);
      assert.ok(queryVector.every(Number.isFinite));
      assert.ok(Math.abs(Math.sqrt(queryVector.reduce((sum, n) => sum + n * n, 0)) - 1) < 1e-3);
    } finally {
      if (originalKey !== undefined) process.env.OPENAI_API_KEY = originalKey;
      if (originalDownload !== undefined) process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD = originalDownload;
      else delete process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD;
      if (originalCache !== undefined) process.env.RAG_EMBEDDING_CACHE_DIR = originalCache;
      else delete process.env.RAG_EMBEDDING_CACHE_DIR;
    }
  });

  it("rejects empty and overlong query input", async () => {
    await assert.rejects(() => buatEmbeddingQuery("   "), /must not be empty/);
    await assert.rejects(() => buatEmbeddingQuery("x".repeat(501)), /maximum length/);
  });
});
