import type { CollectionConfig } from "payload";

import { adminSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * ClientLogos (Mitra) — Logo mitra/klien untuk carousel di beranda dan /layanan.
 * Menggunakan slug database `mitra` agar kompatibel penuh dengan PostgreSQL.
 */
export const ClientLogos: CollectionConfig = {
  slug: "mitra",
  labels: { singular: "Logo Mitra", plural: "Logo Mitra" },
  admin: { useAsTitle: "nama", defaultColumns: ["nama", "urutan"], group: "Konten" },
  access: {
    read: () => true,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    afterChange: [hookRevalidate("mitra")],
    afterDelete: [hookRevalidate("mitra")],
  },
  fields: [
    { name: "nama", label: "Nama Mitra", type: "text", required: true },
    {
      name: "logo",
      label: "Logo",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    { name: "urutan", label: "Urutan Tampil", type: "number", defaultValue: 0 },
  ],
};

export const Mitra = ClientLogos;
export default ClientLogos;
