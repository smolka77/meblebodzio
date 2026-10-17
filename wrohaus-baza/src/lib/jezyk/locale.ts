import type { ProductCategory } from "@/lib/typy";

export const LOCALES = ["pl", "en", "de", "uk"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pl";
export const LOCALE_COOKIE = "sofelio-locale";

export const LOCALE_HTML: Record<Locale, string> = {
  pl: "pl",
  en: "en",
  de: "de",
  uk: "uk",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  pl: "Polski",
  en: "English",
  de: "Deutsch",
  uk: "Українська",
};

export const LOCALE_CODES: Record<Locale, string> = {
  pl: "PL",
  en: "EN",
  de: "DE",
  uk: "UA",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function parseLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function writeLocaleCookie(locale: Locale) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export type PluralForm = "one" | "few" | "many";

export function pluralForm(locale: Locale, n: number): PluralForm {
  const abs = Math.abs(n);
  if (locale === "en" || locale === "de") {
    return abs === 1 ? "one" : "many";
  }
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return "one";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
  return "many";
}

export function categoryKey(category: ProductCategory): `cat.${ProductCategory}` {
  return `cat.${category}`;
}

export function introKey(category: ProductCategory): `intro.${ProductCategory}` {
  return `intro.${category}`;
}
