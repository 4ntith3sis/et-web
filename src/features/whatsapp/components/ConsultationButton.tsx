import React from "react";
import { Tombol } from "@/components/ui/Tombol";
import { PESAN_WHATSAPP_KONSULTASI, tautanKonsultasiWhatsApp } from "@/features/whatsapp/config";

export interface ConsultationButtonProps {
  /** Pesan pembuka WhatsApp khusus saat tombol diklik. */
  pesan?: string;
  konteks?: "layanan" | "paket" | "umum";
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
 * Mengarahkan pengunjung ke WhatsApp dengan variasi tampilan yang konsisten.
 */
export function ConsultationButton({
  pesan,
  konteks = "umum",
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

  const pesanFinal = pesan || (sumber ? PESAN_WHATSAPP_KONSULTASI : undefined);
  const href = tautanKonsultasiWhatsApp(pesanFinal, sumber, konteks);

  return (
    <Tombol
      href={href}
      navigasiPenuh
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
