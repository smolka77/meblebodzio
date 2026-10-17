import type {
  Product,
  ProductOption,
  ProductOptionValue,
  SelectedProductOption,
} from "@/lib/typy";
import { slugify } from "@/lib/slug";

export type OptionSelection = Record<string, string>;

export function slugifyOption(label: string, fallback = "opcja"): string {
  return slugify(label, 40) || fallback;
}

function uniqueId(base: string, seen: Set<string>): string {
  let unique = base;
  let n = 2;
  while (seen.has(unique)) unique = `${base}-${n++}`;
  seen.add(unique);
  return unique;
}

/** Czyści warianty z formularza / API: puste wartości i opcje bez wartości znikają. */
export function sanitizeOptions(input: unknown): ProductOption[] {
  if (!Array.isArray(input)) return [];
  const seenOptions = new Set<string>();
  const out: ProductOption[] = [];

  for (const raw of input.slice(0, 12)) {
    if (!raw || typeof raw !== "object") continue;
    const option = raw as Partial<ProductOption>;
    const name = String(option.name ?? "").trim().slice(0, 60);
    if (!name) continue;

    const seenValues = new Set<string>();
    const values: ProductOptionValue[] = [];
    for (const rawValue of Array.isArray(option.values) ? option.values.slice(0, 24) : []) {
      if (!rawValue || typeof rawValue !== "object") continue;
      const value = rawValue as Partial<ProductOptionValue>;
      const label = String(value.label ?? "").trim().slice(0, 60);
      if (!label) continue;
      let surcharge = Number(value.surcharge);
      if (!Number.isFinite(surcharge) || surcharge < 0) surcharge = 0;
      const id = uniqueId(
        String(value.id ?? "").trim().slice(0, 64) || slugifyOption(label, "wartosc"),
        seenValues
      );
      values.push({ id, label, surcharge: Math.round(surcharge) });
    }
    if (values.length === 0) continue;

    const id = uniqueId(
      String(option.id ?? "").trim().slice(0, 64) || slugifyOption(name),
      seenOptions
    );
    out.push({
      id,
      name,
      values,
      ...(option.afterColor ? { afterColor: true } : {}),
    });
  }
  return out;
}

export function productOptions(product: Pick<Product, "options">): ProductOption[] {
  return sanitizeOptions(product.options);
}

/** Opcje, które faktycznie dają klientowi wybór (≥ 2 wartości). */
export function selectableOptions(product: Pick<Product, "options">): ProductOption[] {
  return productOptions(product).filter((option) => option.values.length > 1);
}

function cheapestValue(option: ProductOption): ProductOptionValue {
  return (
    option.values.find((value) => value.surcharge === 0) ??
    option.values.reduce((best, value) => (value.surcharge < best.surcharge ? value : best))
  );
}

/** Domyślny wybór: pierwsza wartość bez dopłaty w każdej opcji. */
export function defaultOptionSelection(product: Pick<Product, "options">): OptionSelection {
  const selection: OptionSelection = {};
  for (const option of productOptions(product)) {
    selection[option.id] = cheapestValue(option).id;
  }
  return selection;
}

/** Dopasowuje wybór do aktualnych opcji produktu (brakujące → domyślne). */
export function resolveOptionSelection(
  product: Pick<Product, "options">,
  selection?: OptionSelection | null
): SelectedProductOption[] {
  const out: SelectedProductOption[] = [];
  for (const option of productOptions(product)) {
    const wanted = selection?.[option.id];
    const value = option.values.find((entry) => entry.id === wanted) ?? cheapestValue(option);
    out.push({ option, value });
  }
  return out;
}

export function selectionFromResolved(items: SelectedProductOption[]): OptionSelection {
  const selection: OptionSelection = {};
  for (const item of items) selection[item.option.id] = item.value.id;
  return selection;
}

export function optionsSurcharge(items: SelectedProductOption[] | undefined): number {
  if (!items?.length) return 0;
  return items.reduce((sum, item) => sum + (item.value.surcharge || 0), 0);
}

/** Klucz do rozróżnienia pozycji koszyka: `strona=lewy;led=z-led`. */
export function optionSelectionKey(selection?: OptionSelection | null): string {
  if (!selection) return "";
  return Object.keys(selection)
    .sort()
    .map((key) => `${key}=${selection[key]}`)
    .join(";");
}

/** Czytelny opis wyboru: „Strona: Lewy · LED: Z LED”. */
export function describeSelectedOptions(
  items: SelectedProductOption[] | undefined,
  separator = " · "
): string {
  if (!items?.length) return "";
  return items
    .map((item) => `${item.option.name}: ${item.value.label}`)
    .join(separator);
}

/** Tylko etykiety wartości: „Lewy, Z LED”. */
export function selectedOptionLabels(items: SelectedProductOption[] | undefined): string[] {
  return (items ?? []).map((item) => item.value.label);
}

/** Najniższa możliwa dopłata za warianty — do ceny „od”. */
export function minOptionsSurcharge(product: Pick<Product, "options">): number {
  return productOptions(product).reduce(
    (sum, option) => sum + Math.min(...option.values.map((value) => value.surcharge)),
    0
  );
}

export function hasOptionPriceRange(product: Pick<Product, "options">): boolean {
  return productOptions(product).some((option) => {
    const extras = option.values.map((value) => value.surcharge);
    return Math.min(...extras) !== Math.max(...extras);
  });
}

function foldOptionLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .trim();
}

/** Lewy / Left / Links — albo Prawy / Right / Rechts. */
export function optionValueSide(label: string): "left" | "right" | null {
  const text = foldOptionLabel(label);
  if (
    /(^|[^a-z])(lewy|lewa|lewo|left|links)([^a-z]|$)/.test(text) ||
    text.includes("lewostronn")
  ) {
    return "left";
  }
  if (
    /(^|[^a-z])(prawy|prawa|prawo|right|rechts)([^a-z]|$)/.test(text) ||
    text.includes("prawostronn")
  ) {
    return "right";
  }
  return null;
}

function sideOption(product: Pick<Product, "options">): ProductOption | undefined {
  return productOptions(product).find((option) => {
    const sides = new Set(
      option.values.map((value) => optionValueSide(value.label)).filter(Boolean)
    );
    return sides.has("left") && sides.has("right");
  });
}

/**
 * Zdjęcia ogłoszenia są wgrane w jednej orientacji (pierwsza wartość strony).
 * Druga strona (Lewy ↔ Prawy) pokazuje te same kadry w odbiciu lustrzanym.
 */
export function galleryMirrorsForSide(
  product: Pick<Product, "options">,
  selection?: OptionSelection | null
): boolean {
  const option = sideOption(product);
  if (!option) return false;
  const baseSide = optionValueSide(option.values[0]?.label ?? "");
  const picked = resolveOptionSelection(product, selection).find(
    (item) => item.option.id === option.id
  );
  const pickedSide = optionValueSide(picked?.value.label ?? "");
  return Boolean(baseSide && pickedSide && pickedSide !== baseSide);
}

export function newOptionValue(label = "", surcharge = 0): ProductOptionValue {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `val-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    surcharge,
  };
}

export function newOption(name = "", values: string[] = []): ProductOption {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `opt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    values: values.length ? values.map((label) => newOptionValue(label)) : [newOptionValue()],
  };
}
