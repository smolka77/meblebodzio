/** Helpers for compare-at / promotional pricing display. */

/** VAT na meble w sprzedaży detalicznej w Polsce. */
export const PRODUCT_VAT_RATE = 0.23;

export type PriceQuote = {
  costNet: number;
  marginPercent: number;
  sellingNet: number;
  vat: number;
  sellingGross: number;
};

export function quoteFromCost(
  costNet?: number,
  marginPercent?: number
): PriceQuote | null {
  if (costNet == null || !Number.isFinite(costNet) || costNet <= 0) return null;
  const margin =
    marginPercent == null || !Number.isFinite(marginPercent)
      ? 0
      : marginPercent;
  const sellingNet = Math.round(costNet * (1 + margin / 100) * 100) / 100;
  const vat = Math.round(sellingNet * PRODUCT_VAT_RATE * 100) / 100;
  const sellingGross = Math.round(sellingNet * (1 + PRODUCT_VAT_RATE));
  return { costNet, marginPercent: margin, sellingNet, vat, sellingGross };
}

export function formatPln(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function hasSalePrice(product: {
  price: number;
  originalPrice?: number;
}): boolean {
  return (
    product.originalPrice != null &&
    product.originalPrice > product.price
  );
}

export function saleDiscountPercent(price: number, originalPrice: number): number {
  if (originalPrice <= price) return 0;
  return Math.round((1 - price / originalPrice) * 100);
}

export function saleSavings(price: number, originalPrice: number): number {
  return Math.max(0, originalPrice - price);
}

export function formatDiscountPercent(price: number, originalPrice: number): string {
  return `-${saleDiscountPercent(price, originalPrice)}%`;
}
