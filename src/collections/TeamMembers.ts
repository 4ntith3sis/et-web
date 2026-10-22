import type { CollectionConfig } from "payload";

import { adminSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/**
 * TeamMembers (Tim) — Anggota tim konsultan untuk section tim & tentang-kami.
 * Menggunakan slug database `tim` agar kompatibel penuh dengan PostgreSQL.
 */
export const TeamMembers: CollectionConfig = {
  slug: "tim",
  labels: { singular: "Anggota Tim", plural: "Anggota Tim" },
  admin: { useAsTitle: "nama", defaultColumns: ["nama", "jabatan", "urutan"], group: "Konten" },
  access: {
    read: () => true,
    create: stafPenulis,
    update: stafPenulis,
    delete: adminSaja,
  },
  hooks: {
    afterChange: [hookRevalidate("tim")],
    afterDelete: [hookRevalidate("tim")],
  },
  fields: [
    { name: "nama", label: "Nama", type: "text", required: true },
    { name: "jabatan", label: "Jabatan", type: "text", required: true },
    { name: "lisensi", label: "Lisensi", type: "text" },
    {
      name: "level",
      label: "Level",
      type: "select",
      options: [
        { label: "A", value: "A" },
        { label: "B", value: "B" },
        { label: "C", value: "C" },
      ],
    },
    {
      name: "foto",
      label: "Foto",
      type: "upload",
      relationTo: "media",
    },
    { name: "bio", label: "Bio Singkat", type: "textarea" },
    { name: "urutan", label: "Urutan Tampil", type: "number", defaultValue: 0 },
  ],
};

export const Tim = TeamMembers;
export default TeamMembers;
