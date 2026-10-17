const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function clampString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export function isValidEmail(email: string): boolean {
  return email.length <= 254 && EMAIL_RE.test(email);
}

export function isValidUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function isValidVisitorId(value: string): boolean {
  if (isValidUuid(value)) return true;
  // starsze ID z fallbacku createClientId (HTTP bez crypto.randomUUID)
  return /^[a-z0-9-]+$/.test(value) && value.length >= 8 && value.length <= 64;
}

export function sanitizeChatAttachmentUrl(url: string): boolean {
  return (
    url.startsWith("/api/chat/files/") &&
    !url.includes("..") &&
    url.length < 512
  );
}
