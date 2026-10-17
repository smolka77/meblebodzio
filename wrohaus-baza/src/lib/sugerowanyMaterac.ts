import type { Product, ProductSize } from "@/lib/typy";
import { defaultSize, productSizes } from "@/lib/rozmiary";

export function isBedOffer(product: Pick<Product, "category">): boolean {
  return product.category === "lozka";
}

export function sanitizeSuggestedMattressId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const id = value.trim().slice(0, 64);
  return id || undefined;
}

function sizeFingerprint(label: string): string {
  return (label.replace(",", ".").match(/\d+(?:\.\d+)?/g) ?? []).join("x");
}

/** Rozmiar materaca zbliżony do wybranego rozmiaru łóżka (powierzchnia spania). */
export function matchingMattressSize(
  mattress: Pick<Product, "sizes">,
  bedSize?: ProductSize | null
): ProductSize | undefined {
  const sizes = productSizes(mattress);
  if (!sizes.length) return undefined;
  const key = bedSize?.label ? sizeFingerprint(bedSize.label) : "";
  if (key) {
    const match = sizes.find((size) => sizeFingerprint(size.label) === key);
    if (match) return match;
  }
  return defaultSize(mattress);
}

export function resolveSuggestedMattress(
  products: Product[],
  product: Pick<Product, "category" | "suggestedMattressId">
): Product | undefined {
  if (!isBedOffer(product)) return undefined;
  const id = sanitizeSuggestedMattressId(product.suggestedMattressId);
  if (!id) return undefined;
  return products.find((item) => item.id === id && item.category === "materace");
}
