import { revalidatePath } from "next/cache";
import { calculateCouponDiscount } from "@/lib/kasa";
import type { Coupon } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { getSettings } from "./ustawienia";

const FILE = "coupons.json";

export async function getCoupons(): Promise<Coupon[]> {
  await ensureStoreSeeded();
  const coupons = await readStore<Coupon[]>(FILE, []);
  return coupons.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getCouponById(id: string): Promise<Coupon | undefined> {
  const coupons = await getCoupons();
  return coupons.find((c) => c.id === id);
}

export async function getCouponByCode(code: string): Promise<Coupon | undefined> {
  const normalized = code.trim().toUpperCase();
  const coupons = await getCoupons();
  return coupons.find((c) => c.code === normalized);
}

function revalidateCoupons() {
  revalidatePath("/admin/kupony");
  revalidatePath("/koszyk");
}

export type CouponInput = Omit<Coupon, "id" | "usedCount" | "createdAt">;

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export async function createCoupon(data: CouponInput): Promise<Coupon | null> {
  const code = normalizeCode(data.code);
  const name = data.name.trim();
  if (!code || !name || data.discountPercent <= 0 || data.discountPercent > 100) {
    return null;
  }

  const coupons = await getCoupons();
  if (coupons.some((c) => c.code === code)) return null;

  const coupon: Coupon = {
    id: crypto.randomUUID(),
    code,
    name,
    description: data.description?.trim() ?? "",
    discountPercent: Math.round(data.discountPercent),
    minSubtotal: data.minSubtotal && data.minSubtotal > 0 ? data.minSubtotal : undefined,
    maxUses: data.maxUses != null && data.maxUses > 0 ? data.maxUses : null,
    usedCount: 0,
    active: data.active ?? true,
    expiresAt: data.expiresAt || undefined,
    createdAt: new Date().toISOString(),
  };

  await writeStore(FILE, [coupon, ...coupons]);
  revalidateCoupons();
  return coupon;
}

export async function updateCoupon(
  id: string,
  data: Partial<CouponInput>
): Promise<Coupon | null> {
  const coupons = await getCoupons();
  const index = coupons.findIndex((c) => c.id === id);
  if (index === -1) return null;

  const current = coupons[index];
  const nextCode = data.code != null ? normalizeCode(data.code) : current.code;

  if (
    nextCode !== current.code &&
    coupons.some((c) => c.code === nextCode && c.id !== id)
  ) {
    return null;
  }

  const updated: Coupon = {
    ...current,
    ...data,
    id,
    code: nextCode,
    name: data.name?.trim() ?? current.name,
    description: data.description?.trim() ?? current.description,
    discountPercent:
      data.discountPercent != null
        ? Math.round(data.discountPercent)
        : current.discountPercent,
    minSubtotal:
      data.minSubtotal !== undefined
        ? data.minSubtotal && data.minSubtotal > 0
          ? data.minSubtotal
          : undefined
        : current.minSubtotal,
    maxUses:
      data.maxUses !== undefined
        ? data.maxUses != null && data.maxUses > 0
          ? data.maxUses
          : null
        : current.maxUses,
    expiresAt: data.expiresAt !== undefined ? data.expiresAt || undefined : current.expiresAt,
  };

  coupons[index] = updated;
  await writeStore(FILE, coupons);
  revalidateCoupons();
  return updated;
}

export async function deleteCoupon(id: string): Promise<boolean> {
  const coupons = await getCoupons();
  if (!coupons.some((c) => c.id === id)) return false;
  await writeStore(
    FILE,
    coupons.filter((c) => c.id !== id)
  );
  revalidateCoupons();
  return true;
}

export interface CouponValidationResult {
  valid: true;
  coupon: Coupon;
  discountAmount: number;
}

export interface CouponValidationError {
  valid: false;
  error: string;
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult | CouponValidationError> {
  const coupon = await getCouponByCode(code);

  if (!coupon) {
    return { valid: false, error: "Nieprawidłowy kod rabatowy" };
  }
  if (!coupon.active) {
    return { valid: false, error: "Ten kod rabatowy jest nieaktywny" };
  }
  const settings = await getSettings();
  if (settings.discountCodesEnabled === false) {
    return { valid: false, error: "Kody rabatowe są teraz wyłączone" };
  }
  if (
    settings.newsletterOfferEnabled === false &&
    settings.newsletterOfferCode &&
    coupon.code.toUpperCase() === settings.newsletterOfferCode.toUpperCase()
  ) {
    return { valid: false, error: "Ten kod rabatowy jest nieaktywny" };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: "Ten kod rabatowy wygasł" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Limit użyć tego kodu został wyczerpany" };
  }
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      error: `Minimalna wartość zamówienia: ${coupon.minSubtotal} zł`,
    };
  }

  const discountAmount = calculateCouponDiscount(subtotal, coupon.discountPercent);
  if (discountAmount <= 0) {
    return { valid: false, error: "Kod rabatowy nie dotyczy tego koszyka" };
  }

  return { valid: true, coupon, discountAmount };
}

export async function incrementCouponUsage(id: string): Promise<void> {
  const coupons = await getCoupons();
  const index = coupons.findIndex((c) => c.id === id);
  if (index === -1) return;
  coupons[index] = { ...coupons[index], usedCount: coupons[index].usedCount + 1 };
  await writeStore(FILE, coupons);
  revalidateCoupons();
}
