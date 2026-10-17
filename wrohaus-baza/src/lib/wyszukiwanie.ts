import { labelForCategory } from "./dane";
import type { Product } from "./typy";

export function searchProducts(
  query: string,
  products: Product[],
  extraLabels?: Record<string, string>
): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return products.filter((product) => {
    const category = labelForCategory(product.category, extraLabels).toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.category.toLowerCase().includes(q) ||
      category.includes(q)
    );
  });
}
