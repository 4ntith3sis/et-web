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
  partialPrefetching: true,
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