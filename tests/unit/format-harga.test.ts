import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatHargaRupiah, formatSatuan } from "@/lib/format-harga";

describe("formatHargaRupiah", () => {
  it("memformat angka murni menjadi Rupiah", () => {
    assert.equal(formatHargaRupiah(750000), "Rp 750.000");
    assert.equal(formatHargaRupiah(2500000), "Rp 2.500.000");
    assert.equal(formatHargaRupiah(0), "Rp 0");
  });

  it("memformat string angka menjadi Rupiah", () => {
    assert.equal(formatHargaRupiah("750000"), "Rp 750.000");
    assert.equal(formatHargaRupiah("1750000"), "Rp 1.750.000");
  });

  it("menjaga format yang sudah berawalan Rp atau bertitik", () => {
    assert.equal(formatHargaRupiah("Rp 750.000"), "Rp 750.000");
    assert.equal(formatHargaRupiah("Rp750000"), "Rp 750.000");
    assert.equal(formatHargaRupiah("Rp. 2.500.000"), "Rp 2.500.000");
    assert.equal(formatHargaRupiah("750.000"), "Rp 750.000");
  });

  it("mengembalikan teks non-angka apa adanya", () => {
    assert.equal(formatHargaRupiah("Gratis"), "Gratis");
    assert.equal(formatHargaRupiah("Hubungi Kami"), "Hubungi Kami");
    assert.equal(formatHargaRupiah("Harga"), "Harga");
    assert.equal(formatHargaRupiah(""), "");
    assert.equal(formatHargaRupiah(undefined), "");
    assert.equal(formatHargaRupiah(null), "");
  });
});

describe("formatSatuan", () => {
  it("membersihkan tanda slash di depan", () => {
    assert.equal(formatSatuan("paket"), "paket");
    assert.equal(formatSatuan("/paket"), "paket");
    assert.equal(formatSatuan("/ paket"), "paket");
    assert.equal(formatSatuan(" /bulan "), "bulan");
    assert.equal(formatSatuan("/tahun"), "tahun");
  });

  it("menangani nilai kosong atau undefined", () => {
    assert.equal(formatSatuan(""), "");
    assert.equal(formatSatuan(undefined), "");
    assert.equal(formatSatuan(null), "");
  });
});
