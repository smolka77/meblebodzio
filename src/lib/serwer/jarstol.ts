import {
  JARSTOL_FEED_URL,
  jarstolPackageToDraft,
  jarstolProductKey,
  parseJarstolXml,
  stockFields,
  type JarstolPackage,
} from "@/lib/jarstol";
import type { Product } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import {
  assembleStoredProduct,
  loadProductCatalog,
  saveProductCatalog,
} from "./produkty";

const STATE_FILE = "jarstol-sync.json";
const STALE_MS = 12 * 60 * 60 * 1000;

export type JarstolSyncResult = {
  fetched: number;
  created: number;
  updated: number;
  skipped: number;
  at: string;
  error?: string;
};

type JarstolState = {
  lastSyncAt?: string;
  lastResult?: JarstolSyncResult;
  skipKeys: string[];
};

let syncLock: Promise<JarstolSyncResult> | null = null;

async function loadState(): Promise<JarstolState> {
  const stored = await readStore<JarstolState>(STATE_FILE, { skipKeys: [] });
  return {
    skipKeys: Array.isArray(stored.skipKeys) ? stored.skipKeys : [],
    lastSyncAt: stored.lastSyncAt,
    lastResult: stored.lastResult,
  };
}

async function saveState(state: JarstolState): Promise<void> {
  await writeStore(STATE_FILE, state);
}

export async function getJarstolSyncStatus(): Promise<{
  lastSyncAt?: string;
  lastResult?: JarstolSyncResult;
  stale: boolean;
}> {
  const state = await loadState();
  const last = state.lastSyncAt ? new Date(state.lastSyncAt).getTime() : 0;
  return {
    lastSyncAt: state.lastSyncAt,
    lastResult: state.lastResult,
    stale: !last || Date.now() - last > STALE_MS,
  };
}

export async function rememberDeletedJarstolKeys(products: Product[]): Promise<void> {
  const keys = products
    .map((product) => jarstolProductKey(product))
    .filter((key): key is string => Boolean(key));
  if (keys.length === 0) return;
  const state = await loadState();
  const skip = new Set(state.skipKeys);
  for (const key of keys) skip.add(key);
  await saveState({ ...state, skipKeys: [...skip] });
}

async function fetchFeed(): Promise<string> {
  const response = await fetch(JARSTOL_FEED_URL, {
    headers: { Accept: "application/xml,text/xml,*/*", "User-Agent": "Wrohaus/1.0" },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Jarstol XML ${response.status}`);
  }
  return response.text();
}

function matchProduct(products: Product[], item: JarstolPackage): Product | undefined {
  const byId = products.find((product) => product.id === `jarstol-${item.key}`);
  if (byId) return byId;
  if (item.ean) {
    return products.find((product) => {
      const code = product.details?.productCode?.replace(/\D/g, "");
      return code === item.ean || jarstolProductKey(product) === item.ean;
    });
  }
  return products.find((product) => jarstolProductKey(product) === item.key);
}

function applyStock(product: Product, item: JarstolPackage): Product {
  const stock = stockFields(item.stock);
  const next: Product = { ...product, inStock: stock.inStock };
  if (stock.readyToShip) {
    next.readyToShip = true;
    next.stockQty = stock.stockQty;
  } else {
    delete next.readyToShip;
    delete next.stockQty;
  }
  return next;
}

function refreshDraft(existing: Product, draft: Product): Product {
  return assembleStoredProduct({
    ...existing,
    ...draft,
    id: existing.id,
    slug: existing.slug,
    draft: true,
    reviews: existing.reviews,
    line: existing.line,
    furnitureLineId: existing.furnitureLineId,
  });
}

export async function syncJarstolCatalog(options?: {
  ifStale?: boolean;
}): Promise<JarstolSyncResult & { skippedBecauseFresh?: boolean }> {
  if (syncLock) return syncLock;
  const run = (async () => {
    const state = await loadState();
    if (options?.ifStale) {
      const last = state.lastSyncAt ? new Date(state.lastSyncAt).getTime() : 0;
      if (last && Date.now() - last <= STALE_MS && state.lastResult) {
        return { ...state.lastResult, skippedBecauseFresh: true };
      }
    }

    const result: JarstolSyncResult = {
      fetched: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      at: new Date().toISOString(),
    };

    try {
      const xml = await fetchFeed();
      if (!/<Systems[\s>]/i.test(xml) && !/<Package>/i.test(xml)) {
        throw new Error("Nieprawidłowy plik XML Jarstol");
      }
      const packages = parseJarstolXml(xml);
      result.fetched = packages.length;
      const skip = new Set(state.skipKeys);
      const catalog = await loadProductCatalog();
      const usedSlugs = new Set(catalog.map((product) => product.slug));
      const next = [...catalog];

      for (const item of packages) {
        if (skip.has(item.key) || (item.ean && skip.has(item.ean))) {
          result.skipped += 1;
          continue;
        }
        const existing = matchProduct(next, item);
        if (!existing) {
          const draft = assembleStoredProduct(jarstolPackageToDraft(item, usedSlugs));
          next.push(draft);
          result.created += 1;
          continue;
        }
        if (existing.draft && existing.supplier === "jarstol") {
          const refreshed = refreshDraft(
            existing,
            jarstolPackageToDraft(item, new Set(usedSlugs))
          );
          const index = next.findIndex((product) => product.id === existing.id);
          next[index] = { ...refreshed, slug: existing.slug, id: existing.id };
          result.updated += 1;
          continue;
        }
        const index = next.findIndex((product) => product.id === existing.id);
        next[index] = applyStock(existing, item);
        result.updated += 1;
      }

      if (result.created > 0 || result.updated > 0) {
        await saveProductCatalog(next);
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : "Nie udało się pobrać katalogu Jarstol.";
    }

    if (result.error) {
      await saveState({ ...state, lastResult: result });
    } else {
      await saveState({
        ...state,
        lastSyncAt: result.at,
        lastResult: result,
      });
    }
    return result;
  })();

  syncLock = run.finally(() => {
    syncLock = null;
  }) as Promise<JarstolSyncResult>;
  return syncLock;
}
