import type { GlobalConfig } from "payload";

import { siapaSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * Pengaturan situs global: identitas, kontak, jam operasional, topik
 * konsultasi, navigasi, sosial media, dan default SEO. Menggantikan
 * `src/data/situs.ts` & `src/data/kontak.ts` sebagai sumber yang dapat diubah
 * pengelola tanpa deploy ulang.
 */
export const PengaturanSitus: GlobalConfig = {
  slug: "pengaturan-situs",
  label: "Pengaturan Situs",
  access: {
    read: siapaSaja,
    update: stafPenulis,
  },
  hooks: {
    afterChange: [hookRevalidate(["pengaturan-situs", "artikel", "layanan"])],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Identitas",
          fields: [
            { name: "nama", label: "Nama Situs", type: "text", required: true },
            { name: "subjudul", label: "Subjudul", type: "text" },
            { name: "deskripsi", label: "Deskripsi", type: "textarea" },
          ],
        },
        {
          label: "Kontak",
          fields: [
            {
              name: "whatsappUrl",
              label: "URL WhatsApp",
              type: "text",
              admin: { description: "Tautan CTA Konsultasi Gratis." },
            },
            { name: "telepon", label: "Telepon", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "alamat", label: "Alamat", type: "textarea" },
            {
              name: "jamOperasional",
              label: "Jam Operasional",
              type: "array",
              fields: [
                { name: "hari", label: "Hari", type: "text", required: true },
                { name: "jam", label: "Jam", type: "text", required: true },
              ],
            },
            {
              name: "topikKonsultasi",
              label: "Topik Konsultasi (dropdown form)",
              type: "array",
              fields: [
                { name: "teks", label: "Topik", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Navigasi",
          fields: [
            {
              name: "navigasi",
              label: "Menu Navbar",
              type: "array",
              fields: [
                { name: "label", label: "Label", type: "text", required: true },
                { name: "href", label: "Tautan", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "Sosial",
          fields: [
            {
              name: "sosial",
              label: "Sosial Media",
              type: "array",
              fields: [
                {
                  name: "platform",
                  label: "Platform",
                  type: "select",
                  options: [
                    { label: "WhatsApp", value: "whatsapp" },
                    { label: "Instagram", value: "instagram" },
                    { label: "TikTok", value: "tiktok" },
                    { label: "Email", value: "email" },
                    { label: "Telepon", value: "telepon" },
                  ],
                  required: true,
                },
                { name: "url", label: "URL", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "SEO Default",
          fields: [
            {
              name: "seoJudul",
              label: "Judul Default",
              type: "text",
              admin: { description: "Dipakai bila halaman tidak punya judul SEO sendiri." },
            },
            {
              name: "seoDeskripsi",
              label: "Deskripsi Default",
              type: "textarea",
            },
          ],
        },
      ],
    },
  ],
};
