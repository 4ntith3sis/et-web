/**
 * Konfigurasi semantic search artikel EasyTax.
 *
 * Semua parameter dapat di-override melalui environment variable.
 * Model diunduh satu kali saat cache disiapkan; inference berjalan lokal.
 */

export const RAG_CONFIG = {
  /** Apakah semantic search artikel diaktifkan. */
  enabled: process.env.RAG_ARTIKEL_ENABLED === "true",

  /** Ukuran output model Horizon multilingual embedding small. */
  embeddingDimension: 1024,

  /** Repo model HF (ONNX quantized tersedia di repo model). */
  embeddingModel: process.env.RAG_EMBEDDING_MODEL || "Horizon-Labs/multilingual-embedding-small",
  /** Cache transformers.js persistent untuk model ~269MB dan berkas tokenizer. */
  embeddingCacheDir: process.env.RAG_EMBEDDING_CACHE_DIR || "/app/.cache/transformers",

  /** Ukuran maksimal satu chunk dalam karakter. */
  chunkSize: Number(process.env.RAG_CHUNK_SIZE) || 800,

  /** Overlap antar chunk dalam karakter. */
  chunkOverlap: Number(process.env.RAG_CHUNK_OVERLAP) || 150,

  /** Jumlah chunk teratas yang diambil saat retrieval. */
  retrievalLimit: Math.min(50, Math.max(1, Number(process.env.RAG_RETRIEVAL_LIMIT) || 6)),

  /**
   * Threshold cosine similarity minimum (0–1). Chunk di bawah ini dibuang.
   * Model lokal ini menghasilkan skor yang lebih rapat daripada model
   * embedding umum: pasangan relevan yang terukur berada di kisaran
   * 0,49–0,70, sedangkan query di luar topik berada di bawah 0,48.
   */
  similarityThreshold: Math.min(1, Math.max(0, Number(process.env.RAG_SIMILARITY_THRESHOLD) || 0.48)),

  /** Panjang maksimal pertanyaan pengguna dalam karakter. */
  maxQueryLength: Number(process.env.RAG_MAX_QUERY_LENGTH) || 500,

  /**
   * Batas waktu aplikasi untuk retrieval. `maxDuration` hanya petunjuk
   * platform; tanpa batas ini request bisa menggantung saat model/DB macet.
   */
  requestTimeoutMs: Math.min(
    60000,
    Math.max(1000, Number(process.env.RAG_REQUEST_TIMEOUT_MS) || 15000),
  ),
} as const;
