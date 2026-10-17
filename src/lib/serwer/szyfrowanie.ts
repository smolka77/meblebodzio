import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getSessionSecret } from "./sekretSesji";

const PREFIX = "enc:v1:";

async function deriveKey(): Promise<Buffer> {
  const secret = await getSessionSecret();
  return createHash("sha256").update(`sofelio-data-v1:${secret}`).digest();
}

export function isEncrypted(value: string): boolean {
  return typeof value === "string" && value.startsWith(PREFIX);
}

export async function encryptField(plain: string): Promise<string> {
  if (!plain) return plain;
  if (isEncrypted(plain)) return plain;
  const key = await deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, encrypted]);
  return `${PREFIX}${payload.toString("base64url")}`;
}

export async function decryptField(stored: string): Promise<string> {
  if (!stored) return stored;
  if (!isEncrypted(stored)) return stored;
  const raw = stored.slice(PREFIX.length);
  const payload = Buffer.from(raw, "base64url");
  if (payload.length < 29) return stored;
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const key = await deriveKey();
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plain.toString("utf8");
}

export async function encryptOptional(value?: string): Promise<string | undefined> {
  if (value == null || value === "") return value;
  return encryptField(value);
}

export async function decryptOptional(value?: string): Promise<string | undefined> {
  if (value == null || value === "") return value;
  return decryptField(value);
}

export async function encryptRecord<T extends object>(
  record: T,
  fields: (keyof T)[]
): Promise<T> {
  const next = { ...record };
  for (const field of fields) {
    const value = next[field];
    if (typeof value === "string" && value) {
      next[field] = (await encryptField(value)) as T[keyof T];
    }
  }
  return next;
}

export async function decryptRecord<T extends object>(
  record: T,
  fields: (keyof T)[]
): Promise<T> {
  const next = { ...record };
  for (const field of fields) {
    const value = next[field];
    if (typeof value === "string" && value) {
      next[field] = (await decryptField(value)) as T[keyof T];
    }
  }
  return next;
}

export function emailIndex(email: string): string {
  return createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}
