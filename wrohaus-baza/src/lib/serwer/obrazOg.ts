import { isVideoUrl } from "@/lib/obrazy";
import { absObraz } from "@/lib/seo";
import {
  mimeFromStoreFilename,
  readLegacyStoreUpload,
  readStoreUpload,
  storeFilenameFromUrl,
} from "@/lib/serwer/wgrywanie";

const MAX_DATA_URI_BYTES = 2_000_000;

function unsplashHiRes(src: string): string {
  try {
    const url = new URL(src);
    url.searchParams.set("w", "1600");
    url.searchParams.set("q", "80");
    url.searchParams.set("fit", "crop");
    return url.toString();
  } catch {
    return src;
  }
}

async function jakoDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: "image/*" },
    });
    if (!res.ok) return url;
    const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
    if (!mime.startsWith("image/")) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length === 0) return url;
    if (buffer.length > MAX_DATA_URI_BYTES) return url;
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    return url;
  }
}

/** Pierwsze zdjęcie (nie wideo) produktu — okładka albo galeria. */
export function urlZdjeciaProduktu(product: {
  image: string;
  images?: string[];
}): string | null {
  for (const src of [product.image, ...(product.images ?? [])]) {
    const clean = src?.trim();
    if (clean && !isVideoUrl(clean)) return clean;
  }
  return null;
}

/** Źródło obrazu dla karty OG: lokalny plik jako data URI, Unsplash w dużej rozdzielczości. */
export async function zrodloObrazuOg(src: string | undefined | null): Promise<string | null> {
  if (!src || isVideoUrl(src)) return null;

  const parsed = storeFilenameFromUrl(src);
  if (parsed) {
    const stored = await readStoreUpload(parsed.kind, parsed.filename);
    if (stored?.mimeType.startsWith("image/")) {
      if (stored.buffer.length <= MAX_DATA_URI_BYTES) {
        return `data:${stored.mimeType};base64,${stored.buffer.toString("base64")}`;
      }
      return absObraz(src);
    }
    const legacy = await readLegacyStoreUpload(parsed.kind, parsed.filename);
    if (legacy) {
      const mime = mimeFromStoreFilename(parsed.filename);
      if (mime.startsWith("image/")) {
        if (legacy.length <= MAX_DATA_URI_BYTES) {
          return `data:${mime};base64,${legacy.toString("base64")}`;
        }
        return absObraz(src);
      }
    }
    return absObraz(src);
  }

  if (src.includes("images.unsplash.com")) {
    return jakoDataUri(unsplashHiRes(src));
  }
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return jakoDataUri(src);
  }
  return absObraz(src);
}
