import type { UserOrder } from "./typy";

/** Keeps the first occurrence of each order id (newest-first lists stay correct). */
export function dedupeOrdersById(orders: UserOrder[]): UserOrder[] {
  const seen = new Set<string>();
  return orders.filter((order) => {
    if (seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });
}

export function orderSummary(order: { items: { name: string; quantity: number }[] }) {
  if (order.items.length === 0) return "—";
  const first = order.items[0].name;
  if (order.items.length === 1) return first;
  const extra = order.items.length - 1;
  return `${first} (+${extra} więcej)`;
}
