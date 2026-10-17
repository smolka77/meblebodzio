import type { Product } from "@/lib/typy";

const SET_LIMIT = 16;

/** Inne oferty z tej samej linii — inne kategorie pierwsze, bez bieżącego mebla. */
export function productsForCompleteSet(
  products: Product[],
  current: Pick<Product, "id" | "category" | "furnitureLineId">,
  limit = SET_LIMIT
): Product[] {
  const lineId = current.furnitureLineId?.trim();
  if (!lineId) return [];
  return products
    .filter((item) => item.id !== current.id && item.furnitureLineId === lineId)
    .sort((a, b) => {
      const aSame = a.category === current.category ? 1 : 0;
      const bSame = b.category === current.category ? 1 : 0;
      if (aSame !== bSame) return aSame - bSame;
      return a.name.localeCompare(b.name, "pl");
    })
    .slice(0, limit);
}
