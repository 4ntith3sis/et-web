import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Folder proyek berada beberapa level di dalam home, jadi Turbopack
  // menebak root sebagai home dan menolak membaca package-lock.json.
  // Pin root ke folder proyek ini.
  turbopack: {
    // Folder proyek berada beberapa level di dalam home, jadi Turbopack
    // menebak root sebagai home dan menolak membaca package-lock.json.
    // Pin root ke folder proyek ini.
    root: __dirname,
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  cacheComponents: true,
  // Saat diuji lewat 127.0.0.1, Next memblokir resource dev (termasuk HMR)
  // karena origin dianggap lintas host. Izinkan loopback agar hidrasi UI tetap
  // berjalan baik lewat localhost maupun 127.0.0.1. Opsi ini hanya untuk dev.
  allowedDevOrigins: ["127.0.0.1"],
  // Pertahankan halaman yang telah dikompilasi di memori dev server lebih lama
  // agar navigasi bolak-balik antar halaman tidak memicu re-compilation berulang.
  onDemandEntries: {
    maxInactiveAge: 15 * 60 * 1000,
    pagesBufferLength: 25,
  },
  experimental: {
    optimizePackageImports: ["@puckeditor/core"],
    globalNotFound: true,
  },
  // /artikel adalah duplikat lama dari /tulisan-pajak. Arahkan permanen ke
  // URL kanonis agar tidak ada dua halaman indeksabel dengan isi identik.
  async redirects() {
    return [
      { source: "/artikel", destination: "/tulisan-pajak", permanent: true },
      {
        source: "/artikel/:slug*",
        destination: "/tulisan-pajak/:slug*",
        permanent: true,
      },
    ];
  },
  // Dimatikan karena bug pada Payload 3.91: saat Partial Prefetching aktif,
  // Next merender ulang route admin yang sudah terautentikasi dalam konteks
  // prefetch dan menandai `new Date()` di dalam operasi sesi Payload
  // (`authenticate` -> `removeExpiredSessions`) sebagai blocking prerender:
  // 'Route "/admin/[[...segments]]": Next.js encountered the unstable value
  // `new Date()` while prerendering.'
  // `instant = false` / `prefetch = 'force-disabled'` per-route TIDAK
  // mempan; hanya opsi ini yang menghilangkan errornya. Perbaikan permanen
  // menyusul di rilis Payload mayor berikutnya (payloadcms/payload#18065,
  // PR #18694/#18702). Aktifkan lagi setelah Payload dinaikkan ke versi itu.
  partialPrefetching: false,
  images: {
    // Payload menyusun URL media absolut dari PAYLOAD_PUBLIC_SERVER_URL, sehingga
    // optimizer next/image mengambilnya lewat jaringan. Di dev host-nya localhost
    // (IP privat) yang diblokir Next demi keamanan SSRF. URL media hanya berasal
    // dari dokumen media yang dibuat admin (bukan input pengguna), jadi aman
    // diizinkan. Di produksi host adalah domain publik sehingga opsi ini no-op.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Media yang diunggah lewat CMS Payload disajikan dari host ini.
      // Tambahkan domain produksi Anda di sini saat deploy.
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
    ],
  },
};

// withPayload menambahkan dukungan Payload (alias @payload-config, externalisasi
// paket server, env PAYLOAD_CACHE_COMPONENTS_ENABLED, dan header admin).
export default withPayload(nextConfig);