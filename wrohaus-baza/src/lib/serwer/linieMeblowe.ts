import { revalidatePath } from "next/cache";
import type { FurnitureLine, Product } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { wyczyscMeta } from "@/lib/seoPola";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";
import { slugify } from "@/lib/slug";

const FILE = "furniture-lines.json";
const PRODUCTS_FILE = "products.json";
const NAME_MAX = 80;
const DESC_MAX = 500;
const MAX_PRODUCTS = 400;
export const SORELA_LINE_ID = "sorela";
export const SORELA_HERO = "/linie/sorela.jpg";

const STORAGE_CATEGORIES = new Set([
  "szafy",
  "szafki",
  "szafki-rtv",
  "komody",
  "stoliki",
]);

function revalidateLines(slug?: string) {
  revalidatePath("/linie");
  revalidatePath("/linie/[slug]", "page");
  revalidatePath("/admin/linie");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/linie/${slug}`);
}

function uniqueSlug(base: string, lines: FurnitureLine[], exceptId?: string): string {
  const root = slugify(base) || "linia";
  let slug = root;
  let n = 2;
  while (lines.some((item) => item.slug === slug && item.id !== exceptId)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}

function cleanImage(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, 500);
  if (!trimmed) return undefined;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://")
  ) {
    return trimmed;
  }
  return undefined;
}

function matchesSorelaHint(product: Product): boolean {
  const hay = `${product.name} ${product.slug} ${product.kind ?? ""} ${product.manufacturer ?? ""}`.toLowerCase();
  if (hay.includes("sorela") || hay.includes("sorel")) return true;
  if (STORAGE_CATEGORIES.has(product.category) && /\bline\b/.test(hay)) return true;
  return false;
}

async function readLinesRaw(): Promise<FurnitureLine[]> {
  const lines = await readStore<FurnitureLine[]>(FILE, []);
  return Array.isArray(lines) ? lines : [];
}

async function readProductsRaw(): Promise<Product[]> {
  const products = await readStore<Product[]>(PRODUCTS_FILE, []);
  return Array.isArray(products) ? products : [];
}

async function syncProductLineMembership(lineId: string, productIds: string[]) {
  const products = await readProductsRaw();
  const wanted = new Set(productIds);
  let changed = false;
  const next = products.map((product) => {
    const belongs = wanted.has(product.id);
    if (belongs) {
      if (product.furnitureLineId === lineId) return product;
      changed = true;
      return { ...product, furnitureLineId: lineId };
    }
    if (product.furnitureLineId !== lineId) return product;
    changed = true;
    const { furnitureLineId: _removed, ...rest } = product;
    return rest as Product;
  });
  if (changed) await writeStore(PRODUCTS_FILE, next);
}

function knownLiveIds(products: Product[]): Set<string> {
  return new Set(products.filter((product) => !product.draft).map((product) => product.id));
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

export async function ensureFurnitureLinesSeeded() {
  let lines = await readLinesRaw();
  let sorela = lines.find((item) => item.id === SORELA_LINE_ID || item.slug === "sorela");
  if (!sorela) {
    sorela = {
      id: SORELA_LINE_ID,
      slug: "sorela",
      name: "Sorela",
      description:
        "Kolekcja Sorela — zaokrąglone korpusy, spokojne fronty i kuliste nóżki.",
      image: SORELA_HERO,
      createdAt: new Date().toISOString(),
    };
    lines = [sorela, ...lines];
    await writeStore(FILE, lines);
  } else if (!sorela.image) {
    sorela = { ...sorela, image: SORELA_HERO };
    lines = lines.map((item) => (item.id === sorela!.id ? sorela! : item));
    await writeStore(FILE, lines);
  }

  const products = await readProductsRaw();
  const lineId = sorela.id;
  let changed = false;
  const next = products.map((product) => {
    if (product.furnitureLineId || !matchesSorelaHint(product)) return product;
    changed = true;
    return { ...product, furnitureLineId: lineId };
  });
  if (changed) await writeStore(PRODUCTS_FILE, next);
}

export async function getFurnitureLines(): Promise<FurnitureLine[]> {
  await ensureFurnitureLinesSeeded();
  const lines = await readLinesRaw();
  return lines.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getFurnitureLineById(
  id: string
): Promise<FurnitureLine | undefined> {
  const lines = await getFurnitureLines();
  return lines.find((item) => item.id === id);
}

export async function getFurnitureLineBySlug(
  slug: string
): Promise<FurnitureLine | undefined> {
  const lines = await getFurnitureLines();
  return lines.find((item) => item.slug === slug);
}

export function productsInFurnitureLine(
  products: Product[],
  lineId: string
): Product[] {
  return products.filter((product) => product.furnitureLineId === lineId);
}

export type FurnitureLineInput = {
  name: string;
  description?: string;
  image?: string | null;
  productIds?: string[];
  slug?: string;
};

export async function createFurnitureLine(
  data: FurnitureLineInput
): Promise<FurnitureLine | null> {
  const name = wyczyscMeta(data.name, NAME_MAX);
  if (!name) return null;
  const description = wyczyscMeta(data.description, DESC_MAX);
  const image = cleanImage(data.image);
  const lines = await getFurnitureLines();
  const products = await readProductsRaw();
  const id = crypto.randomUUID();
  const line: FurnitureLine = {
    id,
    slug: uniqueSlug(data.slug?.trim() || name, lines),
    name,
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    createdAt: new Date().toISOString(),
  };
  await writeStore(FILE, [...lines, line]);
  await syncProductLineMembership(
    id,
    sanitizeProductIds(data.productIds, knownLiveIds(products))
  );
  revalidateLines(line.slug);
  prefetchListingTranslationsFrom(line);
  return line;
}

export async function updateFurnitureLine(
  id: string,
  data: Partial<FurnitureLineInput>
): Promise<FurnitureLine | null> {
  const lines = await getFurnitureLines();
  const index = lines.findIndex((item) => item.id === id);
  if (index === -1) return null;
  const current = lines[index];
  const name =
    data.name !== undefined ? wyczyscMeta(data.name, NAME_MAX) : current.name;
  if (!name) return null;
  const description =
    data.description !== undefined
      ? wyczyscMeta(data.description, DESC_MAX)
      : current.description;

  const updated: FurnitureLine = {
    ...current,
    name,
    slug:
      data.slug !== undefined || data.name !== undefined
        ? uniqueSlug(data.slug?.trim() || name, lines, id)
        : current.slug,
  };

  if (description) updated.description = description;
  else delete updated.description;

  if (data.image !== undefined) {
    const image = cleanImage(data.image);
    if (image) updated.image = image;
    else delete updated.image;
  }

  lines[index] = updated;
  await writeStore(FILE, lines);

  if (data.productIds !== undefined) {
    const products = await readProductsRaw();
    await syncProductLineMembership(
      id,
      sanitizeProductIds(data.productIds, knownLiveIds(products))
    );
  }

  revalidateLines(updated.slug);
  if (current.slug !== updated.slug) revalidateLines(current.slug);
  prefetchListingTranslationsFrom(updated);
  return updated;
}

export async function deleteFurnitureLine(id: string): Promise<boolean> {
  const lines = await getFurnitureLines();
  const current = lines.find((item) => item.id === id);
  if (!current) return false;
  await syncProductLineMembership(id, []);
  await writeStore(
    FILE,
    lines.filter((item) => item.id !== id)
  );
  revalidateLines(current.slug);
  return true;
}
