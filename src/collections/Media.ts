import { ValidationError, type CollectionConfig, type PayloadRequest } from "payload";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

import { adminSaja, siapaSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/** Konversi raster sebelum Payload menghitung metadata dan menghasilkan ukuran turunannya. */
export async function konversiUploadKeWebp(req: PayloadRequest): Promise<void> {
  const file = req.file;
  if (!file) return;
  const bytes = file.data ?? (file.tempFilePath ? await readFile(file.tempFilePath) : undefined);
  if (!bytes || file.size > 20 * 1024 * 1024) {
    throw new ValidationError({ collection: "media", errors: [{ path: "file", message: "File kosong atau melebihi batas 20 MB." }], req });
  }

  const svg = /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(bytes.toString("utf8", 0, Math.min(bytes.length, 4096)));
  if (svg) {
    if (file.mimetype.toLowerCase() !== "image/svg+xml" || !file.name.toLowerCase().endsWith(".svg")) {
      throw new ValidationError({ collection: "media", errors: [{ path: "file", message: "SVG harus dikirim sebagai image/svg+xml dengan ekstensi .svg." }], req });
    }
    return;
  }
  const image = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
  const actual = await image.metadata().catch(() => null);
  const supported = new Set(["jpeg", "png", "webp", "tiff", "avif"]);
  if (!actual?.format || !supported.has(actual.format)) {
    throw new ValidationError({ collection: "media", errors: [{ path: "file", message: "Format gambar tidak didukung atau file tidak valid." }], req });
  }
  if (!actual.width || !actual.height || actual.width > 10000 || actual.height > 10000) {
    throw new ValidationError({ collection: "media", errors: [{ path: "file", message: "Dimensi gambar tidak valid atau melebihi 10.000 piksel." }], req });
  }

  // WebP yang sudah benar tidak dienkode ulang agar tidak ada generasi lossy
  // kedua. Nama/ekstensi tetap diselaraskan dengan isi file sebenarnya.
  if (actual.format === "webp") {
    req.file = {
      ...file,
      data: bytes,
      size: bytes.byteLength,
      mimetype: "image/webp",
      name: file.name.toLowerCase().endsWith(".webp")
        ? file.name
        : `${file.name.replace(/\.[^.]+$/, "")}.webp`,
    };
    return;
  }

  try {
    const alpha = actual.hasAlpha === true;
    // Sharp normalizes EXIF orientation here; Payload then receives orientation-free pixels.
    let pipeline = image.rotate();
    let converted: Buffer;
    if (alpha && actual.format === "png") {
      const lossless = await pipeline.clone().webp({ lossless: true, effort: 5 }).toBuffer();
      const lossy = await pipeline.clone().webp({ quality: 88, effort: 5 }).toBuffer();
      const [losslessAlpha, lossyAlpha] = await Promise.all([
        sharp(lossless).extractChannel("alpha").raw().toBuffer(),
        sharp(lossy).extractChannel("alpha").raw().toBuffer(),
      ]);
      if (!losslessAlpha.equals(lossyAlpha) || lossy.length < 12 || lossy.toString("ascii", 0, 4) !== "RIFF" || lossy.toString("ascii", 8, 12) !== "WEBP") {
        throw new Error("WebP tidak mempertahankan channel transparansi.");
      }
      converted = lossy;
    } else {
      converted = await pipeline.webp(alpha ? { lossless: true, effort: 5 } : { quality: 88, effort: 5 }).toBuffer();
    }
    const outputMetadata = await sharp(converted).metadata();
    if (outputMetadata.format !== "webp" || !outputMetadata.width || !outputMetadata.height || (alpha && !outputMetadata.hasAlpha)) {
      throw new Error("Validasi keluaran WebP gagal.");
    }
    if (file.tempFilePath) await writeFile(file.tempFilePath, converted);
    req.file = {
      ...file,
      data: converted,
      size: converted.byteLength,
      mimetype: "image/webp",
      name: file.name.replace(/\.[^.]+$/, "") + ".webp",
    };
  } catch (error) {
    req.payload.logger.error({ err: error, msg: "Gagal mengonversi gambar ke WebP." });
    throw new ValidationError({ collection: "media", errors: [{ path: "file", message: "Gambar gagal diproses; file tidak disimpan." }], req });
  }
}

/**
 * Media terunggah untuk gambar konten (sampul layanan/artikel, foto tim,
 * logo mitra). Publik boleh membaca agar gambar tampil di situs; hanya staf
 * yang boleh mengunggah/menghapus.
 */
export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Media", plural: "Media" },
  admin: {
    group: "Administrasi",
  },
  access: {
    read: siapaSaja,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    beforeOperation: [
      async ({ args, operation, req }) => {
        if ((operation === "create" || operation === "update") && req.file) await konversiUploadKeWebp(req);
        return args;
      },
    ],
    afterChange: [hookRevalidate(["artikel", "layanan", "mitra", "tim"])],
    afterDelete: [hookRevalidate(["artikel", "layanan", "mitra", "tim"])],
  },
  upload: {
    // Bound uploads before Sharp allocates decoded pixels. SVG is allowed as a
    // vector asset, but animated/opaque formats are intentionally excluded.
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/tiff", "image/avif"],
    withMetadata: true,
    // Path absolut agar host memakai <proyek>/media dan container memakai
    // /app/media (mount `./media:/app/media`), bukan path relatif CWD.
    staticDir: path.resolve(process.cwd(), "media"),
    adminThumbnail: "kartu",
    imageSizes: [
      { name: "kartu", width: 640, height: 400, position: "centre" },
      { name: "sampul", width: 1280, height: 720, position: "centre" },
      { name: "kecil", width: 400 },
    ],
  },
  fields: [
    {
      name: "alt",
      label: "Teks Alternatif",
      type: "text",
      required: true,
      admin: {
        description: "Deskripsi singkat gambar untuk aksesibilitas dan SEO.",
      },
    },
  ],
};
