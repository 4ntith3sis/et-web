import { KerjaKalkulator } from "@/components/kalkulator/KerjaKalkulator";

/**
 * Halaman /kalkulator-pajak. Tanpa hero — langsung workspace kalkulator.
 * Logika & konten perhitungan diport 1:1 dari easytax-demo (v1): delapan
 * kalkulator (PPh 21/22/23/4(2)/15, PPh Badan, PPN, PPnBM) dengan kode objek
 * pajak, tabel TER, dan tarif progresif yang sama. Visual memakai design v2.
 */
export default function KalkulatorPajakPage() {
  return <KerjaKalkulator />;
}
