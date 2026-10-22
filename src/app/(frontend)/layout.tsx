import type { Metadata } from "next";
import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ambilNavigasi, ambilSitus } from "@/cms/konten";
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
  return {
    metadataBase: new URL(siteUrl),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [situs, navigasi] = await Promise.all([ambilSitus(), ambilNavigasi()]);

  return (
    <html
      lang="id"
      className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white text-navy-900">
        <Suspense fallback={<div aria-hidden="true" className="h-[81px] shrink-0" />}>
          <Navbar
            nama={situs.nama}
            subjudul={situs.subjudul}
            whatsappUrl={situs.whatsappUrl}
            menu={navigasi}
          />
        </Suspense>
        <main id="konten-utama" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
