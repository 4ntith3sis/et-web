import type { Metadata } from "next";

import { KerjaKalkulator } from "@/components/kalkulator/KerjaKalkulator";

export const metadata: Metadata = {
  title: "Kalkulator Pajak Online | EasyTax",
  description:
    "Hitung PPh 21, PPh 22, PPh 23, PPh 4(2), PPh 15, PPh Badan, PPN, dan PPnBM dengan kalkulator pajak online EasyTax.",
  alternates: { canonical: "/kalkulator-pajak" },
  openGraph: {
    title: "Kalkulator Pajak Online | EasyTax",
    description:
      "Kalkulator pajak online untuk PPh, PPN, dan PPnBM dengan tarif terbaru.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
    url: "/kalkulator-pajak",
  },
};

/**
 * Halaman /kalkulator-pajak. Tanpa hero — langsung workspace kalkulator.
 * Logika & konten perhitungan diport 1:1 dari easytax-demo (v1): delapan
 * kalkulator (PPh 21/22/23/4(2)/15, PPh Badan, PPN, PPnBM) dengan kode objek
 * pajak, tabel TER, dan tarif progresif yang sama. Visual memakai design v2.
 */
export default function KalkulatorPajakPage() {
  return <KerjaKalkulator />;
}
