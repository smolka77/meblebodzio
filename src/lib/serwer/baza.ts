import fs from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const STORE_DIR = path.join(process.cwd(), "data", "store");

export async function ensureStoreDir() {
  await fs.mkdir(STORE_DIR, { recursive: true, mode: 0o750 });
}

export function storePath(filename: string) {
  return path.join(STORE_DIR, filename);
}

export async function fileExists(filename: string) {
  try {
    await fs.access(storePath(filename));
    return true;
  } catch {
    return false;
  }
}

export async function readStore<T>(filename: string, fallback: T): Promise<T> {
  await ensureStoreDir();
  try {
    const raw = await fs.readFile(storePath(filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeStore<T>(filename: string, data: T): Promise<void> {
  await ensureStoreDir();
  const dest = storePath(filename);
  const tmp = `${dest}.${randomBytes(8).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o640, encoding: "utf-8" });
  try {
    await fs.rename(tmp, dest);
  } catch {
    try {
      await fs.copyFile(tmp, dest);
    } catch {
      /* concurrent write */
    }
    await fs.unlink(tmp).catch(() => {});
  }
}
