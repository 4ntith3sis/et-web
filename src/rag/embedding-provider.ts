/** Local ONNX inference for article and query embeddings. */

import { access } from "node:fs/promises";
import { join } from "node:path";
import { AutoModel, AutoTokenizer, env } from "@huggingface/transformers";
import { RAG_CONFIG } from "./config";

const BERKAS_WAJIB = ["config.json", "tokenizer_config.json", "onnx/model_quantized.onnx"] as const;
const BERKAS_TOKENIZER = ["tokenizer.json", "vocab.txt"] as const;

/**
 * Daftar berkas yang hilang dari cache lokal. Dipanggil sebelum
 * `from_pretrained` agar kegagalan artifact menghasilkan pesan yang jelas dan
 * tidak bergantung pada error internal tokenizer.
 */
export async function berkasArtifactHilang(
  cacheDir: string,
  modelId: string = RAG_CONFIG.embeddingModel,
): Promise<string[]> {
  const akar = join(cacheDir, modelId);
  const hilang: string[] = [];
  for (const berkas of BERKAS_WAJIB) {
    try {
      await access(join(akar, berkas));
    } catch {
      hilang.push(berkas);
    }
  }

  let adaTokenizer = false;
  for (const berkas of BERKAS_TOKENIZER) {
    try {
      await access(join(akar, berkas));
      adaTokenizer = true;
      break;
    } catch {
      // Coba kandidat berikutnya.
    }
  }
  if (!adaTokenizer) hilang.push("tokenizer.json atau vocab.txt");

  return hilang;
}

let modelPromise: Promise<{ tokenizer: Awaited<ReturnType<typeof AutoTokenizer.from_pretrained>>; model: Awaited<ReturnType<typeof AutoModel.from_pretrained>> }> | undefined;

async function getModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const cacheDir = process.env.RAG_EMBEDDING_CACHE_DIR || RAG_CONFIG.embeddingCacheDir;
      env.cacheDir = cacheDir;
      env.localModelPath = cacheDir;
      env.allowRemoteModels = process.env.RAG_EMBEDDING_ALLOW_DOWNLOAD === "true";
      const modelId = RAG_CONFIG.embeddingModel;
      if (!env.allowRemoteModels) {
        const hilang = await berkasArtifactHilang(cacheDir, modelId);
        if (hilang.length > 0) {
          throw new Error(
            `Local embedding model artifact is incomplete in ${join(cacheDir, modelId)}; missing: ${hilang.join(", ")}`,
          );
        }
      }
      const [tokenizer, model] = await Promise.all([
        AutoTokenizer.from_pretrained(modelId, { local_files_only: !env.allowRemoteModels }),
        AutoModel.from_pretrained(modelId, { dtype: "q8", local_files_only: !env.allowRemoteModels }),
      ]);
      return { tokenizer, model };
    })().catch((error) => {
      modelPromise = undefined;
      throw new Error(
        `Local embedding model failed to load from cache ${process.env.RAG_EMBEDDING_CACHE_DIR || RAG_CONFIG.embeddingCacheDir}: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    });
  }
  return modelPromise;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  if (texts.some((text) => !text.trim())) throw new Error("Embedding input must not be empty");
  const { tokenizer, model } = await getModel();
  const inputs = await tokenizer(texts, { padding: true, truncation: true });
  const result = (await model(inputs)) as { sentence_embedding?: { data: Float32Array | Float64Array; dims: number[] } };
  const embedding = result.sentence_embedding as { data: Float32Array | Float64Array; dims: number[] } | undefined;
  if (!embedding) throw new Error("Local model did not return sentence_embedding");
  const [batchSize, dimension] = embedding.dims;
  if (dimension !== RAG_CONFIG.embeddingDimension || batchSize !== texts.length) {
    throw new Error(`Invalid local embedding shape: [${embedding.dims.join(", ")}]`);
  }
  return texts.map((_, index) => {
    const start = index * dimension;
    const vector = Array.from(embedding.data.slice(start, start + dimension));
    if (vector.length !== RAG_CONFIG.embeddingDimension || vector.some((n) => !Number.isFinite(n))) {
      throw new Error("Local model returned an invalid embedding vector");
    }
    return vector;
  });
}

export async function buatEmbeddingBatch(teksList: string[]): Promise<number[][]> {
  return embedBatch(teksList);
}

export async function buatEmbeddingQuery(query: string): Promise<number[]> {
  const normalized = query.trim();
  if (!normalized) throw new Error("Search query must not be empty");
  if (normalized.length > RAG_CONFIG.maxQueryLength) throw new Error("Search query exceeds the maximum length");
  const [vector] = await embedBatch([normalized]);
  return vector;
}
