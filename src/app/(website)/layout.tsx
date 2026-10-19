import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ambilNavigasi, ambilSitus } from "@/cms/konten";

import "../globals.css";

/* next/font: self-hosted + preload + font-display swap, tanpa request
   ke Google saat runtime. */
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

/**
 * Root layout situs publik (route group `(website)`).
 *
 * Menangani `<html>/<body>`, font global, dan `globals.css`. CMS Payload
 * memakai root layout sendiri di `app/(payload)`, sehingga admin tidak
 * mewarisi chrome maupun metadata situs publik.
 */
export async function generateMetadata(): Promise<Metadata> {
  const situs = await ambilSitus();
  return {
    title: `${situs.nama} - Jasa Konsultan Pajak dan Akuntansi Perusahaan`,
    description: situs.deskripsi,
    openGraph: {
      locale: "id_ID",
      siteName: situs.nama,
      type: "website",
    },
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
        <Navbar
          nama={situs.nama}
          subjudul={situs.subjudul}
          whatsappUrl={situs.whatsappUrl}
          menu={navigasi}
        />
        <main id="konten-utama" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
