import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { getPayload } from "payload";

import config from "@/payload.config";
import { ambilLayoutTerbit, hasilTanpaSnapshot, klasifikasikanQueryLayout, pilihLayoutSnapshotTerbit } from "@/cms/layout";
import { layoutDefault } from "@/puck/default-layouts";
import { DAFTAR_HALAMAN } from "@/puck/types";
import { validasiLayoutPuck } from "@/puck/validation";
import { punyaPeranStaf } from "@/components/admin/page-builder/role";

/**
 * Uji integritas data CMS: setiap tipe halaman punya layout valid, dan
 * halaman publik hanya boleh membaca versi yang sudah terbit.
 *
 * Jalur draft → publish diuji memakai page key sementara yang dibuat dan
 * dihapus oleh test, sehingga data existing tidak tersentuh.
 */

const payload = await getPayload({ config });
const READ_ONLY_PHASE2A = process.env.EASYTAX_READ_ONLY_TESTS === "1";

/** Hapus sisa uji sebelumnya (mis. test terputus di tengah jalan). */
const KUNCI_UJI = "__uji-phase1";

describe("selector snapshot published terisolasi", () => {
  const publishedLayout = layoutDefault("beranda")!;

  it("memilih published dengan revision tertinggi dan mengabaikan draft lebih baru", () => {
    const selected = pilihLayoutSnapshotTerbit([
      { version: { _status: "draft", revision: 73, layout: layoutDefault("kontak") } },
      { version: { _status: "published", revision: 58, layout: publishedLayout } },
      { version: { _status: "published", revision: 54, layout: layoutDefault("tentang-kami") } },
    ]);
    assert.deepEqual(selected, publishedLayout);
  });

  it("mengembalikan null tanpa published snapshot valid", () => {
    assert.equal(
      pilihLayoutSnapshotTerbit([
        { version: { _status: "draft", revision: 9, layout: publishedLayout } },
      ]),
      null,
    );
    assert.equal(
      pilihLayoutSnapshotTerbit([
        { version: { _status: "published", revision: 10, layout: { root: {}, content: [] } } },
      ]),
      null,
    );
  });

  it("menolak layout published dengan komponen yang tidak dikenal", () => {
    assert.equal(
      pilihLayoutSnapshotTerbit([
        {
          version: {
            _status: "published",
            revision: 11,
            layout: { root: {}, content: [{ type: "Unknown", props: { id: "x" } }] },
          },
        },
      ]),
      null,
    );
  });

  it("memisahkan kesalahan akses dan query dari kondisi snapshot missing", () => {
    assert.equal(klasifikasikanQueryLayout({ status: 403 }), "access_denied");
    assert.equal(klasifikasikanQueryLayout(new Error("database unavailable")), "query_error");
    assert.deepEqual(hasilTanpaSnapshot("snapshot_missing"), {
      layout: null,
      source: "fallback",
      reason: "snapshot_missing",
    });
    assert.equal(hasilTanpaSnapshot("validation_error").reason, "validation_error");
  });
});

describe("authorization preview dan audit", () => {
  it("menerima hanya user ber-id dengan role admin/editor", () => {
    assert.equal(punyaPeranStaf(null), false);
    assert.equal(punyaPeranStaf({ id: 1, role: "user" }), false);
    assert.equal(punyaPeranStaf({ role: "admin" }), false);
    assert.equal(punyaPeranStaf({ id: 1, role: "admin" }), true);
    assert.equal(punyaPeranStaf({ id: "staff", role: "editor" }), true);
  });
});

async function bersihkanUji() {
  await payload.delete({
    collection: "page-layouts",
    where: { pageKey: { equals: KUNCI_UJI } },
    overrideAccess: true,
  });
}

before(async () => {
  if (!READ_ONLY_PHASE2A) await bersihkanUji();
});

after(async () => {
  if (!READ_ONLY_PHASE2A) await bersihkanUji();
  await payload.db.destroy?.();
});

describe("integritas layout 7 tipe halaman", () => {
  for (const halaman of DAFTAR_HALAMAN) {
    it(`"${halaman.key}" punya satu dokumen layout yang valid`, async () => {
      const res = await payload.find({
        collection: "page-layouts",
        where: { pageKey: { equals: halaman.key } },
        limit: 10,
        depth: 0,
        draft: true,
        overrideAccess: true,
      });
      assert.equal(res.docs.length, 1, `harus tepat satu dokumen untuk ${halaman.key}`);

      const doc = res.docs[0] as { layout?: unknown; revision?: number };
      const hasil = validasiLayoutPuck(doc.layout);
      assert.equal(hasil.ok, true, hasil.ok ? "" : hasil.error);
      if (!hasil.ok) return;
      assert.ok(hasil.data.content.length > 0, `layout ${halaman.key} kosong`);
      assert.ok(
        typeof doc.revision === "number" && doc.revision > 0,
        `revisi ${halaman.key} tidak valid`,
      );
    });
  }
});

describe("halaman publik hanya membaca versi published", () => {
  it("tidak pernah mengembalikan dokumen berstatus draft", async () => {
    for (const halaman of DAFTAR_HALAMAN) {
      const publik = await payload.find({
        collection: "page-layouts",
        where: {
          pageKey: { equals: halaman.key },
          _status: { equals: "published" },
        },
        limit: 1,
        depth: 0,
        draft: false,
        overrideAccess: false,
      });
      for (const doc of publik.docs) {
        assert.notEqual(
          (doc as { _status?: string })._status,
          "draft",
          `${halaman.key} bocor ke publik`,
        );
      }
    }
  });

  it("mengembalikan layout hanya saat baris utama berstatus published", async () => {
    for (const key of ["beranda", "tentang-kami"]) {
      const result = await ambilLayoutTerbit(key);
      assert.ok(result.layout, `${key} harus memiliki layout published valid`);
      assert.equal(result.source, "published");
      assert.ok(result.layout.content.length > 0);
    }
  });

  it("tidak menghidupkan lagi snapshot published setelah halaman ditarik", async () => {
    // Template detail saat ini punya snapshot published lama, tetapi baris
    // utamanya draft. Snapshot seperti itu tidak boleh tampil di publik.
    for (const key of [
      "template-layanan-detail",
      "template-artikel-detail",
      "kontak",
      "layanan-listing",
      "tulisan-pajak-listing",
    ]) {
      const result = await ambilLayoutTerbit(key);
      assert.equal(result.layout, null, `${key} tidak boleh membaca draft/snapshot lama`);
      assert.equal(result.source, "fallback");
      assert.equal(result.reason, "snapshot_missing");
    }
  });

  it("access control anonim menyembunyikan dokumen draft", async () => {
    const semua = await payload.find({
      collection: "page-layouts",
      limit: 50,
      depth: 0,
      draft: false,
      overrideAccess: false,
    });
    const status = semua.docs.map((d) => (d as { _status?: string })._status);
    assert.equal(
      status.some((s) => s === "draft"),
      false,
      "dokumen draft tidak boleh terlihat oleh pembaca anonim",
    );
  });

  it("query published versions hanya mengekspos snapshot published", async () => {
    const versions = await payload.findVersions({
      collection: "page-layouts",
      where: { "version.pageKey": { equals: "template-layanan-detail" } },
      limit: 100,
      pagination: false,
      overrideAccess: false,
    });
    assert.ok(versions.docs.length > 0);
    assert.ok(versions.docs.every((doc) => doc.version?._status === "published"));
  });
});

describe("siklus draft → publish", { skip: READ_ONLY_PHASE2A }, () => {
  const ambilPublik = async () => {
    const res = await payload.find({
      collection: "page-layouts",
      where: { pageKey: { equals: KUNCI_UJI } },
      limit: 1,
      depth: 0,
      draft: false,
      overrideAccess: false,
    });
    return res.docs[0] as { _status?: string; revision?: number } | undefined;
  };

  const ambilDraft = async () => {
    const res = await payload.find({
      collection: "page-layouts",
      where: { pageKey: { equals: KUNCI_UJI } },
      limit: 1,
      depth: 0,
      draft: true,
      overrideAccess: true,
    });
    return res.docs[0] as
      | { id?: number; _status?: string; revision?: number; layout?: unknown }
      | undefined;
  };

  it("dokumen baru berstatus draft dan belum terlihat publik", async () => {
    await payload.create({
      collection: "page-layouts",
      data: {
        pageKey: KUNCI_UJI,
        judul: "Uji Phase 1",
        rute: "/",
        layout: layoutDefault("beranda"),
        revision: 0,
      } as never,
      draft: true,
      overrideAccess: true,
    });

    const draft = await ambilDraft();
    assert.equal(draft?._status, "draft");
    assert.equal(await ambilPublik(), undefined);
  });

  it("publish menjadikan layout terbaca publik", async () => {
    const draft = await ambilDraft();
    assert.ok(draft?.id);

    await payload.update({
      collection: "page-layouts",
      id: draft!.id!,
      data: {
        layout: draft!.layout,
        revision: draft!.revision,
        _status: "published",
        publishedAt: new Date().toISOString(),
      } as never,
      draft: false,
      overrideAccess: true,
    });

    const publik = await ambilPublik();
    assert.equal(publik?._status, "published");
    assert.ok(publik?.revision);
  });

  it("draft baru tidak menimpa versi yang sudah terbit", async () => {
    const publikSebelum = await ambilPublik();
    const draftSebelum = await ambilDraft();

    await payload.update({
      collection: "page-layouts",
      id: draftSebelum!.id!,
      data: { layout: draftSebelum!.layout, revision: draftSebelum!.revision } as never,
      draft: true,
      overrideAccess: true,
    });

    const publikSesudah = await ambilPublik();
    assert.equal(publikSesudah?.revision, publikSebelum?.revision);
    assert.equal(publikSesudah?._status, "published");

    const draftSesudah = await ambilDraft();
    assert.equal(draftSesudah?._status, "draft");
    assert.ok((draftSesudah?.revision ?? 0) > (publikSebelum?.revision ?? 0));
  });

  it("publish kedua kali menaikkan revisi dan tetap publik", async () => {
    const draft = await ambilDraft();
    await payload.update({
      collection: "page-layouts",
      id: draft!.id!,
      data: {
        layout: draft!.layout,
        revision: draft!.revision,
        _status: "published",
        publishedAt: new Date().toISOString(),
      } as never,
      draft: false,
      overrideAccess: true,
    });

    const publik = await ambilPublik();
    assert.equal(publik?._status, "published");
    const draftBaru = await ambilDraft();
    assert.equal(draftBaru?._status, "published");
  });

  it("konflik revisi ditolak dengan status 409", async () => {
    const draft = await ambilDraft();
    await assert.rejects(
      () =>
        payload.update({
          collection: "page-layouts",
          id: draft!.id!,
          data: { layout: draft!.layout, revision: (draft!.revision ?? 0) - 1 } as never,
          draft: true,
          overrideAccess: true,
        }),
      (err: unknown) => {
        const status = (err as { status?: number }).status;
        assert.equal(status, 409, `harus 409, dapat ${status}`);
        return true;
      },
    );
  });

  it("layout tak valid ditolak oleh hook koleksi", async () => {
    const draft = await ambilDraft();
    await assert.rejects(
      () =>
        payload.update({
          collection: "page-layouts",
          id: draft!.id!,
          data: {
            layout: { root: {}, content: [{ type: "TidakAda", props: { id: "x" } }] },
            revision: draft!.revision,
          } as never,
          draft: true,
          overrideAccess: true,
        }),
      (err: unknown) => {
        const status = (err as { status?: number }).status;
        assert.equal(status, 400, `harus 400, dapat ${status}`);
        return true;
      },
    );
  });

  it("dua publish bersamaan dengan revisi sama hanya menghasilkan satu penulisan", async () => {
    const draft = await ambilDraft();
    assert.ok(draft?.id);
    const revisiAwal = draft!.revision ?? 0;
    const kirimPublish = () =>
      payload.update({
        collection: "page-layouts",
        id: draft!.id!,
        data: {
          layout: draft!.layout,
          revision: revisiAwal,
          _status: "published",
          publishedAt: new Date().toISOString(),
        } as never,
        draft: false,
        overrideAccess: true,
      });

    const hasil = await Promise.allSettled([kirimPublish(), kirimPublish()]);
    const sukses = hasil.filter((h) => h.status === "fulfilled");
    const gagal = hasil.filter(
      (h): h is PromiseRejectedResult => h.status === "rejected",
    );

    assert.equal(sukses.length, 1, "tepat satu publish harus berhasil");
    assert.equal(gagal.length, 1, "publish kedua harus ditolak");
    assert.equal(
      (gagal[0]!.reason as { status?: number }).status,
      409,
      "publish kedua harus mendapat 409",
    );

    const akhir = await ambilDraft();
    assert.equal(akhir?._status, "published");
    assert.equal(
      akhir?.revision,
      revisiAwal + 1,
      "revisi hanya boleh naik satu kali",
    );
  });
});
