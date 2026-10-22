import { isEmailValid, sanitizeText } from "@/lib/validation";

export type DataLeadKontak = {
  nama: string;
  bisnis?: string;
  email: string;
  whatsapp: string;
  topik: string;
  pesan: string;
};

export type HasilValidasiLead =
  | { ok: true; data: DataLeadKontak }
  | { ok: false; error: string };

export function validasiDataLead(input: Record<string, unknown>): HasilValidasiLead {
  const nama = sanitizeText(String(input.nama || ""));
  const bisnis = input.bisnis ? sanitizeText(String(input.bisnis)) : undefined;
  const email = String(input.email || "").trim();
  const whatsapp = sanitizeText(String(input.whatsapp || ""));
  const topik = sanitizeText(String(input.topik || ""));
  const pesan = sanitizeText(String(input.pesan || ""));

  if (!nama) return { ok: false, error: "Nama wajib diisi." };
  if (!email || !isEmailValid(email)) return { ok: false, error: "Alamat email tidak valid." };
  if (!whatsapp) return { ok: false, error: "Nomor WhatsApp wajib diisi." };
  if (!topik) return { ok: false, error: "Topik konsultasi wajib dipilih." };
  if (!pesan) return { ok: false, error: "Pesan wajib diisi." };

  return {
    ok: true,
    data: { nama, bisnis, email, whatsapp, topik, pesan },
  };
}
