import type { CollectionConfig } from "payload";

import { adminSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * Testimonials (Testimoni) — Testimoni klien untuk carousel di beranda dan halaman layanan.
 * Menggunakan slug database `testimoni` agar kompatibel penuh dengan PostgreSQL.
 */
export const Testimonials: CollectionConfig = {
  slug: "testimoni",
  labels: { singular: "Testimoni", plural: "Testimoni" },
  admin: { useAsTitle: "nama", defaultColumns: ["nama", "peran", "urutan"], group: "Konten" },
  access: {
    read: () => true,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    afterChange: [hookRevalidate("testimoni")],
    afterDelete: [hookRevalidate("testimoni")],
  },
  fields: [
    { name: "nama", label: "Nama Klien", type: "text", required: true },
    { name: "peran", label: "Jabatan / Peran", type: "text", required: true },
    { name: "kutipan", label: "Kutipan", type: "textarea", required: true },
    {
      name: "inisial",
      label: "Inisial",
      type: "text",
      admin: { description: "1–3 huruf untuk avatar, mis. ES." },
    },
    {
      name: "rating",
      label: "Rating (1–5)",
      type: "number",
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    { name: "urutan", label: "Urutan Tampil", type: "number", defaultValue: 0 },
  ],
};

export const Testimoni = Testimonials;
export default Testimonials;
