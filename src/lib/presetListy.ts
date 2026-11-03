import { COLOR_FAMILIES } from "@/lib/atrybutyProduktu";
import { isProductRoom, isProductStyle } from "@/lib/stylePomieszczenia";

export type ListingFilterPreset = Partial<
  Record<"typ" | "pokoj" | "styl" | "kolor" | "material", string[]>
>;

const COLOR_IDS = new Set<string>(COLOR_FAMILIES.map((family) => family.id));

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

/** Filtry z adresu (`?styl=loft,skandynawski&typ=sofy`) - nieznane wartości są pomijane. */
export function parseListingPreset(
  query: Record<string, string | string[] | undefined>
): ListingFilterPreset {
  const preset: ListingFilterPreset = {};
  const typ = list(query.typ).filter((slug) => /^[a-z0-9-]+$/.test(slug));
  const pokoj = list(query.pokoj).filter(isProductRoom);
  const styl = list(query.styl).filter(isProductStyle);
  const kolor = list(query.kolor).filter((id) => COLOR_IDS.has(id));
  const material = list(query.material).filter((name) => name.length <= 40);
  if (typ.length) preset.typ = typ;
  if (pokoj.length) preset.pokoj = pokoj;
  if (styl.length) preset.styl = styl;
  if (kolor.length) preset.kolor = kolor;
  if (material.length) preset.material = material;
  return preset;
}
