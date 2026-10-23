export const PESAN_WHATSAPP_KONSULTASI =
  "Halo, saya ingin berkonsultasi mengenai layanan EasyTax. Bisa dibantu dengan informasi lebih lanjut?";

export function pesanKonsultasiLayanan(nama?: string | null): string {
  const namaAman = nama?.trim();
  return namaAman
    ? `Halo, saya ingin berkonsultasi mengenai layanan ${namaAman} dari EasyTax. Bisa dijelaskan mengenai cakupan layanan, proses, dan biayanya?`
    : PESAN_WHATSAPP_KONSULTASI;
}

export function pesanKonsultasiPaket(nama?: string | null, harga?: string | null, satuan?: string | null): string {
  const namaAman = nama?.trim();
  if (!namaAman) return PESAN_WHATSAPP_KONSULTASI;
  const hargaAman = harga?.trim();
  const satuanAman = satuan?.trim();
  const konteksHarga = hargaAman ? `harga ${hargaAman}${satuanAman ? ` ${satuanAman}` : ""}` : "harga";
  return `Halo, saya tertarik dengan paket ${namaAman} dari EasyTax. Saya ingin mengetahui detail manfaat, ${konteksHarga}, dan cara berlangganannya.`;
}

export function tautanKonsultasiWhatsApp(pesan = PESAN_WHATSAPP_KONSULTASI, sumber = "cta", konteks: "layanan" | "paket" | "umum" = "umum") {
  const query = new URLSearchParams({ pesan, sumber, konteks });
  return `/api/konsultasi/whatsapp?${query.toString()}`;
}
