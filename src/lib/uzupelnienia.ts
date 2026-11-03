import type { Product } from "@/lib/typy";
import {
  COMPLEMENTARY_CATEGORIES,
  productRooms,
  productStyles,
} from "@/lib/stylePomieszczenia";

/**
 * Meble, które dobrze uzupełniają dany produkt: inne kategorie z tego samego pomieszczenia,
 * najlepiej w podobnym stylu. Po jednym z każdej kategorii, żeby zestaw był różnorodny.
 */
export function complementaryProducts(all: Product[], product: Product, limit = 4): Product[] {
  const wanted = COMPLEMENTARY_CATEGORIES[product.category] ?? [];
  if (wanted.length === 0) return [];
  const styles = new Set(productStyles(product));
  const rooms = new Set(productRooms(product));

  const scoreOf = (candidate: Product) => {
    const styleMatch = productStyles(candidate).filter((style) => styles.has(style)).length;
    const roomMatch = productRooms(candidate).some((room) => rooms.has(room)) ? 1 : 0;
    return styleMatch * 2 + roomMatch + (candidate.featured ? 0.5 : 0) + (candidate.rating ?? 0) / 10;
  };

  const picked: Product[] = [];
  for (const category of wanted) {
    const best = all
      .filter((candidate) => candidate.id !== product.id && !candidate.draft && candidate.category === category)
      .sort((a, b) => scoreOf(b) - scoreOf(a))[0];
    if (best) picked.push(best);
    if (picked.length >= limit) break;
  }
  return picked;
}
