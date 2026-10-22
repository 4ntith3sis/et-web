import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { layoutDefault } from "@/puck/default-layouts";
import { lengkapiLayoutDefaultProps } from "@/puck/default-props";
import {
  DAFTAR_HALAMAN,
  HALAMAN_PUCK,
  NAMA_KOMPONEN_PUCK,
  halamanDariKey,
  terapkanRoot,
  type LayoutPuck,
} from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";

/**
 * Uji unit fondasi Puck: registry halaman, layout bawaan, dan validator.
 *
 * Tidak menyentuh database maupun React, jadi bisa dijalankan cepat.
 */

const KUNCI_EXPECTED = [
  "beranda",
  "tentang-kami",
  "kontak",
  "layanan-listing",
  "tulisan-pajak-listing",
  "template-layanan-detail",
  "template-artikel-detail",
];

describe("registry halaman Puck", () => {
  it("memuat 7 tipe halaman tanpa duplikat", () => {
    assert.equal(DAFTAR_HALAMAN.length, 7);
    const kunci = DAFTAR_HALAMAN.map((h) => h.key);
    assert.deepEqual([...kunci].sort(), [...KUNCI_EXPECTED].sort());
    assert.equal(new Set(kunci).size, kunci.length);
  });

  it("setiap halaman punya key, judul, dan rute yang konsisten", () => {
    for (const halaman of DAFTAR_HALAMAN) {
      assert.ok(halaman.judul.length > 0, `${halaman.key} tidak punya judul`);
      assert.ok(halaman.rute.startsWith("/"), `${halaman.key} punya rute tidak valid`);
      assert.equal(halamanDariKey(halaman.key), halaman);
      assert.equal(
        (HALAMAN_PUCK as Record<string, { key: string }>)[halaman.key].key,
        halaman.key,
      );
    }
  });

  it("dua template detail memakai rute dinamis yang berbeda", () => {
    assert.equal(halamanDariKey("template-layanan-detail")?.rute, "/layanan/[slug]");
    assert.equal(halamanDariKey("template-artikel-detail")?.rute, "/tulisan-pajak/[slug]");
  });
});

describe("layout bawaan", () => {
  for (const kunci of KUNCI_EXPECTED) {
    it(`layout bawaan "${kunci}" valid dan tidak kosong`, () => {
      const layout = layoutDefault(kunci);
      assert.ok(layout, `layoutDefault("${kunci}") harus mengembalikan layout`);

      const hasil = validasiLayoutPuck(layout);
      assert.equal(hasil.ok, true, hasil.ok ? "" : hasil.error);
      if (!hasil.ok) return;

      assert.ok(hasil.data.content.length > 0, "layout tidak boleh kosong");
      const id = new Set<string>();
      for (const item of hasil.data.content) {
        assert.ok(
          NAMA_KOMPONEN_PUCK.includes(item.type as never),
          `tipe komponen tidak dikenal: ${item.type}`,
        );
        const idKomponen = (item.props as { id?: string }).id;
        assert.ok(typeof idKomponen === "string" && idKomponen.length > 0);
        assert.equal(id.has(idKomponen), false, `id duplikat: ${idKomponen}`);
        id.add(idKomponen);
      }
    });
  }

  it("key tak dikenal mengembalikan null", () => {
    assert.equal(layoutDefault("halaman-yang-tidak-ada"), null);
  });

  it("terapkanRoot menyinkronkan identitas halaman ke root layout", () => {
    const halaman = halamanDariKey("kontak")!;
    const layout = terapkanRoot({ root: {}, content: [] }, halaman);
    const root = layout.root as unknown as {
      props: { kunci: string; rute: string; title: string };
      readOnly: { kunci: boolean };
    };
    assert.equal(root.props.kunci, "kontak");
    assert.equal(root.props.rute, "/kontak");
    assert.equal(root.props.title, "Kontak");
    assert.equal(root.readOnly.kunci, true);
  });
});

describe("validator layout", () => {
  const layoutValid = () => ({
    root: {},
    content: [{ type: "CTA", props: { id: "cta-1" } }],
  });

  it("menerima layout yang valid", () => {
    const hasil = validasiLayoutPuck(layoutValid());
    assert.equal(hasil.ok, true);
    if (hasil.ok) assert.equal(hasil.data.content.length, 1);
  });

  it("menolak tipe komponen tak dikenal", () => {
    const hasil = validasiLayoutPuck({
      root: {},
      content: [{ type: "KomponenPalsu", props: { id: "x" } }],
    });
    assert.equal(hasil.ok, false);
    if (!hasil.ok) assert.match(hasil.error, /tipe komponen tidak dikenal/i);
  });

  it("menolak komponen tanpa props atau tanpa id", () => {
    assert.equal(validasiLayoutPuck({ root: {}, content: [{ type: "CTA" }] }).ok, false);
    assert.equal(
      validasiLayoutPuck({ root: {}, content: [{ type: "CTA", props: {} }] }).ok,
      false,
    );
  });

  it("menolak id komponen duplikat", () => {
    const hasil = validasiLayoutPuck({
      root: {},
      content: [
        { type: "CTA", props: { id: "sama" } },
        { type: "CTA", props: { id: "sama" } },
      ],
    });
    assert.equal(hasil.ok, false);
    if (!hasil.ok) assert.match(hasil.error, /duplikat/i);
  });

  it("menolak kunci berbahaya (prototype pollution)", () => {
    // `JSON.parse` dipakai agar `__proto__` menjadi properti sendiri
    // (object literal akan memakainya sebagai seter prototipe).
    const payloadBerbahaya = JSON.parse(
      '{"root":{},"content":[{"type":"CTA","props":{"id":"x","__proto__":{"polusi":true}}}]}',
    );
    const hasil = validasiLayoutPuck(payloadBerbahaya);
    assert.equal(hasil.ok, false);
    if (!hasil.ok) assert.match(hasil.error, /tidak diizinkan/i);
  });

  it("menolak layout tanpa array content", () => {
    assert.equal(validasiLayoutPuck({ root: {} }).ok, false);
    assert.equal(validasiLayoutPuck(null).ok, false);
    assert.equal(validasiLayoutPuck("bukan json").ok, false);
  });

  it("menolak layout melebihi batas ukuran", () => {
    const besar = {
      root: {},
      content: [
        {
          type: "CTA",
          props: { id: "besar", teks: "x".repeat(600 * 1024) },
        },
      ],
    };
    const hasil = validasiLayoutPuck(besar);
    assert.equal(hasil.ok, false);
    if (!hasil.ok) assert.match(hasil.error, /512 KB|terlalu besar/i);
  });

  it("menolak layout dengan terlalu banyak komponen", () => {
    const banyak = {
      root: {},
      content: Array.from({ length: 601 }, (_, i) => ({
        type: "CTA",
        props: { id: `cta-${i}` },
      })),
    };
    const hasil = validasiLayoutPuck(banyak);
    assert.equal(hasil.ok, false);
    if (!hasil.ok) assert.match(hasil.error, /terlalu banyak komponen/i);
  });

  it("menerima layout dalam bentuk string JSON", () => {
    const hasil = validasiLayoutPuck(JSON.stringify(layoutValid()));
    assert.equal(hasil.ok, true);
  });
});

describe("normalisasi default props komponen", () => {
  it("mengisi props yang hilang pada dokumen lama dengan default props", () => {
    const layoutLama: LayoutPuck = {
      root: {},
      content: [
        { type: "LayananDetailHero", props: { id: "hero-1" } },
        { type: "CaraKerja", props: { id: "cara-1" } },
        { type: "Mitra", props: { id: "mitra-1", jumlah: 10 } },
        { type: "FaqLayanan", props: { id: "faq-1", batas: 5 } },
      ],
    };

    const hasil = lengkapiLayoutDefaultProps(layoutLama, "template-layanan-detail");
    const heroProps = hasil.content[0].props as Record<string, unknown>;
    assert.equal(heroProps.judul, "Nama Layanan");
    assert.equal(heroProps.subjudul, "Subjudul");
    assert.equal(heroProps.ringkasan, "Deskripsi Layanan");
    assert.equal(heroProps.teksGambar, "Gambar");
    assert.equal(heroProps.breadcrumbBeranda, "Beranda");
    assert.equal(heroProps.breadcrumbLayanan, "Layanan");
    assert.equal(heroProps.lencana, "Tax & Accounting Service");
    assert.equal(heroProps.ctaLabel, "Konsultasi Gratis");

    const caraProps = hasil.content[1].props as Record<string, unknown>;
    assert.equal(caraProps.lencana, "Cara Kerja");
    assert.ok(typeof caraProps.judul === "string" && caraProps.judul.length > 0);

    const mitraProps = hasil.content[2].props as Record<string, unknown>;
    assert.equal(mitraProps.jumlah, 10);
    assert.equal(mitraProps.lencana, "Mitra yang sudah percaya");

    const faqProps = hasil.content[3].props as Record<string, unknown>;
    assert.equal(faqProps.batas, 5);
    assert.equal(faqProps.lencana, "FAQ");
  });

  it("tidak menimpa teks kustom yang sudah diisi oleh pengguna", () => {
    const layoutKustom: LayoutPuck = {
      root: {},
      content: [
        {
          type: "CaraKerja",
          props: {
            id: "cara-1",
            lencana: "Alur Praktis",
            judul: "Judul Kustom Pengguna",
          },
        },
      ],
    };

    const hasil = lengkapiLayoutDefaultProps(layoutKustom);
    const caraProps = hasil.content[0].props as Record<string, unknown>;
    assert.equal(caraProps.lencana, "Alur Praktis");
    assert.equal(caraProps.judul, "Judul Kustom Pengguna");
  });
});
