import type { CartItem, SavedConfiguration } from "./typy";

const CART_KEY = "sofelio-cart";
const COUPON_KEY = "sofelio-coupon";
const CONFIGS_KEY = "sofelio-saved-configs";
const PENDING_CHECKOUT_KEY = "sofelio-pending-checkout";
const LEGACY_USER_KEY = "sofelio-user";
const LEGACY_ORDERS_KEY = "sofelio-orders";
const PENDING_CHECKOUT_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export interface StoredCoupon {
  code: string;
  name: string;
  discountPercent: number;
  discountAmount: number;
}

export interface PendingCheckout {
  orderId: string;
  items: CartItem[];
  coupon: StoredCoupon | null;
  savedAt: number;
  guestToken?: string;
}

function isPendingCheckout(value: unknown): value is PendingCheckout {
  if (!value || typeof value !== "object") return false;
  const pending = value as PendingCheckout;
  return (
    typeof pending.orderId === "string" &&
    Array.isArray(pending.items) &&
    typeof pending.savedAt === "number"
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getCart(): CartItem[] {
    return readJson<CartItem[]>(CART_KEY, []);
  },
  setCart(items: CartItem[]) {
    writeJson(CART_KEY, items);
  },
  getCoupon(): StoredCoupon | null {
    return readJson<StoredCoupon | null>(COUPON_KEY, null);
  },
  setCoupon(coupon: StoredCoupon | null) {
    if (coupon) writeJson(COUPON_KEY, coupon);
    else localStorage.removeItem(COUPON_KEY);
  },
  getSavedConfigs(): SavedConfiguration[] {
    return readJson<SavedConfiguration[]>(CONFIGS_KEY, []);
  },
  setSavedConfigs(configs: SavedConfiguration[]) {
    writeJson(CONFIGS_KEY, configs);
  },
  getPendingCheckout(): PendingCheckout | null {
    const pending = readJson<PendingCheckout | null>(PENDING_CHECKOUT_KEY, null);
    if (!pending || !isPendingCheckout(pending) || pending.items.length === 0) {
      return null;
    }
    if (Date.now() - pending.savedAt > PENDING_CHECKOUT_MAX_AGE_MS) {
      localStorage.removeItem(PENDING_CHECKOUT_KEY);
      return null;
    }
    return pending;
  },
  setPendingCheckout(pending: PendingCheckout) {
    writeJson(PENDING_CHECKOUT_KEY, pending);
  },
  clearPendingCheckout() {
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  },
  purgeLegacyAuthData() {
    localStorage.removeItem(LEGACY_USER_KEY);
    localStorage.removeItem(LEGACY_ORDERS_KEY);
  },
  clearOperationalClientData() {
    localStorage.removeItem(COUPON_KEY);
    localStorage.removeItem(PENDING_CHECKOUT_KEY);
  },
};
