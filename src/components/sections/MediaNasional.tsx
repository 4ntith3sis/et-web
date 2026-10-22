/* ==========================================================================
   Section "Telah Diliput Oleh Media Nasional".

   Mengikuti desain easytax-demo (v1): strip kepusatan ("trust strip")
   berlatar putih — judul uppercase kecil di tengah, diikuti baris logo
   media (wordmark SVG inline, bukan file gambar) yang juga rata tengah
   dan wrap. Tanpa panel dekoratif; pemisah visual hanya border-b tipis.
   ========================================================================== */

const MEDIA = [
  { nama: "Industry.co.id", url: "https://www.industry.co.id", lebar: 160 },
  { nama: "Warta Ekonomi", url: "https://wartaekonomi.co.id", lebar: 170 },
  { nama: "JPNN.com", url: "https://jpnn.com", lebar: 135 },
  { nama: "SINDOnews", url: "https://sindonews.com", lebar: 155 },
  { nama: "Business Asia", url: "https://businessasia.co.id", lebar: 160 },
] as const;

type NamaMedia = (typeof MEDIA)[number]["nama"];

/** Wordmark tiap media, memakai viewBox 0 0 <lebar> 38 ala v1. */
function Wordmark({ nama }: { nama: NamaMedia }) {
  const gelap = "var(--color-brand-navy)";
  const redup = "var(--color-teks-redup)";

  switch (nama) {
    case "Industry.co.id":
      return (
        <svg viewBox="0 0 160 38" fill="none" role="img" aria-label="Industry.co.id" width={160} height={38} className="h-8 w-auto">
          <rect x="0" y="7" width="22" height="24" rx="4" fill="#0077C8" />
          <text x="5" y="24" fontFamily="var(--font-heading)" fontWeight="900" fontSize="16" fill="#FFFFFF">
            i
          </text>
          <text x="28" y="24" fontFamily="var(--font-heading)" fontWeight="800" fontSize="17" fill={gelap} letterSpacing="-0.5">
            industry
          </text>
          <text x="104" y="24" fontFamily="var(--font-heading)" fontWeight="800" fontSize="14" fill="#0077C8">
            .co.id
          </text>
        </svg>
      );

    case "Warta Ekonomi":
      return (
        <svg viewBox="0 0 170 38" fill="none" role="img" aria-label="Warta Ekonomi" width={170} height={38} className="h-8 w-auto">
          <text x="0" y="23" fontFamily="var(--font-heading)" fontWeight="900" fontSize="17" fill="#C4161C" letterSpacing="-0.5">
            WARTA
          </text>
          <text x="76" y="23" fontFamily="var(--font-heading)" fontWeight="800" fontSize="17" fill={gelap} letterSpacing="-0.5">
            EKONOMI
          </text>
        </svg>
      );

    case "JPNN.com":
      return (
        <svg viewBox="0 0 135 38" fill="none" role="img" aria-label="JPNN.com" width={135} height={38} className="h-8 w-auto">
          <text x="0" y="24" fontFamily="var(--font-heading)" fontWeight="900" fontSize="22" fill="#E52320" letterSpacing="-0.5">
            JPNN
          </text>
          <text x="74" y="24" fontFamily="var(--font-heading)" fontWeight="800" fontSize="16" fill={gelap}>
            .com
          </text>
        </svg>
      );

    case "SINDOnews":
      return (
        <svg viewBox="0 0 155 38" fill="none" role="img" aria-label="SINDOnews" width={155} height={38} className="h-8 w-auto">
          <text x="0" y="23" fontFamily="var(--font-heading)" fontWeight="900" fontSize="18" fill={gelap}>
            SINDO
          </text>
          <text x="72" y="23" fontFamily="var(--font-heading)" fontWeight="900" fontSize="18" fill="#E52320">
            news
          </text>
          <text x="126" y="23" fontFamily="var(--font-heading)" fontWeight="700" fontSize="12" fill={redup}>
            .com
          </text>
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 160 38" fill="none" role="img" aria-label="Business Asia" width={160} height={38} className="h-8 w-auto">
          <text x="0" y="23" fontFamily="var(--font-heading)" fontWeight="900" fontSize="16" fill={gelap} letterSpacing="0.5">
            BUSINESS
          </text>
          <text x="96" y="23" fontFamily="var(--font-heading)" fontWeight="800" fontSize="16" fill="var(--color-brand-yellow)" letterSpacing="0.5">
            ASIA
          </text>
        </svg>
      );
  }
}

export function MediaNasional({
  desain,
}: {
  desain?: { judul?: string };
} = {}) {
  const judul = desain?.judul ?? "Telah Diliput Oleh Media Nasional:";

  return (
    <section
      id="media"
      aria-labelledby="media-judul"
      className="border-b border-garis bg-white py-[clamp(44px,6vw,64px)]"
    >
      <div className="mx-auto flex w-full max-w-maks flex-col items-center gap-[22px] px-6 text-center md:px-8">
        <h2
          id="media-judul"
          className="font-heading text-[0.92rem] leading-none font-extrabold tracking-[0.12em] text-navy-900 uppercase"
        >
          {judul}
        </h2>

        <ul className="flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-9">
          {MEDIA.map((media) => (
            <li key={media.nama}>
              <a
                href={media.url}
                target="_blank"
                rel="noopener noreferrer"
                title={media.nama}
                className="flex items-center justify-center rounded-lg px-3.5 py-2 opacity-85 grayscale-[15%] transition-[var(--transition-base)] hover:opacity-100 hover:grayscale-0"
              >
                <Wordmark nama={media.nama} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
