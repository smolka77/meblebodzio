import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { getSettings } from "./ustawienia";
import { validateCoupon, incrementCouponUsage } from "./kupony";
import { validateOrderItems } from "./walidacjaZamowien";
import { applyWarehouseSale, loadProductCatalog } from "./produkty";
import {
  buildTransferTitle,
  calculateOrderTotal,
  deliveryFeeForMethod,
  isCartPayMethod,
  payuRatyAmountOk,
} from "@/lib/kasa";
import {
  decryptRecord,
  encryptRecord,
} from "./szyfrowanie";
import type { StoreOrder, UserOrder, UserOrderItem, OrderStatus } from "@/lib/typy";

const FILE = "orders.json";

const PII_FIELDS = [
  "customer",
  "email",
  "phone",
  "address",
  "city",
  "postalCode",
] as const;

type StoredOrder = StoreOrder;

async function decryptOrder(order: StoredOrder): Promise<StoreOrder> {
  return decryptRecord(order, [...PII_FIELDS]);
}

async function encryptOrder(order: StoreOrder): Promise<StoredOrder> {
  return encryptRecord(order, [...PII_FIELDS]);
}

async function readOrdersRaw(): Promise<StoredOrder[]> {
  await ensureStoreSeeded();
  return readStore<StoredOrder[]>(FILE, []);
}

export async function getOrders(): Promise<StoreOrder[]> {
  const orders = await readOrdersRaw();
  const decrypted = await Promise.all(orders.map(decryptOrder));
  return decrypted.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getOrderById(id: string): Promise<StoreOrder | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.id === id);
}

export function toUserOrder(order: StoreOrder): UserOrder {
  return {
    id: order.id,
    items: order.items,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    couponCode: order.couponCode,
    couponName: order.couponName,
    deliveryFee: order.deliveryFee,
    total: order.total,
    transferTitle: order.transferTitle,
    paymentStatus: order.paymentStatus,
    date: order.date,
    status: order.status,
  };
}

export async function getOrdersForUser(userId: string): Promise<UserOrder[]> {
  const orders = await getOrders();
  return orders.filter((o) => o.userId === userId).map(toUserOrder);
}

export function orderOwnedByUser(order: StoreOrder, userId: string): boolean {
  return Boolean(order.userId && order.userId === userId);
}

export function issueGuestAccessToken(): { token: string; hash: string } {
  const token = randomBytes(24).toString("hex");
  return { token, hash: hashGuestAccessToken(token) };
}

export function hashGuestAccessToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function guestAccessTokenOk(order: StoreOrder, token: string): boolean {
  if (!order.guestAccessTokenHash || !token) return false;
  const actual = hashGuestAccessToken(token);
  const expected = order.guestAccessTokenHash;
  if (expected.length !== actual.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

async function nextOrderId(): Promise<string> {
  const orders = await readOrdersRaw();
  const used = new Set(orders.map((o) => o.id));
  const maxNum = orders.reduce((max, o) => {
    const num = parseInt(o.id.replace("ORD-", ""), 10);
    return Number.isNaN(num) ? max : Math.max(max, num);
  }, 0);
  let n = maxNum + 1;
  while (used.has(`ORD-${n}`)) n += 1;
  return `ORD-${n}`;
}

export interface CreateOrderInput {
  customer: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryMethod: string;
  paymentMethod?: string;
  invoiceNip?: string;
  userId?: string;
  guestAccessTokenHash?: string;
  items: UserOrderItem[];
  subtotal: number;
  couponCode?: string;
  deliveryFee?: number;
  total: number;
}

export async function createOrder(
  input: CreateOrderInput
): Promise<StoreOrder | { error: string }> {
  const itemCheck = await validateOrderItems(input.items);
  if (!itemCheck.ok) {
    return { error: itemCheck.error };
  }

  const orders = await readOrdersRaw();
  const settings = await getSettings();
  const subtotal = itemCheck.subtotal;

  let discountAmount = 0;
  let couponCode: string | undefined;
  let couponName: string | undefined;
  let couponId: string | undefined;

  if (input.couponCode?.trim()) {
    const validation = await validateCoupon(input.couponCode, subtotal);
    if (!validation.valid) {
      return { error: validation.error };
    }
    discountAmount = validation.discountAmount;
    couponCode = validation.coupon.code;
    couponName = validation.coupon.name;
    couponId = validation.coupon.id;
  }

  const catalog = await loadProductCatalog();
  const byId = new Map(catalog.map((product) => [product.id, product]));
  const deliveryLines = itemCheck.items.map((item) => ({
    deliveryCost: byId.get(item.productId)?.deliveryCost,
    quantity: item.quantity,
  }));
  const totals = calculateOrderTotal(
    subtotal,
    discountAmount,
    settings,
    input.deliveryMethod,
    deliveryLines
  );
  const paymentMethod = isCartPayMethod(input.paymentMethod)
    ? input.paymentMethod
    : undefined;
  if (paymentMethod === "raty" && !payuRatyAmountOk(totals.total)) {
    return {
      error: "Raty PayU są dostępne dla zamówień od 100 do 50 000 zł.",
    };
  }
  if (couponId) await incrementCouponUsage(couponId);
  const now = new Date();
  const orderId = await nextOrderId();

  const order: StoreOrder = {
    id: orderId,
    customer: input.customer.trim().slice(0, 120),
    email: input.email.trim().slice(0, 254),
    phone: input.phone.trim().slice(0, 40),
    address: input.address.trim().slice(0, 200),
    city: input.city.trim().slice(0, 80),
    postalCode: input.postalCode.trim().slice(0, 12),
    deliveryMethod: input.deliveryMethod.slice(0, 40),
    paymentMethod,
    invoiceNip: input.invoiceNip?.trim().slice(0, 15),
    userId: input.userId?.slice(0, 64),
    guestAccessTokenHash: input.guestAccessTokenHash,
    items: itemCheck.items,
    subtotal,
    discountAmount: totals.discountAmount,
    couponCode,
    couponName,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    transferTitle: buildTransferTitle(orderId, settings.shopName),
    paymentStatus: "awaiting",
    status: "pending",
    date: now.toISOString().split("T")[0],
    createdAt: now.toISOString(),
  };
  const encrypted = await encryptOrder(order);
  await writeStore(FILE, [encrypted, ...orders]);
  revalidatePath("/admin");
  revalidatePath("/admin/zamowienia");
  revalidatePath("/admin/klienci");
  revalidatePath("/admin/analityka");
  revalidatePath("/admin/kupony");
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<StoreOrder | null> {
  const orders = await readOrdersRaw();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  const current = await decryptOrder(orders[index]);
  if (current.status === status) return current;

  let stockRestored = current.stockRestored;
  if (
    status === "cancelled" &&
    current.stockApplied &&
    !current.stockRestored
  ) {
    await applyWarehouseSale(current.items, "restore");
    stockRestored = true;
  }

  const next = { ...current, status, stockRestored };
  orders[index] = await encryptOrder(next);
  await writeStore(FILE, orders);
  revalidatePath("/admin/zamowienia");
  return next;
}

export async function getOrderStatusUpdates(ids: string[]) {
  if (ids.length === 0) return [];
  const wanted = new Set(ids);
  const orders = await getOrders();
  return orders
    .filter((order) => wanted.has(order.id))
    .map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus ?? ("awaiting" as const),
    }));
}

export async function getOrderStatusUpdatesForUser(userId: string, ids: string[]) {
  if (ids.length === 0) return [];
  const wanted = new Set(ids);
  const orders = await getOrders();
  return orders
    .filter((order) => wanted.has(order.id) && order.userId === userId)
    .map((order) => ({
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus ?? ("awaiting" as const),
    }));
}

export async function deleteOrder(id: string): Promise<boolean> {
  const orders = await readOrdersRaw();
  const order = orders.find((o) => o.id === id);
  if (!order) return false;
  const decrypted = await decryptOrder(order);
  if (decrypted.status !== "cancelled") return false;
  await writeStore(
    FILE,
    orders.filter((o) => o.id !== id)
  );
  revalidatePath("/admin");
  revalidatePath("/admin/zamowienia");
  revalidatePath("/admin/klienci");
  revalidatePath("/admin/analityka");
  return true;
}

let paymentLock: Promise<unknown> = Promise.resolve();

function withPaymentLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = paymentLock.then(fn, fn);
  paymentLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export async function confirmOrderPayment(
  id: string
): Promise<{ order: StoreOrder; sendCustomerConfirmation: boolean } | null> {
  return withPaymentLock(async () => {
    const orders = await readOrdersRaw();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const current = await decryptOrder(orders[index]);
    if (current.status === "cancelled") {
      return { order: current, sendCustomerConfirmation: false };
    }
    if (current.paymentStatus === "confirmed" && current.stockApplied) {
      return { order: current, sendCustomerConfirmation: false };
    }

    if (!current.stockApplied) {
      await applyWarehouseSale(current.items, "subtract");
    }

    const sendCustomerConfirmation =
      current.paymentStatus !== "confirmed" && !current.customerConfirmationSent;
    const next = {
      ...current,
      paymentStatus: "confirmed" as const,
      paidAt: current.paidAt ?? new Date().toISOString(),
      stockApplied: true,
      customerConfirmationSent:
        current.customerConfirmationSent || sendCustomerConfirmation,
    };
    orders[index] = await encryptOrder(next);
    await writeStore(FILE, orders);
    revalidatePath("/admin/zamowienia");
    revalidatePath("/admin");
    return { order: next, sendCustomerConfirmation };
  });
}

export async function failOrderPayment(id: string): Promise<StoreOrder | null> {
  return withPaymentLock(async () => {
    const orders = await readOrdersRaw();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    const current = await decryptOrder(orders[index]);
    if (current.paymentStatus === "confirmed") return current;
    if (current.paymentStatus === "failed") return current;

    const next = {
      ...current,
      paymentStatus: "failed" as const,
    };
    orders[index] = await encryptOrder(next);
    await writeStore(FILE, orders);
    revalidatePath("/admin/zamowienia");
    return next;
  });
}

export async function setOrderPayUOrderId(
  id: string,
  payuOrderId: string
): Promise<StoreOrder | null> {
  const orders = await readOrdersRaw();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  const current = await decryptOrder(orders[index]);
  const next = { ...current, payuOrderId };
  orders[index] = await encryptOrder(next);
  await writeStore(FILE, orders);
  return next;
}

export async function getOrderByPayUOrderId(
  payuOrderId: string
): Promise<StoreOrder | undefined> {
  const orders = await getOrders();
  return orders.find((o) => o.payuOrderId === payuOrderId);
}
