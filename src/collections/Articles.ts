import type { CollectionConfig } from "payload";

import { adminSaja, bacaTerbitAtauStaf, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";
import { fieldSeo } from "../fields/seo";
import { formatSlug } from "../lib/slug";
import { hookIndexArtikelRAG, hookHapusArtikelRAG } from "../rag/hooks";

/**
 * Articles (Artikel) — sumber data untuk artikel perpajakan.
 * Menggunakan slug database `artikel` agar kompatibel penuh dengan PostgreSQL.
 */
export const Articles: CollectionConfig = {
  slug: "artikel",
  labels: { singular: "Artikel", plural: "Artikel" },
  admin: {
    useAsTitle: "judul",
    defaultColumns: ["judul", "kategori", "tanggalTerbit", "_status"],
    group: "Konten",
  },
  versions: { drafts: true },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        const target = data.slug || data.judul;
        if (target) {
          data.slug = formatSlug(target);
        }
        return data;
      },
    ],
    afterChange: [hookRevalidate("artikel"), hookIndexArtikelRAG],
    afterDelete: [hookRevalidate("artikel"), hookHapusArtikelRAG],
  },
  access: {
    read: bacaTerbitAtauStaf,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  fields: [
    { name: "judul", label: "Judul", type: "text", required: true },
    {
      name: "slug",
      label: "Slug (URL)",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "ringkasan",
      label: "Ringkasan",
      type: "textarea",
      required: true,
      admin: {
        description:
          "Tampil pada kartu daftar artikel dan sebagai meta description.",
      },
    },
    {
      name: "sampul",
      label: "Gambar Sampul",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "kategori",
      label: "Kategori",
      type: "relationship",
      relationTo: "kategori",
      required: true,
    },
    {
      name: "tag",
      label: "Tag",
      type: "array",
      fields: [{ name: "teks", label: "Tag", type: "text", required: true }],
    },
    {
      name: "penulis",
      label: "Penulis",
      type: "relationship",
      relationTo: "users",
      admin: { position: "sidebar" },
    },
    {
      name: "tanggalTerbit",
      label: "Tanggal Terbit",
      type: "date",
      admin: { position: "sidebar", date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "waktuBaca",
      label: "Estimasi Waktu Baca",
      type: "text",
      admin: { position: "sidebar" },
    },
    {
      name: "blok",
      label: "Isi Artikel",
      type: "blocks",
      labels: { singular: "Blok Isi", plural: "Blok Isi" },
      blocks: [
        {
          slug: "paragraf",
          labels: { singular: "Paragraf", plural: "Paragraf" },
          fields: [
            { name: "teks", label: "Teks", type: "textarea", required: true },
          ],
        },
        {
          slug: "judul-bagian",
          labels: { singular: "Sub-judul", plural: "Sub-judul" },
          fields: [
            { name: "teks", label: "Teks", type: "text", required: true },
            {
              name: "level",
              label: "Tingkat Heading",
              type: "select",
              required: true,
              defaultValue: "2",
              options: [
                { label: "H2", value: "2" },
                { label: "H3", value: "3" },
                { label: "H4", value: "4" },
              ],
            },
          ],
        },
        {
          slug: "daftar",
          labels: { singular: "Daftar", plural: "Daftar" },
          fields: [
            {
              name: "terurut",
              label: "Daftar Bernomor",
              type: "checkbox",
              defaultValue: false,
            },
            {
              name: "item",
              label: "Item",
              type: "array",
              fields: [
                { name: "teks", label: "Teks", type: "text", required: true },
              ],
            },
          ],
        },
      ],
    },
    fieldSeo,
  ],
};

export const Artikel = Articles;
export default Articles;
