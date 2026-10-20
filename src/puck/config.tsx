import type { Config } from "@puckeditor/core";

import { Artikel } from "@/components/sections/Artikel";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { CTA } from "@/components/sections/CTA";
import { Hero } from "@/components/sections/Hero";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { Layanan } from "@/components/sections/Layanan";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { MitraView } from "@/components/sections/MitraView";
import { TestimoniView } from "@/components/sections/TestimoniView";
import { KATEGORI_KOMPONEN, komponenGenerik } from "@/puck/komponen/puck";
import { DEFAULT_CTA, DEFAULT_HERO, DEFAULT_JUMLAH } from "@/puck/default-props";
import { metadataDari, NAMA_KOMPONEN_WEBSITE, type PropsPuck } from "@/puck/types";

/**
 * Registry komponen Page Builder.
 *
 * Satu konfigurasi dipakai bersama oleh dua runtime:
 *  - `Puck` (editor) di klien lewat `/admin/page-builder/:pageKey`.
 *  - `Render` (RSC) di server lewat `PuckRender` untuk halaman publik.
 *
 * Komponen di sini murni presentasional. Isi dinamis (layanan, artikel,
 * testimoni, mitra) tidak ditanam di dalam JSON layout, melainkan dikirim
 * lewat `metadata` dan diakses sebagai `puck.metadata`. Dengan begitu layout
 * tersimpan tetap ringan dan selalu menampilkan konten CMS terbaru.
 */

/** Batasi jumlah item agar layout tidak menarik data tak terbatas. */
function ambil<T>(daftar: T[] | undefined, jumlah: number): T[] {
  const aman = Array.isArray(daftar) ? daftar : [];
  const batas = Number.isFinite(jumlah) && jumlah > 0 ? jumlah : aman.length;
  return aman.slice(0, batas);
}

export const puckConfig: Config<PropsPuck> = {
  /* Field root sengaja didefinisikan meski tidak dapat disunting: tanpa ini
     Puck memakai `title` bawaan yang selalu kosong, sehingga panel "Page"
     menampilkan pengaturan palsu. Nilai sebenarnya diisi dari registry
     halaman lewat `rootPropsHalaman()` saat editor dan seeding dimuat. */
  root: {
    fields: {
      title: { type: "text", label: "Judul halaman" },
      rute: { type: "text", label: "Rute publik" },
      kunci: { type: "text", label: "Kunci halaman" },
    },
    defaultProps: { title: "", rute: "", kunci: "" },
  },
  /* Kategori drawer: section khas EasyTax dipisah dari komponen generik agar
     admin mudah menemukan "Section Website" vs blok layout/konten. */
  categories: {
    Layout: { title: "Layout", components: KATEGORI_KOMPONEN.Layout },
    Konten: { title: "Konten", components: KATEGORI_KOMPONEN.Konten },
    Kartu: { title: "Kartu", components: KATEGORI_KOMPONEN.Kartu },
    Interaktif: { title: "Interaktif", components: KATEGORI_KOMPONEN.Interaktif },
    "Section Website": { title: "Section Website", components: NAMA_KOMPONEN_WEBSITE },
  },
  components: {
    ...komponenGenerik,
    Hero: {
      label: "Hero",
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul (baris 1)" },
        sorotan: { type: "text", label: "Judul (sorotan kuning)" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        poin: {
          type: "array",
          label: "Poin bukti",
          arrayFields: { teks: { type: "text", label: "Teks" } },
          defaultItemProps: { teks: "" },
        },
        ctaLabel: { type: "text", label: "Tombol utama — teks" },
        ctaHref: { type: "text", label: "Tombol utama — tautan" },
        cta2Label: { type: "text", label: "Tombol kedua — teks" },
        cta2Href: { type: "text", label: "Tombol kedua — tautan" },
      },
      defaultProps: DEFAULT_HERO,
      render: ({
        lencana,
        judul,
        sorotan,
        deskripsi,
        poin,
        ctaLabel,
        ctaHref,
        cta2Label,
        cta2Href,
      }) => (
        <Hero
          lencana={lencana}
          judul={judul}
          sorotan={sorotan}
          deskripsi={deskripsi}
          poin={poin}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref || DEFAULT_HERO.ctaHref}
          cta2Label={cta2Label}
          cta2Href={cta2Href || DEFAULT_HERO.cta2Href}
        />
      ),
    },

    Keunggulan: {
      label: "Keunggulan",
      fields: {},
      defaultProps: {},
      render: () => <Keunggulan />,
    },

    Layanan: {
      label: "Layanan",
      fields: {
        jumlah: {
          type: "number",
          label: "Jumlah kartu",
          min: 1,
          max: 24,
        },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.Layanan },
      render: ({ jumlah, puck }) => (
        <Layanan layanan={ambil(metadataDari(puck).layanan, jumlah)} />
      ),
    },

    CaraKerja: {
      label: "Cara Kerja",
      fields: {},
      defaultProps: {},
      render: () => <CaraKerja />,
    },

    Artikel: {
      label: "Artikel",
      fields: {
        jumlah: {
          type: "number",
          label: "Jumlah artikel",
          min: 1,
          max: 60,
        },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.Artikel },
      render: ({ jumlah, puck }) => (
        <Artikel artikel={ambil(metadataDari(puck).artikel, jumlah)} />
      ),
    },

    Mitra: {
      label: "Mitra",
      fields: {
        jumlah: {
          type: "number",
          label: "Jumlah logo",
          min: 1,
          max: 60,
        },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.Mitra },
      render: ({ jumlah, puck }) => (
        <MitraView items={ambil(metadataDari(puck).mitra, jumlah)} />
      ),
    },

    MediaNasional: {
      label: "Liputan Media",
      fields: {},
      defaultProps: {},
      render: () => <MediaNasional />,
    },

    Testimoni: {
      label: "Testimoni",
      fields: {
        jumlah: {
          type: "number",
          label: "Jumlah testimoni",
          min: 1,
          max: 40,
        },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.Testimoni },
      render: ({ jumlah, puck }) => (
        <TestimoniView items={ambil(metadataDari(puck).testimoni, jumlah)} />
      ),
    },

    CTA: {
      label: "CTA Penutup",
      fields: {
        lencana: { type: "text", label: "Label kecil" },
        judul: { type: "text", label: "Judul" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        ctaLabel: { type: "text", label: "Tombol — teks" },
        ctaHref: { type: "text", label: "Tombol — tautan" },
        emailLabel: { type: "text", label: "Tombol email — teks" },
      },
      defaultProps: DEFAULT_CTA,
      render: ({ lencana, judul, deskripsi, ctaLabel, ctaHref, emailLabel }) => (
        <CTA
          lencana={lencana}
          judul={judul}
          deskripsi={deskripsi}
          ctaLabel={ctaLabel}
          ctaHref={ctaHref || DEFAULT_CTA.ctaHref}
          emailLabel={emailLabel}
        />
      ),
    },
  },
};
