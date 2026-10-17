import fs from "fs/promises";
import path from "path";

export type StoreUploadKind = "products" | "blog" | "fabrics";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VIDEO_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const EXT_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
};

function extensionOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** Trwały katalog na VPS — osobny folder dla produktów, bloga i tkanin. */
export function getStoreUploadDir(kind: StoreUploadKind) {
  return path.join(process.cwd(), "data", "uploads", kind);
}

function legacyUploadDir(kind: StoreUploadKind) {
  return path.join(process.cwd(), "public", "uploads", kind);
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
}

export function storeMediaPublicUrl(kind: StoreUploadKind, filename: string) {
  return `/api/media/${kind}/${encodeURIComponent(filename)}`;
}

export function storeFilenameFromUrl(
  url: string
): { kind: StoreUploadKind; filename: string } | null {
  const apiMatch = url.match(/^\/api\/media\/(products|blog|fabrics)\/([^/?#]+)$/);
  if (apiMatch) {
    return {
      kind: apiMatch[1] as StoreUploadKind,
      filename: decodeURIComponent(apiMatch[2]),
    };
  }

  const legacyMatch = url.match(/^\/uploads\/(products|blog|fabrics)\/([^/?#]+)$/);
  if (legacyMatch) {
    return {
      kind: legacyMatch[1] as StoreUploadKind,
      filename: legacyMatch[2],
    };
  }

  return null;
}

export function isStoreMediaUrl(url: string): boolean {
  return storeFilenameFromUrl(url) != null;
}

function resolveImageMime(file: File): string {
  const ext = extensionOf(file.name);
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  return EXT_MIME[ext] ?? "";
}

export async function ensureStoreUploadDir(kind: StoreUploadKind) {
  await fs.mkdir(getStoreUploadDir(kind), { recursive: true });
}

export async function saveStoreImage(kind: StoreUploadKind, file: File) {
  const mime = resolveImageMime(file);
  if (!mime || !ALLOWED_TYPES.has(mime)) {
    throw new Error("Dozwolone formaty: JPG, PNG, WebP, GIF, MP4, WebM");
  }

  const isVideo = mime.startsWith("video/");
  const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
  if (file.size > limit) {
    throw new Error(
      isVideo ? "Wideo jest za duże (max 20 MB)" : "Plik jest za duży (max 8 MB)"
    );
  }

  await ensureStoreUploadDir(kind);
  const id = crypto.randomUUID();
  const ext = extensionOf(file.name) || ".jpg";
  const filename = `${id}${sanitizeFilename(ext)}`;
  const filepath = path.join(getStoreUploadDir(kind), filename);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filepath, buffer);
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? err.code : "";
    if (code === "EACCES" || code === "EPERM") {
      throw new Error("Serwer nie ma uprawnień do zapisu plików");
    }
    throw err;
  }

  return { url: storeMediaPublicUrl(kind, filename) };
}

const MAX_DOCUMENT_SIZE = 12 * 1024 * 1024;

/** Instrukcja montażu — PDF albo zdjęcie. */
export async function saveProductDocument(file: File) {
  const mime = resolveImageMime(file);
  const allowed = new Set([
    ...ALLOWED_TYPES,
    "application/pdf",
  ]);
  if (!mime || !allowed.has(mime) || mime.startsWith("video/")) {
    throw new Error("Dozwolone formaty instrukcji: PDF, JPG, PNG, WebP");
  }
  if (file.size > MAX_DOCUMENT_SIZE) {
    throw new Error("Plik jest za duży (max 12 MB)");
  }

  await ensureStoreUploadDir("products");
  const id = crypto.randomUUID();
  const ext = extensionOf(file.name) || (mime === "application/pdf" ? ".pdf" : ".jpg");
  const filename = `${id}${sanitizeFilename(ext)}`;
  const filepath = path.join(getStoreUploadDir("products"), filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filepath, buffer);
  return { url: storeMediaPublicUrl("products", filename) };
}

export async function readStoreUpload(
  kind: StoreUploadKind,
  filename: string
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const safe = path.basename(filename);
  if (!safe || safe !== filename) return null;

  const filepath = path.join(getStoreUploadDir(kind), safe);
  try {
    const buffer = await fs.readFile(filepath);
    const mimeType = EXT_MIME[extensionOf(safe)] ?? "application/octet-stream";
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

export async function readLegacyStoreUpload(
  kind: StoreUploadKind,
  filename: string
): Promise<Buffer | null> {
  const safe = path.basename(filename);
  const filepath = path.join(legacyUploadDir(kind), safe);
  try {
    return await fs.readFile(filepath);
  } catch {
    return null;
  }
}

export async function deleteStoreImage(url: string): Promise<void> {
  const parsed = storeFilenameFromUrl(url);
  if (!parsed) return;

  const { kind, filename } = parsed;
  const safe = path.basename(filename);

  try {
    await fs.unlink(path.join(getStoreUploadDir(kind), safe));
  } catch {
    // ignore
  }

  try {
    await fs.unlink(path.join(legacyUploadDir(kind), safe));
  } catch {
    // ignore
  }
}

export function mimeFromStoreFilename(filename: string): string {
  return EXT_MIME[extensionOf(filename)] ?? "application/octet-stream";
}
