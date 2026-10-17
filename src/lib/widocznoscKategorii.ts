import { productCategories, visibleProductCategories } from "./dane";
import {
  shopNavTree,
  withCustomCategoryNav,
  type ShopNavItem,
} from "./nawigacjaSklepu";
import type { CustomShopCategory, ProductCategory } from "./typy";

export const DEFAULT_VISIBLE_PRODUCT_CATEGORIES: ProductCategory[] = [
  ...visibleProductCategories,
];

const CATEGORY_PATH = /^\/kategoria\/([^/?#]+)/;

export function parseCategoryFromHref(href: string): ProductCategory | null {
  const path = href.split("?")[0] ?? href;
  const match = CATEGORY_PATH.exec(path);
  const slug = match?.[1];
  if (!slug) return null;
  return productCategories.includes(slug as ProductCategory)
    ? (slug as ProductCategory)
    : null;
}

export function normalizeVisibleProductCategories(
  value: unknown
): ProductCategory[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_VISIBLE_PRODUCT_CATEGORIES];
  }
  const allowed = new Set<string>(productCategories);
  const seen = new Set<ProductCategory>();
  const next: ProductCategory[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !allowed.has(item)) continue;
    const slug = item as ProductCategory;
    if (seen.has(slug)) continue;
    seen.add(slug);
    next.push(slug);
  }
  return next;
}

export function isProductCategoryVisible(
  category: ProductCategory,
  visible: readonly ProductCategory[]
): boolean {
  return visible.includes(category);
}

export function isStorefrontHrefVisible(
  href: string,
  visible: readonly ProductCategory[]
): boolean {
  const category = parseCategoryFromHref(href);
  if (!category) return true;
  return visible.includes(category);
}

export function filterShopNav(
  items: ShopNavItem[] = shopNavTree,
  visible: readonly ProductCategory[] = DEFAULT_VISIBLE_PRODUCT_CATEGORIES
): ShopNavItem[] {
  const result: ShopNavItem[] = [];
  for (const item of items) {
    if (item.type === "link") {
      if (isStorefrontHrefVisible(item.href, visible)) result.push(item);
      continue;
    }
    const children = item.children.filter((child) =>
      isStorefrontHrefVisible(child.href, visible)
    );
    if (children.length === 0) continue;
    result.push({ ...item, children });
  }
  return result;
}

export function storefrontShopNav(
  custom: CustomShopCategory[] = [],
  visible: readonly ProductCategory[] = DEFAULT_VISIBLE_PRODUCT_CATEGORIES
): ShopNavItem[] {
  return filterShopNav(withCustomCategoryNav(shopNavTree, custom), visible);
}
