export const SEO_TITLE_HINT = 60;
export const SEO_TITLE_MAX = 80;
export const SEO_DESC_HINT = 160;
export const SEO_DESC_MAX = 320;
export const SEO_KEYWORDS_MAX = 240;
export const CATEGORY_DESC_MAX = 500;

export const SEO_DEFAULT_TITLE = "Meble i wyposażenie domu | Wrohaus";
export const SEO_HOME_H1 = SEO_DEFAULT_TITLE;
export const SEO_DEFAULT_DESCRIPTION =
  "Cały dom w jednym miejscu — sofy, szafy, łóżka, materace i więcej z polskiej manufaktury. 14 dni na zwrot, 2 lata gwarancji. Zamów online.";
export const SEO_DEFAULT_KEYWORDS = [
  "meble",
  "wyposażenie domu",
  "sofy",
  "narożniki",
  "szafy",
  "łóżka",
  "materace",
  "fotele",
  "meble do salonu",
  "meble do sypialni",
  "meble polskiej produkcji",
  "Wrohaus",
] as const;

/** Czysty tekst do meta — bez HTML i sterujących. Pusty = brak. */
export function wyczyscMeta(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return clean || undefined;
}

export function slowaKluczoweMeta(value: unknown): string[] | undefined {
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string").join(", ")
        : "";
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const word = wyczyscMeta(part, 40);
    if (!word) continue;
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(word);
    if (unique.length >= 20) break;
  }
  return unique.length ? unique : undefined;
}
