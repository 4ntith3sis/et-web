import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import sharp from "sharp";

const enabled = process.env.EASYTAX_MEDIA_HTTP_TESTS === "1";
const baseURL = process.env.EASYTAX_MEDIA_TEST_URL ?? "http://127.0.0.1:3022";
const secret = process.env.EASYTAX_MEDIA_TEST_BEARER;

async function poll<T>(fn: () => Promise<T | null>, timeout = 12000): Promise<T> {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const result = await fn();
    if (result !== null) return result;
    await delay(200);
  }
  throw new Error("HTTP test server did not become ready within timeout");
}

test("Payload media endpoint reports validation statuses and cleans failed uploads", { skip: !enabled }, async () => {
  assert.ok(secret, "EASYTAX_MEDIA_TEST_BEARER must contain a test-only bearer token");
  const temp = await mkdtemp(path.join(tmpdir(), "easytax-media-http-"));
  const invalid = path.join(temp, "invalid.jpg");
  const mismatch = path.join(temp, "mismatch.jpg");
  const invalidWebp = path.join(temp, "invalid.webp");
  const near = path.join(temp, "near.jpg");
  const exact = path.join(temp, "exact.jpg");
  const over = path.join(temp, "over.jpg");
  const created: string[] = [];
  const knownTempNames = ["near.jpg", "exact.jpg", "over.jpg", "invalid.jpg", "mismatch.jpg", "invalid.webp"];

  const upload = async (file: string, mime: string, alt: string) => {
    const form = new FormData();
    form.set("_payload", JSON.stringify({ alt }));
    form.set("file", new File([await (await import("node:fs/promises")).readFile(file)], path.basename(file), { type: mime }));
    const response = await fetch(`${baseURL}/api/media`, {
      method: "POST",
      headers: { Authorization: `JWT ${secret}` },
      body: form,
      signal: AbortSignal.timeout(12000),
    });
    const data = await response.json();
    if (response.ok) created.push(data.doc.filename);
    return { status: response.status, data };
  };

  try {
    await writeFile(invalid, Buffer.from("definitely not a valid jpeg"));
    await writeFile(mismatch, Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>'));
    await writeFile(invalidWebp, Buffer.from("not a webp file"));
    const baseJpeg = await sharp({ create: { width: 256, height: 256, channels: 3, background: "#799" } }).jpeg().toBuffer();
    // Keep valid JPEG bytes and pad with legal trailing whitespace to target precise request sizes.
    await writeFile(near, Buffer.concat([baseJpeg, Buffer.alloc(20 * 1024 * 1024 - 1 - baseJpeg.length, 0x20)]));
    await writeFile(exact, Buffer.concat([baseJpeg, Buffer.alloc(20 * 1024 * 1024 - baseJpeg.length, 0x20)]));
    await writeFile(over, Buffer.concat([baseJpeg, Buffer.alloc(20 * 1024 * 1024 + 1 - baseJpeg.length, 0x20)]));

    const invalidResult = await upload(invalid, "image/jpeg", "invalid media test");
    assert.equal(invalidResult.status, 400);
    assert.match(JSON.stringify(invalidResult.data), /valid|gambar|image/i);

    const mismatchResult = await upload(mismatch, "image/jpeg", "mismatch test");
    assert.equal(mismatchResult.status, 400);
    const invalidWebpResult = await upload(invalidWebp, "image/webp", "invalid WebP test");
    assert.equal(invalidWebpResult.status, 400);

    const nearResult = await upload(near, "image/jpeg", "near 20 MB test");
    assert.ok(nearResult.status >= 200 && nearResult.status < 300);
    assert.equal(nearResult.data.doc.mimeType, "image/webp");

    const exactResult = await upload(exact, "image/jpeg", "exact 20 MB test");
    assert.ok(exactResult.status >= 200 && exactResult.status < 300);
    assert.equal(exactResult.data.doc.mimeType, "image/webp");

    const overResult = await upload(over, "image/jpeg", "over 20 MB test");
    assert.equal(overResult.status, 413);
    assert.match(JSON.stringify(overResult.data), /20 MB|size|limit/i);

    const listing = await poll(async () => {
      const response = await fetch(`${baseURL}/api/media?where[filename][in]=${encodeURIComponent(created.join(","))}`, {
        headers: { Authorization: `JWT ${secret}` }, signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return null;
      return response.json();
    });
    assert.equal(listing.docs.length, 2);
  } finally {
    await rm(temp, { recursive: true, force: true });
    for (const filename of [...new Set([...created, ...knownTempNames])]) {
      const url = `${baseURL}/api/media?where[filename][equals]=${encodeURIComponent(filename)}`;
      const response = await fetch(url, { headers: { Authorization: `JWT ${secret}` }, signal: AbortSignal.timeout(5000) }).catch(() => null);
      if (!response?.ok) continue;
      const result = await response.json();
      for (const doc of result.docs ?? []) {
        await fetch(`${baseURL}/api/media/${doc.id}`, { method: "DELETE", headers: { Authorization: `JWT ${secret}` }, signal: AbortSignal.timeout(5000) }).catch(() => undefined);
      }
    }
  }
});
