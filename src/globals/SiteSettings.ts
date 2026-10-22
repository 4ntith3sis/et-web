import type { GlobalConfig } from "payload";

import { siapaSaja, stafPenulis, fieldStafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * SiteSettings (PengaturanSitus) — Pengaturan situs global: identitas, kontak,
 * jam operasional, topik konsultasi, navigasi, sosial media, dan default SEO.
 * Menggunakan slug database `pengaturan-situs` agar kompatibel penuh dengan PostgreSQL.
 */
export const SiteSettings: GlobalConfig = {
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
          label: "WhatsApp & Routing",
          fields: [
            {
              name: "whatsappEnabled",
              label: "Aktifkan Konsultasi WhatsApp",
              type: "checkbox",
              defaultValue: true,
              admin: {
                description: "Bila dinonaktifkan, tombol konsultasi akan diarahkan ke form kontak atau dinonaktifkan.",
              },
            },
            {
              name: "whatsappRoutingStrategy",
              label: "Strategi Routing WhatsApp",
              type: "select",
              defaultValue: "round-robin",
              access: {
                read: fieldStafPenulis,
              },
              options: [
                { label: "Round Robin (Bergilir Merata)", value: "round-robin" },
                { label: "Random (Acak)", value: "random" },
                { label: "Weighted Random (Berdasarkan Bobot)", value: "weighted" },
                { label: "Priority / Manual (Prioritas Tertinggi / Manual)", value: "priority" },
              ],
              admin: {
                description: "Metode distribusi giliran nomor konsultasi kepada pengunjung.",
              },
            },
            {
              name: "defaultWhatsAppMessage",
              label: "Pesan Pembuka WhatsApp Default",
              type: "textarea",
              defaultValue: "Halo EasyTax, saya ingin berkonsultasi mengenai perpajakan perusahaan saya.",
              access: {
                read: fieldStafPenulis,
              },
              admin: {
                description: "Pesan pembuka default saat tombol diklik bila tidak ada pesan spesifik dari halaman/layanan.",
              },
            },
            {
              name: "fallbackWhatsAppNumber",
              label: "Nomor WhatsApp Cadangan (Fallback)",
              type: "text",
              access: {
                read: fieldStafPenulis,
              },
              admin: {
                description: "Nomor cadangan bila seluruh nomor aktif sedang tidak tersedia (contoh: 6281119200080).",
              },
            },
            {
              name: "whatsappButtonLabel",
              label: "Label Tombol WhatsApp Default",
              type: "text",
              defaultValue: "Konsultasi Gratis",
              admin: {
                description: "Teks bawaan pada tombol konsultasi di seluruh website.",
              },
            },
            {
              name: "manualWhatsAppNumber",
              label: "Nomor Manual Terpilih (Khusus Strategi Priority/Manual)",
              type: "relationship",
              relationTo: "nomor-whatsapp",
              access: {
                read: fieldStafPenulis,
              },
              admin: {
                description: "Pilih nomor konsultan yang selalu digunakan jika strategi diset ke Priority/Manual.",
              },
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

export const PengaturanSitus = SiteSettings;
export default SiteSettings;
