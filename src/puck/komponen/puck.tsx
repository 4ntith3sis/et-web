import type { Config } from "@puckeditor/core";

import { MediaPickerField } from "@/components/admin/page-builder/MediaPickerField";
import { IKON } from "@/components/ikon";

import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  Column,
  Container,
  Divider,
  FeatureCard,
  Gambar,
  Grid,
  Heading,
  Icon,
  List,
  Quote,
  Row,
  Section,
  Spacer,
  Stack,
  StatCard,
  Tautan,
  Text,
} from "./presentasi";
import {
  KOMPONEN_ISI,
  type PropsGeneric,
  type NamaKomponenGeneric,
} from "./tipe";

/**
 * Registry komponen generik Page Builder.
 *
 * Semua komponen memakai slot `konten` Puck sebagai wadah anak, sehingga
 * struktur bersarang tetap divalidasi model Puck. Slot dibatasi
 * (`allow`) agar admin tidak menaruh container di posisi yang tidak sah.
 */

const OPSI_WARNA = [
  { label: "Otomatis (warisi)", value: "otomatis" },
  { label: "Navy", value: "navy" },
  { label: "Kuning", value: "kuning" },
  { label: "Putih", value: "putih" },
  { label: "Sekunder", value: "sekunder" },
  { label: "Redup", value: "redup" },
];

const OPSI_LATAR = [
  { label: "Putih", value: "putih" },
  { label: "Latar terang", value: "latar" },
  { label: "Latar biru", value: "alt" },
  { label: "Navy", value: "navy" },
  { label: "Transparan", value: "transparan" },
];

const OPSI_TEBAL = [
  { label: "400 — Regular", value: "400" },
  { label: "500 — Medium", value: "500" },
  { label: "600 — Semibold", value: "600" },
  { label: "700 — Bold", value: "700" },
  { label: "800 — Extrabold", value: "800" },
  { label: "900 — Black", value: "900" },
];

const OPSI_RATA = [
  { label: "Kiri", value: "kiri" },
  { label: "Tengah", value: "tengah" },
  { label: "Kanan", value: "kanan" },
];

const OPSI_IKON = Object.keys(IKON).map((nama) => ({
  label: nama,
  value: nama,
}));

export const komponenGenerik: Config<PropsGeneric>["components"] = {
  Section: {
    label: "Section",
    fields: {
      latar: { type: "select", label: "Latar", options: OPSI_LATAR },
      paddingAtas: { type: "number", label: "Padding atas (px)", min: 0, max: 400 },
      paddingBawah: { type: "number", label: "Padding bawah (px)", min: 0, max: 400 },
      paddingX: { type: "number", label: "Padding kiri/kanan (px)", min: 0, max: 200 },
      lebar: {
        type: "radio",
        label: "Lebar konten",
        options: [
          { label: "Dalam container", value: "konten" },
          { label: "Selebar layar", value: "penuh" },
        ],
      },
      konten: { type: "slot", allow: KOMPONEN_ISI },
    },
    defaultProps: {
      latar: "putih",
      paddingAtas: 64,
      paddingBawah: 64,
      paddingX: 24,
      lebar: "konten",
      konten: [],
    },
    render: ({ konten: Konten, ...rest }) => (
      <Section {...rest}>
        <Konten minEmptyHeight={140} />
      </Section>
    ),
  },

  Container: {
    label: "Container",
    fields: {
      lebarMaks: { type: "number", label: "Lebar maksimum (px, 0 = penuh)", min: 0, max: 4000 },
      paddingX: { type: "number", label: "Padding kiri/kanan (px)", min: 0, max: 200 },
      konten: { type: "slot", allow: KOMPONEN_ISI },
    },
    defaultProps: { lebarMaks: 1200, paddingX: 24, konten: [] },
    render: ({ konten: Konten, ...rest }) => (
      <Container {...rest}>
        <Konten minEmptyHeight={100} />
      </Container>
    ),
  },

  Grid: {
    label: "Grid",
    fields: {
      kolom: { type: "number", label: "Jumlah kolom", min: 1, max: 6 },
      gap: { type: "number", label: "Jarak antar kolom (px)", min: 0, max: 120 },
      rata: {
        type: "radio",
        label: "Perataan vertikal",
        options: [
          { label: "Atas", value: "atas" },
          { label: "Tengah", value: "tengah" },
          { label: "Bawah", value: "bawah" },
        ],
      },
      konten: { type: "slot", allow: KOMPONEN_ISI },
    },
    defaultProps: { kolom: 3, gap: 24, rata: "atas", konten: [] },
    render: ({ konten: Konten, ...rest }) => (
      <Grid {...rest}>
        <Konten minEmptyHeight={120} />
      </Grid>
    ),
  },

  Row: {
    label: "Row (baris)",
    fields: {
      gap: { type: "number", label: "Jarak antar item (px)", min: 0, max: 120 },
      sejajar: {
        type: "radio",
        label: "Perataan horizontal",
        options: [
          { label: "Kiri", value: "kiri" },
          { label: "Tengah", value: "tengah" },
          { label: "Kanan", value: "kanan" },
          { label: "Sebar", value: "spasi" },
        ],
      },
      rata: {
        type: "radio",
        label: "Perataan vertikal",
        options: [
          { label: "Atas", value: "atas" },
          { label: "Tengah", value: "tengah" },
          { label: "Bawah", value: "bawah" },
        ],
      },
      bungkus: { type: "radio", label: "Baris baru bila penuh", options: [
        { label: "Ya", value: true },
        { label: "Tidak", value: false },
      ] },
      konten: { type: "slot", allow: ["Column", "Card", "FeatureCard", "StatCard", "Button", "ButtonGroup", "Badge", "Icon", "Heading", "Text", "Image"] },
    },
    defaultProps: { gap: 16, sejajar: "kiri", rata: "tengah", bungkus: true, konten: [] },
    render: ({ konten: Konten, ...rest }) => (
      <Row {...rest}>
        <Konten minEmptyHeight={90} />
      </Row>
    ),
  },

  Column: {
    label: "Column (kolom)",
    fields: {
      lebar: { type: "number", label: "Bobot lebar (1–12)", min: 1, max: 12 },
      konten: { type: "slot", allow: KOMPONEN_ISI },
    },
    defaultProps: { lebar: 1, konten: [] },
    render: ({ konten: Konten, ...rest }) => (
      <Column {...rest}>
        <Konten minEmptyHeight={90} />
      </Column>
    ),
  },

  Stack: {
    label: "Stack (tumpuk)",
    fields: {
      gap: { type: "number", label: "Jarak antar item (px)", min: 0, max: 120 },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
      konten: { type: "slot", allow: KOMPONEN_ISI },
    },
    defaultProps: { gap: 16, rata: "kiri", konten: [] },
    render: ({ konten: Konten, ...rest }) => (
      <Stack {...rest}>
        <Konten minEmptyHeight={90} />
      </Stack>
    ),
  },

  Spacer: {
    label: "Spacer (jarak)",
    fields: {
      tinggi: { type: "number", label: "Tinggi (px)", min: 0, max: 400 },
    },
    defaultProps: { tinggi: 32 },
    render: ({ tinggi }) => <Spacer tinggi={tinggi} />,
  },

  Divider: {
    label: "Divider (garis)",
    fields: {
      warna: { type: "select", label: "Warna garis", options: OPSI_WARNA },
      ketebalan: { type: "number", label: "Ketebalan (px)", min: 1, max: 24 },
      lebar: { type: "number", label: "Panjang (%)", min: 1, max: 100 },
      margin: { type: "number", label: "Jarak atas/bawah (px)", min: 0, max: 200 },
    },
    defaultProps: { warna: "otomatis", ketebalan: 1, lebar: 100, margin: 24 },
    render: (props) => <Divider {...props} />,
  },

  Heading: {
    label: "Heading (judul)",
    fields: {
      teks: { type: "text", label: "Teks judul" },
      tingkat: {
        type: "select",
        label: "Tingkat semantik",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
        ],
      },
      ukuran: { type: "number", label: "Ukuran font (px)", min: 12, max: 120 },
      tebal: { type: "select", label: "Ketebalan", options: OPSI_TEBAL },
      warna: { type: "select", label: "Warna", options: OPSI_WARNA },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
      lebarMaks: { type: "number", label: "Lebar maksimum (px, 0 = bebas)", min: 0, max: 4000 },
    },
    defaultProps: {
      teks: "Judul baru",
      tingkat: "h2",
      ukuran: 32,
      tebal: "700",
      warna: "otomatis",
      rata: "kiri",
      lebarMaks: 720,
    },
    render: (props) => <Heading {...props} />,
  },

  Text: {
    label: "Text (paragraf)",
    fields: {
      teks: { type: "textarea", label: "Teks" },
      ukuran: { type: "number", label: "Ukuran font (px)", min: 10, max: 72 },
      tebal: { type: "select", label: "Ketebalan", options: OPSI_TEBAL },
      tinggiBaris: { type: "number", label: "Tinggi baris", min: 1, max: 3, step: 0.05 },
      warna: { type: "select", label: "Warna", options: OPSI_WARNA },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
      lebarMaks: { type: "number", label: "Lebar maksimum (px, 0 = bebas)", min: 0, max: 4000 },
    },
    defaultProps: {
      teks: "Tulis deskripsi di sini.",
      ukuran: 16,
      tebal: "400",
      tinggiBaris: 1.65,
      warna: "redup",
      rata: "kiri",
      lebarMaks: 720,
    },
    render: (props) => <Text {...props} />,
  },

  Image: {
    label: "Image (gambar)",
    fields: {
      media: { type: "custom", label: "Gambar", render: MediaPickerField },
      rasio: {
        type: "select",
        label: "Rasio",
        options: [
          { label: "Mengikuti gambar", value: "asli" },
          { label: "16 : 9", value: "16-9" },
          { label: "4 : 3", value: "4-3" },
          { label: "1 : 1", value: "1-1" },
          { label: "3 : 4", value: "3-4" },
        ],
      },
      pasFit: {
        type: "radio",
        label: "Penyesuaian",
        options: [
          { label: "Penuhi (cover)", value: "cover" },
          { label: "Muat (contain)", value: "contain" },
        ],
      },
      radius: { type: "number", label: "Radius sudut (px)", min: 0, max: 80 },
      lebarMaks: { type: "number", label: "Lebar maksimum (px, 0 = bebas)", min: 0, max: 4000 },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
      keterangan: { type: "text", label: "Keterangan gambar" },
    },
    defaultProps: {
      media: { url: "", alt: "" },
      rasio: "16-9",
      pasFit: "cover",
      radius: 12,
      lebarMaks: 720,
      rata: "kiri",
      keterangan: "",
    },
    render: (props) => <Gambar {...props} />,
  },

  Badge: {
    label: "Badge (lencana)",
    fields: {
      teks: { type: "text", label: "Teks" },
      nada: {
        type: "select",
        label: "Nada warna",
        options: [
          { label: "Kuning", value: "kuning" },
          { label: "Navy", value: "navy" },
          { label: "Hijau", value: "hijau" },
          { label: "Terang", value: "terang" },
          { label: "Putih", value: "putih" },
        ],
      },
    },
    defaultProps: { teks: "Label", nada: "kuning" },
    render: (props) => <Badge {...props} />,
  },

  List: {
    label: "List (daftar)",
    fields: {
      item: {
        type: "array",
        label: "Item",
        arrayFields: { teks: { type: "text", label: "Teks" } },
        defaultItemProps: { teks: "Item baru" },
      },
      penanda: {
        type: "radio",
        label: "Penanda",
        options: [
          { label: "Bullet", value: "bullet" },
          { label: "Centang", value: "centang" },
          { label: "Angka", value: "angka" },
        ],
      },
      warna: { type: "select", label: "Warna teks", options: OPSI_WARNA },
      ukuran: { type: "number", label: "Ukuran font (px)", min: 10, max: 40 },
    },
    defaultProps: {
      item: [{ teks: "Item pertama" }, { teks: "Item kedua" }],
      penanda: "centang",
      warna: "otomatis",
      ukuran: 16,
    },
    render: (props) => <List {...props} />,
  },

  Quote: {
    label: "Quote (kutipan)",
    fields: {
      teks: { type: "textarea", label: "Kutipan" },
      penulis: { type: "text", label: "Nama penulis" },
      jabatan: { type: "text", label: "Jabatan / instansi" },
      nada: { type: "select", label: "Latar", options: OPSI_LATAR },
    },
    defaultProps: { teks: "Kutipan inspiratif.", penulis: "", jabatan: "", nada: "latar" },
    render: (props) => <Quote {...props} />,
  },

  Icon: {
    label: "Icon (ikon)",
    fields: {
      nama: { type: "select", label: "Ikon", options: OPSI_IKON },
      ukuran: { type: "number", label: "Ukuran (px)", min: 12, max: 160 },
      warna: { type: "select", label: "Warna", options: OPSI_WARNA },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
    },
    defaultProps: { nama: "bintang", ukuran: 28, warna: "kuning", rata: "kiri" },
    render: ({ nama, ...rest }) => <Icon nama={nama as never} {...rest} />,
  },

  Button: {
    label: "Button (tombol)",
    fields: {
      label: { type: "text", label: "Label" },
      href: { type: "text", label: "Tautan (URL)" },
      varian: {
        type: "select",
        label: "Varian",
        options: [
          { label: "Utama (kuning)", value: "utama" },
          { label: "Sekunder (navy)", value: "sekunder" },
          { label: "Garis", value: "garis" },
          { label: "Garis putih", value: "garisPutih" },
          { label: "Halus", value: "halus" },
        ],
      },
      ukuran: {
        type: "select",
        label: "Ukuran",
        options: [
          { label: "Kecil", value: "kecil" },
          { label: "Sedang", value: "sedang" },
          { label: "Besar", value: "besar" },
        ],
      },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
      tabBaru: {
        type: "radio",
        label: "Buka di tab baru",
        options: [
          { label: "Ya", value: true },
          { label: "Tidak", value: false },
        ],
      },
    },
    defaultProps: {
      label: "Klik di sini",
      href: "#",
      varian: "utama",
      ukuran: "sedang",
      rata: "kiri",
      tabBaru: false,
    },
    render: (props) => <Button {...props} />,
  },

  ButtonGroup: {
    label: "Button Group (grup tombol)",
    fields: {
      tombol: {
        type: "array",
        label: "Tombol",
        arrayFields: {
          label: { type: "text", label: "Label" },
          href: { type: "text", label: "Tautan" },
          varian: {
            type: "select",
            label: "Varian",
            options: [
              { label: "Utama", value: "utama" },
              { label: "Sekunder", value: "sekunder" },
              { label: "Garis", value: "garis" },
              { label: "Garis putih", value: "garisPutih" },
              { label: "Halus", value: "halus" },
            ],
          },
        },
        defaultItemProps: { label: "Tombol", href: "#", varian: "utama" },
      },
      gap: { type: "number", label: "Jarak antar tombol (px)", min: 0, max: 80 },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
    },
    defaultProps: {
      tombol: [
        { label: "Tombol utama", href: "#", varian: "utama" },
        { label: "Tombol kedua", href: "#", varian: "garis" },
      ],
      gap: 12,
      rata: "kiri",
    },
    render: (props) => <ButtonGroup {...props} />,
  },

  Link: {
    label: "Link (tautan teks)",
    fields: {
      teks: { type: "text", label: "Teks" },
      href: { type: "text", label: "URL" },
      eksternal: {
        type: "radio",
        label: "Tautan eksternal",
        options: [
          { label: "Ya", value: true },
          { label: "Tidak", value: false },
        ],
      },
      warna: { type: "select", label: "Warna", options: OPSI_WARNA },
      ukuran: { type: "number", label: "Ukuran font (px)", min: 10, max: 40 },
    },
    defaultProps: { teks: "Pelajari selengkapnya", href: "#", eksternal: false, warna: "navy", ukuran: 16 },
    render: (props) => <Tautan {...props} />,
  },

  Card: {
    label: "Card (kartu)",
    fields: {
      judul: { type: "text", label: "Judul" },
      deskripsi: { type: "textarea", label: "Deskripsi" },
      media: { type: "custom", label: "Gambar (opsional)", render: MediaPickerField },
      ikon: { type: "select", label: "Ikon (opsional)", options: [{ label: "— tanpa ikon —", value: "" }, ...OPSI_IKON] },
      tautanLabel: { type: "text", label: "Teks tautan (opsional)" },
      tautanHref: { type: "text", label: "URL tautan" },
      latar: { type: "select", label: "Latar", options: OPSI_LATAR },
      padding: { type: "number", label: "Padding (px)", min: 0, max: 120 },
      radius: { type: "number", label: "Radius (px)", min: 0, max: 60 },
      garis: {
        type: "radio",
        label: "Garis tepi",
        options: [
          { label: "Ya", value: true },
          { label: "Tidak", value: false },
        ],
      },
      bayangan: {
        type: "select",
        label: "Bayangan",
        options: [
          { label: "Tidak ada", value: "tidak" },
          { label: "Kecil", value: "kecil" },
          { label: "Sedang", value: "sedang" },
          { label: "Besar", value: "besar" },
        ],
      },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
    },
    defaultProps: {
      judul: "Judul kartu",
      deskripsi: "Deskripsi singkat kartu.",
      media: { url: "", alt: "" },
      ikon: "",
      tautanLabel: "",
      tautanHref: "",
      latar: "putih",
      padding: 24,
      radius: 18,
      garis: true,
      bayangan: "sedang",
      rata: "kiri",
    },
    render: ({ ikon, ...rest }) => <Card ikon={ikon as never} {...rest} />,
  },

  FeatureCard: {
    label: "Feature Card",
    fields: {
      ikon: { type: "select", label: "Ikon", options: OPSI_IKON },
      judul: { type: "text", label: "Judul" },
      deskripsi: { type: "textarea", label: "Deskripsi" },
      nada: {
        type: "radio",
        label: "Nada ikon",
        options: [
          { label: "Kuning", value: "kuning" },
          { label: "Navy", value: "navy" },
          { label: "Hijau", value: "hijau" },
          { label: "Terang", value: "terang" },
        ],
      },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
    },
    defaultProps: {
      ikon: "dokumen",
      judul: "Fitur unggulan",
      deskripsi: "Penjelasan singkat fitur.",
      nada: "kuning",
      rata: "kiri",
    },
    render: ({ ikon, ...rest }) => <FeatureCard ikon={ikon as never} {...rest} />,
  },

  StatCard: {
    label: "Statistic Card",
    fields: {
      angka: { type: "text", label: "Angka" },
      label: { type: "text", label: "Label" },
      deskripsi: { type: "textarea", label: "Deskripsi (opsional)" },
      warnaAngka: { type: "select", label: "Warna angka", options: OPSI_WARNA },
      rata: { type: "radio", label: "Perataan", options: OPSI_RATA },
    },
    defaultProps: { angka: "100+", label: "Klien", deskripsi: "", warnaAngka: "navy", rata: "tengah" },
    render: (props) => <StatCard {...props} />,
  },
};

export const KATEGORI_KOMPONEN: Record<string, NamaKomponenGeneric[]> = {
  Layout: ["Section", "Container", "Grid", "Row", "Column", "Stack", "Spacer", "Divider"],
  Konten: ["Heading", "Text", "Image", "Badge", "List", "Quote", "Icon"],
  Interaktif: ["Button", "ButtonGroup", "Link"],
  Kartu: ["Card", "FeatureCard", "StatCard"],
};
