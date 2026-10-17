import { revalidatePath } from "next/cache";
import type { Product, ShopPromotion } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { getProducts, isLiveProduct, loadProductCatalog, saveProductCatalog } from "./produkty";
import { syncProductOmnibus } from "@/lib/cenaOmnibus";
import { wyczyscMeta } from "@/lib/seoPola";
import { isPromotionLive } from "@/lib/promocje";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";
import { slugify } from "@/lib/slug";

const FILE = "promotions.json";
const TITLE_MAX = 80;
const DESC_MAX = 500;
const MAX_PRODUCTS = 400;

function revalidatePromotions(slug?: string) {
  revalidatePath("/promocje");
  revalidatePath("/promocje/[slug]", "page");
  revalidatePath("/admin/promocje");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/promocje/${slug}`);
}

export async function getPromotions(): Promise<ShopPromotion[]> {
  await ensureStoreSeeded();
  const promotions = await readStore<ShopPromotion[]>(FILE, []);
  return promotions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPromotionById(
  id: string
): Promise<ShopPromotion | undefined> {
  const promotions = await getPromotions();
  return promotions.find((item) => item.id === id);
}

export async function getPromotionBySlug(
  slug: string
): Promise<ShopPromotion | undefined> {
  const promotions = await getPromotions();
  return promotions.find((item) => item.slug === slug);
}

export async function getLivePromotions(): Promise<ShopPromotion[]> {
  const promotions = await getPromotions();
  return promotions.filter((item) => isPromotionLive(item));
}

async function knownProductIds(): Promise<Set<string>> {
  const products = await getProducts();
  return new Set(products.filter(isLiveProduct).map((product) => product.id));
}

function sanitizeProductIds(value: unknown, allowed: Set<string>): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const ids: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const id = raw.trim();
    if (!id || seen.has(id) || !allowed.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= MAX_PRODUCTS) break;
  }
  return ids;
}

function uniqueSlug(base: string, promotions: ShopPromotion[], exceptId?: string): string {
  const root = slugify(base) || "promocja";
  let slug = root;
  let n = 2;
  while (
    promotions.some((item) => item.slug === slug && item.id !== exceptId)
  ) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

export type PromotionInput = {
  title: string;
  description?: string;
  active?: boolean;
  discountPercent?: number | null;
  productIds?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  slug?: string;
};

function sanitizeDiscount(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const percent = Math.round(Number(value));
  if (!Number.isFinite(percent) || percent <= 0 || percent >= 100) return undefined;
  return percent;
}

function priceAfterPercent(base: number, percent: number): number {
  return Math.max(0, Math.round(base * (1 - percent / 100)));
}

function restorePromoPrice(product: Product): Product {
  const restored = product.promoBasePrice ?? product.price;
  const next: Product = { ...product, price: restored };
  delete next.promoBasePrice;
  delete next.promoId;
  if (next.originalPrice != null && next.originalPrice <= restored) {
    delete next.originalPrice;
  }
  return syncProductOmnibus(next, product);
}

async function syncPromotionPrices(
  promotion: ShopPromotion,
  previous?: ShopPromotion
): Promise<void> {
  const percent =
    promotion.active && isPromotionLive(promotion) ? (promotion.discountPercent ?? 0) : 0;
  const ids = new Set(percent > 0 ? promotion.productIds : []);
  const touched = new Set([
    ...ids,
    ...(previous?.productIds ?? []),
    ...(percent > 0 ? [] : promotion.productIds),
  ]);
  if (touched.size === 0) return;
  const products = await loadProductCatalog();
  let changed = false;
  const next = products.map((product) => {
    if (product.manualPrice) {
      if (ids.has(product.id) && product.promoId !== promotion.id) {
        changed = true;
        return { ...product, promoId: promotion.id };
      }
      if (!ids.has(product.id) && product.promoId === promotion.id) {
        changed = true;
        const copy = { ...product };
        delete copy.promoId;
        return copy;
      }
      return product;
    }
    if (ids.has(product.id)) {
      const storedBase =
        product.promoId === promotion.id && product.promoBasePrice
          ? product.promoBasePrice
          : product.price;
      const price = priceAfterPercent(storedBase, percent);
      if (
        product.price === price &&
        product.promoId === promotion.id &&
        product.promoBasePrice === storedBase
      ) {
        return product;
      }
      changed = true;
      const priced: Product = {
        ...product,
        promoBasePrice: storedBase,
        promoId: promotion.id,
        price,
        originalPrice: storedBase > price ? storedBase : product.originalPrice,
      };
      return syncProductOmnibus(priced, product);
    }
    if (product.promoId === promotion.id) {
      changed = true;
      return restorePromoPrice(product);
    }
    return product;
  });
  if (changed) await saveProductCatalog(next);
}

function optionalDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

export async function createPromotion(
  data: PromotionInput
): Promise<ShopPromotion | null> {
  const title = wyczyscMeta(data.title, TITLE_MAX);
  if (!title) return null;
  const description = wyczyscMeta(data.description, DESC_MAX);
  const promotions = await getPromotions();
  const allowed = await knownProductIds();
  const id = crypto.randomUUID();
  const promotion: ShopPromotion = {
    id,
    slug: uniqueSlug(data.slug?.trim() || title, promotions),
    title,
    ...(description ? { description } : {}),
    active: data.active !== false,
    ...(sanitizeDiscount(data.discountPercent)
      ? { discountPercent: sanitizeDiscount(data.discountPercent) }
      : {}),
    productIds: sanitizeProductIds(data.productIds, allowed),
    startsAt: optionalDate(data.startsAt),
    endsAt: optionalDate(data.endsAt),
    createdAt: new Date().toISOString(),
  };

  await writeStore(FILE, [promotion, ...promotions]);
  await syncPromotionPrices(promotion);
  revalidatePromotions(promotion.slug);
  prefetchListingTranslationsFrom(promotion);
  return promotion;
}

export async function updatePromotion(
  id: string,
  data: Partial<PromotionInput>
): Promise<ShopPromotion | null> {
  const promotions = await getPromotions();
  const index = promotions.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const current = promotions[index];
  const allowed = await knownProductIds();
  const title =
    data.title !== undefined
      ? wyczyscMeta(data.title, TITLE_MAX)
      : current.title;
  if (!title) return null;
  const description =
    data.description !== undefined
      ? wyczyscMeta(data.description, DESC_MAX)
      : current.description;

  const updated: ShopPromotion = {
    ...current,
    title,
    slug:
      data.slug !== undefined || data.title !== undefined
        ? uniqueSlug(data.slug?.trim() || title, promotions, id)
        : current.slug,
    active: data.active ?? current.active,
    productIds:
      data.productIds !== undefined
        ? sanitizeProductIds(data.productIds, allowed)
        : current.productIds,
  };

  if (description) updated.description = description;
  else delete updated.description;

  if (data.startsAt !== undefined) {
    const start = optionalDate(data.startsAt);
    if (start) updated.startsAt = start;
    else delete updated.startsAt;
  }
  if (data.endsAt !== undefined) {
    const end = optionalDate(data.endsAt);
    if (end) updated.endsAt = end;
    else delete updated.endsAt;
  }

  if (data.discountPercent !== undefined) {
    const percent = sanitizeDiscount(data.discountPercent);
    if (percent) updated.discountPercent = percent;
    else delete updated.discountPercent;
  }

  promotions[index] = updated;
  await writeStore(FILE, promotions);
  await syncPromotionPrices(updated, current);
  revalidatePromotions(updated.slug);
  if (current.slug !== updated.slug) revalidatePromotions(current.slug);
  prefetchListingTranslationsFrom(updated);
  return updated;
}

export async function deletePromotion(id: string): Promise<boolean> {
  const promotions = await getPromotions();
  const current = promotions.find((item) => item.id === id);
  if (!current) return false;
  await writeStore(
    FILE,
    promotions.filter((item) => item.id !== id)
  );
  await syncPromotionPrices({ ...current, active: false, productIds: [] }, current);
  revalidatePromotions(current.slug);
  return true;
}
