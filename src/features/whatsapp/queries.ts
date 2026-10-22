import { getClient } from "@/lib/payload";
import type { WhatsAppNumberRecord, WhatsAppRoutingConfig } from "./types";
import { validasiNomorWA, normalisasiNomorWA } from "./utils";

/**
 * Mengambil seluruh nomor WhatsApp yang aktif dan nomornya valid.
 */
export async function ambilNomorWAAktif(): Promise<WhatsAppNumberRecord[]> {
  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "nomor-whatsapp",
      where: {
        enabled: { equals: true },
      },
      limit: 100,
      overrideAccess: true,
      sort: "priority",
    });

    return res.docs
      .map((doc) => ({
        id: doc.id,
        label: doc.label,
        phoneNumber: doc.phoneNumber,
        enabled: Boolean(doc.enabled),
        priority: typeof doc.priority === "number" ? doc.priority : 1,
        weight: typeof doc.weight === "number" ? doc.weight : 1,
        notes: doc.notes || null,
        assignedCount: typeof doc.assignedCount === "number" ? doc.assignedCount : 0,
        lastAssignedAt: doc.lastAssignedAt || null,
      }))
      .filter((n) => validasiNomorWA(n.phoneNumber));
  } catch (error) {
    console.error("[WhatsApp Queries] Gagal mengambil nomor aktif:", error);
    return [];
  }
}

/**
 * Mengambil konfigurasi routing WhatsApp dari global SiteSettings (pengaturan-situs).
 */
export async function ambilPengaturanWhatsApp(): Promise<WhatsAppRoutingConfig> {
  try {
    const payload = await getClient();
    const settings = (await payload.findGlobal({
      slug: "pengaturan-situs",
      depth: 1,
      overrideAccess: true,
    })) as unknown as {
      whatsappEnabled?: boolean;
      whatsappRoutingStrategy?: "round-robin" | "random" | "weighted" | "priority";
      defaultWhatsAppMessage?: string;
      fallbackWhatsAppNumber?: string | null;
      whatsappButtonLabel?: string;
      manualWhatsAppNumber?: { id?: number | string; phoneNumber?: string; enabled?: boolean } | number | string;
    } | null;

    if (!settings) {
      return {
        whatsappEnabled: true,
        routingStrategy: "round-robin",
        defaultMessage: "Halo EasyTax, saya ingin berkonsultasi mengenai perpajakan perusahaan saya.",
        fallbackNumber: null,
        buttonLabel: "Konsultasi Gratis",
        manualNumberId: null,
      };
    }

    let manualId: number | string | null = null;
    if (settings.manualWhatsAppNumber) {
      if (typeof settings.manualWhatsAppNumber === "object" && "id" in settings.manualWhatsAppNumber) {
        manualId = settings.manualWhatsAppNumber.id ?? null;
      } else if (typeof settings.manualWhatsAppNumber === "string" || typeof settings.manualWhatsAppNumber === "number") {
        manualId = settings.manualWhatsAppNumber;
      }
    }

    // Nomor fallback hanya digunakan bila admin secara eksplisit mengisi nomor cadangan yang valid
    const rawFallback = typeof settings.fallbackWhatsAppNumber === "string" ? settings.fallbackWhatsAppNumber.trim() : null;
    const normalizedFallback = rawFallback ? normalisasiNomorWA(rawFallback) : null;
    const validFallback = normalizedFallback && validasiNomorWA(normalizedFallback) ? normalizedFallback : null;

    return {
      whatsappEnabled: settings.whatsappEnabled !== false,
      routingStrategy: settings.whatsappRoutingStrategy || "round-robin",
      defaultMessage: settings.defaultWhatsAppMessage || "Halo EasyTax, saya ingin berkonsultasi mengenai perpajakan perusahaan saya.",
      fallbackNumber: validFallback,
      buttonLabel: settings.whatsappButtonLabel || "Konsultasi Gratis",
      manualNumberId: manualId,
    };
  } catch (error) {
    console.error("[WhatsApp Queries] Gagal mengambil SiteSettings:", error);
    return {
      whatsappEnabled: true,
      routingStrategy: "round-robin",
      defaultMessage: "Halo EasyTax, saya ingin berkonsultasi mengenai perpajakan perusahaan saya.",
      fallbackNumber: null,
      buttonLabel: "Konsultasi Gratis",
      manualNumberId: null,
    };
  }
}
