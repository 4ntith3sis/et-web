"use server";

import { prosesRoutingKonsultasi } from "./router";
import { ambilPengaturanWhatsApp } from "./queries";
import type { RoutingResult } from "./types";

/**
 * Server action untuk mendapatkan tujuan URL konsultasi WhatsApp.
 */
export async function dapatkanUrlKonsultasi(
  pesanKustom?: string,
  sumber?: string,
  konteks?: "layanan" | "paket" | "umum",
): Promise<RoutingResult> {
  return prosesRoutingKonsultasi({ pesanKustom, sumber, konteks });
}

/**
 * Server action untuk mengambil status aktivasi WhatsApp dan label tombol default.
 */
export async function dapatkanPengaturanTombolWA(): Promise<{
  whatsappEnabled: boolean;
  buttonLabel: string;
}> {
  const config = await ambilPengaturanWhatsApp();
  return {
    whatsappEnabled: config.whatsappEnabled,
    buttonLabel: config.buttonLabel,
  };
}
