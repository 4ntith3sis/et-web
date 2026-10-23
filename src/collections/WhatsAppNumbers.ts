import type { CollectionConfig } from "payload";

import { adminSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * Normalisasi nomor WhatsApp:
 * Menghilangkan tanda '+', spasi, tanda kurung, dan tanda hubung.
 * Tidak mengubah digit negara secara sembarang.
 */
export function normalisasiNomorWA(nomor?: string | null): string {
  if (!nomor) return "";
  return nomor.replace(/[\s+().-]/g, "").trim();
}

/**
 * Validasi nomor WhatsApp internasional:
 * Harus terdiri dari 8 hingga 16 digit numerik.
 */
export function validasiNomorWA(nomor?: string | null): boolean {
  if (!nomor) return false;
  const bersih = normalisasiNomorWA(nomor);
  return /^[0-9]{8,16}$/.test(bersih);
}

/**
 * WhatsAppNumbers (NomorWhatsApp) — Koleksi untuk mengelola nomor WhatsApp konsultasi
 * dengan dukungan strategi routing (random, weighted, round-robin, priority/manual).
 * Menggunakan slug database `nomor-whatsapp`.
 */
export const WhatsAppNumbers: CollectionConfig = {
  slug: "nomor-whatsapp",
  labels: {
    singular: "WhatsApp Routing",
    plural: "WhatsApp Routing",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "phoneNumber", "enabled", "priority", "weight", "assignedCount"],
    group: "WhatsApp",
  },
  access: {
    // Pengunjung publik tidak perlu mengakses daftar lengkap nomor WhatsApp melalui REST API
    read: stafPenulis,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data;
        if (data.phoneNumber) {
          // Bersihkan karakter pemisah namun pertahankan digit internasional
          data.phoneNumber = normalisasiNomorWA(data.phoneNumber);
        }
        return data;
      },
    ],
    afterChange: [hookRevalidate(["whatsapp-config", "pengaturan-situs"])],
    afterDelete: [hookRevalidate(["whatsapp-config", "pengaturan-situs"])],
  },
  fields: [
    {
      name: "label",
      label: "Label / Nama Konsultan",
      type: "text",
      required: true,
      admin: {
        description: "Identitas nomor, mis. 'Konsultasi Umum', 'Konsultan Pajak Utama', atau 'Konsultan A'.",
      },
    },
    {
      name: "phoneNumber",
      label: "Nomor WhatsApp (Internasional)",
      type: "text",
      required: true,
      validate: (val: unknown) => {
        if (typeof val !== "string" || !val.trim()) {
          return "Nomor WhatsApp wajib diisi.";
        }
        if (!validasiNomorWA(val)) {
          return "Nomor WhatsApp tidak valid. Masukkan 8-16 digit angka dengan kode negara (contoh: 6281234567890).";
        }
        return true;
      },
      admin: {
        description: "Format nomor dengan kode negara tanpa simbol '+' (contoh: 6281119200080 atau 6281234567890).",
      },
    },
    {
      name: "enabled",
      label: "Status Aktif",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Hanya nomor aktif yang akan diikutsertakan dalam pembagian giliran konsultasi.",
      },
    },
    {
      name: "priority",
      label: "Tingkat Prioritas",
      type: "number",
      defaultValue: 1,
      min: 1,
      admin: {
        description: "Angka prioritas (1 = prioritas utama). Digunakan pada strategi Priority/Manual.",
      },
    },
    {
      name: "weight",
      label: "Bobot Distribusi (Weight)",
      type: "number",
      defaultValue: 1,
      min: 1,
      admin: {
        description: "Peluang relatif pemilihan pada strategi Weighted Random (mis. bobot 3 dipilih 3x lebih sering dari bobot 1).",
      },
    },
    {
      name: "notes",
      label: "Catatan Internal",
      type: "textarea",
      admin: {
        description: "Catatan internal opsional (jadwal shift, penanggung jawab, dll.).",
      },
    },
    {
      name: "assignedCount",
      label: "Total Konsultasi Diarahkan",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Jumlah pengunjung yang telah diarahkan ke nomor ini.",
      },
    },
    {
      name: "lastAssignedAt",
      label: "Terakhir Diarahkan",
      type: "date",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Waktu terakhir kali nomor ini dipilih oleh sistem routing.",
      },
    },
  ],
};

export const NomorWhatsApp = WhatsAppNumbers;
export default WhatsAppNumbers;
