import type { Product } from "@/lib/typy";
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from "@/lib/zgodaCookies";
import { productStyles } from "@/lib/stylePomieszczenia";
import { productScore } from "@/lib/opinie";

/**
 * Profil zainteresowań trzymany wyłącznie w przeglądarce (localStorage) i tylko za zgodą
 * na pliki analityczne - na jego podstawie sklep podpowiada „Wybrane dla Ciebie”.
 */

const KEY = "wnetrza-profil";
const MAX_RECENT = 12;
export const PROFILE_EVENT = "wnetrza-profil-zmiana";

export interface BrowsingProfile {
  /** Ostatnio oglądane produkty (slug), najnowsze pierwsze. */
  recent: string[];
  categories: Record<string, number>;
  styles: Record<string, number>;
}

export const EMPTY_PROFILE: BrowsingProfile = { recent: [], categories: {}, styles: {} };

export function readProfile(): BrowsingProfile {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return EMPTY_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw) as Partial<BrowsingProfile>;
    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent.filter((s) => typeof s === "string") : [],
      categories: parsed.categories && typeof parsed.categories === "object" ? parsed.categories : {},
      styles: parsed.styles && typeof parsed.styles === "object" ? parsed.styles : {},
    };
  } catch {
    return EMPTY_PROFILE;
  }
}

function writeProfile(profile: BrowsingProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {
    /* pamięć przeglądarki pełna lub wyłączona - profil jest tylko dodatkiem */
  }
}

export function recordProductView(product: Pick<Product, "slug" | "category" | "styles">) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;
  const profile = readProfile();
  const next: BrowsingProfile = {
    recent: [product.slug, ...profile.recent.filter((slug) => slug !== product.slug)].slice(0, MAX_RECENT),
    categories: { ...profile.categories, [product.category]: (profile.categories[product.category] ?? 0) + 1 },
    styles: { ...profile.styles },
  };
  for (const style of productStyles(product)) {
    next.styles[style] = (next.styles[style] ?? 0) + 1;
  }
  writeProfile(next);
}

export function clearProfile() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(PROFILE_EVENT));
  } catch {
    /* ignorujemy */
  }
}

export function profileHasSignal(profile: BrowsingProfile): boolean {
  return profile.recent.length > 0;
}

/** Produkty dopasowane do profilu - bez tych, które klient już oglądał. */
export function recommendForProfile(
  products: Product[],
  profile: BrowsingProfile,
  limit = 4
): Product[] {
  if (!profileHasSignal(profile)) return [];
  const seen = new Set(profile.recent);
  const scored = products
    .filter((product) => !product.draft && !seen.has(product.slug))
    .map((product) => {
      const category = profile.categories[product.category] ?? 0;
      const style = productStyles(product).reduce((sum, s) => sum + (profile.styles[s] ?? 0), 0);
      const quality = (productScore(product)?.rating ?? 4) / 5;
      const score = category * 2 + style * 1.5 + (product.featured ? 0.6 : 0) + quality * 0.4;
      return { product, score };
    })
    .filter((entry) => entry.score > 0.9)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.product);
}

export function subscribeProfile(listener: () => void): () => void {
  window.addEventListener(PROFILE_EVENT, listener);
  window.addEventListener(COOKIE_CONSENT_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(PROFILE_EVENT, listener);
    window.removeEventListener(COOKIE_CONSENT_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
