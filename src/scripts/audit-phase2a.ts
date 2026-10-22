import { getPayload } from "payload";

import config from "../payload.config";
import { HALAMAN_PUCK } from "../puck/types";
import { layoutDefault } from "../puck/default-layouts";
import { validasiLayoutPuck } from "../puck/validation";

/**
 * Audit rekonsiliasi Phase 2A: status publikasi + isi layout tiap page key.
 *
 * Membaca lewat API resmi Payload (bukan SQL) agar yang terlihat di sini sama
 * dengan yang dibaca `ambilLayoutTerbit()` di halaman publik.
 */

const payload = await getPayload({ config });

type Layout = { root?: unknown; content: { type: string; props: Record<string, unknown> }[] };

const ringkas = (layout: unknown) => {
  const l = layout as Layout;
  if (!l?.content) return "—";
  return l.content
    .map((c) => {
      const p = c.props ?? {};
      const ekstra = Object.entries(p)
        .filter(([k]) => k !== "id")
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");
      return ekstra ? `${c.type}(${ekstra})` : c.type;
    })
    .join(" | ");
};

const bedaDefault = (layout: unknown, pageKey: string) => {
  const def = layoutDefault(pageKey);
  if (!def) return "default: tidak ada";
  const a = JSON.stringify(def.content);
  const b = JSON.stringify((layout as Layout)?.content);
  if (a === b) return "layout sama persis dengan default";
  const ca = def.content.map((c) => c.type);
  const cb = ((layout as Layout)?.content ?? []).map((c) => c.type);
  const urutanSama = JSON.stringify(ca) === JSON.stringify(cb);
  const beda = ca.filter((t, i) => cb[i] !== t);
  return `beda tipe: ${urutanSama ? "tidak" : beda.join(", ") || "?"} | props: ${a === b ? "identik" : "berbeda"}`;
};

const baris: string[] = [];
baris.push(
  "page key | id | main._status | main.rev | versi terbaru | versi published | draft tersedia | publik baca | valid",
);

for (const halaman of Object.values(HALAMAN_PUCK)) {
  const key = halaman.key;

  // 1) Dokumen utama (status admin)
  const semua = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: key } },
    limit: 10,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });
  const doc = semua.docs[0] as
    | { id?: number; _status?: string; revision?: number; published_at?: string }
    | undefined;

  // 2) Versi published (tanpa access override = sama seperti pembacaan publik)
  const publik = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: key }, _status: { equals: "published" } },
    limit: 5,
    depth: 0,
    draft: false,
    overrideAccess: false,
  });
  const publikDoc = publik.docs[0] as
    | { id?: number; _status?: string; revision?: number; layout?: unknown }
    | undefined;

  // 3) Semua version row
  const versi = await payload.find({
    collection: "page-layouts",
    where: { pageKey: { equals: key } },
    limit: 100,
    depth: 0,
    draft: true,
    overrideAccess: true,
    sort: "-revision",
  });
  const versiRows = (versi.docs as {
    id?: number;
    _status?: string;
    revision?: number;
    version?: { status?: string; revision?: number; latest?: boolean };
  }[]).map((v) => ({
    id: v.id,
    status: v.version?.status,
    rev: v.version?.revision,
    latest: v.version?.latest,
    mainStatus: v._status,
  }));
  const terbaru = versiRows[0];
  const adaDraft = versiRows.some((v) => v.status === "draft");
  const adaPublished = versiRows.some((v) => v.status === "published");

  const valid = publikDoc ? validasiLayoutPuck(publikDoc.layout) : null;

  baris.push(
    [
      key,
      String(doc?.id ?? "-"),
      String(doc?._status ?? "-"),
      String(doc?.revision ?? "-"),
      terbaru ? `v${terbaru.rev}/${terbaru.status}${terbaru.latest ? "(latest)" : ""}` : "-",
      publikDoc ? `v${publikDoc.revision}/${publikDoc._status}` : "tidak ada",
      adaDraft ? "ya" : "tidak",
      publikDoc ? "CMS" : "fallback",
      publikDoc ? (valid?.ok ? "valid" : "INVALID") : "-",
    ].join(" | "),
  );

  console.log(`\n===== ${key} (${halaman.rute}) =====`);
  console.log(
    `  dokumen utama  : id=${doc?.id} _status=${doc?._status} revision=${doc?.revision} published_at=${doc?.published_at ?? "-"}`,
  );
  console.log(
    `  versi terbaru  : ${terbaru ? `id=${terbaru.id} version=${terbaru.status} rev=${terbaru.rev} latest=${terbaru.latest}` : "-"}`,
  );
  console.log(
    `  publik baca    : ${publikDoc ? `id=${publikDoc.id} _status=${publikDoc._status} revision=${publikDoc.revision}` : "TIDAK ADA -> fallback statis"}`,
  );
  console.log(`  draft tersedia : ${adaDraft ? "ya" : "tidak"} | published versi: ${adaPublished ? "ya" : "tidak"}`);
  console.log(`  total versi    : ${versiRows.length}`);
  console.log(
    `  10 versi terakhir: ${versiRows
      .slice(0, 10)
      .map((v) => `${v.status}@${v.rev}${v.latest ? "*" : ""}`)
      .join(", ")}`,
  );
  if (publikDoc) {
    console.log(`  isi layout publik : ${ringkas(publikDoc.layout)}`);
    console.log(`  vs default        : ${bedaDefault(publikDoc.layout, key)}`);
  } else {
    const draftDoc = (versi.docs[0] as { layout?: unknown } | undefined)?.layout;
    console.log(`  isi layout draft  : ${ringkas(draftDoc)}`);
    console.log(`  vs default        : ${bedaDefault(draftDoc, key)}`);
  }
}

console.log(`\n\n${baris.join("\n")}`);
process.exit(0);
