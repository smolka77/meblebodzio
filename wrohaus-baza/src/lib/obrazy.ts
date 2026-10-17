/** Stare /uploads/… → /api/media/… (miniatury ?w=). */
export function toMediaApiUrl(src: string): string {
  const clean = src.trim();
  const match = clean.match(/^\/uploads\/(products|blog|fabrics)\/([^/?#]+)/);
  if (!match) return clean;
  return `/api/media/${match[1]}/${match[2]}`;
}

/** Lokalne pliki wgrane do sklepu (VPS: data/uploads + API). */
export function isLocalUpload(src: string): boolean {
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/media/") ||
    src.startsWith("/api/chat/files/")
  );
}

/** next/image rzuca 500 przy obcym hoście — wtedy bez optymalizacji. */
export function shouldUnoptimizeImage(src?: string | null): boolean {
  if (!src?.trim()) return true;
  if (isLocalUpload(src)) return true;
  if (src.startsWith("/")) return false;
  try {
    return new URL(src).hostname !== "images.unsplash.com";
  } catch {
    return true;
  }
}

export function isStoreMediaUrl(src: string): boolean {
  return src.startsWith("/uploads/") || src.startsWith("/api/media/");
}

export function isVideoUrl(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|#|$)/i.test(src);
}

const MEDIA_WIDTHS = [320, 480, 640, 768, 960, 1200];

/** Mniejsza wersja zdjęcia z /api/media albo Unsplash. Wideo zostaje bez zmian. */
export function sizedMediaUrl(src: string, width: number): string {
  const clean = toMediaApiUrl(src.trim());
  if (!clean || isVideoUrl(clean)) return clean;
  if (clean.includes("images.unsplash.com")) {
    try {
      const url = new URL(clean);
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "70");
      return url.toString();
    } catch {
      return clean;
    }
  }
  if (clean.startsWith("/api/media/")) {
    const [pathname, query = ""] = clean.split("?");
    const params = new URLSearchParams(query);
    params.set("w", String(width));
    return `${pathname}?${params.toString()}`;
  }
  return clean;
}

export function mediaSrcSet(src: string): string | undefined {
  const clean = toMediaApiUrl(src.trim());
  if (!clean || isVideoUrl(clean)) return undefined;
  if (!clean.startsWith("/api/media/") && !clean.includes("images.unsplash.com")) return undefined;
  return MEDIA_WIDTHS.map((width) => `${sizedMediaUrl(clean, width)} ${width}w`).join(", ");
}

/** Snapshot plików z inputa — czyści wartość, żeby dało się wgrać ten sam plik ponownie. */
export function takeInputFiles(input: HTMLInputElement): File[] {
  const files = Array.from(input.files ?? []);
  input.value = "";
  input.blur();
  return files;
}
