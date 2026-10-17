import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { categoryIntros, categoryLabels, isBuiltinProductCategory, productCategories } from "@/lib/dane";
import { extraListingIds } from "@/lib/listingi";
import { isCategoryNavGroupId } from "@/lib/nawigacjaSklepu";
import { CATEGORY_DESC_MAX, wyczyscMeta } from "@/lib/seoPola";
import { slugify } from "@/lib/slug";
import type { CategoryNavGroupId, CustomShopCategory, ProductCategory } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { getProducts } from "./produkty";
import { getSettings } from "./ustawienia";
import { normalizeVisibleProductCategories } from "@/lib/widocznoscKategorii";

const FILE = "custom-categories.json";
const MAX_CUSTOM = 60;
const NAME_MAX = 80;

const RESERVED = new Set<string>([
  ...productCategories,
  ...extraListingIds,
  "admin",
  "api",
  "blog",
  "kategoria",
  "konto",
  "koszyk",
  "linia",
  "linie",
  "produkt",
  "produkty",
  "promocje",
  "kontakt",
  "login",
]);

function newId(): string {
  return `cat-${randomBytes(6).toString("hex")}`;
}

function sanitizeName(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
}

function uniqueSlug(base: string, used: Set<string>): string {
  const root = slugify(base, 48) || "kategoria";
  if (!used.has(root) && !RESERVED.has(root)) return root;
  for (let n = 2; n < 80; n += 1) {
    const candidate = `${root}-${n}`.slice(0, 56);
    if (!used.has(candidate) && !RESERVED.has(candidate)) return candidate;
  }
  return `${root}-${randomBytes(3).toString("hex")}`;
}

function sanitizeRow(
  row: Partial<CustomShopCategory>,
  usedSlugs: Set<string>,
  fallbackId?: string
): CustomShopCategory | null {
  const name = sanitizeName(row.name);
  if (!name) return null;
  const parentGroup = isCategoryNavGroupId(String(row.parentGroup ?? ""))
    ? (row.parentGroup as CategoryNavGroupId)
    : null;
  if (!parentGroup) return null;
  const id =
    typeof row.id === "string" && row.id.trim()
      ? row.id.trim().slice(0, 40)
      : fallbackId || newId();
  const requested =
    typeof row.slug === "string" && row.slug.trim()
      ? slugify(row.slug, 48)
      : slugify(name, 48);
  const slug = uniqueSlug(requested || name, usedSlugs);
  usedSlugs.add(slug);
  const description = wyczyscMeta(row.description, CATEGORY_DESC_MAX) ?? "";
  return {
    id,
    slug,
    name,
    description,
    parentGroup,
    visible: row.visible !== false,
  };
}

export async function getCustomCategories(): Promise<CustomShopCategory[]> {
  const stored = await readStore<CustomShopCategory[]>(FILE, []);
  if (!Array.isArray(stored)) return [];
  const used = new Set<string>();
  const next: CustomShopCategory[] = [];
  for (const row of stored.slice(0, MAX_CUSTOM)) {
    const item = sanitizeRow(row, used, row?.id);
    if (item) next.push(item);
  }
  return next;
}

async function saveCustomCategories(
  rows: CustomShopCategory[]
): Promise<CustomShopCategory[]> {
  await writeStore(FILE, rows);
  revalidatePath("/", "layout");
  revalidatePath("/kategoria/[category]", "page");
  revalidatePath("/sitemap.xml");
  return rows;
}

export async function createCustomCategory(input: {
  name: string;
  description?: string;
  parentGroup: string;
}): Promise<CustomShopCategory> {
  const current = await getCustomCategories();
  if (current.length >= MAX_CUSTOM) {
    throw new Error("Za dużo podkategorii.");
  }
  const used = new Set(current.map((row) => row.slug));
  const created = sanitizeRow(
    {
      name: input.name,
      description: input.description,
      parentGroup: input.parentGroup as CategoryNavGroupId,
      visible: true,
    },
    used
  );
  if (!created) throw new Error("Podaj nazwę i wybierz grupę w menu.");
  current.push(created);
  await saveCustomCategories(current);
  return created;
}

export async function updateCustomCategory(
  id: string,
  patch: Partial<Pick<CustomShopCategory, "name" | "description" | "parentGroup" | "visible" | "slug">>
): Promise<CustomShopCategory | null> {
  const current = await getCustomCategories();
  const index = current.findIndex((row) => row.id === id);
  if (index < 0) return null;
  const used = new Set(
    current.filter((row) => row.id !== id).map((row) => row.slug)
  );
  const merged = sanitizeRow({ ...current[index], ...patch, id }, used, id);
  if (!merged) throw new Error("Niepoprawne dane podkategorii.");
  current[index] = merged;
  await saveCustomCategories(current);
  return merged;
}

export async function deleteCustomCategory(id: string): Promise<boolean> {
  const current = await getCustomCategories();
  const existing = current.find((row) => row.id === id);
  if (!existing) return false;
  const products = await getProducts();
  if (products.some((product) => product.category === existing.slug)) {
    throw new Error("Najpierw przenieś produkty z tej kategorii.");
  }
  await saveCustomCategories(current.filter((row) => row.id !== id));
  return true;
}

export async function isCategorySlugPublic(slug: string): Promise<boolean> {
  const settings = await getSettings();
  const visible = normalizeVisibleProductCategories(
    settings.visibleProductCategories
  );
  if (productCategories.includes(slug as ProductCategory)) {
    return visible.includes(slug as ProductCategory);
  }
  const custom = await getCustomCategories();
  return custom.some((row) => row.slug === slug && row.visible);
}

export async function getCategoryPageModel(slug: string): Promise<{
  slug: string;
  name: string;
  description: string;
  builtin: boolean;
} | null> {
  if (!(await isCategorySlugPublic(slug))) return null;
  const custom = (await getCustomCategories()).find((row) => row.slug === slug);
  if (custom) {
    return {
      slug,
      name: custom.name,
      description:
        custom.description.trim() ||
        `${custom.name} z oferty Wrohaus — polska produkcja.`,
      builtin: false,
    };
  }
  if (!productCategories.includes(slug as ProductCategory)) return null;
  const cat = slug as ProductCategory;
  const settings = await getSettings();
  return {
    slug,
    name: categoryLabels[cat],
    description:
      settings.categoryDescriptions?.[cat]?.trim() || categoryIntros[cat],
    builtin: true,
  };
}

export function customCategoryLabels(
  rows: CustomShopCategory[]
): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.slug, row.name]));
}

export async function getCategoryDisplayName(slug: string): Promise<string> {
  const custom = (await getCustomCategories()).find((row) => row.slug === slug);
  if (custom) return custom.name;
  if (isBuiltinProductCategory(slug)) return categoryLabels[slug];
  return slug;
}
