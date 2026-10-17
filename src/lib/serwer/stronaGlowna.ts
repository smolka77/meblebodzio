import { revalidatePath } from "next/cache";
import { readStore, writeStore, fileExists } from "./baza";
import {
  DEFAULT_HOMEPAGE,
  mergeHomepage,
  type HomepageContent,
} from "@/lib/stronaGlowna";
import { isStorefrontHrefVisible } from "@/lib/widocznoscKategorii";
import type { ProductCategory } from "@/lib/typy";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";

const FILE = "homepage.json";

export function filterHomepageForStorefront(
  content: HomepageContent,
  visible: readonly ProductCategory[]
): HomepageContent {
  return {
    ...content,
    hero: isStorefrontHrefVisible(content.hero.buttonHref, visible)
      ? content.hero
      : { ...content.hero, buttonHref: "/produkty" },
    heroSlides: content.heroSlides.map((slide) =>
      isStorefrontHrefVisible(slide.buttonHref, visible)
        ? slide
        : { ...slide, buttonHref: "/produkty" }
    ),
    categories: {
      ...content.categories,
      cards: content.categories.cards.filter((card) =>
        isStorefrontHrefVisible(card.href, visible)
      ),
    },
  };
}

export async function getHomepage(): Promise<HomepageContent> {
  if (!(await fileExists(FILE))) {
    await writeStore(FILE, DEFAULT_HOMEPAGE);
  }
  const stored = await readStore<Partial<HomepageContent>>(FILE, DEFAULT_HOMEPAGE);
  return mergeHomepage(stored);
}

export async function updateHomepage(
  data: Partial<HomepageContent>
): Promise<HomepageContent> {
  const updated = mergeHomepage(data);
  await writeStore(FILE, updated);
  revalidatePath("/");
  revalidatePath("/admin/strona-glowna");
  prefetchListingTranslationsFrom(updated);
  return updated;
}
