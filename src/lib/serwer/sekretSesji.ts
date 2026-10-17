import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import fs from "fs/promises";
import path from "path";

const SECRET_FILE = path.join(process.cwd(), "data", "store", ".session-secret");

let cachedSecret: string | null = null;

async function persistSecret(secret: string) {
  await fs.mkdir(path.dirname(SECRET_FILE), { recursive: true });
  await fs.writeFile(SECRET_FILE, secret, { mode: 0o600 });
}

export async function getSessionSecret(): Promise<string> {
  if (process.env.SOFELIO_SESSION_SECRET?.trim()) {
    return process.env.SOFELIO_SESSION_SECRET.trim();
  }

  if (cachedSecret) return cachedSecret;

  try {
    const fromFile = (await fs.readFile(SECRET_FILE, "utf-8")).trim();
    if (fromFile.length >= 32) {
      cachedSecret = fromFile;
      return fromFile;
    }
  } catch {
    // brak pliku — wygeneruj
  }

  const generated = randomBytes(48).toString("hex");
  await persistSecret(generated);
  cachedSecret = generated;
  return generated;
}

export async function signPayload(payload: string): Promise<string> {
  const secret = await getSessionSecret();
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}
