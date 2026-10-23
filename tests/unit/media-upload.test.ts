import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import sharp from "sharp";

import { konversiUploadKeWebp, Media } from "../../src/collections/Media";

function request(data: Buffer, mimetype: string, name = "upload.jpg", tempFilePath?: string) {
  return {
    file: { data, mimetype, name, size: data.byteLength, ...(tempFilePath ? { tempFilePath } : {}) },
    payload: { logger: { error() {} } },
  } as any;
}

test("direktori media menunjuk ke <proyek>/media, bukan relatif CWD", () => {
  assert.equal(Media.upload && typeof Media.upload === "object" ? Media.upload.staticDir : undefined, path.join(process.cwd(), "media"));
  assert.ok(path.isAbsolute(Media.upload && typeof Media.upload === "object" ? (Media.upload.staticDir as string) : ""));
});

test("JPEG/JPG, including PNG mislabeled .jpg, are detected by bytes and converted with consistent metadata", async () => {
  const jpeg = await sharp({ create: { width: 80, height: 40, channels: 3, background: "#cc8844" } }).jpeg().toBuffer();
  const jpgReq = request(jpeg, "image/jpeg", "photo.jpg");
  await konversiUploadKeWebp(jpgReq);
  const meta = await sharp(jpgReq.file.data).metadata();
  assert.equal(jpgReq.file.mimetype, "image/webp");
  assert.equal(jpgReq.file.name, "photo.webp");
  assert.equal(jpgReq.file.size, jpgReq.file.data.byteLength);
  assert.equal(meta.format, "webp");
  assert.deepEqual([meta.width, meta.height], [80, 40]);

  const mislabeledPng = await sharp({ create: { width: 21, height: 13, channels: 3, background: "white" } }).png().toBuffer();
  const mismatchReq = request(mislabeledPng, "image/png", "legacy.jpg");
  await konversiUploadKeWebp(mismatchReq);
  assert.equal(mismatchReq.file.name, "legacy.webp");
  assert.equal((await sharp(mismatchReq.file.data).metadata()).format, "webp");
});

test("opaque PNG converts to WebP; alpha PNG keeps its transparency channel", async () => {
  const opaque = await sharp({ create: { width: 24, height: 16, channels: 3, background: "#336699" } }).png().toBuffer();
  const opaqueReq = request(opaque, "image/png", "opaque.png");
  await konversiUploadKeWebp(opaqueReq);
  assert.equal((await sharp(opaqueReq.file.data).metadata()).format, "webp");

  const transparent = await sharp({ create: { width: 32, height: 24, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 0 } } }).png().toBuffer();
  const alphaReq = request(transparent, "image/png", "mark.png");
  await konversiUploadKeWebp(alphaReq);
  const alphaMeta = await sharp(alphaReq.file.data).metadata();
  assert.equal(alphaMeta.format, "webp");
  assert.equal(alphaMeta.hasAlpha, true);
  assert.deepEqual([alphaMeta.width, alphaMeta.height], [32, 24]);
  const pixels = await sharp(alphaReq.file.data).raw().toBuffer({ resolveWithObject: true });
  assert.equal(pixels.data[3], 0);
});

test("SVG remains unchanged and malformed image is rejected", async () => {
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
  const svgReq = request(svg, "image/svg+xml", "logo.svg");
  await konversiUploadKeWebp(svgReq);
  assert.equal(svgReq.file.name, "logo.svg");
  assert.equal(svgReq.file.data, svg);
  await assert.rejects(() => konversiUploadKeWebp(request(svg, "image/png", "logo.svg")), { name: "ValidationError" });
  await assert.rejects(() => konversiUploadKeWebp(request(Buffer.from("not an image"), "image/jpeg")), { name: "ValidationError" });
});

test("WebP yang sudah benar tidak dienkode ulang; nama .jpg yang salah tetap diselaraskan", async () => {
  const webp = await sharp({ create: { width: 18, height: 12, channels: 3, background: "#224466" } }).webp().toBuffer();
  const benar = request(webp, "image/webp", "sudah.webp");
  await konversiUploadKeWebp(benar);
  assert.equal(benar.file.name, "sudah.webp");
  assert.equal(benar.file.mimetype, "image/webp");
  assert.equal(benar.file.data, webp);
  assert.equal(benar.file.size, webp.byteLength);

  const salahNama = request(webp, "image/jpeg", "sebenarnya.jpg");
  await konversiUploadKeWebp(salahNama);
  assert.equal(salahNama.file.name, "sebenarnya.webp");
  assert.equal(salahNama.file.mimetype, "image/webp");
  assert.equal(salahNama.file.data, webp);
});

test("converted file bytes persist at a test-only directory, with correct extension, size and dimensions", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "easytax-media-fixture-"));
  try {
    const input = await sharp({ create: { width: 48, height: 30, channels: 3, background: "green" } }).jpeg().toBuffer();
    const temp = path.join(dir, "incoming.tmp");
    await writeFile(temp, input);
    const req = request(input, "image/jpeg", "portrait.jpeg", temp);
    await konversiUploadKeWebp(req);
    const stored = await readFile(temp);
    const details = await stat(temp);
    assert.equal(req.file.name, "portrait.webp");
    assert.equal(req.file.mimetype, "image/webp");
    assert.equal(details.size, req.file.size);
    assert.equal((await sharp(stored).metadata()).format, "webp");
    assert.deepEqual([(await sharp(stored).metadata()).width, (await sharp(stored).metadata()).height], [48, 30]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
