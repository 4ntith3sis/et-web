import React from "react";
import { Tombol } from "@/components/ui/Tombol";

export interface ConsultationButtonProps {
  /** Pesan pembuka WhatsApp khusus saat tombol diklik. */
  pesan?: string;
  /** Pelacakan sumber tombol (mis. 'navbar', 'hero', 'cta-bawah'). */
  sumber?: string;
  /** Label teks tombol bila children tidak disertakan. */
  label?: string;
  children?: React.ReactNode;
  varian?: "utama" | "sekunder" | "garis" | "garisSolid" | "garisPutih" | "halus";
  ukuran?: "kecil" | "sedang" | "besar";
  className?: string;
  ikonKiri?: React.ReactNode;
  ikonKanan?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Komponen tombol konsultasi terpusat:
 * Mengarahkan pengunjung ke endpoint routing server (/api/konsultasi/whatsapp)
 * dengan variasi tampilan dan gaya yang konsisten dengan desain EasyTax.
 */
export function ConsultationButton({
  pesan,
  sumber,
  label,
  children,
  varian = "utama",
  ukuran = "sedang",
  className,
  ikonKiri,
  ikonKanan,
  disabled = false,
}: ConsultationButtonProps) {
  const content = children || label || "Konsultasi Gratis";

  if (disabled) {
    return (
      <Tombol
        disabled
        varian={varian}
        ukuran={ukuran}
        className={className}
        ikonKiri={ikonKiri}
        ikonKanan={ikonKanan}
      >
        {content}
      </Tombol>
    );
  }

  const queryParams = new URLSearchParams();
  if (pesan) queryParams.set("pesan", pesan);
  if (sumber) queryParams.set("sumber", sumber);

  const qs = queryParams.toString();
  const href = qs ? `/api/konsultasi/whatsapp?${qs}` : "/api/konsultasi/whatsapp";

  return (
    <Tombol
      href={href}
      external
      varian={varian}
      ukuran={ukuran}
      className={className}
      ikonKiri={ikonKiri}
      ikonKanan={ikonKanan}
    >
      {content}
    </Tombol>
  );
}

export default ConsultationButton;
