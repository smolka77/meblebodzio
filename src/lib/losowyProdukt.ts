import type { Product, ProductCategory } from "./typy";

export function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export function productsInCategory(products: Product[], category?: ProductCategory) {
  return products.filter(
    (p) => p.inStock && (category == null || p.category === category)
  );
}

export function pickRandomProduct(
  products: Product[],
  category?: ProductCategory
): Product | undefined {
  return pickRandom(productsInCategory(products, category));
}

export function pickRandomProducts(
  products: Product[],
  count: number,
  category?: ProductCategory
): Product[] {
  const pool = productsInCategory(products, category);
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export function pickRelatedProducts(
  products: Product[],
  excludeSlug: string,
  count = 4,
  category?: ProductCategory
): Product[] {
  const others = products.filter((p) => p.inStock && p.slug !== excludeSlug);
  const sameCategory = pickRandomProducts(others, count, category);
  if (sameCategory.length >= count) return sameCategory;

  const taken = new Set(sameCategory.map((p) => p.id));
  const fill = pickRandomProducts(
    others.filter((p) => !taken.has(p.id)),
    count - sameCategory.length
  );
  return [...sameCategory, ...fill];
}
