"use client";

import dynamic from "next/dynamic";

import type { LayoutPuck, MetadataPuck } from "@/puck/types";

/**
 * Pembungkus klien untuk editor Puck.
 *
 * Puck hanya berjalan di browser (mengakses `window`/`document`), jadi
 * komponen inti dimuat lewat `next/dynamic` dengan `ssr: false`. Ini menjaga
 * view admin tetap bisa dirender server tanpa error hidrasi.
 */
const EditorPuck = dynamic(() => import("./EditorPuck").then((m) => m.EditorPuck), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        height: "100dvh",
        fontFamily: "system-ui, sans-serif",
        color: "#4b5563",
      }}
    >
      Memuat editor…
    </div>
  ),
});

export type PropsEditorPageBuilder = {
  pageKey: string;
  judul: string;
  rute: string;
  initialLayout: LayoutPuck;
  initialRevision: number;
  metadata: MetadataPuck;
};

export function EditorPageBuilder(props: PropsEditorPageBuilder) {
  return <EditorPuck {...props} />;
}
