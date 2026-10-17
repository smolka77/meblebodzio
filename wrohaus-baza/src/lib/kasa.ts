import type { PaymentStatus, StoreOrder, UserOrder } from "./typy";

export interface DeliveryOptions {
  deliveryFee: number;
  freeShippingThreshold: number;
}

export type DeliveryLine = {
  deliveryCost?: string;
  quantity: number;
};

/** „od 249 zł”, „349 zł” → 249 / 349. Pusty tekst = brak własnej stawki. */
export function parseDeliveryCostAmount(value: string | undefined | null): number | undefined {
  if (!value?.trim()) return undefined;
  const match = value.replace(/\s+/g, "").match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!match) return undefined;
  const amount = Number(match[1].replace(",", "."));
  if (!Number.isFinite(amount) || amount < 0) return undefined;
  return Math.round(amount);
}

export function deliveryFeeForLines(
  lines: DeliveryLine[] | undefined,
  method: string,
  subtotalAfterDiscount: number,
  options: DeliveryOptions
): number {
  if (method === "pickup") return 0;
  if (
    options.freeShippingThreshold > 0 &&
    subtotalAfterDiscount >= options.freeShippingThreshold
  ) {
    return 0;
  }
  if (!lines?.length) return options.deliveryFee;
  let custom = 0;
  let needsShopFee = false;
  for (const line of lines) {
    const amount = parseDeliveryCostAmount(line.deliveryCost);
    const qty = Math.max(1, Math.round(line.quantity) || 1);
    if (amount == null) needsShopFee = true;
    else custom += amount * qty;
  }
  return custom + (needsShopFee ? options.deliveryFee : 0);
}

export function deliveryFeeForMethod(
  method: string,
  subtotalAfterDiscount: number,
  options: DeliveryOptions,
  lines?: DeliveryLine[]
): number {
  return deliveryFeeForLines(lines, method, subtotalAfterDiscount, options);
}

export function calculateDeliveryFee(
  subtotal: number,
  { deliveryFee, freeShippingThreshold }: DeliveryOptions
): number {
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) {
    return 0;
  }
  return deliveryFee;
}

export function calculateCouponDiscount(
  subtotal: number,
  discountPercent: number
): number {
  if (subtotal <= 0 || discountPercent <= 0) return 0;
  return Math.round(subtotal * (discountPercent / 100));
}

export function calculateOrderTotal(
  subtotal: number,
  discountAmount: number,
  deliveryOptions: DeliveryOptions,
  deliveryMethod = "standard",
  lines?: DeliveryLine[]
): {
  discountAmount: number;
  subtotalAfterDiscount: number;
  deliveryFee: number;
  total: number;
} {
  const appliedDiscount = Math.min(Math.max(0, discountAmount), subtotal);
  const subtotalAfterDiscount = subtotal - appliedDiscount;
  const deliveryFee = deliveryFeeForMethod(
    deliveryMethod,
    subtotalAfterDiscount,
    deliveryOptions,
    lines
  );
  return {
    discountAmount: appliedDiscount,
    subtotalAfterDiscount,
    deliveryFee,
    total: subtotalAfterDiscount + deliveryFee,
  };
}

export function buildTransferTitle(orderId: string, shopName = "Wrohaus"): string {
  return `${shopName} ${orderId}`;
}

/** Metody wybierane w koszyku. Raty to PayU | Raty (payMethod `ai`), nie osobna bramka. */
export const CART_PAY_METHODS = ["blik", "card", "apple", "bank", "raty"] as const;

export type CartPayMethodId = (typeof CART_PAY_METHODS)[number];

export function isCartPayMethod(value: string | undefined | null): value is CartPayMethodId {
  return CART_PAY_METHODS.includes(value as CartPayMethodId);
}

/** PayU | Raty (`ai`): 100–50 000 zł. */
export const PAYU_RATY_MIN_PLN = 100;
export const PAYU_RATY_MAX_PLN = 50_000;

export function payuRatyAmountOk(totalPln: number): boolean {
  return (
    Number.isFinite(totalPln) &&
    totalPln >= PAYU_RATY_MIN_PLN &&
    totalPln <= PAYU_RATY_MAX_PLN
  );
}

export function resolvePaymentStatus(
  order: Pick<StoreOrder | UserOrder, "paymentStatus">
): PaymentStatus {
  return order.paymentStatus ?? "awaiting";
}

/** Przychód w panelu: tylko dostarczone i opłacone. */
export function orderCountsTowardRevenue(
  order: Pick<StoreOrder | UserOrder, "status" | "paymentStatus">
): boolean {
  return (
    order.status === "delivered" && resolvePaymentStatus(order) === "confirmed"
  );
}

export function orderSubtotal(order: {
  subtotal?: number;
  items: { price: number; quantity: number }[];
  total: number;
}): number {
  if (order.subtotal != null) return order.subtotal;
  return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function orderDeliveryFee(order: {
  deliveryFee?: number;
  subtotal?: number;
  discountAmount?: number;
  items: { price: number; quantity: number }[];
  total: number;
}): number {
  if (order.deliveryFee != null) return order.deliveryFee;
  const subtotal = orderSubtotal(order);
  const discount = order.discountAmount ?? 0;
  return Math.max(0, order.total - Math.max(0, subtotal - discount));
}

export function orderDiscountAmount(order: { discountAmount?: number }): number {
  return order.discountAmount ?? 0;
}
