import { createHash } from "crypto";
import type { Locale } from "@/lib/jezyk/locale";
import { readStore, writeStore } from "./baza";

const FILE = "listing-translations.json";
const TARGET: Record<Exclude<Locale, "pl">, string> = {
  en: "en",
  de: "de",
  uk: "uk",
};
const TARGET_LOCALES: Exclude<Locale, "pl">[] = ["en", "de", "uk"];
const FETCH_MS = 2500;
const FAIL_COOLDOWN_MS = 15 * 60 * 1000;

type Cache = Record<string, string>;

let memory: Cache | null = null;
let writeQueue: Promise<void> = Promise.resolve();
let persistTimer: ReturnType<typeof setTimeout> | null = null;
const filling = new Set<string>();
const recentFails = new Map<string, number>();

function cacheKey(locale: Locale, text: string): string {
  const hash = createHash("sha1").update(text).digest("hex").slice(0, 16);
  return `${locale}:${hash}`;
}

async function loadCache(): Promise<Cache> {
  if (memory) return memory;
  memory = await readStore<Cache>(FILE, {});
  return memory;
}

function persist(cache: Cache) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const snapshot = { ...cache };
    writeQueue = writeQueue
      .then(() => writeStore(FILE, snapshot))
      .catch(() => undefined);
  }, 400);
}

function skipTranslation(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length < 2) return true;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.startsWith("/") && !/\s/.test(trimmed)) return true;
  if (!/[a-ząćęłńóśźż]/i.test(trimmed)) return true;
  if (/^[\d\s.,×xX+\-/%°cmkgzłPLN]+$/i.test(trimmed)) return true;
  return false;
}

function isUsableTranslation(source: string, translated: string): boolean {
  const from = source.trim();
  const to = translated.trim();
  if (!to || to === from) return false;
  if (/<\s*html|we're sorry|mymemory warning|quota finished|used all available/i.test(to)) {
    return false;
  }
  return true;
}

function isCoolingDown(key: string): boolean {
  const until = recentFails.get(key);
  if (!until) return false;
  if (until > Date.now()) return true;
  recentFails.delete(key);
  return false;
}

async function fetchText(url: string, headers?: HeadersInit): Promise<Response> {
  return fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(FETCH_MS),
    headers,
  });
}

function parseGooglePayload(raw: string): string {
  if (raw.trimStart().startsWith("<")) return "";
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return "";
  }
  if (Array.isArray(json) && typeof json[0] === "string") {
    return json.filter((chunk): chunk is string => typeof chunk === "string").join("").trim();
  }
  if (!Array.isArray(json) || !Array.isArray(json[0])) return "";
  return json[0]
    .map((chunk) => (Array.isArray(chunk) && typeof chunk[0] === "string" ? chunk[0] : ""))
    .join("")
    .trim();
}

async function translateGoogle(
  text: string,
  locale: Exclude<Locale, "pl">,
  endpoint: "gtx" | "chrome"
): Promise<string> {
  const target = TARGET[locale];
  const url =
    endpoint === "chrome"
      ? `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=pl&tl=${target}&q=${encodeURIComponent(text)}`
      : `https://translate.googleapis.com/translate_a/single?client=gtx&sl=pl&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetchText(url, {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "application/json,text/plain,*/*",
  });
  if (!res.ok) return text;
  return parseGooglePayload(await res.text()) || text;
}

async function translateMyMemory(
  text: string,
  locale: Exclude<Locale, "pl">
): Promise<string> {
  const chunks =
    text.length <= 450
      ? [text]
      : text
          .split(/\n{2,}|(?<=[.!?])\s+/)
          .map((part) => part.trim())
          .filter(Boolean);
  const out: string[] = [];
  for (const chunk of chunks.length ? chunks : [text]) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk.slice(0, 450))}&langpair=pl|${TARGET[locale]}`;
    const res = await fetchText(url);
    if (!res.ok) return text;
    const json = (await res.json()) as {
      responseStatus?: number;
      responseData?: { translatedText?: string };
    };
    const translated = json.responseData?.translatedText?.trim();
    if (!translated || json.responseStatus !== 200) return text;
    out.push(translated);
  }
  return out.join(" ").trim() || text;
}

async function translateOnce(text: string, locale: Exclude<Locale, "pl">): Promise<string> {
  try {
    const memory = await translateMyMemory(text, locale);
    if (isUsableTranslation(text, memory)) return memory;
  } catch {
    /* fallback */
  }
  try {
    const chrome = await translateGoogle(text, locale, "chrome");
    if (isUsableTranslation(text, chrome)) return chrome;
  } catch {
    /* fallback */
  }
  try {
    const google = await translateGoogle(text, locale, "gtx");
    if (isUsableTranslation(text, google)) return google;
  } catch {
    /* keep original */
  }
  return text;
}

function scheduleFill(texts: string[], locale: Exclude<Locale, "pl">) {
  const todo = texts.filter((text) => {
    const key = cacheKey(locale, text);
    if (filling.has(key) || isCoolingDown(key)) return false;
    filling.add(key);
    return true;
  });
  if (todo.length === 0) return;

  void (async () => {
    try {
      const cache = await loadCache();
      const concurrency = 4;
      for (let i = 0; i < todo.length; i += concurrency) {
        const batch = todo.slice(i, i + concurrency);
        const results = await Promise.all(
          batch.map(async (text) => {
            try {
              return [text, await translateOnce(text, locale)] as const;
            } catch {
              return [text, text] as const;
            }
          })
        );
        let wrote = false;
        for (const [text, translated] of results) {
          const key = cacheKey(locale, text);
          if (isUsableTranslation(text, translated)) {
            cache[key] = translated;
            recentFails.delete(key);
            wrote = true;
          } else {
            recentFails.set(key, Date.now() + FAIL_COOLDOWN_MS);
          }
        }
        if (wrote) persist(cache);
      }
    } finally {
      for (const text of todo) filling.delete(cacheKey(locale, text));
    }
  })();
}

export function collectTranslatableStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (!skipTranslation(value)) out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectTranslatableStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value as Record<string, unknown>)) {
      collectTranslatableStrings(item, out);
    }
  }
  return out;
}

/** Dociąga EN/DE/UK w tle i zapisuje do data/store/listing-translations.json. */
export function prefetchListingTranslations(texts: string[]) {
  const unique = [...new Set(texts.filter((text) => !skipTranslation(text)))];
  if (unique.length === 0) return;
  for (const locale of TARGET_LOCALES) scheduleFill(unique, locale);
}

export function prefetchListingTranslationsFrom(value: unknown) {
  prefetchListingTranslations(collectTranslatableStrings(value));
}

export async function translateListingText(
  text: string,
  locale: Locale
): Promise<string> {
  if (locale === "pl" || skipTranslation(text)) return text;
  const cache = await loadCache();
  const key = cacheKey(locale, text);
  const cached = cache[key];
  if (cached && isUsableTranslation(text, cached)) return cached;
  scheduleFill([text], locale);
  return text;
}

export async function translateListingMany(
  texts: string[],
  locale: Locale
): Promise<Map<string, string>> {
  const unique = [...new Set(texts.filter(Boolean))];
  const out = new Map<string, string>();
  const pending: string[] = [];
  const cache = await loadCache();

  for (const text of unique) {
    if (locale === "pl" || skipTranslation(text)) {
      out.set(text, text);
      continue;
    }
    const key = cacheKey(locale, text);
    const cached = cache[key];
    if (cached && isUsableTranslation(text, cached)) out.set(text, cached);
    else {
      out.set(text, text);
      pending.push(text);
    }
  }

  if (locale !== "pl" && pending.length > 0) {
    scheduleFill(pending, locale);
  }

  return out;
}
