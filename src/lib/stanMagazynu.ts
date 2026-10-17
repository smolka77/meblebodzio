import type { Product } from "@/lib/typy";

export const MAX_STOCK = 9999;

export type StockFields = Pick<Product, "readyToShip" | "inStock" | "stockQty">;

export type CartQtyItem = {
  quantity: number;
  productId?: string;
  id?: string;
  cartKey?: string;
};

export function sanitizeStockQty(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const qty = Math.round(Number(value));
  if (!Number.isFinite(qty) || qty < 0 || qty > MAX_STOCK) return undefined;
  return qty;
}

/** Ilość na magazynie — tylko dla mebli od ręki. */
export function warehouseQty(
  product: Pick<Product, "readyToShip" | "stockQty"> | undefined
): number | undefined {
  if (!product?.readyToShip) return undefined;
  return sanitizeStockQty(product.stockQty);
}

export function isPurchasable(product: StockFields | undefined): boolean {
  if (!product?.inStock) return false;
  const qty = warehouseQty(product);
  if (qty === undefined) return true;
  return qty > 0;
}

function itemProductId(item: CartQtyItem): string | undefined {
  return item.productId || item.id;
}

/** Ile sztuk produktu już leży w koszyku (wszystkie warianty razem). */
export function cartQtyForProduct(
  items: CartQtyItem[],
  productId: string,
  except?: (item: CartQtyItem) => boolean
): number {
  return items.reduce((sum, item) => {
    if (itemProductId(item) !== productId) return sum;
    if (except?.(item)) return sum;
    return sum + item.quantity;
  }, 0);
}

/** Ile jeszcze można dodać / ile może mieć ta linia, biorąc pod uwagę koszyk. */
export function remainingWarehouseQty(
  product: Pick<Product, "id" | "readyToShip" | "stockQty"> | undefined,
  items: CartQtyItem[],
  except?: (item: CartQtyItem) => boolean
): number | undefined {
  const max = warehouseQty(product);
  if (max === undefined || !product) return undefined;
  return Math.max(0, max - cartQtyForProduct(items, product.id, except));
}
