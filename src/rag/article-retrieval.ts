/** Semantic retrieval atas artikel published saja. */

import { RAG_CONFIG } from "./config";
import { cariChunkRelevan, type HasilRetrieval } from "./vector-store";

export interface HasilPencarianArtikel {
  chunks: HasilRetrieval[];
  query: string;
  dpiProses: number;
}

type DatabaseRetrieval = Parameters<typeof cariChunkRelevan>[0];

/**
 * Seam dependency injection untuk pengujian retrieval tanpa Payload, tanpa
 * database, dan tanpa artifact ONNX.
 */
export interface DependensiRetrievalArtikel {
  enabled: boolean;
  embedQuery: (query: string) => Promise<number[]>;
  getDatabase: () => Promise<DatabaseRetrieval>;
  retrieve: typeof cariChunkRelevan;
  maxQueryLength: number;
  retrievalLimit: number;
  similarityThreshold: number;
}

const dependensiDefault: DependensiRetrievalArtikel = {
  enabled: RAG_CONFIG.enabled,
  embedQuery: async (query) => {
    const { buatEmbeddingQuery } = await import("./embedding-provider");
    return buatEmbeddingQuery(query);
  },
  getDatabase: async () => {
    const { getClient } = await import("@/lib/payload/client");
    return (await getClient()).db as unknown as DatabaseRetrieval;
  },
  retrieve: cariChunkRelevan,
  maxQueryLength: RAG_CONFIG.maxQueryLength,
  retrievalLimit: RAG_CONFIG.retrievalLimit,
  similarityThreshold: RAG_CONFIG.similarityThreshold,
};

export async function cariArtikelSemantikDenganDependensi(
  query: string,
  dependencies: DependensiRetrievalArtikel,
): Promise<HasilPencarianArtikel> {
  const mulai = Date.now();
  const q = query.trim();
  if (!dependencies.enabled || !q || q.length > dependencies.maxQueryLength) {
    return { chunks: [], query: q, dpiProses: Date.now() - mulai };
  }

  // Embedding hanya dibuat setelah query lolos validasi, sehingga query
  // kosong/terlalu panjang tidak memicu inference.
  const queryEmbedding = await dependencies.embedQuery(q);
  const db = await dependencies.getDatabase();
  const chunks = await dependencies.retrieve(
    db,
    queryEmbedding,
    dependencies.retrievalLimit,
    dependencies.similarityThreshold,
  );

  return { chunks, query: q, dpiProses: Date.now() - mulai };
}

export function cariArtikelSemantik(query: string): Promise<HasilPencarianArtikel> {
  return cariArtikelSemantikDenganDependensi(query, dependensiDefault);
}
