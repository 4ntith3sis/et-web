import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MEDIA_REFERENCE_SOURCES,
  scanMediaReferences,
  type ReadOnlySQL,
} from "../../src/lib/media-cleanup/reference-scanner";

function sqlFixture(hits: ReadonlySet<string> = new Set(), fail = new Set<string>()): ReadOnlySQL {
  return async (query) => {
    const table = /public\."([a-z_]+)"/.exec(query)?.[1] ?? "";
    if (fail.has(table)) throw new Error(`simulated scanner failure: ${table}`);
    return [{ count: hits.has(table) ? 1 : 0 }];
  };
}

test("known direct and SEO foreign-key paths include current content and retained versions", () => {
  assert.deepEqual(MEDIA_REFERENCE_SOURCES.map((source) => source.name), [
    "artikel.sampul", "artikel.seo.gambar", "artikel versions.sampul",
    "artikel versions.seo.gambar", "layanan.gambar", "layanan.seo.gambar",
    "layanan versions.gambar", "layanan versions.seo.gambar", "tim.foto",
    "mitra.logo", "testimoni.fotoProfil", "Payload locked-document media relation",
  ]);
});

test("scanner retains media referenced by another content row", async () => {
  const result = await scanMediaReferences(5, sqlFixture(new Set(["artikel"])), { knownPolymorphicSourcesComplete: true });
  assert.equal(result.decision, "RETAIN");
  assert.ok(result.references.some((item) => item.source === "artikel.sampul"));
});

test("scanner retains media referenced by a retained draft/version row", async () => {
  const result = await scanMediaReferences(5, sqlFixture(new Set(["_artikel_v"])), { knownPolymorphicSourcesComplete: true });
  assert.equal(result.decision, "RETAIN");
  assert.ok(result.references.some((item) => item.source === "artikel versions.sampul"));
});

test("SEO OG reference is included", async () => {
  const result = await scanMediaReferences(5, sqlFixture(new Set(["layanan"])), { knownPolymorphicSourcesComplete: true });
  assert.equal(result.decision, "RETAIN");
  assert.ok(result.references.some((item) => item.source === "layanan.seo.gambar"));
});

test("Page Builder/Reusables JSON paths force RETAIN even without a textual match", async () => {
  const result = await scanMediaReferences(5, sqlFixture(), { knownPolymorphicSourcesComplete: true });
  assert.equal(result.decision, "RETAIN");
  assert.ok(result.uncertainSources.some((source) => source.source === "page-layouts.layout"));
  assert.ok(result.uncertainSources.some((source) => source.source === "reusable-components.data"));
});

test("SQL failure and unverified polymorphic coverage force RETAIN", async () => {
  const failed = await scanMediaReferences(5, sqlFixture(new Set(), new Set(["artikel"])), { knownPolymorphicSourcesComplete: true });
  assert.equal(failed.decision, "RETAIN");
  assert.ok(failed.uncertainSources.some((source) => source.source === "artikel.sampul"));

  const incomplete = await scanMediaReferences(5, sqlFixture(), { knownPolymorphicSourcesComplete: false });
  assert.equal(incomplete.decision, "RETAIN");
});

test("invalid media IDs fail closed without querying", async () => {
  let queried = false;
  const result = await scanMediaReferences(0, async () => { queried = true; return []; }, { knownPolymorphicSourcesComplete: true });
  assert.equal(result.decision, "RETAIN");
  assert.equal(queried, false);
});
