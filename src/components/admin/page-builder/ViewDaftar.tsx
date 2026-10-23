import { SetStepNav } from "@payloadcms/ui";
import Link from "next/link";
import type { AdminViewServerProps } from "payload";

import { urlPratinjauHalaman } from "@/cms/layout";
import { HALAMAN_PUCK } from "@/puck/types";
import { KUNCI_PUCK_BERANDA } from "@/puck/editor-policy";

import { stafAtauRedirect } from "./penjaga";
import { TemplatAdmin } from "./TemplatAdmin";

/**
 * View kustom `/admin/page-builder`: pemilih halaman.
 *
 * Puck editor dibatasi hanya untuk Beranda. Registry dan dokumen halaman lain
 * tetap tersedia untuk renderer publik, tetapi tidak ditawarkan untuk editing.
 */
export async function ViewDaftar(props: AdminViewServerProps) {
  stafAtauRedirect(props.user, "/admin/page-builder");

  const [resMain, resDraft] = await Promise.all([
    props.payload.find({
      collection: "page-layouts",
      limit: 100,
      depth: 0,
      draft: false,
      overrideAccess: true,
    }),
    props.payload.find({
      collection: "page-layouts",
      limit: 100,
      depth: 0,
      draft: true,
      overrideAccess: true,
    }),
  ]);

  const halaman = HALAMAN_PUCK[KUNCI_PUCK_BERANDA];
  const peta = new Map(
    resMain.docs
      .filter((doc) => (doc as { pageKey?: string }).pageKey === halaman.key)
      .map((doc) => {
        const d = doc as { pageKey?: string; revision?: number; _status?: string };
        return [d.pageKey ?? "", d] as const;
      }),
  );
  const petaDraft = new Map(
    resDraft.docs
      .filter((doc) => (doc as { pageKey?: string }).pageKey === halaman.key)
      .map((doc) => {
        const d = doc as { pageKey?: string; revision?: number };
        return [d.pageKey ?? "", d] as const;
      }),
  );

  /* URL Preview konkret per halaman. Halaman statis memakai rutenya sendiri;
     template dinamis (`/layanan/[slug]`, `/tulisan-pajak/[slug]`) dipetakan ke
     slug record nyata dari Payload, atau `null` bila belum ada data. */
  const urlPratinjau = new Map([
    [halaman.key, await urlPratinjauHalaman(halaman.key, halaman.rute)] as const,
  ]);

  return (
    <TemplatAdmin props={props}>
    {/* View kustom tidak mengisi StepNav Payload; tanpa ini breadcrumb header
        tetap memakai label halaman admin yang dikunjungi sebelumnya. */}
    <SetStepNav nav={[{ label: "Page Builder" }]} />
    <div style={{ margin: "0 auto", maxWidth: 860, padding: "40px 24px" }}>
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#6b7280",
            fontWeight: 700,
          }}
        >
          Tampilan
        </p>
        <h1 style={{ margin: "6px 0 8px", fontSize: 28, fontWeight: 800 }}>
          Page Builder
        </h1>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6, maxWidth: 620 }}>
          Susun tata letak halaman secara visual. Perubahan tampil di Pratinjau
          hingga Anda menekan Publish di editor untuk memperbarui halaman publik.
        </p>
      </header>

      <div style={{ marginBottom: 24 }}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
          {[halaman].map((halaman) => {
                  const dok = peta.get(halaman.key);
                  const draft = petaDraft.get(halaman.key);
                  const revisiPublik = dok?.revision ?? 0;
                  const revisiDraft = draft?.revision ?? 0;
                  const jumlah = dok ? revisiPublik : revisiDraft;
                  const adaDraftBaru = revisiDraft > revisiPublik;
                  const terbit = dok?._status === "published";
                  const pratinjau = urlPratinjau.get(halaman.key) ?? null;
                  return (
                    <li
                      key={halaman.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        border: "1px solid #e5e7eb",
                        borderRadius: 10,
                        padding: "16px 18px",
                        background: "#fff",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <strong style={{ fontSize: 16 }}>{halaman.judul}</strong>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 999,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              background: terbit ? "#dcfce7" : "#fef3c7",
                              color: terbit ? "#166534" : "#92400e",
                            }}
                          >
                            {terbit ? "Terbit" : dok ? "Draft" : "Belum ada"}
                          </span>
                        </div>
                        <p style={{ margin: "6px 0 0", color: "#6b7280", fontSize: 13 }}>
                          {halaman.keterangan} · <code>{halaman.rute}</code>
                          {jumlah > 0
                            ? terbit
                              ? ` · revisi publik ${jumlah}`
                              : ` · draft rev ${jumlah}`
                            : ""}
                          {adaDraftBaru && dok ? ` · draft rev ${revisiDraft}` : ""}
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <Link
                          href={`/admin/page-builder/${halaman.key}`}
                          style={{
                            padding: "9px 16px",
                            borderRadius: 8,
                            background: "#111827",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 14,
                            textDecoration: "none",
                          }}
                        >
                          Edit
                        </Link>
                        {pratinjau ? (
                          <Link
                            href={pratinjau}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "9px 16px",
                              borderRadius: 8,
                              background: "#f3f4f6",
                              color: "#111827",
                              fontWeight: 700,
                              fontSize: 14,
                              textDecoration: "none",
                              border: "1px solid #e5e7eb",
                            }}
                          >
                            Preview
                          </Link>
                        ) : (
                          <span
                            title="Belum ada data untuk dipratinjau"
                            style={{
                              padding: "9px 16px",
                              borderRadius: 8,
                              background: "#f9fafb",
                              color: "#9ca3af",
                              fontWeight: 700,
                              fontSize: 14,
                              border: "1px dashed #e5e7eb",
                              cursor: "not-allowed",
                            }}
                          >
                            Preview
                          </span>
                        )}
                      </div>
                    </li>
                  );
          })}
        </ul>
      </div>

      <p style={{ marginTop: 24 }}>
        <Link href="/admin" style={{ color: "#2563eb", fontSize: 14 }}>
          ← Kembali ke dashboard
        </Link>
      </p>
    </div>
    </TemplatAdmin>
  );
}

export default ViewDaftar;
