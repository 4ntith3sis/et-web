import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { it } from "node:test";

it("menunda query Navbar berbasis CMS sampai request, bukan prerender static shell", async () => {
  const layout = await readFile(
    new URL("../../src/app/(frontend)/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.match(layout, /<Suspense[\s\S]*?<ChromeNavbar\s*\/>[\s\S]*?<\/Suspense>/);
  assert.match(layout, /async function ChromeNavbar\(\)\s*\{\s*await connection\(\);/);
  assert.match(layout, /Promise\.all\(\[ambilSitus\(\), ambilNavigasi\(\)\]\)/);
});
