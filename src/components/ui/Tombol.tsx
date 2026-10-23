import Link from "next/link";
import { cn } from "@/lib/cn";

/* ==========================================================================
   Tombol polimorfik.

   Satu komponen menutup tiga kasus: navigasi internal (next/link),
   navigasi eksternal / dokumen (a), dan aksi (button). Ini menggantikan
   pola v1 di mana Button selalu jadi <a> dan `className` diisi string
   bebas seperti "btn-primary btn-lg" — yang tidak type-safe.
   ========================================================================== */

type Varian = "utama" | "sekunder" | "garis" | "garisSolid" | "garisPutih" | "halus";
type Ukuran = "kecil" | "sedang" | "besar";

const GAYA_VARIAN: Record<Varian, string> = {
  // Kuning solid di atas navy — CTA utama brand.
  utama:
    "bg-yellow-500 text-navy-900 font-extrabold shadow-kuning hover:-translate-y-0.5 hover:shadow-[0_12px_28px_color-mix(in_srgb,var(--color-brand-yellow)_50%,transparent)] active:translate-y-0",
  // Navy solid — dipakai di section terang.
  sekunder:
    "bg-navy-900 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
  // Garis navy — CTA sekunder di atas latar putih.
  garis:
    "bg-transparent text-navy-900 border-[1.5px] border-navy-900/25 font-bold hover:bg-navy-900 hover:text-white hover:border-navy-900 hover:-translate-y-0.5",
  // Garis navy pekat (1px) — tombol CTA dengan bobot lebih tegas.
  garisSolid:
    "bg-transparent text-navy-900 border-[1px] border-navy-900 font-bold hover:bg-navy-900 hover:text-white hover:-translate-y-0.5",
  // Garis putih — khusus di atas latar navy.
  garisPutih:
    "bg-white/8 text-white border-[1.5px] border-white/30 font-bold backdrop-blur-md hover:bg-white hover:text-navy-900 hover:border-white hover:-translate-y-0.5",
  // Tanpa border, hanya hover lembut.
  halus: "bg-white/10 text-white font-bold hover:bg-white/20",
};

const GAYA_UKURAN: Record<Ukuran, string> = {
  kecil: "px-5 py-2.5 text-sm gap-2 rounded-sm",
  sedang: "px-7 py-[13px] text-[0.95rem] gap-2.5 rounded-md",
  besar: "px-9 py-4 text-base gap-2.5 rounded-full",
};

interface PropDasar {
  children: React.ReactNode;
  varian?: Varian;
  ukuran?: Ukuran;
  /** Tambahkan className tambahan di luar preset. */
  className?: string;
  /** Ikon di kiri konten. */
  ikonKiri?: React.ReactNode;
  /** Ikon di kanan konten. */
  ikonKanan?: React.ReactNode;
  /** Buka di tab baru. Hanya berlaku saat dirender sebagai <a>. */
  external?: boolean;
  /** Gunakan navigasi browser penuh, bukan transisi client-side Next.js. */
  navigasiPenuh?: boolean;
  /** Nonaktifkan interaksi + redupkan tampilan. */
  disabled?: boolean;
}

type PropTombol = PropDasar &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
    /** FORCE render sebagai <button> walau href diisi. */
    /** Mencegah <button> di dalam <form> melakukan submit tak sengaja. */
    tipe?: "button" | "submit" | "reset";
  };

type PropTautanInternal = PropDasar &
  Omit<React.ComponentProps<typeof Link>, "children" | "className"> & {
    href: string;
    external?: false;
    tipe?: undefined;
    disabled?: undefined;
  };

type PropTautanEksternal = PropDasar &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className" | "href"> & {
    href: string;
    external: true;
    tipe?: undefined;
    disabled?: undefined;
  };

export type PropsTombol = PropTombol | PropTautanInternal | PropTautanEksternal;

function GabungGaya({
  varian,
  ukuran,
  className,
  disabled,
}: {
  varian: Varian;
  ukuran: Ukuran;
  className?: string;
  disabled?: boolean;
}) {
  return cn(
    // Sengaja BUKAN "inline-flex" polos: memakai `@container`-safe default
    // `flex` supaya class `hidden` dari pemanggil (mis. "hidden lg:inline-flex"
    // di Navbar) bisa menang lewat urutan breakpoint, bukan kalah diam-diam.
    "flex items-center justify-center whitespace-nowrap",
    "transition-[all] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]",
    "disabled:pointer-events-none disabled:opacity-55",
    GAYA_VARIAN[varian ?? "utama"],
    GAYA_UKURAN[ukuran ?? "sedang"],
    className,
  );
}

export function Tombol(props: PropsTombol) {
  const {
    children,
    varian = "utama",
    ukuran = "sedang",
    className,
    ikonKiri,
    ikonKanan,
    disabled,
    external,
    navigasiPenuh,
  } = props;

  const gaya = GabungGaya({ varian, ukuran, className, disabled });
  const isi = (
    <>
      {ikonKiri}
      {children}
      {ikonKanan}
    </>
  );

  /* Prop milik komponen dipisah dari prop DOM, supaya ikonKiri/ikonKanan
     tidak diteruskan ke elemen dan memicu peringatan React. */
  const {
    varian: _varian,
    ukuran: _ukuran,
    className: _className,
    ikonKiri: _ikonKiri,
    ikonKanan: _ikonKanan,
    disabled: _disabled,
    external: _external,
    navigasiPenuh: _navigasiPenuh,
    ...sisa
  } = props;

  /* href undefined -> <button> */
  if (props.href === undefined) {
    const { tipe = "button", href: _href, external: _external, ...sisaTombol } = sisa as PropTombol;
    return (
      <button type={tipe} disabled={disabled} className={gaya} {...sisaTombol}>
        {isi}
      </button>
    );
  }

  /* external -> <a target=_blank> */
  if (external) {
    const { href, ...sisaTautan } = sisa as PropTautanEksternal;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={gaya}
        {...sisaTautan}
      >
        {isi}
      </a>
    );
  }

  // API konsultasi merespons redirect ke wa.me. Next Link mencoba mengambil
  // redirect sebagai RSC fetch dan terkena CORS lintas-origin; navigasi biasa
  // membiarkan browser mengikuti redirect sebagai navigasi dokumen.
  if (navigasiPenuh) {
    const { href, ...sisaTautan } = sisa as PropTautanInternal;
    return (
      <a href={href} className={gaya} {...sisaTautan}>
        {isi}
      </a>
    );
  }

  /* sisanya -> <Link> internal */
  const { href, ...sisaInternal } = sisa as PropTautanInternal;
  return (
    <Link href={href} className={gaya} {...sisaInternal}>
      {isi}
    </Link>
  );
}
