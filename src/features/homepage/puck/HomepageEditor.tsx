"use client";

import "@puckeditor/core/puck.css";

import { Puck } from "@puckeditor/core";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";

import { homepagePuckConfig } from "./config";
import type { LayoutPuck, MetadataPuck } from "./types";
import { simpanHomepageDraft, terbitkanHomepage } from "../actions";

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

export type PropsHomepageEditor = {
  initialLayout: LayoutPuck;
  initialRevision: number;
  metadata?: MetadataPuck;
};

export function HomepageEditor({
  initialLayout,
  initialRevision,
  metadata,
}: PropsHomepageEditor) {
  const revisionRef = useRef(initialRevision);
  const dataRef = useRef<LayoutPuck>(initialLayout);
  const sibukRef = useRef(false);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState(false);

  const jalankanSimpanDraft = async (): Promise<boolean> => {
    if (sibukRef.current) return false;
    sibukRef.current = true;
    setSibuk(true);
    setPesan("Menyimpan draft...");
    setGalat(false);

    try {
      const hasil = await simpanHomepageDraft(dataRef.current, revisionRef.current);
      if (!hasil.ok) {
        setGalat(true);
        setPesan(hasil.error);
        return false;
      }
      revisionRef.current = hasil.revision;
      setPesan(`Draft tersimpan (rev ${hasil.revision}).`);
      return true;
    } catch (err) {
      setGalat(true);
      setPesan(err instanceof Error ? err.message : "Gagal menyimpan draft.");
      return false;
    } finally {
      sibukRef.current = false;
      setSibuk(false);
    }
  };

  const jalankanPublish = async (dataPublikasi: LayoutPuck) => {
    if (sibukRef.current) return;
    sibukRef.current = true;
    setSibuk(true);
    setPesan("Menerbitkan beranda...");
    setGalat(false);

    try {
      const hasil = await terbitkanHomepage(dataPublikasi, revisionRef.current);
      if (!hasil.ok) {
        setGalat(true);
        setPesan(hasil.error);
        return;
      }
      revisionRef.current = hasil.revision;
      dataRef.current = dataPublikasi;
      setPesan(`Berhasil diterbitkan! (rev ${hasil.revision})`);
    } catch (err) {
      setGalat(true);
      setPesan(err instanceof Error ? err.message : "Gagal menerbitkan.");
    } finally {
      sibukRef.current = false;
      setSibuk(false);
    }
  };

  const bukaPratinjau = async () => {
    const ok = await jalankanSimpanDraft();
    if (ok) {
      window.open("/pratinjau/beranda", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Puck
        config={homepagePuckConfig}
        data={initialLayout}
        metadata={metadata}
        onChange={(data) => {
          dataRef.current = data;
        }}
        onPublish={jalankanPublish}
        overrides={{
          headerActions: ({ children }) => (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {pesan && (
                <span
                  style={{
                    fontSize: 13,
                    color: galat ? "#b91c1c" : "#047857",
                    marginRight: 8,
                    fontWeight: 500,
                  }}
                >
                  {pesan}
                </span>
              )}
              <button
                type="button"
                onClick={bukaPratinjau}
                disabled={sibuk}
                style={{
                  ...gayaTombol,
                  opacity: sibuk ? 0.6 : 1,
                }}
              >
                Pratinjau
              </button>
              <Link href="/admin" style={gayaTombol}>
                Kembali ke Admin
              </Link>
              {children}
            </div>
          ),
        }}
      />
    </div>
  );
}

export default HomepageEditor;
