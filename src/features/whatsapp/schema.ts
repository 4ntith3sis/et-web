import { validasiNomorWA, normalisasiNomorWA, sanitasiPesanWA } from "./utils";
import type { WhatsAppRoutingStrategy } from "./types";

export interface InputNomorWhatsApp {
  label: string;
  phoneNumber: string;
  enabled?: boolean;
  priority?: number;
  weight?: number;
  notes?: string;
}

export function validasiInputNomor(input: InputNomorWhatsApp): { ok: true; data: InputNomorWhatsApp } | { ok: false; error: string } {
  if (!input.label || !input.label.trim()) {
    return { ok: false, error: "Label nama nomor wajib diisi." };
  }

  const normalized = normalisasiNomorWA(input.phoneNumber);
  if (!validasiNomorWA(normalized)) {
    return { ok: false, error: "Nomor WhatsApp tidak valid. Gunakan format internasional (8-16 digit angka)." };
  }

  const priority = typeof input.priority === "number" && input.priority >= 1 ? input.priority : 1;
  const weight = typeof input.weight === "number" && input.weight >= 1 ? input.weight : 1;

  return {
    ok: true,
    data: {
      label: input.label.trim(),
      phoneNumber: normalized,
      enabled: input.enabled !== false,
      priority,
      weight,
      notes: input.notes?.trim() || undefined,
    },
  };
}

export function validasiStrategiRouting(strategi: string): strategi is WhatsAppRoutingStrategy {
  return ["round-robin", "random", "weighted", "priority"].includes(strategi);
}

export function validasiQueryKonsultasi(params: URLSearchParams): {
  pesanKustom: string;
  sumber: string;
  konteks: "layanan" | "paket" | "umum";
} {
  const pesanRaw = params.get("pesan") || "";
  const sumberRaw = params.get("sumber") || "";

  return {
    pesanKustom: sanitasiPesanWA(pesanRaw, 500),
    sumber: sanitasiPesanWA(sumberRaw, 50),
    konteks: params.get("konteks") === "layanan" || params.get("konteks") === "paket"
      ? params.get("konteks") as "layanan" | "paket"
      : "umum",
  };
}
