import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isEmailValid, isPhoneValid, sanitizeText } from "@/lib/validation";
import { validasiDataLead } from "@/features/leads/schema";
import { formatSlug, buatSlug } from "@/lib/slug";
import { formatHargaRupiah, formatSatuan } from "@/lib/format-harga";
import { buatMetadata } from "@/lib/seo";

describe("unit test features & lib", () => {
  it("validasi email dan nomor telepon", () => {
    assert.equal(isEmailValid("test@easytax.id"), true);
    assert.equal(isEmailValid("invalid-email"), false);
    assert.equal(isPhoneValid("081234567890"), true);
    assert.equal(isPhoneValid("+62 812-3456-7890"), true);
    assert.equal(isPhoneValid("abc"), false);
  });

  it("sanitasi teks menghapus tag HTML", () => {
    assert.equal(sanitizeText("<script>alert('xss')</script>Halo"), "alert('xss')Halo");
    assert.equal(sanitizeText("  Konsultasi Pajak  "), "Konsultasi Pajak");
  });

  it("validasi data lead kontak", () => {
    const valid = validasiDataLead({
      nama: "Budi",
      email: "budi@perusahaan.com",
      whatsapp: "08123456789",
      topik: "Restitusi Pajak",
      pesan: "Mohon info lebih lanjut.",
    });
    assert.equal(valid.ok, true);
    if (valid.ok) {
      assert.equal(valid.data.nama, "Budi");
    }

    const invalid = validasiDataLead({
      nama: "",
      email: "budi",
      whatsapp: "",
      topik: "",
      pesan: "",
    });
    assert.equal(invalid.ok, false);
  });

  it("slug generator dan alias", () => {
    assert.equal(formatSlug("Layanan Restitusi Pajak"), "layanan-restitusi-pajak");
    assert.equal(buatSlug("Layanan Restitusi Pajak"), "layanan-restitusi-pajak");
  });

  it("SEO helper menghasilkan metadata Next.js yang valid", () => {
    const meta = buatMetadata({
      title: "Uji Layanan",
      description: "Deskripsi uji layanan",
    });
    assert.equal(meta.title, "Uji Layanan | EasyTax");
    assert.equal(meta.description, "Deskripsi uji layanan");
  });

  it("format harga dan satuan", () => {
    assert.equal(formatHargaRupiah(500000), "Rp 500.000");
    assert.equal(formatSatuan("/bulan"), "bulan");
    assert.equal(formatSatuan("bulan"), "bulan");
  });
});
