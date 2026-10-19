import type { CollectionConfig } from "payload";

import { adminSaja, stafPenulis } from "../access";

/**
 * Pesan dari form /kontak. TIDAK dapat dibuat lewat REST publik (create
 * hanya untuk admin); pengiriman dari form melewati route handler
 * `src/app/(website)/api/kontak/route.ts` yang memvalidasi input lalu
 * menulis dengan `overrideAccess`. Isi pesan juga tidak dapat dibaca publik.
 */
export const PesanKontak: CollectionConfig = {
  slug: "pesan-kontak",
  labels: { singular: "Pesan Kontak", plural: "Pesan Kontak" },
  admin: {
    useAsTitle: "nama",
    defaultColumns: ["nama", "email", "topik", "status", "createdAt"],
    group: "Kontak",
  },
  access: {
    create: adminSaja,
    read: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  fields: [
    { name: "nama", label: "Nama", type: "text", required: true },
    { name: "bisnis", label: "Bisnis / Perusahaan", type: "text" },
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
    },
    { name: "whatsapp", label: "No. WhatsApp", type: "text", required: true },
    { name: "topik", label: "Topik Konsultasi", type: "text", required: true },
    { name: "pesan", label: "Pesan", type: "textarea", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      defaultValue: "baru",
      options: [
        { label: "Baru", value: "baru" },
        { label: "Dibaca", value: "dibaca" },
        { label: "Dibalas", value: "dibalas" },
        { label: "Arsip", value: "arsip" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "meta",
      label: "Metadata Pengirim",
      type: "group",
      admin: { description: "Diisi otomatis oleh server." },
      fields: [
        { name: "ip", label: "IP", type: "text" },
        { name: "userAgent", label: "User Agent", type: "text" },
      ],
    },
  ],
};
