import fs from "fs/promises";
import path from "path";

/** Trwały katalog uploadów (obok data/store) — działa na VPS po deployu. */
export function getChatUploadDir() {
  return path.join(process.cwd(), "data", "uploads", "chat");
}

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".txt": "text/plain",
};

const ALLOWED_EXT = new Set(Object.keys(EXT_MIME));

export async function ensureUploadDir() {
  await fs.mkdir(getChatUploadDir(), { recursive: true });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

export function resolveChatMimeType(file: File): string {
  const ext = extensionOf(file.name);
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  return EXT_MIME[ext] ?? "";
}

export function isAllowedChatFile(file: File): boolean {
  const mime = resolveChatMimeType(file);
  if (mime && ALLOWED_MIME.has(mime)) return true;
  return ALLOWED_EXT.has(extensionOf(file.name));
}

export function chatFilePublicUrl(filename: string): string {
  return `/api/chat/files/${encodeURIComponent(filename)}`;
}

export function chatFilenameFromUrl(url: string): string | null {
  const apiMatch = url.match(/^\/api\/chat\/files\/([^/?#]+)$/);
  if (apiMatch) return decodeURIComponent(apiMatch[1]);

  const legacyMatch = url.match(/^\/uploads\/chat\/([^/?#]+)$/);
  if (legacyMatch) return legacyMatch[1];

  return null;
}

export async function saveChatUpload(file: File) {
  if (file.size > MAX_SIZE) {
    throw new Error("Plik jest za duży (max 5 MB)");
  }
  if (!isAllowedChatFile(file)) {
    throw new Error("Niedozwolony typ pliku");
  }

  const mimeType = resolveChatMimeType(file) || "application/octet-stream";

  await ensureUploadDir();
  const id = crypto.randomUUID();
  const safeName = sanitizeFilename(file.name);
  const filename = `${id}-${safeName}`;
  const filepath = path.join(getChatUploadDir(), filename);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : "";
    if (code === "EACCES" || code === "EPERM") {
      throw new Error("Serwer nie ma uprawnień do zapisu plików czatu");
    }
    throw err;
  }

  return {
    url: chatFilePublicUrl(filename),
    name: file.name,
    mimeType,
    size: file.size,
  };
}

export async function readChatUpload(filename: string): Promise<{
  buffer: Buffer;
  mimeType: string;
} | null> {
  const safe = path.basename(filename);
  if (!safe || safe !== filename) return null;

  const filepath = path.join(getChatUploadDir(), safe);
  try {
    const buffer = await fs.readFile(filepath);
    const mimeType = EXT_MIME[extensionOf(safe)] ?? "application/octet-stream";
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

/** Stary katalog public/uploads/chat (kompatybilność wsteczna). */
export async function readLegacyChatUpload(filename: string): Promise<Buffer | null> {
  const safe = path.basename(filename);
  const filepath = path.join(process.cwd(), "public", "uploads", "chat", safe);
  try {
    return await fs.readFile(filepath);
  } catch {
    return null;
  }
}

export async function deleteChatUpload(url: string): Promise<void> {
  const filename = chatFilenameFromUrl(url);
  if (!filename) return;

  const filepath = path.join(getChatUploadDir(), filename);
  try {
    await fs.unlink(filepath);
  } catch {
    // może już nie istnieć
  }

  const legacyPath = path.join(process.cwd(), "public", "uploads", "chat", filename);
  try {
    await fs.unlink(legacyPath);
  } catch {
    // ignore
  }
}

export function mimeFromFilename(filename: string): string {
  return EXT_MIME[extensionOf(filename)] ?? "application/octet-stream";
}
