import type { Config } from "@puckeditor/core";

import { Artikel } from "@/components/sections/Artikel";
import { ArtikelDetailHero } from "@/components/sections/ArtikelDetailHero";
import { ArtikelTerkait } from "@/components/sections/ArtikelTerkait";
import { BadanArtikel } from "@/components/sections/BadanArtikel";
import { CaraKerja } from "@/components/sections/CaraKerja";
import { CeritaKami } from "@/components/sections/CeritaKami";
import { CTA } from "@/components/sections/CTA";
import { DaftarArtikel, ambilKategori } from "@/components/sections/DaftarArtikel";
import { DaftarLayanan } from "@/components/sections/DaftarLayanan";
import { FaqKontak } from "@/components/sections/FaqKontak";
import { FaqLayanan } from "@/components/sections/FaqLayanan";
import { FormPertanyaan } from "@/components/sections/FormPertanyaan";
import { HargaLayanan } from "@/components/sections/HargaLayanan";
import { Hero } from "@/components/sections/Hero";
import { Keunggulan } from "@/components/sections/Keunggulan";
import { KontakHero } from "@/components/sections/KontakHero";
import { Layanan } from "@/components/sections/Layanan";
import { LayananDetailHero } from "@/components/sections/LayananDetailHero";
import { LayananHero } from "@/components/sections/LayananHero";
import { LokasiKantorView } from "@/components/sections/LokasiKantorView";
import { MediaNasional } from "@/components/sections/MediaNasional";
import { MitraView } from "@/components/sections/MitraView";
import { PengantarArtikel } from "@/components/sections/PengantarArtikel";
import { TentangHero } from "@/components/sections/TentangHero";
import { TestimoniView } from "@/components/sections/TestimoniView";
import { TimKonsultanView } from "@/components/sections/TimKonsultanView";
import { KATEGORI_KOMPONEN, komponenGenerik } from "@/puck/komponen/puck";
import {
  DEFAULT_CARA_KERJA,
  DEFAULT_CTA,
  DEFAULT_FAQ_LAYANAN,
  DEFAULT_HARGA_LAYANAN,
  DEFAULT_HERO,
  DEFAULT_JUMLAH,
  DEFAULT_KEUNGGULAN,
  DEFAULT_LAYANAN_DETAIL_HERO,
  DEFAULT_MEDIA_NASIONAL,
  DEFAULT_MITRA,
  DEFAULT_TESTIMONI,
} from "@/puck/default-props";
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

/** Section statis / yang mengambil data sendiri: tanpa field yang dapat disunting. */
const STATIS = { fields: {}, defaultProps: {} } as const;

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
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        perataan: {
          type: "radio",
          label: "Perataan teks",
          options: [
            { label: "Kiri", value: "kiri" },
            { label: "Tengah", value: "tengah" },
          ],
        },
      },
      defaultProps: DEFAULT_KEUNGGULAN,
      render: ({ lencana, judul, deskripsi, perataan }) => (
        <Keunggulan desain={{ lencana, judul, deskripsi, perataan }} />
      ),
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
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
      },
      defaultProps: DEFAULT_CARA_KERJA,
      render: ({ lencana, judul }) => (
        <CaraKerja desain={{ lencana, judul }} />
      ),
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
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        jumlah: {
          type: "number",
          label: "Jumlah logo",
          min: 1,
          max: 60,
        },
      },
      defaultProps: DEFAULT_MITRA,
      render: ({ lencana, judul, deskripsi, jumlah, puck }) => (
        <MitraView
          items={ambil(metadataDari(puck).mitra, jumlah)}
          desain={{ lencana, judul, deskripsi }}
        />
      ),
    },

    MediaNasional: {
      label: "Liputan Media",
      fields: {
        judul: { type: "text", label: "Judul section" },
      },
      defaultProps: DEFAULT_MEDIA_NASIONAL,
      render: ({ judul }) => <MediaNasional desain={{ judul }} />,
    },

    Testimoni: {
      label: "Testimoni",
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        jumlah: {
          type: "number",
          label: "Jumlah testimoni",
          min: 1,
          max: 40,
        },
      },
      defaultProps: DEFAULT_TESTIMONI,
      render: ({ lencana, judul, deskripsi, jumlah, puck }) => (
        <TestimoniView
          items={ambil(metadataDari(puck).testimoni, jumlah)}
          desain={{ lencana, judul, deskripsi }}
        />
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

    /* ------------------------------------------------- Hero halaman statis */
    TentangHero: {
      label: "Hero Tentang Kami",
      ...STATIS,
      render: () => <TentangHero />,
    },

    LayananHero: {
      label: "Hero Layanan",
      ...STATIS,
      render: () => <LayananHero />,
    },

    KontakHero: {
      label: "Hero Kontak",
      ...STATIS,
      render: () => <KontakHero />,
    },

    /* ----------------------------------------------------- Tentang Kami */
    CeritaKami: {
      label: "Cerita Kami",
      ...STATIS,
      render: () => <CeritaKami />,
    },

    TimKonsultan: {
      label: "Tim Konsultan",
      ...STATIS,
      render: ({ puck }) => <TimKonsultanView tim={metadataDari(puck).tim} />,
    },

    /* ---------------------------------------------------------- Kontak */
    FormPertanyaan: {
      label: "Form Pertanyaan",
      ...STATIS,
      render: ({ puck }) => {
        const meta = metadataDari(puck);
        return (
          <FormPertanyaan
            topikKonsultasi={meta.topikKonsultasi}
            jamOperasional={meta.jamOperasional}
          />
        );
      },
    },

    LokasiKantor: {
      label: "Lokasi Kantor",
      ...STATIS,
      render: ({ puck }) => (
        <LokasiKantorView jamOperasional={metadataDari(puck).jamOperasional} />
      ),
    },

    FaqKontak: {
      label: "FAQ Kontak",
      ...STATIS,
      render: () => <FaqKontak />,
    },

    /* ------------------------------------------------- Halaman listing */
    DaftarLayanan: {
      label: "Daftar Layanan",
      fields: {
        jumlah: {
          type: "number",
          label: "Jumlah kartu",
          min: 1,
          max: 40,
        },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.DaftarLayanan },
      render: ({ jumlah, puck }) => (
        <DaftarLayanan layanan={ambil(metadataDari(puck).layanan, jumlah)} />
      ),
    },

    PengantarArtikel: {
      label: "Pengantar Artikel",
      ...STATIS,
      render: () => <PengantarArtikel />,
    },

    DaftarArtikel: {
      label: "Daftar Artikel",
      fields: {
        perHalaman: {
          type: "number",
          label: "Artikel per halaman",
          min: 1,
          max: 24,
        },
      },
      defaultProps: { perHalaman: DEFAULT_JUMLAH.DaftarArtikel },
      render: ({ perHalaman, puck }) => {
        const meta = metadataDari(puck);
        const semua = meta.artikel;
        const kategori = ambilKategori(semua);

        /* Halaman listing menghitung sendiri state URL (pencarian, filter
           kategori, paginasi) lalu mengirimnya lewat konteks. Tanpa konteks
           — mis. saat kanvas editor dirender — komponen memakai daftar
           lengkap, seperti sebelumnya. */
        const ctx = meta.konteks?.daftarArtikel;
        if (ctx) {
          return (
            <DaftarArtikel
              artikel={ctx.daftar}
              kategori={kategori}
              kategoriAktif={ctx.kategoriAktif}
              page={ctx.page}
              totalPages={ctx.totalPages}
              totalDocs={ctx.totalDocs}
              kueri={ctx.kueri}
            />
          );
        }

        const batas = Number.isFinite(perHalaman) && perHalaman > 0 ? perHalaman : DEFAULT_JUMLAH.DaftarArtikel;
        const totalPages = Math.max(1, Math.ceil(semua.length / batas));
        return (
          <DaftarArtikel
            artikel={semua.slice(0, batas)}
            kategori={kategori}
            page={1}
            totalPages={totalPages}
            totalDocs={semua.length}
            kueri=""
          />
        );
      },
    },

    /* -------------------------------------- Template detail layanan */
    LayananDetailHero: {
      label: "Hero Detail Layanan",
      fields: {
        lencana: { type: "text", label: "Label kecil (lencana)" },
        judul: { type: "text", label: "Judul / Nama Layanan" },
        subjudul: { type: "text", label: "Subjudul (warna kuning)" },
        ringkasan: { type: "textarea", label: "Deskripsi / ringkasan" },
        teksGambar: { type: "text", label: "Teks pada shape gambar" },
        breadcrumbBeranda: { type: "text", label: "Breadcrumb — Beranda" },
        breadcrumbLayanan: { type: "text", label: "Breadcrumb — Layanan" },
        ctaLabel: { type: "text", label: "Tombol — teks" },
        ctaHref: { type: "text", label: "Tombol — tautan" },
        perataan: {
          type: "radio",
          label: "Perataan teks",
          options: [
            { label: "Kiri", value: "kiri" },
            { label: "Tengah", value: "tengah" },
          ],
        },
      },
      defaultProps: DEFAULT_LAYANAN_DETAIL_HERO,
      render: ({
        lencana,
        judul,
        subjudul,
        ringkasan,
        teksGambar,
        breadcrumbBeranda,
        breadcrumbLayanan,
        ctaLabel,
        ctaHref,
        perataan,
        puck,
      }) => {
        const layanan = metadataDari(puck).konteks.layanan?.layanan;
        if (!layanan)
          return (
            <BagianPeringatan pesan="Belum ada layanan untuk slug ini. Buka pratinjau untuk melihat data slug." />
          );
        return (
          <LayananDetailHero
            layanan={layanan}
            desain={{
              lencana,
              judul,
              subjudul,
              ringkasan,
              teksGambar,
              breadcrumbBeranda,
              breadcrumbLayanan,
              ctaLabel,
              ctaHref,
              perataan,
            }}
          />
        );
      },
    },

    HargaLayanan: {
      label: "Harga Layanan",
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
        deskripsi: { type: "textarea", label: "Deskripsi" },
        labelKeunggulan: { type: "text", label: "Label daftar keunggulan (kartu)" },
        labelTombol: { type: "text", label: "Tombol kartu — teks" },
        tombolHref: { type: "text", label: "Tombol kartu — tautan" },
        perataan: {
          type: "radio",
          label: "Perataan judul",
          options: [
            { label: "Kiri", value: "kiri" },
            { label: "Tengah", value: "tengah" },
          ],
        },
        batas: { type: "number", label: "Jumlah paket", min: 1, max: 16 },
      },
      defaultProps: DEFAULT_HARGA_LAYANAN,
      render: ({
        lencana,
        judul,
        deskripsi,
        labelKeunggulan,
        labelTombol,
        tombolHref,
        perataan,
        batas,
        puck,
      }) => (
        <HargaLayanan
          paket={ambil(metadataDari(puck).konteks.layanan?.paket, batas)}
          desain={{
            lencana,
            judul,
            deskripsi,
            labelKeunggulan,
            labelTombol,
            tombolHref,
            perataan,
            batas,
          }}
        />
      ),
    },

    FaqLayanan: {
      label: "FAQ Layanan",
      fields: {
        lencana: { type: "text", label: "Label kecil di atas judul" },
        judul: { type: "text", label: "Judul section" },
        batas: { type: "number", label: "Jumlah FAQ", min: 1, max: 24 },
      },
      defaultProps: DEFAULT_FAQ_LAYANAN,
      render: ({ lencana, judul, batas, puck }) => (
        <FaqLayanan
          faq={ambil(metadataDari(puck).konteks.layanan?.faq, batas)}
          desain={{ lencana, judul }}
        />
      ),
    },

    /* -------------------------------------- Template detail artikel */
    ArtikelDetailHero: {
      label: "Hero Detail Artikel",
      ...STATIS,
      render: ({ puck }) => {
        const k = metadataDari(puck).konteks.artikel;
        if (!k) return <BagianPeringatan pesan="Belum ada artikel untuk slug ini." />;
        return <ArtikelDetailHero artikel={k.artikel} penulis={k.penulis} />;
      },
    },

    BadanArtikel: {
      label: "Badan Artikel",
      ...STATIS,
      render: ({ puck }) => {
        const k = metadataDari(puck).konteks.artikel;
        if (!k) return <BagianPeringatan pesan="Belum ada artikel untuk slug ini." />;
        return <BadanArtikel blok={k.blok} tags={k.tags} headings={k.headings} />;
      },
    },

    ArtikelTerkait: {
      label: "Artikel Terkait",
      fields: {
        jumlah: { type: "number", label: "Jumlah kartu", min: 1, max: 6 },
      },
      defaultProps: { jumlah: DEFAULT_JUMLAH.ArtikelTerkait },
      render: ({ jumlah, puck }) => (
        <ArtikelTerkait artikel={ambil(metadataDari(puck).konteks.artikel?.terkait, jumlah)} />
      ),
    },
  },
};

/** Placeholder ringan saat template dinamis dibuka tanpa konteks slug. */
function BagianPeringatan({ pesan }: { pesan: string }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto w-full max-w-maks px-6 md:px-8">
        <p className="rounded-xl border border-dashed border-navy-900/20 bg-latar/60 px-6 py-10 text-center text-[0.95rem] text-navy-900/60">
          {pesan}
        </p>
      </div>
    </section>
  );
}
