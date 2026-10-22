"use client";

import "@puckeditor/core/puck.css";

import { Puck } from "@puckeditor/core";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";

import { puckConfig } from "@/puck/config";
import type { LayoutPuck } from "@/puck/types";

import { simpanDraft, terbitkanLayout } from "./actions";
import type { PropsEditorPageBuilder } from "./EditorPageBuilder";
import PluginReusable from "./PluginReusable";

/**
 * Editor visual Puck untuk satu halaman.
 *
 * Toolbar menyediakan Pratinjau, dan Kembali di samping tombol Publish bawaan
 * Puck. Alur draft disembunyikan dari pengguna: tidak ada tombol "Simpan Draft".
 * Menekan Pratinjau otomatis menyimpan perubahan sebagai versi draft (lewat
 * action `simpanDraft` yang sama) lalu membuka `/pratinjau/<pageKey>` di tab
 * baru, sehingga yang terlihat selalu kondisi terbaru editor tanpa menyentuh
 * halaman publik. Publish menerbitkan layout ke publik.
 *
 * Semua penyimpanan lewat server action sehingga peran pengguna dan validasi
 * layout selalu diverifikasi di server. `revisionRef` melacak revisi terakhir
 * yang diketahui untuk deteksi konflik. Versi draft tetap tersimpan di riwayat
 * (revision history) — mekanisme internal dipertahankan, hanya UI-nya yang
 * disederhanakan.
 */

const gayaTombol: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  height: 36,
  padding: "0 14px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#111827",
  fontSize: 14,
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export function EditorPuck({
  pageKey,
  judul,
  rute,
  initialLayout,
  initialRevision,
  metadata,
}: PropsEditorPageBuilder) {
  const revisionRef = useRef(initialRevision);
  const dataRef = useRef<LayoutPuck>(initialLayout);
  /* Guard sinkron: state React (`sibuk`) belum tentu sudah ter-flush saat klik
     beruntun, sehingga dua Publish bisa berjalan bersamaan. Ref ini menutup
     celah itu agar satu klik = satu aksi. */
  const sibukRef = useRef(false);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState(false);

  /**
   * Simpan perubahan terbaru sebagai versi draft tanpa menyentuh publik.
   * Mengembalikan `true` bila berhasil; pesan status diperbarui di tempat.
   */
  const simpanDraftInternal = async (): Promise<boolean> => {
    const hasil = await simpanDraft(pageKey, dataRef.current, revisionRef.current);
    if (hasil.ok) {
      revisionRef.current = hasil.revision;
      setGalat(false);
      return true;
    }
    setGalat(true);
    setPesan(hasil.error);
    return false;
  };

  /**
   * Tombol Pratinjau: simpan draft terlebih dahulu agar `/pratinjau` selalu
   * menampilkan kondisi terbaru editor, lalu buka di tab baru.
   */
  const pratinjau = async () => {
    if (sibukRef.current) return;
    sibukRef.current = true;
    setSibuk(true);
    setPesan(null);
    const ok = await simpanDraftInternal();
    if (ok) setPesan("Pratinjau dibuka di tab baru.");
    setSibuk(false);
    sibukRef.current = false;
    if (!ok) return;
    // Dibuka setelah penyimpanan selesai; popup-blocker tidak berlaku karena
    // berasal dari klik pengguna, namun tetap aman bila diblokir.
    window.open(`/pratinjau/${pageKey}`, "_blank", "noopener,noreferrer");
  };

  const terbitkan = async (data: LayoutPuck) => {
    if (sibukRef.current) return;
    sibukRef.current = true;
    setSibuk(true);
    setPesan(null);
    dataRef.current = data;
    const hasil = await terbitkanLayout(pageKey, data, revisionRef.current);
    if (hasil.ok) {
      revisionRef.current = hasil.revision;
      setGalat(false);
      setPesan("Layout diterbitkan. Halaman publik diperbarui.");
    } else {
      setGalat(true);
      setPesan(hasil.error);
    }
    setSibuk(false);
    sibukRef.current = false;
  };

  const aksiHeader = ({ children }: { children: ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {children}
      <button type="button" onClick={pratinjau} disabled={sibuk} style={gayaTombol}>
        Pratinjau
      </button>
      <Link href="/admin/page-builder" style={gayaTombol}>
        Kembali
      </Link>
      {pesan ? (
        <span
          role="status"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: galat ? "#dc2626" : "#16a34a",
            maxWidth: 260,
          }}
        >
          {pesan}
        </span>
      ) : null}
      {sibuk ? <span style={{ fontSize: 13, color: "#6b7280" }}>Memproses…</span> : null}
    </div>
  );

  return (
    <Puck
      config={puckConfig}
      data={initialLayout}
      metadata={metadata}
      height="100%"
      headerTitle={judul}
      headerPath={rute}
      onChange={(data) => {
        dataRef.current = data;
      }}
      onPublish={(data) => terbitkan(data)}
      plugins={[PluginReusable as any]}
      overrides={{ headerActions: aksiHeader }}
    />
  );
}
