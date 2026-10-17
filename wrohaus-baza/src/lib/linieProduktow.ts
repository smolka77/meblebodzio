import type { ProductLine } from "./typy";

export const productLines: ProductLine[] = ["smart", "comfort", "premium"];

export const lineLabels: Record<ProductLine, string> = {
  smart: "Smart",
  comfort: "Comfort",
  premium: "Premium",
};

/** Domyślna linia przy braku ustawienia — wg ceny katalogowej. */
export function inferProductLine(price: number): ProductLine {
  if (price >= 6000) return "premium";
  if (price >= 3000) return "comfort";
  return "smart";
}

export function resolveProductLine(product: {
  line?: ProductLine;
  price: number;
}): ProductLine {
  return product.line ?? inferProductLine(product.price);
}

export function isProductLine(value: string): value is ProductLine {
  return productLines.includes(value as ProductLine);
}

export const productLineNav = productLines.map((line) => ({
  label: lineLabels[line],
  href: `/linia/${line}`,
}));

export const lineAccentClass: Record<ProductLine, string> = {
  smart: "text-line-smart",
  comfort: "text-line-comfort",
  premium: "text-line-premium",
};

export const lineTextClass: Record<ProductLine, string> = {
  smart: "text-line-smart hover:text-line-smart/80",
  comfort: "text-line-comfort hover:text-line-comfort/80",
  premium: "text-line-premium hover:text-line-premium/80",
};

export const lineImages: Record<ProductLine, string> = {
  smart: "/linie/smart.jpg",
  comfort: "/linie/comfort.jpg",
  premium: "/linie/premium.jpg",
};

export const lineFrameClass: Record<ProductLine, string> = {
  smart: "ring-line-smart/55",
  comfort: "ring-line-comfort/50",
  premium: "ring-line-premium/60",
};

export const lineBarClass: Record<ProductLine, string> = {
  smart: "bg-line-smart",
  comfort: "bg-line-comfort",
  premium: "bg-line-premium",
};

export function lineFromHref(href: string): ProductLine | null {
  const path = href.split("?")[0];
  if (path === "/linia/smart") return "smart";
  if (path === "/linia/comfort") return "comfort";
  if (path === "/linia/premium") return "premium";
  return null;
}

export function lineFromCollectionCard(card: {
  label?: string;
  href?: string;
}): ProductLine | null {
  const fromHref = lineFromHref(card.href ?? "");
  if (fromHref) return fromHref;
  const label = (card.label ?? "").trim().toLowerCase();
  if (label === "smart") return "smart";
  if (label === "comfort") return "comfort";
  if (label === "premium") return "premium";
  return null;
}
