import type { Product } from "@/lib/typy";
import { warehouseQty } from "@/lib/stanMagazynu";
import { computeDeliverySchedule } from "@/lib/terminDostawy";

/* ───── Kolory: rodziny do filtra „Kolor” ───── */

export type ColorFamilyId =
  | "krem"
  | "bez"
  | "szary"
  | "grafit"
  | "braz"
  | "terakota"
  | "zielen"
  | "niebieski"
  | "bordo";

export const COLOR_FAMILIES: { id: ColorFamilyId; label: string; swatch: string }[] = [
  { id: "krem", label: "Krem i biel", swatch: "#F1EBE0" },
  { id: "bez", label: "Beż i piasek", swatch: "#D4C9B8" },
  { id: "szary", label: "Szary i taupe", swatch: "#9C9288" },
  { id: "grafit", label: "Grafit i czerń", swatch: "#3F3F3D" },
  { id: "braz", label: "Brąz i karmel", swatch: "#A9774B" },
  { id: "terakota", label: "Terakota", swatch: "#C17B5C" },
  { id: "zielen", label: "Zieleń", swatch: "#4F6B55" },
  { id: "niebieski", label: "Granat i błękit", swatch: "#2C3E50" },
  { id: "bordo", label: "Bordo", swatch: "#6B2C3E" },
];

function hexToHsl(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const value = parseInt(match[1], 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, s, l];
}

export function colorFamilyOf(hex: string): ColorFamilyId | null {
  const hsl = hexToHsl(hex);
  if (!hsl) return null;
  const [h, s, l] = hsl;
  if (l >= 0.86) return "krem";
  if (s < 0.06) return l < 0.38 ? "grafit" : l < 0.7 ? "szary" : "krem";
  if (h >= 345 || h < 15) return l < 0.35 ? "bordo" : "terakota";
  if (h < 45) {
    if (l >= 0.68) return "bez";
    if (s < 0.2) return l < 0.38 ? "grafit" : "szary";
    if (l < 0.4) return "braz";
    return h < 25 ? "terakota" : "braz";
  }
  if (h < 70) return "braz";
  if (h < 170) return "zielen";
  if (h < 260) return "niebieski";
  return "bordo";
}

export function productColorFamilies(product: Pick<Product, "colors">): ColorFamilyId[] {
  const out = new Set<ColorFamilyId>();
  for (const color of product.colors ?? []) {
    const family = colorFamilyOf(color.hex);
    if (family) out.add(family);
  }
  return [...out];
}

/* ───── Wymiary ───── */

export interface ProductDimsCm {
  width?: number;
  height?: number;
  depth?: number;
}

function firstNumber(value: string): number | undefined {
  const match = /(\d+(?:[.,]\d+)?)/.exec(value);
  if (!match) return undefined;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export interface DimRow {
  label: string;
  value: string;
}

/** Wymiary gabarytowe (szerokość, wysokość, głębokość) z wierszy tabeli wymiarów. */
export function dimsFromRows(rows: DimRow[] | undefined): ProductDimsCm {
  const dims: ProductDimsCm = {};
  for (const row of rows ?? []) {
    const label = row.label.toLowerCase();
    if (/siedzisk|n[oó][zż]k|spania|powierzchn|zasi[eę]g/.test(label)) continue;
    const num = firstNumber(row.value);
    if (num == null) continue;
    if (/szerok/.test(label) && dims.width == null) dims.width = num;
    else if (/wysok/.test(label) && dims.height == null) dims.height = num;
    else if (/g[lł][eę]bok/.test(label) && dims.depth == null) dims.depth = num;
    else if (/[sś]rednic/.test(label)) {
      dims.width ??= num;
      dims.depth ??= num;
    }
  }
  return dims;
}

export function productDimsCm(product: Pick<Product, "details">): ProductDimsCm {
  return dimsFromRows(product.details?.dimensions);
}

/** Wysokość siedziska (cm) — do linii pomocniczej na rysunku technicznym. */
export function seatHeightCm(rows: DimRow[] | undefined): number | undefined {
  for (const row of rows ?? []) {
    if (/wysoko[sś][cć] siedzisk/i.test(row.label)) return firstNumber(row.value);
  }
  return undefined;
}

export function hasFullDims(dims: ProductDimsCm): dims is Required<ProductDimsCm> {
  return dims.width != null && dims.height != null && dims.depth != null;
}

/* ───── Dostępność na karcie ───── */

export interface ProductAvailability {
  tone: "ready" | "fast" | "made";
  label: string;
  detail?: string;
}

export function productAvailability(product: Product): ProductAvailability {
  const stock = warehouseQty(product);
  if (product.shipping24h || product.readyToShip) {
    return {
      tone: "ready",
      label: "Wysyłka w 24 h",
      detail: stock != null && stock > 0 ? `Na magazynie: ${stock} szt.` : "Dostępny od ręki",
    };
  }
  if (product.shipsIn7Days) {
    return { tone: "fast", label: "Dostawa do 7 dni" };
  }
  const schedule = computeDeliverySchedule(product);
  return {
    tone: "made",
    label: schedule.productionLabel
      ? `Realizacja: ${schedule.productionLabel}`
      : "Realizacja na zamówienie",
  };
}

/* ───── Montaż i wniesienie — domyślne informacje wg kategorii ───── */

export interface AssemblyInfo {
  title: string;
  text: string;
}

export function assemblyInfo(product: Pick<Product, "category" | "packageCount">): AssemblyInfo {
  const parcels =
    product.packageCount && product.packageCount > 0
      ? ` Liczba paczek: ${product.packageCount}.`
      : "";
  switch (product.category) {
    case "sofy":
    case "narozniki":
    case "fotele":
    case "kolekcje":
      return {
        title: "Gotowy do użycia",
        text: `Tapicerowane meble przyjeżdżają złożone — wystarczy zdjąć opakowanie i dokręcić nóżki.${parcels}`,
      };
    case "materace":
      return {
        title: "Rozwijasz i gotowe",
        text: `Materac dostarczamy zapakowany próżniowo. Po rozpakowaniu potrzebuje kilku godzin, żeby odzyskać kształt.${parcels}`,
      };
    case "oswietlenie":
      return {
        title: "Szybki montaż",
        text: `Wystarczy złożyć podstawę i wkręcić źródło światła. Instrukcja w pudełku.${parcels}`,
      };
    case "akcesoria-dla-zwierzat":
      return {
        title: "Bez montażu",
        text: `Gotowe do użycia zaraz po wyjęciu z opakowania.${parcels}`,
      };
    default:
      return {
        title: "Do samodzielnego montażu",
        text: `W paczce znajdziesz elementy, okucia i instrukcję krok po kroku. Do złożenia wystarczą podstawowe narzędzia.${parcels}`,
      };
  }
}
