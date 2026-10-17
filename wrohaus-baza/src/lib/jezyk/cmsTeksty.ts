import type { Locale } from "@/lib/jezyk/locale";
import { translateListingMany } from "@/lib/serwer/tlumaczenia";

export function mappedText(source: string, map: Map<string, string>): string {
  if (!source) return source;
  return map.get(source) ?? source;
}

/** Słownik, gdy CMS nadal ma domyślny polski tekst; inaczej tłumaczenie z panelu. */
export function cmsOrDictionary(
  cms: string,
  defaultPl: string,
  dictionary: string,
  map: Map<string, string>
): string {
  if (!cms.trim()) return cms;
  if (cms.trim() === defaultPl.trim()) return dictionary;
  return mappedText(cms, map);
}

export function collectIfChanged(
  bucket: string[],
  cms: string,
  defaultPl: string
) {
  if (cms.trim() && cms.trim() !== defaultPl.trim()) bucket.push(cms);
}

export async function translateCmsTexts(
  texts: string[],
  locale: Locale
): Promise<Map<string, string>> {
  if (locale === "pl") return new Map();
  return translateListingMany(texts, locale);
}
