import type { CollectionConfig } from "payload";

import { adminSaja, fieldAdminSaja, sudahLogin } from "../access";

/**
 * Koleksi autentikasi admin. Menjadi `admin.user` di payload.config.ts.
 * Hanya admin yang boleh menambah/menghapus akun; peran hanya bisa diubah
 * admin (field-level access), sehingga editor tidak dapat menaikkan haknya.
 */
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  labels: { singular: "Pengguna", plural: "Pengguna" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "nama", "role"],
    group: "Administrasi",
  },
  access: {
    read: sudahLogin,
    create: adminSaja,
    update: adminSaja,
    delete: adminSaja,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "nama",
      label: "Nama Lengkap",
      type: "text",
      required: true,
    },
    {
      name: "role",
      label: "Peran",
      type: "select",
      required: true,
      defaultValue: "admin",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      access: {
        update: fieldAdminSaja,
      },
      admin: {
        description: "Admin dapat mengelola pengguna; editor hanya mengelola konten.",
      },
    },
  ],
};
