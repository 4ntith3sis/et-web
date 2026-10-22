import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { ambilArtikel, ambilArtikelDetail } from "@/cms/konten";
import { konteksRepresentatif } from "@/cms/layout";

/**
 * Uji konteks representatif untuk template detail.
 *
 * Kanvas editor dan halaman pratinjau memakai `konteksRepresentatif()`
 * karena tidak tahu slug aktif. Tanpa konteks, komponen template artikel
 * hanya menampilkan peringatan sehingga kanvas tampak kosong.
 */

describe("konteks representatif template detail", () => {
  it("template detail layanan memakai konteks representatif template (Nama Layanan & Subjudul)", async () => {
    const konteks = await konteksRepresentatif("template-layanan-detail");
    assert.ok(konteks, "konteks layanan harus ada");
    assert.ok(konteks.layanan, "konteks.layanan harus ada");
    assert.equal(konteks.layanan.layanan.judul, "Nama Layanan");
    assert.equal(konteks.layanan.layanan.subjudul, "Subjudul");
    assert.ok(konteks.layanan.layanan.gambar.length > 0, "gambar layanan harus ada");
    assert.ok(konteks.layanan.paket.length > 0);
    assert.equal(konteks.artikel, undefined);
  });

  it("template detail artikel memakai artikel nyata dari CMS", async () => {
    const konteks = await konteksRepresentatif("template-artikel-detail");
    assert.ok(konteks, "konteks artikel harus ada");
    assert.ok(konteks.artikel, "konteks.artikel harus ada");

    const artikel = konteks.artikel.artikel;
    assert.ok(artikel.slug.length > 0);
    assert.ok(artikel.judul.length > 0);
    assert.ok(konteks.artikel.blok.length > 0, "blok isi artikel harus terisi");
    assert.ok(konteks.artikel.penulis.length > 0);
    assert.ok(konteks.artikel.terkait.length > 0, "harus ada artikel terkait");
  });

  it("konteks artikel memakai artikel yang benar-benar ada di Payload", async () => {
    const semua = await ambilArtikel();
    assert.ok(semua.length > 0, "harus ada minimal satu artikel di CMS");

    const konteks = await konteksRepresentatif("template-artikel-detail");
    const slug = konteks?.artikel?.artikel.slug;
    assert.ok(slug);
    assert.ok(semua.some((a) => a.slug === slug), "slug konteks harus dari CMS");

    const detail = await ambilArtikelDetail(slug!);
    assert.ok(detail, "detail artikel harus bisa diambil");
  });

  it("halaman statis tidak membutuhkan konteks", async () => {
    assert.equal(await konteksRepresentatif("beranda"), undefined);
    assert.equal(await konteksRepresentatif("tentang-kami"), undefined);
  });
});
