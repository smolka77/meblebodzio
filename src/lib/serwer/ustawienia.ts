import { revalidatePath } from "next/cache";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded, DEFAULT_SETTINGS } from "./startDanych";
import type {
  ExtraListingId,
  ProductCategory,
  ShopSettings,
  SocialLink,
  SocialPlatform,
} from "@/lib/typy";
import { extraListingIds } from "@/lib/listingi";
import { productCategories } from "@/lib/dane";
import { normalizeVisibleProductCategories } from "@/lib/widocznoscKategorii";
import {
  detectSocialPlatform,
  instagramUrlFromSocialLinks,
  normalizeSocialLinks,
} from "@/lib/socialMedia";
import {
  CATEGORY_DESC_MAX,
  SEO_DESC_MAX,
  SEO_KEYWORDS_MAX,
  SEO_TITLE_MAX,
  slowaKluczoweMeta,
  wyczyscMeta,
} from "@/lib/seoPola";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";

const FILE = "settings.json";
const MAX_SOCIAL_LINKS = 12;

const VALID_PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "pinterest",
  "linkedin",
  "x",
  "other",
]);

function sanitizeSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  const links: SocialLink[] = [];
  for (const item of value.slice(0, MAX_SOCIAL_LINKS)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<SocialLink>;
    const url = sanitizeHttpUrl(row.url);
    if (!url) continue;
    const platform =
      typeof row.platform === "string" && VALID_PLATFORMS.has(row.platform as SocialPlatform)
        ? (row.platform as SocialPlatform)
        : detectSocialPlatform(url);
    const id =
      typeof row.id === "string" && row.id.trim()
        ? row.id.trim().slice(0, 80)
        : `social-${links.length + 1}`;
    const label =
      typeof row.label === "string" && row.label.trim()
        ? row.label.trim().slice(0, 80)
        : undefined;
    links.push({ id, url, platform, label });
  }
  return links;
}

function normalizeSettings(stored: ShopSettings): ShopSettings {
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  const socialLinks = normalizeSocialLinks(
    sanitizeSocialLinks(merged.socialLinks),
    merged.instagramUrl
  );
  return {
    ...merged,
    socialLinks,
    instagramUrl: instagramUrlFromSocialLinks(socialLinks),
    visibleProductCategories: normalizeVisibleProductCategories(
      merged.visibleProductCategories
    ),
    categoryDescriptions: sanitizeCategoryDescriptions(merged.categoryDescriptions),
    listingDescriptions: sanitizeListingDescriptions(merged.listingDescriptions),
  };
}

function sanitizeCategoryDescriptions(
  value: unknown
): ShopSettings["categoryDescriptions"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const next: Partial<Record<ProductCategory, string>> = {};
  for (const slug of productCategories) {
    const text = wyczyscMeta(source[slug], CATEGORY_DESC_MAX);
    if (text) next[slug] = text;
  }
  return Object.keys(next).length ? next : undefined;
}

function sanitizeListingDescriptions(
  value: unknown
): ShopSettings["listingDescriptions"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const source = value as Record<string, unknown>;
  const next: Partial<Record<ExtraListingId, string>> = {};
  for (const slug of extraListingIds) {
    const text = wyczyscMeta(source[slug], CATEGORY_DESC_MAX);
    if (text) next[slug] = text;
  }
  return Object.keys(next).length ? next : undefined;
}

function sanitizeHttpUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim().slice(0, 500);
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function getSettings(): Promise<ShopSettings> {
  await ensureStoreSeeded();
  const stored = await readStore<ShopSettings>(FILE, DEFAULT_SETTINGS);
  return normalizeSettings(stored);
}

export async function updateSettings(
  data: Partial<ShopSettings>
): Promise<ShopSettings> {
  const current = await getSettings();
  const { adminPassword: _pw, adminUsername: _user, adminAuthVersion: _ver, ...rest } =
    data;
  const updated: ShopSettings = {
    ...current,
    ...rest,
  };

  if ("instagramUrl" in rest) {
    updated.instagramUrl = sanitizeHttpUrl(rest.instagramUrl);
  }

  if ("socialLinks" in rest) {
    updated.socialLinks = sanitizeSocialLinks(rest.socialLinks);
  }

  if ("visibleProductCategories" in rest) {
    updated.visibleProductCategories = normalizeVisibleProductCategories(
      rest.visibleProductCategories
    );
  }

  if ("seoTitle" in rest) {
    const title = wyczyscMeta(rest.seoTitle, SEO_TITLE_MAX);
    if (title) updated.seoTitle = title;
    else delete updated.seoTitle;
  }

  if ("seoDescription" in rest) {
    const description = wyczyscMeta(rest.seoDescription, SEO_DESC_MAX);
    if (description) updated.seoDescription = description;
    else delete updated.seoDescription;
  }

  if ("seoKeywords" in rest) {
    const keywords = slowaKluczoweMeta(
      wyczyscMeta(rest.seoKeywords, SEO_KEYWORDS_MAX) ?? rest.seoKeywords
    );
    if (keywords) updated.seoKeywords = keywords.join(", ");
    else delete updated.seoKeywords;
  }

  if ("categoryDescriptions" in rest) {
    const descriptions = sanitizeCategoryDescriptions(rest.categoryDescriptions);
    if (descriptions) updated.categoryDescriptions = descriptions;
    else delete updated.categoryDescriptions;
  }

  if ("listingDescriptions" in rest) {
    const listings = sanitizeListingDescriptions(rest.listingDescriptions);
    if (listings) updated.listingDescriptions = listings;
    else delete updated.listingDescriptions;
  }

  updated.socialLinks = normalizeSocialLinks(
    updated.socialLinks,
    updated.instagramUrl
  );
  updated.instagramUrl = instagramUrlFromSocialLinks(updated.socialLinks);
  updated.visibleProductCategories = normalizeVisibleProductCategories(
    updated.visibleProductCategories
  );

  updated.adminUsername = current.adminUsername;
  updated.adminPassword = current.adminPassword;
  updated.adminAuthVersion = current.adminAuthVersion;

  await writeStore(FILE, updated);
  revalidatePath("/", "layout");
  revalidatePath("/koszyk");
  revalidatePath("/dostawa");
  revalidatePath("/produkty");
  revalidatePath("/kategoria/[category]", "page");
  revalidatePath("/meble-od-reki");
  revalidatePath("/meble-do-7-dni");
  revalidatePath("/probki-tkanin");
  revalidatePath("/promocje");
  revalidatePath("/sitemap.xml");
  prefetchListingTranslationsFrom(updated.categoryDescriptions);
  prefetchListingTranslationsFrom(updated.listingDescriptions);
  return updated;
}

export async function getVisibleProductCategories(): Promise<ProductCategory[]> {
  const settings = await getSettings();
  return normalizeVisibleProductCategories(settings.visibleProductCategories);
}
