#!/usr/bin/env node

import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const DIMENSI_DIHARAPKAN = 1024;
const TEKS_UJI = "Perusahaan melaporkan pajak tahunan sesuai ketentuan yang berlaku.";

function gagal(pesan) {
  console.error(`[RAG smoke] GAGAL: ${pesan}`);
  process.exitCode = 1;
}

async function main() {
  if (process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD?.toLowerCase() === "true") {
    gagal("Unduhan model harus dinonaktifkan; gunakan RAG_EMBEDDING_ALLOW_DOWNLOAD=false atau unset.");
    return;
  }

  const cacheDir = process.env.RAG_EMBEDDING_CACHE_DIR || "/app/model-cache";
  const modelId = process.env.RAG_EMBEDDING_MODEL || "Horizon-Labs/multilingual-embedding-small";
  const root = resolve(cacheDir, modelId);

  process.env.RAG_EMBEDDING_CACHE_DIR = cacheDir;
  process.env.RAG_EMBEDDING_MODEL = modelId;
  process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD = "false";

  // Impor helper provider yang sama agar prapemeriksaan sesuai dengan kontrak aplikasi.
  const { berkasArtifactHilang, buatEmbeddingBatch } = await import(
    "../src/rag/embedding-provider.ts"
  );
  const hilang = await berkasArtifactHilang(cacheDir, modelId);
  if (hilang.length > 0) {
    gagal(`Cache model belum lengkap di ${root}; file yang belum ada: ${hilang.join(", ")}`);
    return;
  }

  if (process.platform !== "linux" || process.arch !== "arm64") {
    gagal(`Runtime harus linux/arm64; aktual ${process.platform}/${process.arch}.`);
    return;
  }

  // Transformers.js memilih onnxruntime-node pada entry Node. Memuat paket ini
  // terlebih dahulu memastikan native binding ARM64 benar-benar dapat diload.
  try {
    require("onnxruntime-node");
  } catch (error) {
    gagal(`Native onnxruntime-node tidak dapat dimuat: ${error instanceof Error ? error.message : "unknown error"}`);
    return;
  }

  try {
    const [embedding] = await buatEmbeddingBatch([TEKS_UJI]);
    if (!Array.isArray(embedding)) {
      gagal("Provider tidak mengembalikan array embedding.");
      return;
    }
    if (embedding.length !== DIMENSI_DIHARAPKAN) {
      gagal(`Dimensi embedding ${embedding.length}; diharapkan ${DIMENSI_DIHARAPKAN}.`);
      return;
    }
    if (!embedding.every((nilai) => typeof nilai === "number" && Number.isFinite(nilai))) {
      gagal("Embedding berisi nilai non-numerik, NaN, atau Infinity.");
      return;
    }

    console.log(`[RAG smoke] LULUS: embedding nyata melalui provider EasyTax dan Node ONNX Runtime.`);
    console.log(`[RAG smoke] model=${modelId} dimensi=${embedding.length} semua_nilai_finite=true`);
  } catch (error) {
    gagal(`Inference provider gagal: ${error instanceof Error ? error.message : "unknown error"}`);
  }
}

main().catch((error) => gagal(error instanceof Error ? error.message : "unknown error"));
