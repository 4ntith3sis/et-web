import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { outfit, plusJakarta } from "@/lib/fonts";

import "../globals.css";

/* next/font: self-hosted + preload + font-display swap, tanpa request
   ke Google saat runtime. Definisi ada di `@/lib/fonts` (dipakai bersama
   layout admin agar kanvas Puck ikut memuat font yang sama). */

/**
 * Root layout situs publik (route group `(frontend)`).
 *
 * Menangani `<html>/<body>`, font global, dan `globals.css`. CMS Payload
 * memakai root layout sendiri di `app/(payload)`, sehingga admin tidak
 * mewarisi chrome maupun metadata situs publik.
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://easytax.id";
  const judul = "EasyTax | Konsultan Pajak & Akuntansi untuk Bisnis";
  const deskripsi =
    "Jasa konsultan pajak dan akuntansi terpercaya untuk UMKM dan perusahaan di Indonesia. Pelaporan SPT, pembukuan, PKP, restitusi, dan pendampingan audit.";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: judul, absolute: judul },
    description: deskripsi,
    applicationName: "EasyTax",
    authors: [{ name: "EasyTax" }],
    creator: "EasyTax",
    publisher: "EasyTax",
    formatDetection: { telephone: false, email: false, address: false },
    openGraph: {
      title: judul,
      description: deskripsi,
      type: "website",
      locale: "id_ID",
      siteName: "EasyTax",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: judul,
      description: deskripsi,
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico", apple: "/favicon.webp" },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-navy-900">
        <Suspense fallback={<div aria-hidden="true" className="h-[81px] shrink-0" />}>
          <ChromeNavbar />
        </Suspense>
        <main id="konten-utama" className="flex-1">
          {children}
        </main>
        <Suspense fallback={<div aria-hidden="true" className="h-64 shrink-0" />}>
          <ChromeFooter />
        </Suspense>
      </body>
    </html>
  );
}

async function ChromeNavbar() {
  await connection();
  const { ambilNavigasi, ambilSitus } = await import("@/cms/konten");
  const [situs, navigasi] = await Promise.all([ambilSitus(), ambilNavigasi()]);
  return <Navbar nama={situs.nama} subjudul={situs.subjudul} whatsappUrl={situs.whatsappUrl} menu={navigasi} />;
}

async function ChromeFooter() {
  await connection();
  return <Footer />;
}
