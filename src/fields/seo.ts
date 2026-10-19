import type { Field } from "payload";

/**
 * Grup field SEO yang dapat dipakai ulang pada koleksi maupun global.
 * Nilai ini dipetakan ke metadata Next.js oleh lapisan `src/cms/*`, sehingga
 * perilaku SEO situs tetap dikendalikan dari satu tempat.
 */
export const fieldSeo: Field = {
  name: "seo",
  label: "SEO",
  type: "group",
  fields: [
    {
      name: "judul",
      label: "Judul SEO",
      type: "text",
      admin: {
        description:
          "Judul untuk tab browser dan hasil pencarian. Kosongkan untuk memakai judul utama.",
      },
    },
    {
      name: "deskripsi",
      label: "Deskripsi SEO",
      type: "textarea",
      admin: {
        description: "Ringkasan 150–160 karakter untuk mesin pencari.",
      },
    },
    {
      name: "gambar",
      label: "Gambar OG",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Gambar pratinjau saat tautan dibagikan (Open Graph).",
      },
    },
    {
      name: "janganIndeks",
      label: "Jangan indeks halaman ini",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};
