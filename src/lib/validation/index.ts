/**
 * Utilitas validasi umum untuk input form dan data.
 */

export function isEmailValid(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isPhoneValid(phone: string): boolean {
  const re = /^[+0-9\s-]{8,20}$/;
  return re.test(phone.trim());
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/<[^>]*>/g, "");
}
