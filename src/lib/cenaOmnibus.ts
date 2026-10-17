import { hasSalePrice } from "@/lib/ceny";

export const OMNIBUS_DAYS = 30;
const MS_DAY = 24 * 60 * 60 * 1000;
const KEEP_DAYS = 60;
const MAX_POINTS = 180;

export type PricePoint = {
  at: string;
  price: number;
};

export function pricesEqual(a: number, b: number): boolean {
  return Math.round(a * 100) === Math.round(b * 100);
}

export function sanitizePricePoints(input: unknown): PricePoint[] {
  if (!Array.isArray(input)) return [];
  const out: PricePoint[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Partial<PricePoint>;
    const atMs = Date.parse(String(row.at ?? ""));
    const price = Number(row.price);
    if (!Number.isFinite(atMs) || !Number.isFinite(price) || price <= 0) continue;
    out.push({
      at: new Date(atMs).toISOString(),
      price: Math.round(price * 100) / 100,
    });
  }
  out.sort((a, b) => a.at.localeCompare(b.at) || a.price - b.price);
  const collapsed: PricePoint[] = [];
  for (const point of out) {
    const last = collapsed[collapsed.length - 1];
    if (last && pricesEqual(last.price, point.price)) continue;
    collapsed.push(point);
  }
  return prunePriceHistory(collapsed);
}

export function prunePriceHistory(
  history: PricePoint[],
  now = Date.now()
): PricePoint[] {
  const cutoff = now - KEEP_DAYS * MS_DAY;
  let firstKeep = 0;
  for (let i = 0; i < history.length; i++) {
    if (Date.parse(history[i].at) >= cutoff) {
      firstKeep = Math.max(0, i - 1);
      break;
    }
    firstKeep = i;
  }
  return history.slice(firstKeep).slice(-MAX_POINTS);
}

export function seedPriceHistory(
  product: { price: number; lowestPrice30Days?: number; priceHistory?: PricePoint[] },
  now = Date.now()
): PricePoint[] {
  if (product.priceHistory?.length) {
    return sanitizePricePoints(product.priceHistory);
  }
  const price = Number(product.price);
  if (!Number.isFinite(price) || price <= 0) return [];
  const lowest = Number(product.lowestPrice30Days);
  const points: PricePoint[] = [];
  if (Number.isFinite(lowest) && lowest > 0 && !pricesEqual(lowest, price)) {
    points.push({
      at: new Date(now - OMNIBUS_DAYS * MS_DAY).toISOString(),
      price: lowest,
    });
  }
  points.push({ at: new Date(now).toISOString(), price });
  return points;
}

export function recordPriceChange(
  history: PricePoint[] | undefined,
  price: number,
  now = Date.now()
): PricePoint[] {
  const current = sanitizePricePoints(history);
  if (!Number.isFinite(price) || price <= 0) return current;
  const rounded = Math.round(price * 100) / 100;
  const last = current[current.length - 1];
  if (last && pricesEqual(last.price, rounded)) return current;
  return prunePriceHistory(
    [...current, { at: new Date(now).toISOString(), price: rounded }],
    now
  );
}

/**
 * Najniższa cena, która obowiązywała w 30 dniach przed aktualną ceną
 * (dyrektywa Omnibus / UOKIK).
 */
export function lowestPriceInPrior30Days(
  history: PricePoint[] | undefined,
  now = Date.now()
): number | undefined {
  const points = sanitizePricePoints(history);
  if (points.length < 2) return undefined;
  const currentStart = Date.parse(points[points.length - 1].at);
  if (!Number.isFinite(currentStart)) return undefined;
  const windowEnd = currentStart;
  const windowStart = Math.min(currentStart, now) - OMNIBUS_DAYS * MS_DAY;

  let min: number | undefined;
  for (let i = 0; i < points.length - 1; i++) {
    const start = Date.parse(points[i].at);
    const end = Date.parse(points[i + 1].at);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (end > windowStart && start < windowEnd) {
      min = min == null ? points[i].price : Math.min(min, points[i].price);
    }
  }
  return min;
}

function attachLowest<T extends { lowestPrice30Days?: number }>(
  product: T,
  lowest: number | undefined
): T {
  const next = { ...product };
  if (lowest != null && Number.isFinite(lowest) && lowest > 0) {
    next.lowestPrice30Days = lowest;
  } else {
    delete next.lowestPrice30Days;
  }
  return next;
}

export function resolveOmnibusLowest(
  product: {
    price: number;
    lowestPrice30Days?: number;
    priceHistory?: PricePoint[];
  },
  now = Date.now()
): number | undefined {
  const history = product.priceHistory?.length
    ? sanitizePricePoints(product.priceHistory)
    : seedPriceHistory(product, now);
  const computed = lowestPriceInPrior30Days(history, now);
  if (computed != null) return computed;
  if (history.length < 2) {
    const legacy = Number(product.lowestPrice30Days);
    if (Number.isFinite(legacy) && legacy > 0) return legacy;
  }
  return undefined;
}

export function withOmnibusLowest<
  T extends { price: number; lowestPrice30Days?: number; priceHistory?: PricePoint[] },
>(product: T, now = Date.now()): T {
  const history = product.priceHistory?.length
    ? sanitizePricePoints(product.priceHistory)
    : seedPriceHistory(product, now);
  const lowest = resolveOmnibusLowest({ ...product, priceHistory: history }, now);
  return attachLowest({ ...product, priceHistory: history }, lowest);
}

export function syncProductOmnibus<
  T extends { price: number; lowestPrice30Days?: number; priceHistory?: PricePoint[] },
>(next: T, previous?: T | null, now = Date.now()): T {
  const history = previous
    ? recordPriceChange(
        previous.priceHistory?.length
          ? previous.priceHistory
          : seedPriceHistory(previous, now),
        next.price,
        now
      )
    : seedPriceHistory(next, now);
  const lowest = resolveOmnibusLowest({ ...next, priceHistory: history }, now);
  return attachLowest({ ...next, priceHistory: history }, lowest);
}

export function shouldShowOmnibusLowest(product: {
  price: number;
  originalPrice?: number;
  lowestPrice30Days?: number;
}): boolean {
  const lowest = product.lowestPrice30Days;
  if (lowest == null || lowest <= 0) return false;
  return hasSalePrice(product) || lowest > product.price;
}
