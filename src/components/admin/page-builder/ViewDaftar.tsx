import { SetStepNav } from "@payloadcms/ui";
import Link from "next/link";
import type { AdminViewServerProps } from "payload";

import { DAFTAR_HALAMAN } from "@/puck/types";

import { stafAtauRedirect } from "./penjaga";
import { TemplatAdmin } from "./TemplatAdmin";

/**
 * View kustom `/admin/page-builder`: pemilih halaman.
 *
 * Hanya halaman yang terdaftar di registry (`HALAMAN_PUCK`) yang boleh
 * dibangun. Status draft/terbit dibaca langsung dari koleksi `page-layouts`.
 */
export async function ViewDaftar(props: AdminViewServerProps) {
  stafAtauRedirect(props.user, "/admin/page-builder");

  const res = await props.payload.find({
    collection: "page-layouts",
    limit: 100,
    depth: 0,
    draft: true,
    overrideAccess: true,
  });

  const peta = new Map(
    res.docs.map((doc) => {
      const d = doc as { pageKey?: string; revision?: number; _status?: string };
      return [d.pageKey ?? "", d] as const;
    }),
  );

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
          Susun tata letak halaman secara visual. Perubahan disimpan sebagai
          draft sampai Anda menekan Publish di editor.
        </p>
      </header>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12 }}>
        {DAFTAR_HALAMAN.map((halaman) => {
          const dok = peta.get(halaman.key);
          const jumlah = dok?.revision ?? 0;
          const terbit = dok?._status === "published";
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
                  {jumlah > 0 ? ` · revisi ${jumlah}` : ""}
                </p>
              </div>

              <Link
                href={`/admin/page-builder/${halaman.key}`}
                style={{
                  flexShrink: 0,
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "#111827",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                }}
              >
                Buka editor
              </Link>
            </li>
          );
        })}
      </ul>

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
