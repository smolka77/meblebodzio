import type { Product } from "@/lib/typy";
import { sanitizeStockQty } from "@/lib/stanMagazynu";

type PublishFields = Pick<
  Product,
  "name" | "description" | "image" | "price" | "readyToShip" | "stockQty"
>;

export function productSaveError(
  data: Partial<PublishFields>,
  asDraft: boolean
): string | null {
  if (!data.name?.trim()) return "Podaj nazwę produktu.";
  if (asDraft) return null;
  if (!data.description?.trim() || !data.image?.trim()) {
    return "Żeby opublikować, uzupełnij krótki opis i zdjęcie produktu.";
  }
  if (!data.price || data.price <= 0) {
    return "Żeby opublikować, podaj cenę finalną na stronie (brutto).";
  }
  if (data.readyToShip && sanitizeStockQty(data.stockQty) == null) {
    return "Przy meblu od ręki podaj ilość na magazynie.";
  }
  return null;
}

export function isProductReadyToPublish(product: PublishFields): boolean {
  return productSaveError(product, false) === null;
}
