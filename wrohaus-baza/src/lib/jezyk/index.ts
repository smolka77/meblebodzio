import type { ProductCategory } from "@/lib/typy";
import { categoryIntros, isBuiltinProductCategory } from "@/lib/dane";
import {
  categoryKey,
  DEFAULT_LOCALE,
  introKey,
  parseLocale,
  pluralForm,
  type Locale,
} from "./locale";
import { dictionaries, type MessageKey } from "./slownik";

export type { Locale, MessageKey };
export {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_HTML,
  LOCALE_CODES,
  LOCALE_NAMES,
  parseLocale,
  writeLocaleCookie,
  pluralForm,
  categoryKey,
  introKey,
  isLocale,
} from "./locale";

export type TranslateVars = Record<string, string | number>;

export function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] == null ? `{${key}}` : String(vars[key])
  );
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: TranslateVars
): string {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
  const value = dict[key] ?? dictionaries[DEFAULT_LOCALE][key] ?? key;
  return interpolate(value, vars);
}

export function tPlural(
  locale: Locale,
  base: "listing.count" | "search.results" | "home.moreSale",
  n: number,
  extra?: TranslateVars
): string {
  const form = pluralForm(locale, n);
  const key = `${base}.${form}` as MessageKey;
  return translate(locale, key, { n, ...extra });
}

export function translateCategory(
  locale: Locale,
  category: string
): string {
  if (isBuiltinProductCategory(category)) {
    return translate(locale, categoryKey(category));
  }
  return category;
}

export function translateCategoryIntro(
  locale: Locale,
  category: ProductCategory
): string {
  if (locale === "pl") return categoryIntros[category];
  return translate(locale, introKey(category));
}

const NAV_BY_HREF: Record<string, MessageKey> = {
  "/kategoria/sofy": "cat.sofy",
  "/kategoria/narozniki": "cat.narozniki",
  "/kategoria/narozniki?ksztalt=l": "nav.cornerL",
  "/kategoria/narozniki?ksztalt=u": "nav.cornerU",
  "/kategoria/fotele": "cat.fotele",
  "/kategoria/kolekcje": "cat.kolekcje",
  "/kategoria/oswietlenie": "cat.oswietlenie",
  "/kategoria/szafy": "cat.szafy",
  "/kategoria/szafki": "nav.nightstands",
  "/kategoria/szafki-rtv": "cat.szafki-rtv",
  "/kategoria/komody": "cat.komody",
  "/kategoria/stoliki": "cat.stoliki",
  "/kategoria/materace": "cat.materace",
  "/kategoria/lozka": "cat.lozka",
  "/kategoria/meble-dzieciece": "cat.meble-dzieciece",
  "/kategoria/akcesoria-dla-zwierzat": "cat.akcesoria-dla-zwierzat",
  "/promocje": "nav.sale",
  "/meble-od-reki": "nav.ready",
  "/outlet": "nav.outlet",
  "/meble-do-7-dni": "nav.sevenDays",
  "/probki-tkanin": "nav.samples",
  "/linia/smart": "line.smart.title",
  "/linia/comfort": "line.comfort.title",
  "/linia/premium": "line.premium.title",
};

export function translateHrefLabel(
  locale: Locale,
  href: string,
  fallback?: string
): string {
  const key = NAV_BY_HREF[href];
  if (key) return translate(locale, key);
  return fallback ?? href;
}

export function isUnchangedNavLabel(href: string, label: string): boolean {
  const key = NAV_BY_HREF[href];
  if (!key) return false;
  return label.trim() === translate("pl", key).trim();
}
