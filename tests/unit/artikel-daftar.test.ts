import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ambilKategori } from "@/lib/artikel/kategori";
import { hitungDaftarArtikel } from "@/lib/artikel/daftar";
import type { ArtikelBeranda } from "@/data/artikel";

const artikel: ArtikelBeranda[] = [
  { slug: "pajak-a", judul: "Pajak A", ringkasan: "Usaha kecil", kategori: "Perpajakan", tanggal: "", waktuBaca: "", gambar: "" },
  { slug: "akun-b", judul: "Buku B", ringkasan: "Laporan", kategori: "Akuntansi", tanggal: "", waktuBaca: "", gambar: "" },
  { slug: "pajak-c", judul: "Pajak C", ringkasan: "Bisnis", kategori: "Perpajakan", tanggal: "", waktuBaca: "", gambar: "" },
];

describe("artikel listing server-safe category utility", () => {
  it("returns unique categories with lowercase slugs", () => {
    assert.deepEqual(ambilKategori(artikel), [
      { nama: "Perpajakan", slug: "perpajakan" },
      { nama: "Akuntansi", slug: "akuntansi" },
    ]);
  });

  it("preserves category validation, keyword filtering, and pagination", () => {
    const filtered = hitungDaftarArtikel({ kategori: "perpajakan", q: "usaha" }, artikel, 1);
    assert.equal(filtered.kategoriAktif, "perpajakan");
    assert.equal(filtered.totalDocs, 1);
    assert.equal(filtered.artikel[0].slug, "pajak-a");

    const invalidCategory = hitungDaftarArtikel({ kategori: "unknown", page: "99" }, artikel, 1);
    assert.equal(invalidCategory.kategoriAktif, undefined);
    assert.equal(invalidCategory.halamanAman, 3);
  });
});
