/**
 * Apply migration for missing client logos only.
 * Creates missing media uploads and mitra rows; never updates existing rows.
 * Each JPEG passes through the Media beforeOperation hook and is stored as WebP.
 *
 * Safety: requires --apply; runs with Payload Local API and overrideAccess.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { logoMitra, namaMitra } from "../src/data/mitra";

if (!process.argv.includes("--apply")) {
  throw new Error("Refusing to write. Pass --apply after reviewing the migration plan.");
}

const root = process.cwd();
const payload = await getPayload({ config });
const created = [];
const preserved = [];
const failures = [];

try {
  const existingMitra = await payload.find({
    collection: "mitra",
    limit: 500,
    depth: 1,
    draft: true,
    overrideAccess: true,
  });
  const existingMedia = await payload.find({
    collection: "media",
    limit: 1000,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const mitraByName = new Map(existingMitra.docs.map((doc) => [String(doc.nama).toLowerCase(), doc]));
  const mediaByFilename = new Map(existingMedia.docs.map((doc) => [doc.filename, doc]));

  for (const [index, filename] of logoMitra.entries()) {
    const name = namaMitra[filename];
    if (!name) throw new Error(`Missing display name for ${filename}`);

    const priorMitra = mitraByName.get(name.toLowerCase());
    if (priorMitra?.logo) {
      preserved.push({ name, id: priorMitra.id, logo: priorMitra.logo.filename ?? priorMitra.logo });
      continue;
    }

    const sourcePath = path.join(root, "public", "images", "clients", filename);
    const input = await fs.readFile(sourcePath);
    const metadata = await sharp(input).metadata();
    if (metadata.format !== "jpeg" || !metadata.width || !metadata.height) {
      throw new Error(`Source is not a valid JPEG: ${filename}`);
    }

    const desiredStem = `migrasi-mitra-${path.basename(filename, ".jpg")}`;
    const matchingMedia = [...mediaByFilename.values()].find((doc) =>
      doc.filename?.replace(/\.[^.]+$/, "") === desiredStem,
    );
    let mediaId;
    let mediaFilename;

    if (matchingMedia) {
      mediaId = matchingMedia.id;
      mediaFilename = matchingMedia.filename;
      if (matchingMedia.mimeType !== "image/webp" || !mediaFilename.endsWith(".webp")) {
        throw new Error(`Existing target media has unexpected format: ${mediaFilename}`);
      }
    } else {
      const mediaDoc = await payload.create({
        collection: "media",
        data: { alt: name },
        file: {
          data: input,
          mimetype: "image/jpeg",
          name: `${desiredStem}.jpg`,
          size: input.byteLength,
        },
        overrideAccess: true,
      });
      mediaId = mediaDoc.id;
      mediaFilename = mediaDoc.filename;
      if (mediaDoc.mimeType !== "image/webp" || !mediaFilename?.endsWith(".webp")) {
        throw new Error(`Media hook did not produce WebP for ${filename}: ${mediaFilename} (${mediaDoc.mimeType})`);
      }
      mediaByFilename.set(mediaFilename, mediaDoc);
    }

    if (priorMitra) {
      // A row that exists without a logo is not overwritten automatically.
      // This should not happen for the audited database; stop for review.
      throw new Error(`Mitra row exists with empty logo; refusing to update: ${name} (id ${priorMitra.id})`);
    }

    const mitraDoc = await payload.create({
      collection: "mitra",
      data: {
        nama: name,
        logo: mediaId,
        // Keep akiha at its existing order=1; new records follow it.
        urutan: index + 2,
      },
      overrideAccess: true,
    });

    created.push({ name, mitraId: mitraDoc.id, mediaId, mediaFilename, source: filename });
  }

  const finalMitra = await payload.find({ collection: "mitra", limit: 500, depth: 1, draft: true, overrideAccess: true });
  const finalMedia = await payload.find({ collection: "media", limit: 1000, depth: 0, draft: true, overrideAccess: true });
  const finalDocs = finalMitra.docs.map((doc) => ({
    id: doc.id,
    nama: doc.nama,
    urutan: doc.urutan,
    mediaId: typeof doc.logo === "object" ? doc.logo.id : doc.logo,
    filename: typeof doc.logo === "object" ? doc.logo.filename : null,
    mimeType: typeof doc.logo === "object" ? doc.logo.mimeType : null,
  }));
  const mediaWebp = finalMedia.docs.filter((doc) => doc.mimeType === "image/webp" && doc.filename?.endsWith(".webp")).length;
  const brokenRelations = finalDocs.filter((doc) => !doc.mediaId || !doc.filename || doc.mimeType !== "image/webp");
  if (finalMitra.totalDocs !== 21 || finalDocs.length !== 21 || mediaWebp < 21 || brokenRelations.length) {
    throw new Error(`Post-migration verification failed: mitra=${finalMitra.totalDocs}, WebP media=${mediaWebp}, bad relations=${brokenRelations.length}`);
  }

  console.log(JSON.stringify({
    created,
    preserved,
    totals: { mitra: finalMitra.totalDocs, media: finalMedia.totalDocs, webpMedia: mediaWebp },
    relations: finalDocs,
    failures,
  }, null, 2));
} catch (error) {
  failures.push({ error: error instanceof Error ? error.message : String(error) });
  console.error(JSON.stringify({ created, preserved, failures }, null, 2));
  process.exitCode = 1;
} finally {
  await payload.destroy();
}
