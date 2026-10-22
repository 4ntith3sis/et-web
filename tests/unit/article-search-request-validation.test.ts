import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validasiRequestPencarian } from "@/rag/search-request-validation";

describe("article search request validation", () => {
  it("rejects malformed JSON with the endpoint error", () => {
    assert.deepEqual(validasiRequestPencarian("{", null), {
      ok: false,
      status: 400,
      error: "Request body tidak valid.",
    });
  });

  it("rejects missing and non-string query values", () => {
    for (const body of ["{}", ...[null, 42, false, [], {}].map((query) => JSON.stringify({ query }))]) {
      assert.deepEqual(validasiRequestPencarian(body, null), {
        ok: false,
        status: 400,
        error: "Query harus berupa teks.",
      });
    }
  });

  it("rejects empty and whitespace-only queries", () => {
    for (const query of ["", "  \n\t  "]) {
      assert.deepEqual(validasiRequestPencarian(JSON.stringify({ query }), null), {
        ok: false,
        status: 400,
        error: "Query wajib diisi.",
      });
    }
  });

  it("rejects bodies over the endpoint content-length limit", () => {
    assert.deepEqual(validasiRequestPencarian("{}", "4097"), {
      ok: false,
      status: 413,
      error: "Ukuran request terlalu besar.",
    });
  });

  it("rejects queries over the configured maximum after trimming", () => {
    assert.deepEqual(validasiRequestPencarian(JSON.stringify({ query: ` ${"x".repeat(501)} ` }), null), {
      ok: false,
      status: 400,
      error: "Query maksimal 500 karakter.",
    });
  });

  it("returns the trimmed query for valid input", () => {
    assert.deepEqual(validasiRequestPencarian(JSON.stringify({ query: "  PPh 21  " }), null), {
      ok: true,
      query: "PPh 21",
    });
  });
});
