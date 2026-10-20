"use client";

import { usePuck } from "@puckeditor/core";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { LayoutPuck } from "@/puck/types";

import { daftarReusable, hapusReusable, simpanReusable, type KomponenUlang } from "./reusable-actions";

/**
 * Plugin kecil Page Builder untuk menyimpan & memakai kembali komponen.
 *
 * Fitur: "Simpan sebagai Komponen Ulang Pakai" (mengekstrak layout terpilih),
 * panel "Komponen Saya" untuk menarik salinan ke kanvas, hapus dari library.
 * Secara default menjadi salinan independen (tidak shared/global).
 */
export function PluginReusable() {
  const { appState, dispatch } = usePuck();
  const state: any = appState;
  const [buka, setBuka] = useState(false);
  const [daftar, setDaftar] = useState<KomponenUlang[]>([]);
  const [memuat, setMemuat] = useState(false);
  const [pesan, setPesan] = useState<string | null>(null);
  const [modalSimpan, setModalSimpan] = useState(false);
  const [nama, setNama] = useState("Komponen");
  const [kategori, setKategori] = useState("Lain-lain");
  const [deskripsi, setDeskripsi] = useState("");
  const [dipilih, setDipilih] = useState<LayoutPuck | null>(null);
  const [menyimpan, setMenyimpan] = useState(false);

  const itemTerpilih: any = state.selectedItem;

  async function muat() {
    setMemuat(true);
    setPesan(null);
    try {
      const d = await daftarReusable();
      setDaftar(d);
    } catch (e: any) {
      setPesan(e?.message || "Gagal memuat library");
    } finally {
      setMemuat(false);
    }
  }

  useEffect(() => {
    muat();
  }, []);

  function ekstrakTerpilih(): LayoutPuck | null {
    const item: any = itemTerpilih;
    if (!item || !item.type) return null;
    const zona = item.zIndexPath ? `content-${item.zIndexPath.join(".")}` : "content";
    return {
      root: {},
      content: [
        {
          type: item.type,
          props: { ...(item.props || {}), id: item.props?.id || crypto.randomUUID() },
        },
      ],
      zones: {},
    } as LayoutPuck;
  }

  function bukaSimpan() {
    const x = ekstrakTerpilih();
    if (!x) return;
    setDipilih(x);
    setNama("Komponen");
    setModalSimpan(true);
  }

  async function lakukanSimpan() {
    if (!dipilih) return;
    setMenyimpan(true);
    setPesan(null);
    try {
      const baru = await simpanReusable({ nama, kategori, deskripsi, data: dipilih });
      setDaftar((prev) => [baru, ...prev]);
      setModalSimpan(false);
    } catch (e: any) {
      setPesan(e?.message || "Gagal menyimpan");
    } finally {
      setMenyimpan(false);
    }
  }

  function tambahkan(data: unknown) {
    const hasil = normalize(data);
    if (!hasil) return;
    const konten = hasil.content || [];
    if (konten.length === 0) return;
    const item = konten[0];
    const propsBaru = { ...(item.props || {}) };
    delete propsBaru.id;
    const id = crypto.randomUUID();
    dispatch({
      type: "insert",
      componentType: item.type,
      destinationIndex: state.indexes?.zones?.root?.content?.length ?? 0,
      destinationZone: "root",
    } as any);
    // Pakai replace setelah insert sederhana? fallback: set lewat insert lalu ganti id minimal
    setTimeout(() => {
      // cari terakhir? mudah: dispatch replace root/content tidak dibutuhkan; cukup insert default + edit: insert sudah buat. tapi kita ingin salin penuh.
      // fallback: masukkan via setData dengan append aman
      const baru = state.data?.content?.slice();
      const last = baru?.[baru.length - 1];
      if (last && last.props?.id) {
        // tidak bisa mutate; abaikan, user bisa klik 2x? lebih baik append manual
      }
    }, 0);
  }

  function normalize(input: unknown): LayoutPuck | null {
    if (!input || typeof input !== "object") return null;
    const obj = input as any;
    if (Array.isArray(obj.content)) return obj as LayoutPuck;
    if (Array.isArray(obj.data?.content)) return obj.data as LayoutPuck;
    return null;
  }

  function append(data: unknown) {
    const hasil = normalize(data);
    if (!hasil) return;
    const konten = hasil.content || [];
    if (konten.length === 0) return;
    const item = { ...konten[0], props: { ...konten[0].props, id: crypto.randomUUID() } };
    const baru = [...(state.data?.content || []), item];
    dispatch({ type: "setData", data: { ...state.data, content: baru } } as any);
  }

  async function hapus(id: string | number) {
    if (!confirm("Hapus komponen ini dari library? Instance yang sudah dipakai tidak akan terhapus.")) return;
    try {
      await hapusReusable(id);
      setDaftar((p) => p.filter((x) => String(x.id) !== String(id)));
    } catch (e: any) {
      setPesan(e?.message || "Gagal menghapus");
    }
  }

  const bisaSimpan = !!itemTerpilih && !!itemTerpilih?.type;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong style={{ fontSize: 14 }}>Komponen Saya</strong>
          <button
            onClick={() => { setBuka((v) => !v); if (!buka) muat(); }}
            style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer" }}
          >
            {buka ? "Tutup" : "Buka"}
          </button>
        </div>

        {bisaSimpan ? (
          <button
            onClick={bukaSimpan}
            style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}
          >
            Simpan sebagai Komponen Ulang Pakai
          </button>
        ) : (
          <small style={{ color: "#9ca3af" }}>Pilih satu komponen di kanvas untuk menyimpan</small>
        )}

        {buka && (
          <div style={{ display: "grid", gap: 8, maxHeight: 320, overflow: "auto", paddingRight: 4 }}>
            {memuat ? <small style={{ color: "#6b7280" }}>Memuat…</small> : null}
            {pesan ? <small style={{ color: "#dc2626" }}>{pesan}</small> : null}
            {daftar.length === 0 && !memuat ? <small style={{ color: "#9ca3af" }}>Library masih kosong</small> : null}
            {daftar.map((r) => (
              <div key={String(r.id)} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{r.nama}</strong>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{r.kategori}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => append(r.data)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 11, cursor: "pointer" }}>
                      Tambahkan
                    </button>
                    <button onClick={() => hapus(r.id)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #fecaca", background: "#fff", color: "#b91c1c", fontSize: 11, cursor: "pointer" }}>
                      Hapus
                    </button>
                  </div>
                </div>
                {r.deskripsi ? <small style={{ color: "#6b7280" }}>{r.deskripsi}</small> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalSimpan ? (
        <div
          role="dialog"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(17,24,39,0.55)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
          onClick={() => setModalSimpan(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "min(420px, 100%)", background: "#fff", borderRadius: 12, padding: 18, display: "grid", gap: 14 }}
          >
            <h3 style={{ margin: 0 }}>Simpan sebagai Komponen Ulang Pakai</h3>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Nama komponen</span>
              <input
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Kategori</span>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              >
                <option value="Layout">Layout</option>
                <option value="Konten">Konten</option>
                <option value="Kartu">Kartu</option>
                <option value="Interaktif">Interaktif</option>
                <option value="Section Website">Section Website</option>
                <option value="Lain-lain">Lain-lain</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Deskripsi (opsional)</span>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                rows={3}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
              />
            </label>
            {pesan ? <small style={{ color: "#dc2626" }}>{pesan}</small> : null}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setModalSimpan(false)} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff" }}>
                Batal
              </button>
              <button onClick={lakukanSimpan} disabled={menyimpan} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "#fff", fontWeight: 600 }}>
                {menyimpan ? "Menyimpan…" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default PluginReusable;
