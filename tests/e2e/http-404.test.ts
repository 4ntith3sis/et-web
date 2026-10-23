import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { after, before, describe, it } from "node:test";

import { ambilArtikel, ambilLayanan } from "@/cms/konten";

/**
 * Uji HTTP nyata untuk route detail. Jalankan setelah `npm run build`:
 *
 *   EASYTAX_HTTP_TESTS=1 npm test
 *
 * Tanpa flag tersebut test dilewati agar `npm test` biasa tidak memerlukan
 * hasil build dan tidak membuka port tambahan.
 */

const JALANKAN = process.env.EASYTAX_HTTP_TESTS === "1";
const PORT = Number(process.env.EASYTAX_HTTP_TEST_PORT ?? 3014);
const BASE = `http://127.0.0.1:${PORT}`;

let server: ChildProcess | undefined;

async function tungguServerSiap(): Promise<void> {
  const batas = Date.now() + 90_000;
  while (Date.now() < batas) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2_000) });
      if (res.status < 500) return;
    } catch {
      // Server belum menerima koneksi; coba lagi.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Server Next.js tidak siap dalam 90 detik.");
}

async function status(path: string): Promise<number> {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  await res.body?.cancel();
  return res.status;
}

describe("respons HTTP route detail", { skip: !JALANKAN }, () => {
  before(async () => {
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
      { cwd: process.cwd(), env: process.env, stdio: ["ignore", "pipe", "pipe"] },
    );
    await tungguServerSiap();
  }, { timeout: 120_000 });

  after(() => {
    server?.kill("SIGTERM");
  });

  it("slug artikel yang tidak ada menghasilkan HTTP 404", async () => {
    const res = await fetch(`${BASE}/tulisan-pajak/__slug-tidak-ada-phase1`, {
      redirect: "manual",
    });
    assert.equal(res.status, 404);
    assert.match(await res.text(), /Halaman Tidak Ditemukan/);
  });

  it("slug layanan yang tidak ada menghasilkan HTTP 404", async () => {
    const res = await fetch(`${BASE}/layanan/__slug-tidak-ada-phase1`, {
      redirect: "manual",
    });
    assert.equal(res.status, 404);
    assert.match(await res.text(), /Halaman Tidak Ditemukan/);
  });

  it("slug artikel yang valid tetap menghasilkan HTTP 200", async () => {
    const artikel = await ambilArtikel();
    assert.ok(artikel.length > 0, "butuh minimal satu artikel untuk uji");
    assert.equal(
      await status(`/tulisan-pajak/${encodeURIComponent(artikel[0]!.slug)}`),
      200,
    );
  });

  it("slug layanan yang valid tetap menghasilkan HTTP 200", async () => {
    const layanan = await ambilLayanan();
    assert.ok(layanan.length > 0, "butuh minimal satu layanan untuk uji");
    assert.equal(
      await status(`/layanan/${encodeURIComponent(layanan[0]!.slug)}`),
      200,
    );
  });
});
