import type { Metadata } from "next";

import { KerjaKalkulator } from "@/components/kalkulator/KerjaKalkulator";

export const metadata: Metadata = {
  title: "Kalkulator Pajak | EasyTax",
  description:
    "Hitung estimasi pajak Anda dengan kalkulator PPh 21, PPh 22, PPh 23, PPh 4(2), PPh 15, PPh Badan, PPN, dan PPnBM di EasyTax.",
  openGraph: {
    title: "Kalkulator Pajak | EasyTax",
    description:
      "Hitung estimasi pajak Anda dengan kalkulator PPh 21, PPh 22, PPh 23, PPh 4(2), PPh 15, PPh Badan, PPN, dan PPnBM di EasyTax.",
    type: "website",
    locale: "id_ID",
    siteName: "EasyTax",
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
