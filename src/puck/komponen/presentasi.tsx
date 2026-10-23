import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { Ikon } from "@/components/ui/Ikon";
import { cn } from "@/lib/cn";
import { mediaUrlRelatif } from "@/lib/media-url";

import type {
  ItemDaftar,
  ItemTombol,
  MediaTerpilih,
  NadaLatar as NadaLatarKomponen,
  PropsBadge,
  PropsButton,
  PropsButtonGroup,
  PropsCard,
  PropsColumn,
  PropsContainer,
  PropsDivider,
  PropsFeatureCard,
  PropsGrid,
  PropsHeading,
  PropsIcon,
  PropsImage,
  PropsLink,
  PropsList,
  PropsQuote,
  PropsRow,
  PropsSection,
  PropsSpacer,
  PropsStack,
  PropsStatCard,
  PropsText,
  Rata,
  WarnaTeks as WarnaTeksKomponen,
} from "./tipe";

/**
 * Komponen presentasional untuk Page Builder.
 *
 * Semua komponen murni props → markup, tanpa state/hook, sehingga bisa
 * dirender di iframe editor maupun sebagai Server Component di halaman
 * publik dari definisi yang sama (`komponen/puck.tsx`).
 */

const WARNA: Record<WarnaTeksKomponen, string> = {
  otomatis: "inherit",
  navy: "var(--color-brand-navy)",
  kuning: "var(--color-brand-yellow)",
  putih: "#ffffff",
  sekunder: "var(--color-teks-sekunder)",
  redup: "var(--color-teks-redup)",
};

/** True untuk path internal yang aman dinavigasi lewat next/link. */
function tautanInternal(href: string | undefined): href is string {
  return Boolean(href && href.startsWith("/") && !href.startsWith("//"));
}

const LATAR: Record<NadaLatarKomponen, string> = {
  putih: "#ffffff",
  latar: "var(--color-netral-lat)",
  alt: "var(--color-netral-alt)",
  navy: "var(--color-brand-navy)",
  transparan: "transparent",
};

function px(nilai: number, min: number, maks: number, fallback: number): number {
  const n = Number(nilai);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(maks, Math.max(min, Math.round(n)));
}

function warnaTeks(w: WarnaTeksKomponen): string {
  return WARNA[w] ?? "inherit";
}

function rataCSS(rata: Rata): "left" | "center" | "right" {
  return rata === "tengah" ? "center" : rata === "kanan" ? "right" : "left";
}

function gayaRata(rata: Rata): CSSProperties {
  return {
    textAlign: rataCSS(rata),
    marginLeft: rata === "kanan" ? "auto" : rata === "tengah" ? "auto" : undefined,
    marginRight: rata === "kiri" ? undefined : "auto",
  };
}

export function Section({
  latar,
  paddingAtas,
  paddingBawah,
  paddingX,
  lebar,
  children,
}: Omit<PropsSection, "konten"> & { children: ReactNode }) {
  return (
    <section
      style={{
        background: LATAR[latar] ?? "#ffffff",
        paddingTop: px(paddingAtas, 0, 400, 64),
        paddingBottom: px(paddingBawah, 0, 400, 64),
      }}
    >
      <div
        style={{
          maxWidth: lebar === "penuh" ? "100%" : "var(--container-maks)",
          marginInline: "auto",
          paddingInline: px(paddingX, 0, 200, 24),
          width: "100%",
        }}
      >
        {children}
      </div>
    </section>
  );
}

export function Container({
  lebarMaks,
  paddingX,
  children,
}: Omit<PropsContainer, "konten"> & { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: lebarMaks > 0 ? px(lebarMaks, 320, 4000, 1200) : "100%",
        marginInline: "auto",
        paddingInline: px(paddingX, 0, 200, 0),
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function Grid({
  kolom,
  gap,
  rata,
  children,
}: Omit<PropsGrid, "konten"> & { children: ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${px(kolom, 1, 6, 3)}, minmax(0, 1fr))`,
        gap: px(gap, 0, 120, 24),
        alignItems: rata === "tengah" ? "center" : rata === "bawah" ? "end" : "start",
      }}
    >
      {children}
    </div>
  );
}

export function Row({ gap, sejajar, rata, bungkus, children }: Omit<PropsRow, "konten"> & { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: bungkus ? "wrap" : "nowrap",
        gap: px(gap, 0, 120, 16),
        justifyContent:
          sejajar === "tengah"
            ? "center"
            : sejajar === "kanan"
              ? "flex-end"
              : sejajar === "spasi"
                ? "space-between"
                : "flex-start",
        alignItems: rata === "tengah" ? "center" : rata === "bawah" ? "flex-end" : "flex-start",
      }}
    >
      {children}
    </div>
  );
}

export function Column({ lebar, children }: Omit<PropsColumn, "konten"> & { children: ReactNode }) {
  const flex = px(lebar, 1, 12, 1);
  return <div style={{ flex: `${flex} 1 0%`, minWidth: 0 }}>{children}</div>;
}

export function Stack({ gap, rata, children }: Omit<PropsStack, "konten"> & { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: px(gap, 0, 120, 16), ...gayaRata(rata) }}>
      {children}
    </div>
  );
}

export function Spacer({ tinggi }: PropsSpacer) {
  return <div aria-hidden="true" style={{ height: px(tinggi, 0, 400, 32) }} />;
}

export function Divider({ warna, ketebalan, lebar, margin }: PropsDivider) {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginBlock: px(margin, 0, 200, 24) }}>
      <span
        role="separator"
        style={{
          display: "block",
          width: `${Math.min(100, Math.max(1, Number(lebar) || 100))}%`,
          height: px(ketebalan, 1, 24, 1),
          background: warnaTeks(warna) === "inherit" ? "var(--color-garis)" : warnaTeks(warna),
        }}
      />
    </div>
  );
}

export function Heading({ teks, tingkat, ukuran, tebal, warna, rata, lebarMaks }: PropsHeading) {
  const Tag = tingkat;
  return (
    <Tag
      style={{
        fontSize: px(ukuran, 12, 120, 32),
        fontWeight: Number(tebal) || 700,
        color: warnaTeks(warna),
        lineHeight: 1.15,
        maxWidth: lebarMaks > 0 ? px(lebarMaks, 120, 4000, 720) : undefined,
        fontFamily: "var(--font-heading)",
        letterSpacing: "-0.02em",
        margin: 0,
        ...gayaRata(rata),
      }}
    >
      {teks}
    </Tag>
  );
}

export function Text({ teks, ukuran, tebal, tinggiBaris, warna, rata, lebarMaks }: PropsText) {
  return (
    <p
      style={{
        fontSize: px(ukuran, 10, 72, 16),
        fontWeight: Number(tebal) || 400,
        lineHeight: Math.min(3, Math.max(1, Number(tinggiBaris) || 1.65)),
        color: warnaTeks(warna),
        whiteSpace: "pre-wrap",
        maxWidth: lebarMaks > 0 ? px(lebarMaks, 120, 4000, 720) : undefined,
        margin: 0,
        ...gayaRata(rata),
      }}
    >
      {teks}
    </p>
  );
}

function rasioGambar(media: MediaTerpilih, rasio: PropsImage["rasio"]): string {
  if (rasio === "16-9") return "16 / 9";
  if (rasio === "4-3") return "4 / 3";
  if (rasio === "1-1") return "1 / 1";
  if (rasio === "3-4") return "3 / 4";
  if (media.width && media.height) return `${media.width} / ${media.height}`;
  return "16 / 9";
}

export function Gambar({ media, rasio, pasFit, radius, lebarMaks, rata, keterangan }: PropsImage) {
  const src = mediaUrlRelatif(media?.url);
  const adaGambar = Boolean(src);
  return (
    <figure style={{ ...gayaRata(rata), maxWidth: lebarMaks > 0 ? px(lebarMaks, 80, 4000, 720) : undefined, margin: 0 }}>
      <div
        style={{
          position: "relative",
          aspectRatio: rasioGambar(media, rasio),
          borderRadius: px(radius, 0, 80, 12),
          overflow: "hidden",
          background: "var(--color-netral-lat)",
        }}
      >
        {adaGambar ? (
          <Image
            src={src!}
            alt={media.alt || ""}
            fill
            sizes="(max-width: 768px) 100vw, 720px"
            style={{ objectFit: pasFit }}
            unoptimized
          />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "100%",
              color: "var(--color-teks-redup)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Pilih gambar
          </div>
        )}
      </div>
      {keterangan ? (
        <figcaption style={{ marginTop: 8, fontSize: 13, color: "var(--color-teks-redup)" }}>
          {keterangan}
        </figcaption>
      ) : null}
    </figure>
  );
}

const GAYA_BADGE: Record<PropsBadge["nada"], string> = {
  kuning: "bg-yellow-500 text-navy-900",
  navy: "bg-navy-900 text-white",
  hijau: "bg-emerald-accent text-white",
  terang: "bg-yellow-500/15 text-navy-900",
  putih: "bg-white text-navy-900 border border-garis",
};

export function Badge({ teks, nada }: PropsBadge) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold tracking-[0.08em] uppercase",
        GAYA_BADGE[nada] ?? GAYA_BADGE.kuning,
      )}
    >
      {teks}
    </span>
  );
}

export function List({ item, penanda, warna, ukuran }: PropsList) {
  const daftar: ItemDaftar[] = Array.isArray(item) ? item : [];
  const warnaAkhir = warnaTeks(warna);
  return (
    <ul
      style={{
        display: "grid",
        gap: 8,
        margin: 0,
        padding: 0,
        listStyle: penanda === "bullet" ? "disc" : "none",
        paddingLeft: penanda === "bullet" ? 22 : 0,
        fontSize: px(ukuran, 10, 40, 16),
        color: warnaAkhir,
      }}
    >
      {daftar.map((row, i) => (
        <li key={`${row.teks}-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {penanda === "centang" ? (
            <Ikon nama="centang" style={{ width: 18, height: 18, flexShrink: 0, color: "var(--color-emerald-accent)" }} />
          ) : null}
          {penanda === "angka" ? (
            <span style={{ fontWeight: 800, flexShrink: 0 }}>{i + 1}.</span>
          ) : null}
          <span>{row.teks}</span>
        </li>
      ))}
    </ul>
  );
}

export function Quote({ teks, penulis, jabatan, nada }: PropsQuote) {
  const gelap = nada === "navy";
  return (
    <blockquote
      style={{
        borderLeft: "4px solid var(--color-brand-yellow)",
        background: LATAR[nada] ?? "transparent",
        color: gelap ? "#ffffff" : "inherit",
        padding: "18px 22px",
        borderRadius: 12,
        margin: 0,
      }}
    >
      <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, fontStyle: "italic" }}>“{teks}”</p>
      {penulis ? (
        <footer style={{ marginTop: 12, fontWeight: 700 }}>
          {penulis}
          {jabatan ? (
            <span style={{ fontWeight: 500, opacity: 0.8 }}> — {jabatan}</span>
          ) : null}
        </footer>
      ) : null}
    </blockquote>
  );
}

export function Icon({ nama, ukuran, warna, rata }: PropsIcon) {
  const sisi = px(ukuran, 12, 160, 28);
  return (
    <div style={{ display: "flex", justifyContent: rata === "kiri" ? "flex-start" : rata === "kanan" ? "flex-end" : "center" }}>
      <Ikon nama={nama} style={{ width: sisi, height: sisi, color: warnaTeks(warna) }} />
    </div>
  );
}

const KELAS_VARIAN: Record<PropsButton["varian"], string> = {
  utama:
    "bg-yellow-500 text-navy-900 font-extrabold shadow-kuning hover:-translate-y-0.5 active:translate-y-0",
  sekunder: "bg-navy-900 text-white font-bold hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0",
  garis:
    "bg-transparent text-navy-900 border-[1.5px] border-navy-900/25 font-bold hover:bg-navy-900 hover:text-white",
  garisPutih:
    "bg-white/10 text-white border-[1.5px] border-white/30 font-bold hover:bg-white hover:text-navy-900",
  halus: "bg-white/10 text-white font-bold hover:bg-white/20",
};

const KELAS_UKURAN: Record<PropsButton["ukuran"], string> = {
  kecil: "px-5 py-2.5 text-sm rounded-sm",
  sedang: "px-7 py-[13px] text-[0.95rem] rounded-md",
  besar: "px-9 py-4 text-base rounded-full",
};

export function Button({ label, href, varian, ukuran, rata, tabBaru }: PropsButton) {
  const kelas = cn(
    "inline-flex items-center justify-center transition-all duration-200",
    KELAS_VARIAN[varian] ?? KELAS_VARIAN.utama,
    KELAS_UKURAN[ukuran] ?? KELAS_UKURAN.sedang,
  );
  const isi = href ? (
    tautanInternal(href) ? (
      <Link
        href={href}
        className={kelas}
        target={tabBaru ? "_blank" : undefined}
        rel={tabBaru ? "noopener noreferrer" : undefined}
      >
        {label}
      </Link>
    ) : (
      <a
        href={href}
        className={kelas}
        target={tabBaru ? "_blank" : undefined}
        rel={tabBaru ? "noopener noreferrer" : undefined}
      >
        {label}
      </a>
    )
  ) : (
    <span className={kelas}>{label}</span>
  );
  return (
    <div style={{ display: "flex", justifyContent: rata === "kiri" ? "flex-start" : rata === "kanan" ? "flex-end" : "center" }}>
      {isi}
    </div>
  );
}

export function ButtonGroup({ tombol, gap, rata }: PropsButtonGroup) {
  const daftar: ItemTombol[] = Array.isArray(tombol) ? tombol : [];
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: px(gap, 0, 80, 12),
        justifyContent: rata === "kiri" ? "flex-start" : rata === "kanan" ? "flex-end" : "center",
      }}
    >
      {daftar.map((t, i) => (
        <span
          key={`${t.label}-${i}`}
          className={cn(
            "inline-flex items-center justify-center transition-all duration-200",
            KELAS_VARIAN[t.varian] ?? KELAS_VARIAN.utama,
            KELAS_UKURAN.sedang,
          )}
        >
          {t.href ? (
            tautanInternal(t.href) ? (
              <Link href={t.href}>{t.label}</Link>
            ) : (
              <a href={t.href} rel="noopener noreferrer">
                {t.label}
              </a>
            )
          ) : (
            t.label
          )}
        </span>
      ))}
    </div>
  );
}

export function Tautan({ teks, href, eksternal, warna, ukuran }: PropsLink) {
  const hrefAman = href || "#";
  const gaya = {
    color: warnaTeks(warna) === "inherit" ? "var(--color-brand-navy)" : warnaTeks(warna),
    fontSize: px(ukuran, 10, 40, 16),
    fontWeight: 700,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  } satisfies CSSProperties;

  if (!eksternal && tautanInternal(hrefAman)) {
    return (
      <Link href={hrefAman} style={gaya}>
        {teks}
      </Link>
    );
  }

  return (
    <a
      href={hrefAman}
      target={eksternal ? "_blank" : undefined}
      rel={eksternal ? "noopener noreferrer" : undefined}
      style={gaya}
    >
      {teks}
    </a>
  );
}

const BAYANGAN: Record<PropsCard["bayangan"], string> = {
  tidak: "none",
  kecil: "var(--shadow-sm)",
  sedang: "var(--shadow-md)",
  besar: "var(--shadow-lg)",
};

export function Card({
  judul,
  deskripsi,
  media,
  ikon,
  tautanLabel,
  tautanHref,
  latar,
  padding,
  radius,
  garis,
  bayangan,
  rata,
}: PropsCard) {
  const gelap = latar === "navy";
  const src = mediaUrlRelatif(media?.url);
  return (
    <div
      style={{
        background: LATAR[latar] ?? "#ffffff",
        padding: px(padding, 0, 120, 24),
        borderRadius: px(radius, 0, 60, 18),
        border: garis ? (gelap ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--color-garis)") : "none",
        boxShadow: BAYANGAN[bayangan] ?? BAYANGAN.sedang,
        color: gelap ? "#ffffff" : "inherit",
        textAlign: rataCSS(rata),
        display: "grid",
        gap: 12,
      }}
    >
      {src ? (
        <div style={{ position: "relative", aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden" }}>
          <Image src={src} alt={media?.alt || ""} fill sizes="360px" style={{ objectFit: "cover" }} unoptimized />
        </div>
      ) : null}
      {ikon ? (
        <span
          style={{
            display: "inline-flex",
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            background: gelap ? "rgba(255,255,255,0.12)" : "var(--color-brand-yellow)",
            color: gelap ? "#fff" : "var(--color-brand-navy)",
            marginInline: rata === "tengah" ? "auto" : undefined,
          }}
        >
          <Ikon nama={ikon} style={{ width: 24, height: 24 }} />
        </span>
      ) : null}
      {judul ? (
        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, fontFamily: "var(--font-heading)" }}>{judul}</h3>
      ) : null}
      {deskripsi ? <p style={{ margin: 0, lineHeight: 1.65, opacity: gelap ? 0.9 : 0.85 }}>{deskripsi}</p> : null}
      {tautanLabel ? (
        <Tautan teks={tautanLabel} href={tautanHref} eksternal={false} warna={gelap ? "kuning" : "navy"} ukuran={15} />
      ) : null}
    </div>
  );
}

const GAYA_NADA_FITUR: Record<PropsFeatureCard["nada"], string> = {
  kuning: "bg-yellow-500 text-navy-900",
  navy: "bg-navy-900 text-white",
  hijau: "bg-emerald-accent text-white",
  terang: "bg-yellow-500/15 text-navy-900",
};

export function FeatureCard({ ikon, judul, deskripsi, nada, rata }: PropsFeatureCard) {
  return (
    <div style={{ display: "grid", gap: 12, textAlign: rataCSS(rata) }}>
      <span
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-md",
          GAYA_NADA_FITUR[nada] ?? GAYA_NADA_FITUR.kuning,
        )}
        style={{ marginInline: rata === "tengah" ? "auto" : undefined }}
      >
        <Ikon nama={ikon} style={{ width: 22, height: 22 }} />
      </span>
      <h3 style={{ margin: 0, fontSize: 19, fontWeight: 800, fontFamily: "var(--font-heading)" }}>{judul}</h3>
      <p style={{ margin: 0, lineHeight: 1.65, color: "var(--color-teks-redup)" }}>{deskripsi}</p>
    </div>
  );
}

export function StatCard({ angka, label, deskripsi, warnaAngka, rata }: PropsStatCard) {
  return (
    <div style={{ display: "grid", gap: 6, textAlign: rataCSS(rata) }}>
      <span
        style={{
          fontSize: 40,
          fontWeight: 900,
          lineHeight: 1,
          fontFamily: "var(--font-heading)",
          color: warnaTeks(warnaAngka) === "inherit" ? "var(--color-brand-navy)" : warnaTeks(warnaAngka),
        }}
      >
        {angka}
      </span>
      <span style={{ fontWeight: 800, fontSize: 16 }}>{label}</span>
      {deskripsi ? (
        <span style={{ color: "var(--color-teks-redup)", lineHeight: 1.6 }}>{deskripsi}</span>
      ) : null}
    </div>
  );
}
