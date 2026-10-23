import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalisasiNomorWA, validasiNomorWA, buatTautanWA, sanitasiPesanWA } from "@/features/whatsapp/utils";
import { pilihNomorSesuaiStrategi } from "@/features/whatsapp/router";
import { validasiQueryKonsultasi, validasiInputNomor } from "@/features/whatsapp/schema";
import type { WhatsAppNumberRecord } from "@/features/whatsapp/types";
import {
  PESAN_WHATSAPP_KONSULTASI,
  pesanKonsultasiLayanan,
  pesanKonsultasiPaket,
  tautanKonsultasiWhatsApp,
} from "@/features/whatsapp/config";

describe("unit test: WhatsApp utilities & validation", () => {
  it("mengarahkan konsultasi ke router server dengan pesan dan sumber", () => {
    const url = new URL(tautanKonsultasiWhatsApp(undefined, "navbar"), "https://easytax.invalid");
    assert.equal(url.pathname, "/api/konsultasi/whatsapp");
    assert.equal(url.searchParams.get("sumber"), "navbar");
    assert.equal(url.searchParams.get("pesan"), "Halo, saya ingin berkonsultasi mengenai layanan EasyTax. Bisa dibantu dengan informasi lebih lanjut?");
    assert.equal(PESAN_WHATSAPP_KONSULTASI, "Halo, saya ingin berkonsultasi mengenai layanan EasyTax. Bisa dibantu dengan informasi lebih lanjut?");
  });

  it("menerima konteks hanya dari nilai yang diizinkan dan memakai umum jika tidak tersedia", () => {
    const layanan = validasiQueryKonsultasi(new URLSearchParams({ konteks: "layanan" }));
    const paket = validasiQueryKonsultasi(new URLSearchParams({ konteks: "paket" }));
    const fallback = validasiQueryKonsultasi(new URLSearchParams({ konteks: "../../secret" }));
    assert.equal(layanan.konteks, "layanan");
    assert.equal(paket.konteks, "paket");
    assert.equal(fallback.konteks, "umum");
  });

  it("meng-encode pesan layanan dan paket dengan karakter khusus untuk query URL", () => {
    const pesanLayanan = "Halo, layanan Pajak & SPT Tahunan?";
    const url = new URL(tautanKonsultasiWhatsApp(pesanLayanan, "detail", "layanan"), "https://easytax.invalid");
    assert.equal(url.searchParams.get("pesan"), pesanLayanan);
    assert.equal(url.searchParams.get("konteks"), "layanan");
  });

  it("membentuk pesan dinamis dari nama layanan/paket dan fallback umum untuk konteks kosong", () => {
    assert.equal(
      pesanKonsultasiLayanan("Pajak & SPT Tahunan"),
      "Halo, saya ingin berkonsultasi mengenai layanan Pajak & SPT Tahunan dari EasyTax. Bisa dijelaskan mengenai cakupan layanan, proses, dan biayanya?",
    );
    assert.equal(
      pesanKonsultasiPaket("Paket UMKM Premium", "Rp 1.500.000", "per bulan"),
      "Halo, saya tertarik dengan paket Paket UMKM Premium dari EasyTax. Saya ingin mengetahui detail manfaat, harga Rp 1.500.000 per bulan, dan cara berlangganannya.",
    );
    assert.equal(pesanKonsultasiLayanan(null), PESAN_WHATSAPP_KONSULTASI);
    assert.equal(pesanKonsultasiPaket(undefined), PESAN_WHATSAPP_KONSULTASI);
    const url = new URL(tautanKonsultasiWhatsApp(pesanKonsultasiPaket("Paket Pajak & Akuntansi"), "paket", "paket"), "https://easytax.invalid");
    assert.match(url.searchParams.get("pesan") || "", /Paket Pajak & Akuntansi/);
    assert.match(url.searchParams.get("pesan") || "", /EasyTax/);
  });

  it("nomor hanya dipilih dari kandidat aktif yang diberikan CMS", () => {
    const cmsNumber: WhatsAppNumberRecord = {
      id: "cms-1", label: "Konsultan CMS", phoneNumber: "6281111111111",
      enabled: true, priority: 1, weight: 1, assignedCount: 0,
    };
    assert.equal(pilihNomorSesuaiStrategi([cmsNumber], "round-robin")?.phoneNumber, cmsNumber.phoneNumber);
  });

  it("normalisasi nomor WhatsApp menghilangkan +, spasi, tanda kurung, dan tanda hubung", () => {
    assert.equal(normalisasiNomorWA("+62 812-3456-7890"), "6281234567890");
    assert.equal(normalisasiNomorWA("+1 (555) 019-2834"), "15550192834");
    assert.equal(normalisasiNomorWA(" 08123456789 "), "08123456789");
    assert.equal(normalisasiNomorWA(""), "");
    assert.equal(normalisasiNomorWA(null), "");
  });

  it("validasi nomor WhatsApp internasional", () => {
    assert.equal(validasiNomorWA("6281234567890"), true);
    assert.equal(validasiNomorWA("+62 811-1920-0080"), true);
    assert.equal(validasiNomorWA("15550192834"), true);
    // Terlalu pendek (< 8 digit)
    assert.equal(validasiNomorWA("12345"), false);
    // Mengandung huruf
    assert.equal(validasiNomorWA("62812abc7890"), false);
    // Kosong
    assert.equal(validasiNomorWA(""), false);
  });

  it("sanitasi pesan konsultasi dan batas panjang", () => {
    const raw = "Halo <script>alert('xss')</script>Saya ingin konsultasi.";
    assert.equal(sanitasiPesanWA(raw), "Halo alert('xss')Saya ingin konsultasi.");

    // Panjang melebihi 500 karakter dipotong
    const longText = "A".repeat(600);
    assert.equal(sanitasiPesanWA(longText).length, 500);
  });

  it("membuat tautan wa.me yang valid dan ter-encode", () => {
    const url = buatTautanWA("6281234567890", "Halo, saya ingin tanya!");
    assert.equal(url, "https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20tanya!");

    const urlTanpaPesan = buatTautanWA("+62 812-3456-7890");
    assert.equal(urlTanpaPesan, "https://wa.me/6281234567890");

    // Menolak nomor tidak valid
    assert.throws(() => buatTautanWA("nomor-salah"), /Nomor WhatsApp tidak valid/);
  });

  it("validasi input nomor WhatsApp di schema", () => {
    const valid = validasiInputNomor({
      label: "Konsultan Pajak 1",
      phoneNumber: "+62 812-9999-8888",
      priority: 1,
      weight: 5,
    });
    assert.equal(valid.ok, true);
    if (valid.ok) {
      assert.equal(valid.data.phoneNumber, "6281299998888");
      assert.equal(valid.data.priority, 1);
      assert.equal(valid.data.weight, 5);
    }

    const invalid = validasiInputNomor({
      label: "",
      phoneNumber: "123",
    });
    assert.equal(invalid.ok, false);
  });

  it("validasi query konsultasi mencegah open redirect dan karakter berbahaya", () => {
    const sp = new URLSearchParams({
      pesan: "Halo <script>alert(1)</script>pajak",
      sumber: "hero",
      // Parameter asing pengacau diabaikan
      target: "https://evil.com",
      to: "6289999999999",
    });

    const hasil = validasiQueryKonsultasi(sp);
    assert.equal(hasil.pesanKustom, "Halo alert(1)pajak");
    assert.equal(hasil.sumber, "hero");
  });
});

describe("unit test: WhatsApp Routing Strategy Algorithms", () => {
  const dummyKandidat: WhatsAppNumberRecord[] = [
    {
      id: "wa-1",
      label: "Konsultan A",
      phoneNumber: "6281111111111",
      enabled: true,
      priority: 2,
      weight: 1,
      assignedCount: 5,
      lastAssignedAt: "2026-10-20T10:00:00.000Z",
    },
    {
      id: "wa-2",
      label: "Konsultan B",
      phoneNumber: "6282222222222",
      enabled: true,
      priority: 1,
      weight: 3,
      assignedCount: 2,
      lastAssignedAt: "2026-10-19T08:00:00.000Z", // Paling lama belum dapat giliran
    },
    {
      id: "wa-3",
      label: "Konsultan C (Baru)",
      phoneNumber: "6283333333333",
      enabled: true,
      priority: 3,
      weight: 1,
      assignedCount: 0,
      lastAssignedAt: null, // Belum pernah sama sekali
    },
  ];

  it("round-robin: memprioritaskan nomor yang belum pernah ditugaskan atau paling lama belum ditugaskan", () => {
    // wa-3 belum pernah ditugaskan (lastAssignedAt null)
    const terpilih1 = pilihNomorSesuaiStrategi(dummyKandidat, "round-robin");
    assert.equal(terpilih1?.id, "wa-3");

    // Jika semua sudah pernah ditugaskan, pilih yang paling lama (wa-2 pada 19 Okt vs wa-1 pada 20 Okt)
    const kandidatPernah: WhatsAppNumberRecord[] = [dummyKandidat[0], dummyKandidat[1]];
    const terpilih2 = pilihNomorSesuaiStrategi(kandidatPernah, "round-robin");
    assert.equal(terpilih2?.id, "wa-2");
  });

  it("priority: memilih nomor dengan priority tertinggi (angka terkecil = 1)", () => {
    const terpilih = pilihNomorSesuaiStrategi(dummyKandidat, "priority");
    assert.equal(terpilih?.id, "wa-2"); // priority = 1
  });

  it("priority manual: memilih nomor yang ditentukan secara eksplisit jika tersedia", () => {
    const terpilih = pilihNomorSesuaiStrategi(dummyKandidat, "priority", "wa-1");
    assert.equal(terpilih?.id, "wa-1");
  });

  it("random: selalu mengembalikan salah satu kandidat aktif", () => {
    for (let i = 0; i < 20; i++) {
      const terpilih = pilihNomorSesuaiStrategi(dummyKandidat, "random");
      assert.ok(terpilih !== null);
      assert.ok(["wa-1", "wa-2", "wa-3"].includes(String(terpilih.id)));
    }
  });

  it("weighted: selalu mengembalikan kandidat yang valid dan menghormati bobot", () => {
    const counts: Record<string, number> = { "wa-1": 0, "wa-2": 0, "wa-3": 0 };
    for (let i = 0; i < 500; i++) {
      const terpilih = pilihNomorSesuaiStrategi(dummyKandidat, "weighted");
      assert.ok(terpilih !== null);
      counts[String(terpilih.id)]++;
    }

    // wa-2 berbobot 3, wa-1 berbobot 1, wa-3 berbobot 1
    // wa-2 harus terpilih lebih banyak daripada wa-1 dan wa-3
    assert.ok(counts["wa-2"] > counts["wa-1"], "Nomor dengan bobot 3 harus lebih sering terpilih dari bobot 1");
  });

  it("kandidat kosong mengembalikan null secara aman", () => {
    const terpilih = pilihNomorSesuaiStrategi([], "round-robin");
    assert.equal(terpilih, null);
  });

  it("nomor nonaktif tidak dipilih oleh strategi mana pun", () => {
    const tidakAktif = { ...dummyKandidat[0], enabled: false };
    for (const strategy of ["round-robin", "random", "weighted", "priority"] as const) {
      assert.equal(pilihNomorSesuaiStrategi([tidakAktif], strategy), null);
    }
  });

  it("priority/manual memilih nomor manual yang masih aktif", () => {
    assert.equal(pilihNomorSesuaiStrategi(dummyKandidat, "priority", "wa-1")?.id, "wa-1");
    assert.equal(
      pilihNomorSesuaiStrategi([{ ...dummyKandidat[0], enabled: false }, dummyKandidat[1]], "priority")?.id,
      "wa-2",
    );
  });
});

describe("unit & integration test: WhatsApp routing fallback & security", () => {
  const fallbackKonfigurasi = (input: string | null | undefined) => {
    const raw = typeof input === "string" ? input.trim() : null;
    const normalized = raw ? normalisasiNomorWA(raw) : null;
    return normalized && validasiNomorWA(normalized) ? normalized : null;
  };

  it("fallback nomor CMS dinormalisasi dan data kosong tidak menghasilkan nomor pengganti", () => {
    // Verifikasi normalisasi fallback ketika admin sengaja mengosongkan
    const inputKosong = "";
    const inputSpasi = "   ";
    const inputNull = null;
    const inputValid = "+62 811-1920-0080";

    assert.equal(fallbackKonfigurasi(inputKosong), null);
    assert.equal(fallbackKonfigurasi(inputSpasi), null);
    assert.equal(fallbackKonfigurasi(inputNull), null);
    assert.equal(fallbackKonfigurasi(inputValid), "6281119200080");
    assert.equal(pilihNomorSesuaiStrategi([], "round-robin"), null);
  });

  it("keamanan endpoint SiteSettings: field routing internal dilindungi dari akses anonim", { skip: !process.env.TEST_DATABASE_URL }, async () => {
    assertTestDatabase(process.env.TEST_DATABASE_URL!);
    const { getPayload } = await import("payload");
    const { default: config } = await import("@/payload.config");
    const payload = await getPayload({ config });

    // Permintaan tanpa user (anonim)
    const settingsAnon = (await payload.findGlobal({
      slug: "pengaturan-situs",
      overrideAccess: false,
    })) as unknown as Record<string, unknown>;

    // Field internal harus undefined untuk publik
    assert.equal(settingsAnon.whatsappRoutingStrategy, undefined);
    assert.equal(settingsAnon.defaultWhatsAppMessage, undefined);
    assert.equal(settingsAnon.fallbackWhatsAppNumber, undefined);
    assert.equal(settingsAnon.manualWhatsAppNumber, undefined);

    // Field publik harus tetap dapat diakses
    assert.ok(typeof settingsAnon.nama === "string");
    assert.ok(typeof settingsAnon.telepon === "string");
    assert.ok(typeof settingsAnon.email === "string");

    // Permintaan dengan peran admin
    const settingsAdmin = (await payload.findGlobal({
      slug: "pengaturan-situs",
      overrideAccess: false,
      user: { id: 999, role: "admin", collection: "users" } as any,
    })) as unknown as Record<string, unknown>;

    assert.ok(settingsAdmin.whatsappRoutingStrategy !== undefined);
  });

  it("konkurensi Round Robin: eksekusi atomik mencegah lost update pada permintaan bersamaan", { skip: !process.env.TEST_DATABASE_URL }, async () => {
    assertTestDatabase(process.env.TEST_DATABASE_URL!);
    process.env.DATABASE_URI = process.env.TEST_DATABASE_URL!;
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL!;
    process.env.EASYTAX_DEV_DATABASE_URI = process.env.TEST_DATABASE_URL!;
    const { getPayload } = await import("payload");
    const { default: config } = await import("@/payload.config");
    const { pilihDanTugaskanNomorAtomik } = await import("@/features/whatsapp/router");
    const payload = await getPayload({ config });

    // Buat 2 nomor uji sementara
    const n1 = await payload.create({
      collection: "nomor-whatsapp",
      data: {
        label: "__TEST_CONCURRENCY_A",
        phoneNumber: "6289900000001",
        enabled: true,
        priority: 1,
        weight: 1,
        assignedCount: 0,
      },
      overrideAccess: true,
    });

    const n2 = await payload.create({
      collection: "nomor-whatsapp",
      data: {
        label: "__TEST_CONCURRENCY_B",
        phoneNumber: "6289900000002",
        enabled: true,
        priority: 1,
        weight: 1,
        assignedCount: 0,
      },
      overrideAccess: true,
    });

    try {
      const TOTAL_REQUESTS = 8;
      const tasks = Array.from({ length: TOTAL_REQUESTS }, () =>
        pilihDanTugaskanNomorAtomik({
          whatsappEnabled: true,
          routingStrategy: "round-robin",
          defaultMessage: "Pesan tes",
          fallbackNumber: null,
          buttonLabel: "Konsultasi",
          manualNumberId: null,
        }),
      );

      const results = await Promise.all(tasks);
      assert.equal(results.length, TOTAL_REQUESTS);
      results.forEach((r) => assert.ok(r !== null));

      // Verifikasi di level database: jumlah penugasan tercatat tanpa ada yang hilang
      const doc1 = await payload.findByID({ collection: "nomor-whatsapp", id: n1.id, overrideAccess: true });
      const doc2 = await payload.findByID({ collection: "nomor-whatsapp", id: n2.id, overrideAccess: true });

      const totalAssigned = (doc1.assignedCount || 0) + (doc2.assignedCount || 0);
      assert.equal(
        totalAssigned,
        TOTAL_REQUESTS,
        `Total penugasan (${totalAssigned}) harus tepat sama dengan jumlah request (${TOTAL_REQUESTS}) tanpa lost update`,
      );
    } finally {
      // Bersihkan data uji agar database tetap bersih
      await payload.delete({ collection: "nomor-whatsapp", id: n1.id, overrideAccess: true });
      await payload.delete({ collection: "nomor-whatsapp", id: n2.id, overrideAccess: true });
    }
  });
});

function assertTestDatabase(rawUrl: string): void {
  const url = new URL(rawUrl);
  const database = decodeURIComponent(url.pathname.slice(1));
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (!new Set(["localhost", "127.0.0.1", "::1"]).has(hostname) || !/(^|_)test($|_)/i.test(database)) {
    throw new Error("Integration tests require a loopback PostgreSQL database with 'test' in its name");
  }
  process.env.DATABASE_URI = url.toString();
  process.env.DATABASE_URL = url.toString();
}
