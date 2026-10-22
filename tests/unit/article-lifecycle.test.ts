import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tentukanAksiLifecycleArtikel } from "@/rag/article-lifecycle";
import { indexArtikelDenganDependensi, type DependensiIndexingArtikel } from "@/rag/article-indexing";

const ARTICLE = {
  id: 11,
  slug: "pajak-usaha",
  judul: "Panduan Pajak Usaha",
  ringkasan: "Panduan bagi pelaku usaha tentang kewajiban perpajakan yang berlaku.",
  blok: [{ blockType: "paragraf" as const, teks: "Pelaku usaha perlu memahami kewajiban pajak dan pelaporan secara berkala." }],
};

function makeDependencies(overrides: Partial<DependensiIndexingArtikel> = {}) {
  const events: string[] = [];
  const db = {
    drizzle: { execute: async () => [], transaction: async () => undefined },
  } as unknown as Awaited<ReturnType<DependensiIndexingArtikel["getDatabase"]>>;
  const dependencies: DependensiIndexingArtikel = {
    enabled: true,
    getDatabase: async () => { events.push("database"); return db; },
    embedBatch: async (texts) => { events.push(`embed:${texts.length}`); return texts.map(() => Array(1024).fill(0.25)); },
    hapus: async () => { events.push("delete"); },
    contentHash: async () => { events.push("hash"); return "different-hash"; },
    simpan: async (_db, _id, records) => { events.push(`save:${records.length}`); },
    extract: async (article) => {
      events.push("extract");
      return {
        artikelId: article.id,
        slug: article.slug,
        judul: article.judul,
        teksLengkap: `${article.judul} ${article.ringkasan} Informasi perpajakan untuk pengusaha dan kewajiban pelaporan pajak berkala.`,
        contentHash: `hash-${article.slug}`,
      };
    },
    chunk: (params) => [{ artikelId: params.artikelId, slug: params.slug, judul: params.judul, chunkIndex: 0, teks: params.teksLengkap, contentHash: params.contentHash }],
    ...overrides,
  };
  return { dependencies, events };
}

describe("article embedding lifecycle decisions", () => {
  it("indexes a newly published article with indexable content", () => {
    assert.equal(tentukanAksiLifecycleArtikel({ published: true, hasIndexableContent: true }), "index");
  });

  it("reindexes published content when its hash changes", () => {
    assert.equal(tentukanAksiLifecycleArtikel({
      published: true,
      hasIndexableContent: true,
      previousContentHash: "old",
      nextContentHash: "new",
    }), "index");
  });

  it("skips unchanged content unless forced", () => {
    const input = {
      published: true,
      hasIndexableContent: true,
      previousContentHash: "same",
      nextContentHash: "same",
    };
    assert.equal(tentukanAksiLifecycleArtikel(input), "skip");
    assert.equal(tentukanAksiLifecycleArtikel({ ...input, forceReindex: true }), "index");
  });

  it("removes embeddings when unpublished or content is not indexable", () => {
    assert.equal(tentukanAksiLifecycleArtikel({ published: false, hasIndexableContent: true }), "remove");
    assert.equal(tentukanAksiLifecycleArtikel({ published: true, hasIndexableContent: false }), "remove");
  });

  it("skips without touching dependencies when the feature flag is off", async () => {
    const { dependencies, events } = makeDependencies({ enabled: false });
    const result = await indexArtikelDenganDependensi(ARTICLE, dependencies);
    assert.equal(result.status, "skipped");
    assert.deepEqual(events, []);
  });

  it("embeds and stores a new article using 1024-dimensional vectors", async () => {
    const { dependencies, events } = makeDependencies();
    const result = await indexArtikelDenganDependensi(ARTICLE, dependencies);
    assert.equal(result.status, "indexed");
    assert.equal(result.chunks, 1);
    assert.deepEqual(events, ["extract", "database", "hash", "embed:1", "save:1"]);
  });

  it("skips identical content and removes embeddings for non-indexable content", async () => {
    const identical = makeDependencies({
      extract: async (article) => ({
        artikelId: article.id,
        slug: article.slug,
        judul: article.judul,
        teksLengkap: "konten yang sama",
        contentHash: "hash-pajak-usaha",
      }),
      contentHash: async () => "hash-pajak-usaha",
    });
    assert.equal((await indexArtikelDenganDependensi(ARTICLE, identical.dependencies)).status, "skipped");
    assert.deepEqual(identical.events, ["database"]);

    const empty = makeDependencies({ extract: async () => null });
    assert.equal((await indexArtikelDenganDependensi(ARTICLE, empty.dependencies)).status, "removed");
    assert.deepEqual(empty.events, ["database", "delete"]);
    assert.ok(!empty.events.some((event) => event.startsWith("embed:")));
  });

  it("returns error rather than success for malformed vectors or failed persistence", async () => {
    const malformed = makeDependencies({ embedBatch: async () => [[1, 2]] });
    const firstError = console.error;
    console.error = () => undefined;
    try {
      assert.equal((await indexArtikelDenganDependensi(ARTICLE, malformed.dependencies)).status, "error");
    } finally {
      console.error = firstError;
    }

    const saveFailure = makeDependencies({ simpan: async () => { throw new Error("write failed"); } });
    console.error = () => undefined;
    try {
      const result = await indexArtikelDenganDependensi(ARTICLE, saveFailure.dependencies);
      assert.equal(result.status, "error");
      assert.match(result.error || "", /write failed/);
    } finally {
      console.error = firstError;
    }
  });

  it("passes article metadata, chunk identity, and one 1024-d embedding per chunk to storage", async () => {
    let stored: import("@/rag/vector-store").ChunkEmbeddingRecord[] = [];
    const dependencies = makeDependencies({
      chunk: (params) => [
        { ...params, chunkIndex: 0, teks: "chunk pertama" },
        { ...params, chunkIndex: 1, teks: "chunk kedua" },
      ],
      embedBatch: async (texts) => {
        assert.deepEqual(texts, ["chunk pertama", "chunk kedua"]);
        return texts.map((_, chunk) => Array.from({ length: 1024 }, (_, i) => chunk + i / 1024));
      },
      simpan: async (_db, artikelId, records) => {
        assert.equal(artikelId, ARTICLE.id);
        stored = records;
      },
    }).dependencies;

    const result = await indexArtikelDenganDependensi(ARTICLE, dependencies);

    assert.equal(result.status, "indexed");
    assert.equal(result.chunks, 2);
    assert.equal(stored.length, 2);
    assert.deepEqual(
      stored.map(({ artikelId, slug, judul, chunkIndex, teks, contentHash, embedding }) => ({
        artikelId, slug, judul, chunkIndex, teks, contentHash, dimension: embedding.length,
      })),
      [
        {
          artikelId: ARTICLE.id,
          slug: ARTICLE.slug,
          judul: ARTICLE.judul,
          chunkIndex: 0,
          teks: "chunk pertama",
          contentHash: "hash-pajak-usaha",
          dimension: 1024,
        },
        {
          artikelId: ARTICLE.id,
          slug: ARTICLE.slug,
          judul: ARTICLE.judul,
          chunkIndex: 1,
          teks: "chunk kedua",
          contentHash: "hash-pajak-usaha",
          dimension: 1024,
        },
      ],
    );
    assert.ok(stored.every((record) => record.embedding.every(Number.isFinite)));
  });

  it("reindexes unchanged content when the slug changes", async () => {
    const dependencies = makeDependencies({
      contentHash: async () => "hash-slug-lama",
    }).dependencies;

    const result = await indexArtikelDenganDependensi(ARTICLE, dependencies);

    assert.equal(result.status, "indexed");
  });

  it("cleans up without inference when chunking produces no indexable chunk", async () => {
    const { dependencies, events } = makeDependencies({ chunk: () => [] });

    const result = await indexArtikelDenganDependensi(ARTICLE, dependencies);

    assert.equal(result.status, "removed");
    assert.deepEqual(events, ["extract", "database", "hash", "delete"]);
  });

  it("reports extraction, embedding, and persistence failures as errors", async () => {
    const firstError = console.error;
    console.error = () => undefined;
    try {
      const extractionFailure = makeDependencies({
        extract: async () => { throw new Error("extract failed"); },
      });
      const extractionResult = await indexArtikelDenganDependensi(ARTICLE, extractionFailure.dependencies);
      assert.equal(extractionResult.status, "error");
      assert.match(extractionResult.error || "", /extract failed/);
      assert.ok(!extractionFailure.events.some((event) => event.startsWith("embed:")));

      const embeddingFailure = makeDependencies({
        embedBatch: async () => { throw new Error("embedding failed"); },
      });
      const embeddingResult = await indexArtikelDenganDependensi(ARTICLE, embeddingFailure.dependencies);
      assert.equal(embeddingResult.status, "error");
      assert.match(embeddingResult.error || "", /embedding failed/);
      assert.ok(!embeddingFailure.events.some((event) => event.startsWith("save:")));
    } finally {
      console.error = firstError;
    }
  });
});
