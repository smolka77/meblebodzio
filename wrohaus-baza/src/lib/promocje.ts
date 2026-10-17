import type { Product, ShopPromotion } from "@/lib/typy";

export function isPromotionLive(
  promo: Pick<ShopPromotion, "active" | "startsAt" | "endsAt">,
  now = new Date()
): boolean {
  if (!promo.active) return false;
  if (promo.startsAt) {
    const start = new Date(promo.startsAt);
    if (!Number.isNaN(start.getTime()) && start > now) return false;
  }
  if (promo.endsAt) {
    const end = new Date(promo.endsAt);
    if (!Number.isNaN(end.getTime())) {
      if (promo.endsAt.length <= 10) end.setHours(23, 59, 59, 999);
      if (end < now) return false;
    }
  }
  return true;
}

export function productsInPromotion(
  products: Product[],
  promo: Pick<ShopPromotion, "productIds">
): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return promo.productIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => Boolean(product));
}
