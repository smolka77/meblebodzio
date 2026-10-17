import type { Product, ProductAspectRatio, ProductColor } from "@/lib/typy";
import { DEFAULT_PRODUCT_ASPECT_RATIO } from "@/lib/typy";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";

const PRODUCT_ASPECT_RATIOS: ProductAspectRatio[] = ["5/4", "1/1", "4/5", "3/2"];

export function resolveProductAspectRatio(
  ratio?: ProductAspectRatio | string | null
): ProductAspectRatio {
  if (ratio && PRODUCT_ASPECT_RATIOS.includes(ratio as ProductAspectRatio)) {
    return ratio as ProductAspectRatio;
  }
  return DEFAULT_PRODUCT_ASPECT_RATIO;
}

export function productAspectClass(ratio?: ProductAspectRatio): string {
  switch (resolveProductAspectRatio(ratio)) {
    case "1/1":
      return "aspect-square";
    case "4/5":
      return "aspect-[4/5]";
    case "3/2":
      return "aspect-[3/2]";
    case "5/4":
    default:
      return "aspect-[5/4]";
  }
}

export function productAspectUploadHint(ratio?: ProductAspectRatio): string {
  switch (resolveProductAspectRatio(ratio)) {
    case "1/1":
      return "2000 × 2000 px";
    case "4/5":
      return "2000 × 2500 px";
    case "3/2":
      return "2400 × 1600 px";
    case "5/4":
    default:
      return "2000 × 1600 px";
  }
}

export const COLOR_PHOTO_LIMIT = 10;

function isFabricSwatch(src: string, color: ProductColor): boolean {
  const swatch = color.fabricImage?.trim();
  return Boolean(swatch && src === swatch);
}

/** Zdjęcia mebla w danym kolorze (max COLOR_PHOTO_LIMIT) — nigdy próbka tkaniny. */
export function productPhotosForColor(color: ProductColor): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of [color.image, ...(color.images ?? [])]) {
    const src = raw?.trim();
    if (!src || seen.has(src) || isFabricSwatch(src, color)) continue;
    seen.add(src);
    unique.push(src);
    if (unique.length >= COLOR_PHOTO_LIMIT) break;
  }
  return unique;
}

/** Pierwsze zdjęcie mebla w kolorze — do koszyka i kafelka. */
export function productPhotoForColor(color: ProductColor): string | undefined {
  return productPhotosForColor(color)[0];
}

export function sanitizeColorPhotos(urls: string[], color?: ProductColor): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();
  const swatch = color?.fabricImage?.trim();
  for (const raw of urls) {
    const src = raw?.trim();
    if (!src || seen.has(src) || (swatch && src === swatch)) continue;
    seen.add(src);
    unique.push(src);
    if (unique.length >= COLOR_PHOTO_LIMIT) break;
  }
  return unique;
}

export function colorWithPhotos(
  color: ProductColor,
  urls: string[]
): ProductColor {
  const photos = sanitizeColorPhotos(urls, color);
  return {
    ...color,
    image: photos[0],
    images: photos.length > 1 ? photos.slice(1) : undefined,
  };
}

export function getProductColorImage(
  color: ProductColor,
  fallback: string
): string {
  return productPhotoForColor(color) || fallback;
}

const PHOTO_VIEWS = [
  "widok z przodu",
  "widok z boku",
  "widok z tyłu",
  "widok z góry",
  "zbliżenie",
  "detal",
];

export function galleryPhotoAlt(name: string, index: number, color?: string): string {
  const view = PHOTO_VIEWS[index] ?? `zdjęcie ${index + 1}`;
  const label = collapseRepeatedProductName(name) || "Produkt";
  const who = color?.trim() ? `${label} w kolorze ${color.trim()}` : label;
  return `${who} — ${view}`;
}

export type ProductGallerySlide = {
  src: string;
  colorIds: string[];
  alt: string;
};

export function normalizeProductImages(
  image: string,
  images?: string[]
): { image: string; images: string[] } {
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const raw of [image, ...(images ?? [])]) {
    const src = raw?.trim();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    unique.push(src);
  }
  return {
    image: unique[0] ?? "",
    images: unique.slice(1),
  };
}

/** Osobna aranżacja z starych ogłoszeń → 2. zdjęcie galerii. */
export function listingMedia(
  product: Pick<Product, "image" | "images" | "arrangementImage">
): { image: string; images: string[] } {
  const { image, images } = normalizeProductImages(product.image, product.images);
  const arrangement = product.arrangementImage?.trim();
  if (!arrangement) return { image, images };
  if (!image) return normalizeProductImages(arrangement, images);
  if (arrangement === image) return { image, images };
  return {
    image,
    images: [arrangement, ...images.filter((url) => url !== arrangement)],
  };
}

export function getProductImageUrls(
  product: Pick<Product, "image" | "images" | "arrangementImage">
): string[] {
  const { image, images } = listingMedia(product);
  return image ? [image, ...images] : images;
}

/** Drugie zdjęcie ogłoszenia — hover na karcie. */
export function arrangementPhotoUrl(
  product: Pick<Product, "image" | "images" | "arrangementImage">
): string | undefined {
  return getProductImageUrls(product)[1];
}

function colorFurniturePhotoUrls(product: Product): Set<string> {
  const urls = new Set<string>();
  for (const color of product.colors ?? []) {
    for (const src of productPhotosForColor(color)) {
      urls.add(src);
    }
  }
  return urls;
}

/** Zdjęcia poglądowe ogłoszenia — bez kadrów mebla w konkretnej tkaninie. */
export function overviewPhotoUrls(product: Product): string[] {
  const all = getProductImageUrls(product);
  if (all.length === 0) return [];
  const colorUrls = colorFurniturePhotoUrls(product);
  const overview = colorUrls.size === 0 ? all : all.filter((src) => !colorUrls.has(src));
  return overview.length > 0 ? overview : all;
}

export function moveListItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Galeria ogłoszenia: na starcie zdjęcia poglądowe produktu.
 * Zdjęcia konkretnej tkaniny dopiero gdy klient kliknie kafelek
 * (`showColorPhotos` + `selectedColorId`).
 */
export function getProductGallerySlides(
  product: Product,
  selectedColorId?: string,
  showColorPhotos = Boolean(selectedColorId)
): ProductGallerySlide[] {
  const bySrc = new Map<string, { colorIds: string[]; alt: string }>();

  function add(src: string | undefined, colorId?: string, alt?: string) {
    const url = src?.trim();
    if (!url) return;
    const existing = bySrc.get(url);
    if (existing) {
      if (colorId && !existing.colorIds.includes(colorId)) {
        existing.colorIds.push(colorId);
      }
      return;
    }
    bySrc.set(url, {
      colorIds: colorId ? [colorId] : [],
      alt: alt ?? product.name,
    });
  }

  const selected = selectedColorId
    ? (product.colors ?? []).find((color) => color.id === selectedColorId)
    : undefined;
  const colorPhotos = selected ? productPhotosForColor(selected) : [];

  if (showColorPhotos && colorPhotos.length > 0 && selected) {
    colorPhotos.forEach((src, index) => {
      add(src, selected.id, galleryPhotoAlt(product.name, index, selected.name));
    });
  } else {
    overviewPhotoUrls(product).forEach((src, index) => {
      add(
        src,
        undefined,
        index === 1
          ? `${collapseRepeatedProductName(product.name)} — aranżacja`
          : galleryPhotoAlt(product.name, index)
      );
    });
  }

  if (bySrc.size === 0) {
    return product.image
      ? [{ src: product.image, colorIds: [], alt: galleryPhotoAlt(product.name, 0) }]
      : [];
  }

  return Array.from(bySrc.entries()).map(([src, meta]) => ({
    src,
    colorIds: meta.colorIds,
    alt: meta.alt,
  }));
}

export function isGallerySlideActive(
  slide: ProductGallerySlide,
  selectedColorId: string
): boolean {
  return slide.colorIds.includes(selectedColorId);
}
