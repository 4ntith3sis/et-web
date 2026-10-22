import type { Metadata } from "next";
import { outfit, plusJakarta } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Homepage Editor | EasyTax Admin",
  robots: { index: false, follow: false },
};

export default function AdminToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full bg-white text-navy-900">{children}</body>
    </html>
  );
}
