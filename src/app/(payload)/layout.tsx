/* Import CSS pertama di file ini = sheet pertama yang diterbitkan Turbopack
   untuk route admin (terbit sebelum chunk CSS Payload sendiri). Isinya hanya
   pernyataan `@layer` — lihat komentar di layer-order.css. */
import "./layer-order.css";

import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import config from "@payload-config";
import React from "react";
import type { ServerFunctionClient } from "payload";

import { importMap } from "./admin/importMap.js";

/* Puck menyalin seluruh `style`/`link[rel=stylesheet]` dari dokumen induk ke
   iframe pratinjaunya (`syncHostStyles`). Tanpa Tailwind di dokumen admin,
   kanvas kehilangan semua utility class dan komponen situs ter-render salah
   (Hero melar, gambar tidak ter-crop). Import ini membuat kanvas setara dengan
   halaman publik. */
import "../globals.css";
import "@payloadcms/next/css";
import "./custom.scss";

/* Memuat `@font-face` Outfit & Plus Jakarta Sans ke dokumen admin supaya
   `syncHostStyles` menyalinnya ke kanvas Puck. Tanpa ini kanvas memakai font
   sistem dan berbeda dari halaman publik. Class variabel dipasang ke wrapper
   agar `next/font` benar-benar menerbitkan CSS-nya. */
import { outfit, plusJakarta } from "@/lib/fonts";

type Args = {
  children: React.ReactNode;
};

/**
 * Root layout khusus admin Payload (route group `(payload)`).
 *
 * Merender `<html>/<body>` sendiri dan membaca cookie/header, jadi sengaja
 * terpisah dari root layout situs publik. `serverFunction` WAJIB berupa Server
 * Action (direktif `"use server"`) agar bisa dikirim ke `RootProvider` di
 * klien; `handleServerFunctions` menjembatani pemanggilan tersebut dengan
 * `config` dan `importMap`.
 */
const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ config, importMap, ...args });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    <div className={`${outfit.variable} ${plusJakarta.variable}`}>{children}</div>
  </RootLayout>
);

export default Layout;
