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
 * Menyediakan tombol Simpan Draft, Pratinjau, Lihat Halaman, dan Kembali di
 * samping tombol Publish bawaan Puck. Semua penyimpanan lewat server action
 * sehingga peran pengguna dan validasi layout selalu diverifikasi di server.
 * `revisionRef` melacak revisi terakhir yang diketahui untuk deteksi konflik.
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
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState(false);

  const simpan = async () => {
    setSibuk(true);
    setPesan(null);
    const hasil = await simpanDraft(pageKey, dataRef.current, revisionRef.current);
    if (hasil.ok) {
      revisionRef.current = hasil.revision;
      setGalat(false);
      setPesan("Draft tersimpan.");
    } else {
      setGalat(true);
      setPesan(hasil.error);
    }
    setSibuk(false);
  };

  const terbitkan = async (data: LayoutPuck) => {
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
  };

  const aksiHeader = ({ children }: { children: ReactNode }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {children}
      <button type="button" onClick={simpan} disabled={sibuk} style={gayaTombol}>
        Simpan Draft
      </button>
      <Link href={`/pratinjau/${pageKey}`} target="_blank" style={gayaTombol}>
        Pratinjau
      </Link>
      <Link href={rute} target="_blank" style={gayaTombol}>
        Lihat Halaman
      </Link>
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
      {sibuk ? <span style={{ fontSize: 13, color: "#6b7280" }}>Menyimpan…</span> : null}
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
