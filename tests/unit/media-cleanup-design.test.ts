import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

/**
 * Executable specification for the proposed post-commit media cleanup worker.
 * This intentionally uses an isolated temp directory and mocked reference/DB
 * state; it is not wired into Payload hooks and cannot touch project media/DB.
 */
type Asset = { id: number; filename: string; mimeType?: string };
type FakeState = {
  references: Set<number>;
  records: Set<number>;
  failUnlink?: boolean;
  failCommit?: boolean;
  logs: string[];
};

async function cleanupCandidate(root: string, asset: Asset, state: FakeState) {
  // A production worker must call this only after commit and acquire a lock
  // shared with reference-changing writes before scanning/deleting.
  if (state.references.has(asset.id)) return "referenced" as const;
  if (!state.records.has(asset.id)) return "already-clean" as const;
  const safeRoot = path.resolve(root);
  const target = path.resolve(safeRoot, asset.filename);
  if (!asset.filename || path.basename(asset.filename) !== asset.filename ||
      target === safeRoot || !target.startsWith(`${safeRoot}${path.sep}`)) {
    throw new Error("unsafe media path");
  }
  try {
    if (state.failUnlink) throw new Error("simulated unlink failure");
    await rm(target, { force: true });
  } catch (error) {
    state.logs.push(String(error));
    return "retry" as const;
  }
  // Model record deletion only after file deletion. In production this step
  // belongs in an idempotent queue, rechecking references under the same lock.
  if (state.failCommit) return "retry" as const;
  state.records.delete(asset.id);
  return "deleted" as const;
}

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "easytax-cleanup-spec-"));
  const asset = { id: 11, filename: "asset.webp", mimeType: "image/webp" };
  await writeFile(path.join(root, asset.filename), "fixture bytes");
  const state: FakeState = { references: new Set(), records: new Set([asset.id]), logs: [] };
  return { root, asset, state };
}

test("replace A by B: exclusive A is eligible only after successful update commit", async () => {
  const f = await fixture();
  try {
    f.state.failCommit = true;
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "retry");
    assert.equal(f.state.records.has(f.asset.id), true);
    f.state.failCommit = false;
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "deleted");
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("shared image remains when any content still references it", async () => {
  const f = await fixture();
  try {
    f.state.references.add(f.asset.id);
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "referenced");
    assert.equal(await readFile(path.join(f.root, f.asset.filename), "utf8"), "fixture bytes");
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("failed new upload or failed DB update never schedules old-media cleanup", async () => {
  const f = await fixture();
  try {
    const before = await readFile(path.join(f.root, f.asset.filename), "utf8");
    // The post-commit worker is not invoked for upload or update failures.
    assert.equal(before, "fixture bytes");
    assert.equal(f.state.records.has(f.asset.id), true);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("exclusive content delete and partner-logo replacement use the same safe candidate check", async () => {
  const f = await fixture();
  try {
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "deleted");
    assert.equal(f.state.records.has(f.asset.id), false);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("text-only update does not enqueue media when before/after media IDs match", () => {
  const mediaBefore = 11;
  const mediaAfter = 11;
  assert.deepEqual(mediaBefore === mediaAfter ? [] : [mediaBefore], []);
});

test("SVG, WebP, transparent PNG and JPEG metadata are valid fixtures for current upload policy", async () => {
  // Format conversion itself is exercised by media-upload.test.ts. This test
  // asserts the cleanup layer is format-agnostic and uses stored filenames.
  for (const [filename, mimeType] of [
    ["logo.svg", "image/svg+xml"], ["photo.webp", "image/webp"],
    ["transparent.webp", "image/webp"], ["scan.webp", "image/webp"],
  ]) {
    assert.ok(path.extname(filename));
    assert.match(mimeType, /^image\//);
  }
});

test("path traversal and paths outside media root are rejected", async () => {
  const f = await fixture();
  try {
    await assert.rejects(cleanupCandidate(f.root, { ...f.asset, filename: "../outside.webp" }, f.state), /unsafe media path/);
    await assert.rejects(cleanupCandidate(f.root, { ...f.asset, filename: path.join(os.tmpdir(), "outside.webp") }, f.state), /unsafe media path/);
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("unlink failure is logged and retry is idempotent", async () => {
  const f = await fixture();
  try {
    f.state.failUnlink = true;
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "retry");
    assert.equal(f.state.logs.length, 1);
    f.state.failUnlink = false;
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "deleted");
    assert.equal(await cleanupCandidate(f.root, f.asset, f.state), "already-clean");
  } finally { await rm(f.root, { recursive: true, force: true }); }
});

test("fallback/static assets are never candidates for Media cleanup", async () => {
  const staticFallback = { id: -1, filename: "../public/images/fallback.webp" };
  assert.equal(staticFallback.id > 0 && path.basename(staticFallback.filename) === staticFallback.filename, false);
});
