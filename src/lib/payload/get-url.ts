/**
 * Utilitas untuk mendapatkan Server URL dan Client URL Payload / EasyTax.
 */

export function getServerURL(): string {
  let url = process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SITE_URL || "";

  if (!url && typeof window !== "undefined") {
    url = window.location.origin;
  }

  if (!url) {
    url = "http://localhost:3004";
  }

  return url.replace(/\/+$/, "");
}

export function getClientURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getServerURL();
}
