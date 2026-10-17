import fs from "fs/promises";
import path from "path";

const WIDTHS = [320, 480, 640, 768, 960, 1200, 1600] as const;

const RASTER = new Set(["image/jpeg", "image/png", "image/webp"]);

export function snapImageWidth(raw: string | null): number | null {
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 16) return null;
  let best: number = WIDTHS[0];
  for (const width of WIDTHS) {
    if (Math.abs(width - value) < Math.abs(best - value)) best = width;
  }
  return best;
}

function cachePath(kind: string, width: number, filename: string) {
  return path.join(process.cwd(), "data", "cache", "media", kind, `${width}-${filename}.webp`);
}

/** Mniejszy WebP do telefonu. Brak szerokości albo wideo/PDF → null (oryginał). */
export async function resizedStoreImage(
  kind: string,
  filename: string,
  source: Buffer,
  mimeType: string,
  width: number | null
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!width || !RASTER.has(mimeType)) return null;

  const dest = cachePath(kind, width, filename);
  try {
    const cached = await fs.readFile(dest);
    return { buffer: cached, mimeType: "image/webp" };
  } catch {
    // cache miss
  }

  try {
    const sharp = (await import("sharp")).default;
    const buffer = await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const tmp = `${dest}.${process.pid}.tmp`;
    await fs.writeFile(tmp, buffer);
    await fs.rename(tmp, dest);
    return { buffer, mimeType: "image/webp" };
  } catch {
    return null;
  }
}
