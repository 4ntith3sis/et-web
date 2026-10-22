import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server.js";
import {
  POST,
  tanganiPencarian,
  type DependensiRoutePencarian,
} from "@/app/api/artikel/search/route";
import type { HasilRetrieval } from "@/rag/vector-store";

const URL_PENCARIAN = "http://localhost/api/artikel/search";

function request(body: string, contentLength?: string): NextRequest {
  return new NextRequest(URL_PENCARIAN, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/json",
      ...(contentLength === undefined ? {} : { "content-length": contentLength }),
    },
  });
}

function chunk(overrides: Partial<HasilRetrieval> = {}): HasilRetrieval {
  return {
    artikelId: 5,
    slug: "pajak-usaha",
    judul: "Pajak Usaha",
    ringkasan: "Ringkasan pajak usaha.",
    kategori: "Pajak",
    similarity: 0.87,
    ...overrides,
  };
}

function dependencies(
  cari: DependensiRoutePencarian["cari"],
  enabled = true,
): DependensiRoutePencarian {
  return { enabled, cari };
}

describe("POST /api/artikel/search", () => {
  it("keeps the feature disabled by default without calling retrieval", async (t) => {
    if (process.env.RAG_ARTIKEL_ENABLED === "true") {
      t.skip("RAG_ARTIKEL_ENABLED diset di environment");
      return;
    }
    const originalWarn = console.warn;
    let warning = "";
    console.warn = (message?: unknown) => { warning = String(message); };
    try {
      const response = await POST(request(JSON.stringify({ query: "pajak usaha" })));

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error: "Pencarian semantik artikel sedang tidak aktif.",
      });
      assert.match(warning, /RAG_ARTIKEL_ENABLED=true/);
    } finally {
      console.warn = originalWarn;
    }
  });

  it("returns mapped public results for a valid request", async () => {
    let receivedQuery = "";
    const response = await tanganiPencarian(
      request(JSON.stringify({ query: "  pajak usaha  " })),
      dependencies(async (query) => {
        receivedQuery = query;
        return {
          chunks: [
            chunk({ similarity: 0.7 }),
            chunk({ similarity: 0.91 }),
            chunk({ artikelId: 9, slug: "ppn & ppnbm", judul: "PPN", similarity: 0.6 }),
          ],
          query,
          dpiProses: 1,
        };
      }),
    );

    assert.equal(response.status, 200);
    assert.equal(receivedQuery, "pajak usaha");
    assert.deepEqual(await response.json(), {
      query: "pajak usaha",
      artikel: [
        {
          id: 5,
          judul: "Pajak Usaha",
          slug: "pajak-usaha",
          ringkasan: "Ringkasan pajak usaha.",
          kategori: "Pajak",
          url: "/tulisan-pajak/pajak-usaha",
          relevansi: 0.91,
        },
        {
          id: 9,
          judul: "PPN",
          slug: "ppn & ppnbm",
          ringkasan: "Ringkasan pajak usaha.",
          kategori: "Pajak",
          url: "/tulisan-pajak/ppn%20%26%20ppnbm",
          relevansi: 0.6,
        },
      ],
    });
  });

  it("never exposes embeddings, chunk text, or content hashes", async () => {
    const internal = {
      ...chunk(),
      teks: "chunk rahasia",
      embedding: [0.1, 0.2],
      contentHash: "hash-rahasia",
    } as HasilRetrieval;
    const response = await tanganiPencarian(
      request(JSON.stringify({ query: "pajak" })),
      dependencies(async (query) => ({ chunks: [internal], query, dpiProses: 0 })),
    );
    const body = await response.json();
    const serialized = JSON.stringify(body);

    assert.equal(response.status, 200);
    assert.deepEqual(Object.keys(body.artikel[0]).sort(), [
      "id",
      "judul",
      "kategori",
      "relevansi",
      "ringkasan",
      "slug",
      "url",
    ]);
    assert.ok(!serialized.includes("embedding"));
    assert.ok(!serialized.includes("contentHash"));
    assert.ok(!serialized.includes("chunk rahasia"));
  });

  it("rejects malformed JSON, missing/wrong-type, empty, and overlong queries", async () => {
    const cases: Array<{ body: string; status: number }> = [
      { body: "{", status: 400 },
      { body: JSON.stringify({}), status: 400 },
      { body: JSON.stringify({ query: 42 }), status: 400 },
      { body: JSON.stringify({ query: "   " }), status: 400 },
      { body: JSON.stringify({ query: "x".repeat(501) }), status: 400 },
    ];

    for (const { body, status } of cases) {
      let called = false;
      const response = await tanganiPencarian(
        request(body),
        dependencies(async (query) => {
          called = true;
          return { chunks: [], query, dpiProses: 0 };
        }),
      );
      assert.equal(response.status, status, `body ${body.slice(0, 40)}`);
      assert.equal(called, false);
      assert.equal(typeof (await response.json()).error, "string");
    }
  });

  it("rejects oversized requests with 413 before retrieval", async () => {
    let called = false;
    const response = await tanganiPencarian(
      request("x".repeat(5000), "5000"),
      dependencies(async (query) => {
        called = true;
        return { chunks: [], query, dpiProses: 0 };
      }),
    );

    assert.equal(response.status, 413);
    assert.equal(called, false);
    assert.deepEqual(await response.json(), { error: "Ukuran request terlalu besar." });
  });

  it("maps timeout and provider failures to 504 and 503 without success payload", async () => {
    const originalError = console.error;
    console.error = () => undefined;
    try {
      const timeout = new Error("timed out");
      timeout.name = "TimeoutError";
      const timeoutResponse = await tanganiPencarian(
        request(JSON.stringify({ query: "pajak" })),
        dependencies(async () => { throw timeout; }),
      );
      assert.equal(timeoutResponse.status, 504);
      assert.deepEqual(await timeoutResponse.json(), {
        error: "Pencarian melewati batas waktu. Coba lagi.",
      });

      const aborted = new Error("aborted");
      aborted.name = "AbortError";
      assert.equal(
        (await tanganiPencarian(
          request(JSON.stringify({ query: "pajak" })),
          dependencies(async () => { throw aborted; }),
        )).status,
        504,
      );

      for (const thrown of [
        new Error("model unavailable"),
        new Error("database unavailable"),
        "non-error rejection",
      ]) {
        const response = await tanganiPencarian(
          request(JSON.stringify({ query: "pajak" })),
          dependencies(async () => { throw thrown; }),
        );
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
          error: "Pencarian artikel gagal sementara.",
        });
      }
    } finally {
      console.error = originalError;
    }
  });
});
