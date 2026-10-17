import type { PaymentStatus, StoreOrder, UserOrder } from "./typy";

export interface DeliveryOptions {
  deliveryFee: number;
  freeShippingThreshold: number;
}

export function deliveryFeeForMethod(
  method: string,
  subtotalAfterDiscount: number,
  options: DeliveryOptions
): number {
  if (method === "pickup") return 0;
  return calculateDeliveryFee(subtotalAfterDiscount, options);
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
  deliveryMethod = "standard"
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
    deliveryOptions
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
