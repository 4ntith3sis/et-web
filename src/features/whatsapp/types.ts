export type WhatsAppRoutingStrategy = "round-robin" | "random" | "weighted" | "priority";

export interface WhatsAppNumberRecord {
  id: number | string;
  label: string;
  phoneNumber: string;
  enabled: boolean;
  priority: number;
  weight: number;
  notes?: string | null;
  assignedCount?: number | null;
  lastAssignedAt?: string | null;
}

export interface WhatsAppRoutingConfig {
  whatsappEnabled: boolean;
  routingStrategy: WhatsAppRoutingStrategy;
  defaultMessage: string;
  fallbackNumber?: string | null;
  buttonLabel: string;
  manualNumberId?: number | string | null;
}

export type RoutingResult =
  | {
      success: true;
      targetUrl: string;
      phoneNumber: string;
      message: string;
      strategy: WhatsAppRoutingStrategy;
      numberLabel: string;
      fallbackUsed: boolean;
    }
  | {
      success: false;
      targetUrl: string;
      reason: string;
      fallbackUsed: boolean;
    };
