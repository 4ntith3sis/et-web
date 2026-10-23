import type { SVGProps } from "react";
import type { NamaIkon } from "@/types";

/* ==========================================================================
   Set ikon SVG internal — menggantikan Font Awesome CDN yang dipakai v1.
   Semua ikon mewarisi currentColor, jadi warnanya mengikuti teks induk.
   ========================================================================== */

type PropsIkon = SVGProps<SVGSVGElement>;

function Bungkus({
  children,
  ...props
}: PropsIkon & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function PanahKanan(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Bungkus>
  );
}

export function PanahKiri(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Bungkus>
  );
}

export function Rumah(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M4 10.5L12 4l8 6.5" />
      <path d="M6 9.8V20h12V9.8" />
      <path d="M10 20v-5.5h4V20" />
    </Bungkus>
  );
}

export function Cari(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8L20 20" />
    </Bungkus>
  );
}

export function TutupLingkar(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </Bungkus>
  );
}

export function Centang(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.2l2.4 2.4 4.6-4.9" />
    </Bungkus>
  );
}

export function Medali(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5L7 22l5-2.5L17 22l-1.5-8.5" />
    </Bungkus>
  );
}

export function Perisai(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M12 3l7.5 3v5.5c0 4.5-3 8.2-7.5 9.5-4.5-1.3-7.5-5-7.5-9.5V6L12 3z" />
      <path d="M9.2 12.2l2 2 3.6-3.8" />
    </Bungkus>
  );
}

export function Kunci(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    </Bungkus>
  );
}

export function Obrolan(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M20.5 12.2c0 4-3.8 7.2-8.5 7.2-1 0-2-.15-2.9-.43L4 20.5l1.6-3.7A6.9 6.9 0 013.5 12.2C3.5 8.2 7.3 5 12 5s8.5 3.2 8.5 7.2z" />
    </Bungkus>
  );
}

export function Bintang(props: PropsIkon) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M12 3.6l2.6 5.3 5.9.86-4.25 4.14 1 5.86L12 17.1l-5.25 2.76 1-5.86L3.5 9.76l5.9-.86L12 3.6z"
        className="stroke-current [stroke-width:0]"
      />
    </svg>
  );
}

export function Menu(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Bungkus>
  );
}

export function Tutup(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Bungkus>
  );
}

export function Telepon(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 006 6l1.5-2 4 1.5v3a2 2 0 01-2.2 2A16.5 16.5 0 014.5 5.7 2 2 0 016.5 3.5z" />
    </Bungkus>
  );
}

export function Email(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3.8 7.2l7.1 5.1a2 2 0 002.2 0l7.1-5.1" />
    </Bungkus>
  );
}

export function Lokasi(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M12 21s7-5.4 7-10.5a7 7 0 10-14 0C5 15.6 12 21 12 21z" />
      <circle cx="12" cy="10.4" r="2.6" />
    </Bungkus>
  );
}

export function Jam(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 1.9" />
    </Bungkus>
  );
}

export function KartuKredit(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2.5" />
      <path d="M2.8 10h18.4M6.5 14.5h3" />
    </Bungkus>
  );
}

export function Dokumen(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M13.5 3.5H7a2 2 0 00-2 2v13a2 2 0 002 2h10a2 2 0 002-2V9l-5.5-5.5z" />
      <path d="M13.5 3.5V9H19M8.5 13.5h7M8.5 16.5h4.5" />
    </Bungkus>
  );
}

export function Pengguna(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.2a7.7 7.7 0 0115 0" />
    </Bungkus>
  );
}

export function TrenNaik(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M3.5 16.5l5.5-5.5 3.5 3.5 7-7" />
      <path d="M14.5 7.5h5v5" />
    </Bungkus>
  );
}

export function Instagram(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <path d="M17.2 6.9h.01" />
    </Bungkus>
  );
}

export function TikTok(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M14.2 3.5v10.9a3.6 3.6 0 1 1-3.6-3.6c.35 0 .68.05 1 .14" />
      <path d="M14.2 3.5c.4 2.4 1.9 3.9 4.3 4.1" />
    </Bungkus>
  );
}

export function PanahBawah(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M6 9.5l6 6 6-6" />
    </Bungkus>
  );
}

export function Kalkulator(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M8.5 7.5h7" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 15.5h.01M12 15.5h.01M15.5 15.5h.01" />
    </Bungkus>
  );
}

export function WhatsApp(props: PropsIkon) {
  return (
    <Bungkus {...props}>
      <path d="M20.5 11.7a8.4 8.4 0 01-12.3 7.4L3.5 20.5l1.4-4.6a8.4 8.4 0 1115.6-4.2z" />
      <path d="M9 9.2c.3 2.4 2.6 4.6 5 5l1-1.3 1.9.9-.3 1.5c-2.6.5-6.6-2.2-7.4-6.2l1.5-.5z" />
    </Bungkus>
  );
}

/** Peta nama ikon -> komponen, supaya section cukup menulis ikon="medali". */
export const IKON = {
  "panah-kanan": PanahKanan,
  "panah-kiri": PanahKiri,
  rumah: Rumah,
  cari: Cari,
  "tutup-lingkar": TutupLingkar,
  centang: Centang,
  medali: Medali,
  perisai: Perisai,
  kunci: Kunci,
  obrolan: Obrolan,
  bintang: Bintang,
  menu: Menu,
  tutup: Tutup,
  telepon: Telepon,
  email: Email,
  lokasi: Lokasi,
  jam: Jam,
  "kartu-kredit": KartuKredit,
  dokumen: Dokumen,
  pengguna: Pengguna,
  "tren-naik": TrenNaik,
  instagram: Instagram,
  tiktok: TikTok,
  whatsapp: WhatsApp,
  "panah-bawah": PanahBawah,
  kalkulator: Kalkulator,
} satisfies Record<NamaIkon, (props: PropsIkon) => React.ReactNode>;

export type { PropsIkon };
