import type { CollectionConfig } from "payload";

import { adminSaja, siapaSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

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
    afterChange: [hookRevalidate(["artikel", "layanan", "mitra", "tim"])],
    afterDelete: [hookRevalidate(["artikel", "layanan", "mitra", "tim"])],
  },
  upload: {
    mimeTypes: ["image/*"],
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
