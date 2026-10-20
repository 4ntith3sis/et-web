"use client";

import type { CustomFieldRender } from "@puckeditor/core";
import { useEffect, useMemo, useState } from "react";

import type { MediaTerpilih } from "@/puck/komponen/tipe";

import { daftarMedia, type MediaRingkas } from "./media-actions";

/**
 * Media picker Page Builder.
 *
 * Field kustom Puck yang membaca koleksi `media` Payload lewat server action
 * (cookie sesi admin diverifikasi di server). Admin memilih gambar dari
 * pustaka media — tidak perlu menempel URL manual.
 */
export const MediaPickerField: CustomFieldRender<MediaTerpilih> = ({
  value,
  onChange,
  readOnly,
}) => {
  const [terbuka, setTerbuka] = useState(false);
  const [cari, setCari] = useState("");
  const [daftar, setDaftar] = useState<MediaRingkas[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);

  useEffect(() => {
    if (!terbuka) return;
    let batal = false;
    setMemuat(true);
    setGalat(null);
    daftarMedia(cari)
      .then((hasil) => {
        if (!batal) setDaftar(hasil);
      })
      .catch((err: unknown) => {
        if (!batal) setGalat(err instanceof Error ? err.message : "Gagal memuat media.");
      })
      .finally(() => {
        if (!batal) setMemuat(false);
      });
    return () => {
      batal = true;
    };
  }, [terbuka, cari]);

  const pilihan = useMemo(() => (value?.url ? value : null), [value]);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <div
          style={{
            width: 72,
            height: 54,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            background: "#f3f4f6",
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {pilihan?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pilihan.url} alt={pilihan.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Kosong</span>
          )}
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <button
            type="button"
            disabled={readOnly}
            onClick={() => setTerbuka(true)}
            style={{
              padding: "7px 12px",
              borderRadius: 7,
              border: "1px solid #d1d5db",
              background: "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {pilihan?.url ? "Ganti gambar" : "Pilih gambar"}
          </button>
          {pilihan?.url ? (
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ url: "", alt: "", id: undefined })}
              style={{
                padding: "5px 10px",
                borderRadius: 7,
                border: "1px solid #fecaca",
                background: "#fff",
                color: "#b91c1c",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Hapus gambar
            </button>
          ) : null}
        </div>
      </div>

      {pilihan?.url ? (
        <input
          type="text"
          value={pilihan.alt}
          placeholder="Teks alternatif gambar"
          onChange={(e) => onChange({ ...pilihan, alt: e.target.value })}
          style={{ padding: "7px 10px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13 }}
        />
      ) : null}

      {terbuka ? (
        <div
          role="dialog"
          aria-label="Pilih media"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(17,24,39,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
          onClick={() => setTerbuka(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(880px, 100%)",
              maxHeight: "80vh",
              background: "#fff",
              borderRadius: 12,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", gap: 10, padding: 14, borderBottom: "1px solid #e5e7eb" }}>
              <input
                autoFocus
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama file…"
                style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 }}
              />
              <button
                type="button"
                onClick={() => setTerbuka(false)}
                style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontWeight: 600, cursor: "pointer" }}
              >
                Tutup
              </button>
            </div>

            <div style={{ overflow: "auto", padding: 14 }}>
              {memuat ? <p style={{ color: "#6b7280" }}>Memuat…</p> : null}
              {galat ? <p style={{ color: "#b91c1c" }}>{galat}</p> : null}
              {!memuat && !galat && daftar.length === 0 ? (
                <p style={{ color: "#6b7280" }}>
                  Belum ada media. Unggah gambar lewat menu Media di admin, lalu coba lagi.
                </p>
              ) : null}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                {daftar.map((m) => (
                  <button
                    key={String(m.id)}
                    type="button"
                    onClick={() => {
                      onChange({ id: m.id, url: m.url, alt: m.alt, width: m.width, height: m.height });
                      setTerbuka(false);
                    }}
                    style={{
                      padding: 0,
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      overflow: "hidden",
                      cursor: "pointer",
                      background: "#fff",
                      textAlign: "left",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt} style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }} />
                    <span style={{ display: "block", padding: "6px 8px", fontSize: 11, color: "#4b5563", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.nama}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
