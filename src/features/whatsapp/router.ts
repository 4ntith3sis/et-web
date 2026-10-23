import { getClient } from "@/lib/payload";
import { sql } from "@payloadcms/db-postgres";
import type { WhatsAppNumberRecord, WhatsAppRoutingConfig, WhatsAppRoutingStrategy, RoutingResult } from "./types";
import { buatTautanWA, validasiNomorWA, sanitasiPesanWA } from "./utils";
import { ambilNomorWAAktif, ambilPengaturanWhatsApp } from "./queries";
import { PESAN_WHATSAPP_KONSULTASI } from "./config";

/**
 * Logika pemilihan nomor murni (pure function) berdasarkan strategi yang dipilih.
 * Mudah diuji dalam unit test tanpa ketergantungan database.
 */
export function pilihNomorSesuaiStrategi(
  kandidat: WhatsAppNumberRecord[],
  strategi: WhatsAppRoutingStrategy,
  manualNumberId?: number | string | null,
): WhatsAppNumberRecord | null {
  const aktif = kandidat.filter((k) => k.enabled && validasiNomorWA(k.phoneNumber));
  if (!aktif.length) return null;

  switch (strategi) {
    case "priority": {
      // 1. Cek bila ada manualNumberId yang dipilih secara eksplisit dan masih aktif
      if (manualNumberId != null) {
        const manual = aktif.find((k) => String(k.id) === String(manualNumberId));
        if (manual) return manual;
      }
      // 2. Pilih berdasarkan prioritas tertinggi (angka terkecil = prioritas paling utama)
      const terurut = [...aktif].sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        return (a.assignedCount || 0) - (b.assignedCount || 0);
      });
      return terurut[0];
    }

    case "weighted": {
      const totalWeight = aktif.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0);
      let randomVal = Math.random() * totalWeight;

      for (const item of aktif) {
        const weight = Math.max(1, item.weight || 1);
        if (randomVal < weight) {
          return item;
        }
        randomVal -= weight;
      }
      return aktif[0];
    }

    case "random": {
      const idx = Math.floor(Math.random() * aktif.length);
      return aktif[idx];
    }

    case "round-robin":
    default: {
      // Urutkan berdasarkan waktu terakhir ditugaskan (paling lama / belum pernah terpilih diprioritaskan)
      const terurut = [...aktif].sort((a, b) => {
        if (!a.lastAssignedAt && b.lastAssignedAt) return -1;
        if (a.lastAssignedAt && !b.lastAssignedAt) return 1;
        if (a.lastAssignedAt && b.lastAssignedAt) {
          const diff = new Date(a.lastAssignedAt).getTime() - new Date(b.lastAssignedAt).getTime();
          if (diff !== 0) return diff;
        }
        return (a.assignedCount || 0) - (b.assignedCount || 0);
      });
      return terurut[0];
    }
  }
}

/**
 * Statistik ditulis dengan UPDATE aritmetis PostgreSQL agar tidak mengalami
 * lost update. Kegagalan dilempar kembali supaya pemanggil dapat mengetahuinya.
 */
export async function perbaruiStatistikNomorAtomik(
  nomorId: string | number,
): Promise<void> {
  try {
    const payload = await getClient();
    const db = payload.db as any;
    if (db?.drizzle) {
      await db.drizzle.execute(sql`
        UPDATE "nomor_whatsapp"
        SET assigned_count = COALESCE(assigned_count, 0) + 1,
            last_assigned_at = clock_timestamp(),
            updated_at = clock_timestamp()
        WHERE id = ${Number(nomorId) || nomorId}
      `);
      return;
    }

    throw new Error("PostgreSQL Drizzle adapter tidak tersedia; statistik assignment tidak diperbarui.");
  } catch (error) {
    console.error("[WhatsApp Router] Gagal memperbarui statistik nomor atomik.");
    throw error;
  }
}

export const perbaruiStatistikNomor = perbaruiStatistikNomorAtomik;

/**
 * Memilih dan menugaskan nomor secara atomik untuk mencegah race-condition di lingkungan
 * multi-proses / multi-container Docker.
 *
 * Khusus Round Robin: Menggunakan PostgreSQL Transaction dengan Advisory Lock
 * (pg_advisory_xact_lock) agar pemilihan giliran dan pembaruan timestamp/counter
 * berjalan secara terisolasi tanpa tabrakan antar instance.
 */
export async function pilihDanTugaskanNomorAtomik(
  config: WhatsAppRoutingConfig,
): Promise<WhatsAppNumberRecord | null> {
  const { routingStrategy, manualNumberId } = config;
  let kandidat: WhatsAppNumberRecord[];
  try {
    kandidat = await ambilNomorWAAktif();
  } catch {
    throw new Error("Data nomor konsultasi CMS tidak dapat diakses.");
  }
  if (!kandidat.length) return null;

  // 1. Eksekusi khusus Round Robin secara atomik via PostgreSQL
  if (routingStrategy === "round-robin") {
    try {
      const payload = await getClient();
      const db = payload.db as any;

      if (db?.drizzle) {
        const hasilTx = await db.drizzle.transaction(async (tx: any) => {
          // Kunci advisory transaction: serialisasi pemilihan round-robin antar container
          await tx.execute(
            sql`SELECT pg_advisory_xact_lock(hashtext('easytax_whatsapp_round_robin'))`,
          );

          // Ambil kandidat aktif urutan pertama (paling lama / belum pernah terpilih)
          const queryPilih = await tx.execute(sql`
            SELECT id, label, phone_number as "phoneNumber", enabled,
                   priority, weight, notes,
                   COALESCE(assigned_count, 0) as "assignedCount",
                   last_assigned_at as "lastAssignedAt"
            FROM "nomor_whatsapp"
            WHERE enabled = true
              AND phone_number ~ '^[0-9]{8,16}$'
            ORDER BY assigned_count ASC, last_assigned_at ASC NULLS FIRST, id ASC
            LIMIT 1
          `);

          const rows = (queryPilih.rows || queryPilih) as any[];
          if (!rows || rows.length === 0) return null;

          const row = rows[0];
          const nomorId = row.id;

          // Naikkan counter & update timestamp dalam transaksi yang sama
          const queryUpdate = await tx.execute(sql`
            UPDATE "nomor_whatsapp"
            SET assigned_count = COALESCE(assigned_count, 0) + 1,
                last_assigned_at = clock_timestamp(),
                updated_at = clock_timestamp()
            WHERE id = ${nomorId} AND enabled = true AND phone_number ~ '^[0-9]{8,16}$'
            RETURNING id, label, phone_number as "phoneNumber", enabled,
                      priority, weight, notes,
                      assigned_count as "assignedCount",
                      last_assigned_at as "lastAssignedAt"
          `);

          const updatedRows = (queryUpdate.rows || queryUpdate) as any[];
          const finalDoc = updatedRows?.[0];
          if (!finalDoc) return null;

          return {
            id: finalDoc.id,
            label: finalDoc.label,
            phoneNumber: finalDoc.phoneNumber,
            enabled: Boolean(finalDoc.enabled),
            priority: Number(finalDoc.priority || 1),
            weight: Number(finalDoc.weight || 1),
            notes: finalDoc.notes || null,
            assignedCount: Number(finalDoc.assignedCount || 0),
            lastAssignedAt: finalDoc.lastAssignedAt ? new Date(finalDoc.lastAssignedAt).toISOString() : null,
          } as WhatsAppNumberRecord;
        });

        return hasilTx && validasiNomorWA(hasilTx.phoneNumber) ? hasilTx : null;
      }
      throw new Error("PostgreSQL Drizzle adapter tidak tersedia untuk Round Robin atomik.");
    } catch (err) {
      console.error("[WhatsApp Router] Transaksi atomik Round Robin gagal.");
      // Fallback: tetap pilih nomor aktif dari Payload agar kegagalan transaksi
      // khusus tidak langsung memutus CTA. Counter update bersifat best-effort.
      const terpilih = pilihNomorSesuaiStrategi(kandidat, "round-robin");
      if (!terpilih) throw err;
      try {
        await perbaruiStatistikNomorAtomik(terpilih.id);
      } catch {
        // Jangan memblokir redirect WhatsApp karena statistik gagal dicatat.
      }
      return terpilih;
    }
  }

  // 2. Strategi Priority, Weighted, Random atau fallback jika DB transaksi gagal
  const terpilih = pilihNomorSesuaiStrategi(kandidat, routingStrategy, manualNumberId);
  if (terpilih) {
    await perbaruiStatistikNomorAtomik(terpilih.id);
  } else {
      return null;
  }
  return terpilih;
}

/**
 * Menjalankan routing konsultasi lengkap:
 * 1. Mengambil konfigurasi dari CMS.
 * 2. Mengambil kandidat nomor aktif secara atomik.
 * 3. Membentuk pesan pembuka yang aman.
 * 4. Menghasilkan tautan wa.me resmi atau fallback internal /kontak.
 */
export async function prosesRoutingKonsultasi(options?: {
  pesanKustom?: string | null;
  sumber?: string | null;
  konteks?: "layanan" | "paket" | "umum";
}): Promise<RoutingResult> {
  let config: WhatsAppRoutingConfig;
  let kandidat: WhatsAppNumberRecord[];
  try {
    config = await ambilPengaturanWhatsApp();
    kandidat = await ambilNomorWAAktif();
  } catch (error) {
    console.error("[WhatsApp Router] Data routing CMS tidak tersedia.");
    return { success: false, targetUrl: "", reason: "Data nomor konsultasi sementara tidak tersedia.", fallbackUsed: false };
  }

  if (!config.whatsappEnabled) {
    return {
      success: false,
      targetUrl: "/kontak",
      reason: "Konsultasi WhatsApp sedang dinonaktifkan oleh pengelola.",
      fallbackUsed: false,
    };
  }

  const nomorAktif = new Set(kandidat.map((n) => String(n.id)));
  if (config.fallbackNumber && !kandidat.some((n) => n.phoneNumber === config.fallbackNumber)) {
    config.fallbackNumber = null;
  }

  const pesan = sanitasiPesanWA(options?.pesanKustom || config.defaultMessage || PESAN_WHATSAPP_KONSULTASI);
  let terpilih: WhatsAppNumberRecord | null;
  try {
    terpilih = await pilihDanTugaskanNomorAtomik(config);
    if (!terpilih) return { success: false, targetUrl: "", reason: "Belum ada nomor konsultasi aktif di CMS.", fallbackUsed: false };
  } catch (error) {
    // Jika transaksi round-robin gagal, tetap routing ke WhatsApp memakai
    // daftar aktif CMS; jangan menyembunyikan masalah dengan redirect ke /kontak.
    if (error instanceof Error && /CMS tidak dapat diakses/.test(error.message)) {
      return { success: false, targetUrl: "", reason: "Data nomor konsultasi sementara tidak tersedia.", fallbackUsed: false };
    }
    terpilih = pilihNomorSesuaiStrategi(kandidat, "round-robin");
    if (!terpilih) return { success: false, targetUrl: "", reason: "Belum ada nomor konsultasi aktif di CMS.", fallbackUsed: false };
  }

  // Jika nomor aktif ditemukan
  if (terpilih && validasiNomorWA(terpilih.phoneNumber)) {
    try {
      const waUrl = buatTautanWA(terpilih.phoneNumber, pesan);
      return {
        success: true,
        targetUrl: waUrl,
        phoneNumber: terpilih.phoneNumber,
        message: pesan,
        strategy: config.routingStrategy,
        numberLabel: terpilih.label,
        fallbackUsed: false,
      };
    } catch {
      // Jika terjadi kesalahan URL, lanjut ke fallback
    }
  }

  // Nomor fallback hanya boleh menunjuk ke nomor aktif yang tercatat di koleksi CMS.
  if (config.fallbackNumber && validasiNomorWA(config.fallbackNumber) && nomorAktif.size > 0) {
    try {
      const fallbackUrl = buatTautanWA(config.fallbackNumber, pesan);
      return {
        success: true,
        targetUrl: fallbackUrl,
        phoneNumber: config.fallbackNumber,
        message: pesan,
        strategy: config.routingStrategy,
        numberLabel: "Nomor Cadangan (Fallback)",
        fallbackUsed: true,
      };
    } catch {
      // Lanjut ke penolakan aman
    }
  }

  return {
    success: false,
    targetUrl: "",
    reason: "Belum ada nomor konsultasi aktif di CMS.",
    fallbackUsed: false,
  };
}
