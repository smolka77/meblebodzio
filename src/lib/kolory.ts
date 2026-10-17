import type { ProductColor } from "./typy";

export const defaultColors: ProductColor[] = [
  { id: "cream", name: "Kremowy", hex: "#F5F0EB" },
  { id: "sand", name: "Piaskowy", hex: "#D4C9B8" },
  { id: "taupe", name: "Taupe", hex: "#9A8B7A" },
  { id: "graphite", name: "Grafitowy", hex: "#4A4A48" },
];

export const accentColors: ProductColor[] = [
  { id: "cream", name: "Kremowy", hex: "#F5F0EB" },
  { id: "olive", name: "Oliwkowy", hex: "#6B705C" },
  { id: "terracotta", name: "Terakota", hex: "#C17B5C" },
  { id: "navy", name: "Granatowy", hex: "#2C3E50" },
];

export const NO_PRODUCT_COLOR_ID = "none";

export function getCartKey(
  productId: string,
  colorId: string,
  sizeId = "",
  optionsKey = ""
): string {
  const base = sizeId ? `${productId}:${colorId}:${sizeId}` : `${productId}:${colorId}`;
  return optionsKey ? `${base}#${optionsKey}` : base;
}

export function findColor(
  colors: ProductColor[] | undefined,
  colorId?: string
): ProductColor | undefined {
  const list = colors ?? [];
  if (!colorId || colorId === NO_PRODUCT_COLOR_ID) return undefined;
  return list.find((c) => c.id === colorId);
}
