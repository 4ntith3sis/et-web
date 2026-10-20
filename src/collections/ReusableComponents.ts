import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import { adminSaja, bacaTerbitAtauStaf, stafPenulis } from "../access";
import { validasiLayoutPuck } from "../puck/validation";

/**
 * Komponen dapat digunakan ulang (Reusable Components) untuk Page Builder.
 *
 * Disimpan sebagai struktur Puck (JSON) yang tervalidasi. Secara default,
 * komponen yang dimasukkan ke kanvas menjadi salinan independen. Tidak ada
 * hubungan shared/global secara otomatis.
 */
export const ReusableComponents: CollectionConfig = {
  slug: "reusable-components",
  labels: { singular: "Komponen Ulang Pakai", plural: "Komponen Ulang Pakai" },
  admin: {
    useAsTitle: "nama",
    group: "Tampilan",
    defaultColumns: ["nama", "kategori", "updatedAt"],
    description: "Section atau blok yang dapat ditambahkan kembali ke halaman.",
  },
  versions: { drafts: false },
  access: {
    read: bacaTerbitAtauStaf,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data;
        if (data.data !== undefined) {
          const hasil = validasiLayoutPuck(data.data);
          if (!hasil.ok) throw new APIError(hasil.error, 400);
          data.data = hasil.data;
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "nama",
      label: "Nama komponen",
      type: "text",
      required: true,
      admin: { description: "Nama yang terlihat di panel My Components." },
    },
    {
      name: "deskripsi",
      label: "Deskripsi",
      type: "textarea",
      admin: { description: "Ringkasan opsional." },
    },
    {
      name: "kategori",
      label: "Kategori",
      type: "select",
      options: [
        { label: "Layout", value: "Layout" },
        { label: "Konten", value: "Konten" },
        { label: "Kartu", value: "Kartu" },
        { label: "Interaktif", value: "Interaktif" },
        { label: "Section Website", value: "Section Website" },
        { label: "Lain-lain", value: "Lain-lain" },
      ],
      defaultValue: "Lain-lain",
    },
    {
      name: "data",
      label: "Data Puck",
      type: "json",
      required: true,
      validate: (value: unknown) => {
        const hasil = validasiLayoutPuck(value);
        return hasil.ok ? true : hasil.error;
      },
      admin: {
        description: "Struktur komponen (root + content) yang akan disalin ke kanvas.",
      },
    },
    {
      name: "versi",
      label: "Versi",
      type: "number",
      defaultValue: 1,
      admin: { position: "sidebar", readOnly: true },
    },
  ],
};
