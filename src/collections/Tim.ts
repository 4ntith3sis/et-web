import type { CollectionConfig } from "payload";

import { adminSaja, siapaSaja, stafPenulis } from "../access";
import { hookRevalidate } from "../cms/revalidate";

/** Anggota tim konsultan untuk section /tentang-kami. */
export const Tim: CollectionConfig = {
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
