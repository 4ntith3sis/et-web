import type { CollectionConfig } from "payload";

import { adminSaja, bacaTerbitAtauStaf, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";
import { fieldSeo } from "../fields/seo";
import { formatSlug } from "../lib/slug";

/**
 * Services (Layanan) — sumber data untuk katalog /layanan, kartu di beranda,
 * dan halaman detail /layanan/[slug] (paket harga + FAQ).
 * Menggunakan slug database `layanan` agar kompatibel penuh dengan PostgreSQL.
 */
export const Services: CollectionConfig = {
  slug: "layanan",
  labels: { singular: "Layanan", plural: "Layanan" },
  admin: {
    useAsTitle: "judul",
    defaultColumns: ["judul", "slug", "urutan", "_status"],
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
    afterChange: [hookRevalidate("layanan")],
    afterDelete: [hookRevalidate("layanan")],
  },
  access: {
    read: bacaTerbitAtauStaf,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  fields: [
    {
      name: "judul",
      label: "Nama Layanan",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      label: "Slug (URL)",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        position: "sidebar",
        description: "Alamat URL, mis. restitusi-pajak. Ubah dengan hati-hati.",
      },
    },
    {
      name: "subjudul",
      label: "Subjudul",
      type: "text",
    },
    {
      name: "ringkasan",
      label: "Ringkasan",
      type: "textarea",
      required: true,
    },
    {
      name: "gambar",
      label: "Gambar Sampul",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "paket",
      label: "Paket Harga",
      type: "array",
      labels: { singular: "Paket", plural: "Paket" },
      fields: [
        { name: "nama", label: "Nama Paket", type: "text", required: true },
        { name: "deskripsi", label: "Deskripsi", type: "textarea" },
        { name: "harga", label: "Harga", type: "text", required: true },
        {
          name: "satuan",
          label: "Satuan",
          type: "text",
          admin: { description: 'Mis. "/bulan" atau "/paket".' },
        },
        {
          name: "fitur",
          label: "Fitur",
          type: "array",
          fields: [{ name: "teks", label: "Fitur", type: "text", required: true }],
        },
      ],
    },
    {
      name: "faq",
      label: "FAQ",
      type: "array",
      labels: { singular: "FAQ", plural: "FAQ" },
      fields: [
        { name: "pertanyaan", label: "Pertanyaan", type: "text", required: true },
        { name: "jawaban", label: "Jawaban", type: "textarea", required: true },
      ],
    },
    {
      name: "urutan",
      label: "Urutan Tampil",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Angka kecil tampil lebih dahulu.",
      },
    },
    fieldSeo,
  ],
};

export const Layanan = Services;
export default Services;
