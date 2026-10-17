import type { Product, ProductCategory, ProductColor, ProductDimension, ProductSize } from "@/lib/typy";
import { getFabricSurcharge, minColorSurcharge } from "@/lib/infoTkanin";
import { minOptionsSurcharge } from "@/lib/opcjeProduktu";
import { withDefaultCm } from "@/lib/wymiary";
import { slugify } from "@/lib/slug";

/** Kategorie z rozmiarem / szerokością jako wariantem zakupowym (dopłata do ceny bazowej). */
export const SIZE_CATEGORIES: readonly ProductCategory[] = [
  "materace",
  "lozka",
  "szafy",
  "komody",
  "szafki-rtv",
];

export const TYPICAL_SIZE_LABELS = [
  "80×200",
  "90×200",
  "120×200",
  "140×200",
  "160×200",
  "180×200",
  "200×200",
] as const;

export function isSizeCategory(category: ProductCategory): boolean {
  return SIZE_CATEGORIES.includes(category);
}

export function slugifySize(label: string): string {
  return slugify(label, 40) || "rozmiar";
}

/** Klucz sortowania: najpierw szerokość, potem długość (80×200 przed 200×200). */
export function sizeSortKey(label: string): number {
  const nums = label.replace(",", ".").match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return Number.POSITIVE_INFINITY;
  const width = Number(nums[0]);
  const length = nums[1] ? Number(nums[1]) : 0;
  if (!Number.isFinite(width)) return Number.POSITIVE_INFINITY;
  return width * 10000 + (Number.isFinite(length) ? length : 0);
}

export function sortSizes<T extends { label: string }>(sizes: T[]): T[] {
  return [...sizes].sort((a, b) => sizeSortKey(a.label) - sizeSortKey(b.label));
}

export function sanitizeSizes(input: unknown): ProductSize[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: ProductSize[] = [];
  for (const raw of input.slice(0, 24)) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Partial<ProductSize>;
    const label = withDefaultCm(String(row.label ?? "").trim()).slice(0, 48);
    if (!label) continue;
    let surcharge = Number(row.surcharge);
    if (!Number.isFinite(surcharge) || surcharge < 0) surcharge = 0;
    surcharge = Math.round(surcharge);
    let id = String(row.id ?? "").trim().slice(0, 64);
    if (!id) id = slugifySize(label);
    let unique = id;
    let n = 2;
    while (seen.has(unique)) unique = `${id}-${n++}`;
    seen.add(unique);
    out.push({ id: unique, label, surcharge });
  }
  return sortSizes(out);
}

export function typicalSizes(labels: readonly string[] = TYPICAL_SIZE_LABELS): ProductSize[] {
  return labels.map((label) => ({
    id: slugifySize(label),
    label: withDefaultCm(label),
    surcharge: 0,
  }));
}

export function productSizes(product: Pick<Product, "sizes">): ProductSize[] {
  return sanitizeSizes(product.sizes);
}

export function findSize(
  sizes: ProductSize[] | undefined,
  sizeId?: string | null
): ProductSize | undefined {
  const list = sanitizeSizes(sizes);
  if (!list.length) return undefined;
  return list.find((size) => size.id === sizeId) ?? list[0];
}

export function defaultSize(product: Pick<Product, "sizes">): ProductSize | undefined {
  const list = productSizes(product);
  if (!list.length) return undefined;
  return list.find((size) => size.surcharge === 0) ?? list[0];
}

export function priceWithSize(
  base: number | undefined,
  size?: ProductSize | null
): number {
  const price = Number(base) || 0;
  const extra = size?.surcharge ?? 0;
  return price + extra;
}

export function priceWithOptions(
  base: number | undefined,
  size?: ProductSize | null,
  color?: ProductColor | null
): number {
  return priceWithSize(base, size) + (color ? getFabricSurcharge(color) : 0);
}

export function startingPrice(
  product: Pick<Product, "price" | "sizes" | "colors" | "options">
): number {
  const list = productSizes(product);
  const sizeMin = list.length ? Math.min(...list.map((size) => size.surcharge)) : 0;
  return product.price + sizeMin + minColorSurcharge(product) + minOptionsSurcharge(product);
}

export function hasSizePriceRange(product: Pick<Product, "sizes">): boolean {
  const list = productSizes(product);
  if (list.length < 2) return false;
  const extras = list.map((size) => size.surcharge);
  return Math.min(...extras) !== Math.max(...extras);
}

function parseSizeNumbers(label: string): number[] {
  return (label.replace(",", ".").match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite);
}

function formatCm(value: number): string {
  const text = Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
  return `${text} cm`;
}

const WIDTH_LABEL = /szerokość|szerokosc|width|breite|ширин/i;
const LENGTH_LABEL = /długość|dlugosc|length|länge|lange|довжин/i;
const SLEEP_AREA_LABEL = /powierzchnia spania|sleeping area|liegefläche|площа/i;
const OVERALL_WIDTH_LABEL = /szerokość całkowita|overall width|gesamtbreite|загальна ширина/i;
const HEADBOARD_WIDTH_LABEL = /szerokość zagłówka|headboard width|kopfteilbreite|ширина узгол/i;
const HEADBOARD_HEIGHT_LABEL = /wysokość zagłówka|headboard height|kopfteilhöhe|висота узгол/i;
const CHEST_HEIGHT_LABEL = /wysokość skrzyni|chest height|kastenhöhe|висота скрин/i;
const OVERALL_LENGTH_LABEL = /długość całkowita|overall length|gesamtlänge|загальна довжин/i;

/** Dopasowanie ramy tapicerowanego łóżka do rozmiaru materaca (Wrohaus). */
export const BED_FRAME = {
  widthOverhangCm: 30,
  overallLengthCm: 238,
  headboardHeightCm: 93,
  chestHeightCm: 33,
} as const;

export function bedFrameFromMattress(widthCm: number, lengthCm = 200) {
  const overallWidth = widthCm + BED_FRAME.widthOverhangCm;
  return {
    sleepWidth: widthCm,
    sleepLength: lengthCm,
    overallWidth,
    overallLength: BED_FRAME.overallLengthCm,
    headboardWidth: overallWidth,
    headboardHeight: BED_FRAME.headboardHeightCm,
    chestHeight: BED_FRAME.chestHeightCm,
  };
}

function applyBedFrameDimensions(
  rows: ProductDimension[],
  widthCm: number,
  lengthCm: number
): ProductDimension[] {
  const frame = bedFrameFromMattress(widthCm, lengthCm);
  const area = `${String(widthCm).replace(".", ",")} × ${String(lengthCm).replace(".", ",")} cm`;
  const required: { label: string; match: RegExp; value: string }[] = [
    { label: "Powierzchnia spania", match: SLEEP_AREA_LABEL, value: area },
    {
      label: "Szerokość całkowita",
      match: OVERALL_WIDTH_LABEL,
      value: formatCm(frame.headboardWidth),
    },
    {
      label: "Szerokość zagłówka",
      match: HEADBOARD_WIDTH_LABEL,
      value: formatCm(frame.headboardWidth),
    },
    {
      label: "Długość całkowita",
      match: OVERALL_LENGTH_LABEL,
      value: formatCm(frame.overallLength),
    },
    {
      label: "Wysokość zagłówka",
      match: HEADBOARD_HEIGHT_LABEL,
      value: formatCm(frame.headboardHeight),
    },
    {
      label: "Wysokość skrzyni",
      match: CHEST_HEIGHT_LABEL,
      value: formatCm(frame.chestHeight),
    },
  ];

  const taken = new Set<number>();
  const canonical: ProductDimension[] = [];
  for (const field of required) {
    const index = rows.findIndex(
      (item, i) => !taken.has(i) && field.match.test(item.label.trim())
    );
    if (index >= 0) {
      taken.add(index);
      canonical.push({ ...rows[index], value: field.value });
    } else {
      canonical.push({ label: field.label, value: field.value });
    }
  }
  return [...canonical, ...rows.filter((_, i) => !taken.has(i))];
}

/** Podstawia szerokość / długość / powierzchnię spania z wybranego rozmiaru. */
export function dimensionsForSize(
  dimensions: ProductDimension[] | undefined,
  size?: ProductSize | null,
  product?: Pick<Product, "category"> | null
): ProductDimension[] {
  const rows = (dimensions ?? []).map((item) => ({ ...item }));
  if (!size?.label.trim()) return rows;
  const nums = parseSizeNumbers(size.label);
  if (!nums.length) return rows;

  if (product?.category === "lozka" && nums[1] != null) {
    return applyBedFrameDimensions(rows, nums[0], nums[1]);
  }

  const width = formatCm(nums[0]);
  const length = nums[1] != null ? formatCm(nums[1]) : undefined;
  const area =
    length != null
      ? `${String(nums[0]).replace(".", ",")} × ${String(nums[1]).replace(".", ",")} cm`
      : width;

  return rows.map((item) => {
    const label = item.label.trim();
    if (SLEEP_AREA_LABEL.test(label)) return { ...item, value: area };
    if (WIDTH_LABEL.test(label)) return { ...item, value: width };
    if (length && LENGTH_LABEL.test(label)) return { ...item, value: length };
    return item;
  });
}
