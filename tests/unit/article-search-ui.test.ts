import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const componentPath = new URL("../../src/components/sections/DaftarArtikel.tsx", import.meta.url);
const pagePath = new URL("../../src/app/(frontend)/tulisan-pajak/page.tsx", import.meta.url);

describe("article listing semantic search integration", () => {
  it("keeps one search input, debounces live requests, aborts stale work, and caps results at five", async () => {
    const source = await readFile(new URL("../../src/components/sections/ArtikelSearchControl.tsx", import.meta.url), "utf8");
    assert.equal((source.match(/role="combobox"/g) ?? []).length, 1);
    assert.match(source, /type="text"/);
    assert.match(source, /DEBOUNCE_MS = 300/);
    assert.match(source, /AbortController/);
    assert.match(source, /results\.slice\(0, 5\)/);
    assert.match(source, /generation !== generationRef\.current/);
    assert.match(source, /event\.key === "Escape"/);
    assert.match(source, /event\.key === "ArrowDown"/);
    assert.match(source, /event\.key === "ArrowUp"/);
  });

  it("preserves subdued focus and removes duplicate semantic search section", async () => {
    const [source, page, control] = await Promise.all([
      readFile(componentPath, "utf8"),
      readFile(pagePath, "utf8"),
      readFile(new URL("../../src/components/sections/ArtikelSearchControl.tsx", import.meta.url), "utf8"),
    ]);
    assert.match(control, /bg-white[^\n]*focus:border-garis/);
    assert.match(control, /focus-visible:outline-navy-900\/40/);
    assert.doesNotMatch(page, /PencarianSemantikArtikel/);
    assert.match(source, /ArtikelSearchControl/);
    assert.match(source, /aria-label="Filter kategori"/);
    assert.match(source, /kategori\.map/);
  });

  it("uses the existing search endpoint and renders semantic results separately from the initial grid", async () => {
    const [control, listing] = await Promise.all([
      readFile(new URL("../../src/components/sections/ArtikelSearchControl.tsx", import.meta.url), "utf8"),
      readFile(componentPath, "utf8"),
    ]);
    assert.match(control, /fetch\("\/api\/artikel\/search"/);
    assert.match(control, /onResults\(await cariDenganFallback/);
    assert.match(control, /where\[or\]\[0\]\[judul\]\[like\]/);
    assert.match(control, /cariKeyword/);
    assert.match(listing, /Pencarian semantik mencakup semua kategori/);
    assert.match(listing, /searchSubmitted/);
    assert.match(listing, /Hasil Pencarian Kata Kunci/);
    assert.match(control, /item\.url/);
  });
});
