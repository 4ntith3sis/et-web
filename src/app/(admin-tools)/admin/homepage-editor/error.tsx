"use client";

import Link from "next/link";

export default function ErrorHomepageEditor({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f9fafb",
        color: "#111827",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          backgroundColor: "#ffffff",
          padding: 32,
          borderRadius: 12,
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#b91c1c" }}>
          Gagal Memuat Editor Beranda
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
          {error.message || "Terjadi kesalahan saat memuat data layout."}
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 18px",
              backgroundColor: "#152269",
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Coba Lagi
          </button>
          <Link
            href="/admin"
            style={{
              padding: "10px 18px",
              backgroundColor: "#e5e7eb",
              color: "#374151",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Kembali ke Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
