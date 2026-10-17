import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  if (!stored) return false;

  if (stored.startsWith("scrypt:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const expectedHex = parts[2];
    try {
      const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer;
      const expected = Buffer.from(expectedHex, "hex");
      if (expected.length !== derived.length) return false;
      return timingSafeEqual(expected, derived);
    } catch {
      return false;
    }
  }

  // Migracja ze starego plaintext — porównanie stałoczasowe gdy długości równe
  if (password.length !== stored.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(stored));
}

export function isPasswordHashed(stored: string): boolean {
  return stored.startsWith("scrypt:");
}

export function assertPasswordStrength(password: string): string | null {
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków";
  }
  if (password.length > 128) {
    return "Hasło jest za długie";
  }
  return null;
}
