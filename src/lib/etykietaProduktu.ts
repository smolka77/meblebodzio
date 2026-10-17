/** Ukrywa kind, gdy nazwa już go zawiera — np. „Narożnik Porto L-kształtny” + kind „Porto”. */
export function productKindLabel(name: string, kind?: string): string | undefined {
  const label = kind?.trim();
  if (!label) return undefined;
  const n = name.trim().toLowerCase();
  const k = label.toLowerCase();
  if (!n || n.includes(k)) return undefined;
  const nameWords = new Set(n.split(/\s+/));
  if (k.split(/\s+/).every((word) => nameWords.has(word))) return undefined;
  return label;
}

function extraNameHint(product: {
  name: string;
  colors?: { name?: string }[];
  kind?: string;
}): string | undefined {
  const base = collapseRepeatedProductName(product.name).toLowerCase();
  const color = product.colors?.[0]?.name?.trim();
  if (color && !base.includes(color.toLowerCase())) return color;
  const kind = product.kind?.trim();
  if (kind && !base.includes(kind.toLowerCase())) return kind;
  return undefined;
}

/** Dwa ogłoszenia z tą samą nazwą — dopisz kolor / rodzaj, żeby karty się różniły. */
export function disambiguateProductNames<T extends { id: string; name: string; colors?: { name?: string }[]; kind?: string }>(
  products: T[]
): T[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    const key = collapseRepeatedProductName(product.name).toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return products.map((product) => {
    const key = collapseRepeatedProductName(product.name).toLowerCase();
    if ((counts.get(key) ?? 0) < 2) return product;
    const extra = extraNameHint(product);
    if (!extra) return product;
    const base = collapseRepeatedProductName(product.name);
    return { ...product, name: `${base} — ${extra}` };
  });
}

/** „Narożnik Porto L-kształtny Porto” → „Narożnik Porto L-kształtny”. */
export function collapseRepeatedProductName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length < 3) return name.trim();
  const last = words[words.length - 1];
  const earlier = words.slice(0, -1);
  if (earlier.some((word) => word.toLowerCase() === last.toLowerCase())) {
    return earlier.join(" ");
  }
  return name.trim();
}
