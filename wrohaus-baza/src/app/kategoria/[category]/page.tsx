import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { productCategories } from "@/lib/dane";
import { jsonLdLista, jsonLdOkuszki, metaKategorii, stronaMeta } from "@/lib/seo";
import type { ProductCategory } from "@/lib/typy";
import { getI18n } from "@/lib/jezyk/serwer";
import { translateCategory } from "@/lib/jezyk";
import { localizeCategoryIntro } from "@/lib/jezyk/trescCms";
import {
  parseCornerShape,
  productMatchesCornerShape,
} from "@/lib/nawigacjaSklepu";
import { getSettings } from "@/lib/serwer/ustawienia";
import {
  getCategoryPageModel,
  getCustomCategories,
} from "@/lib/serwer/kategorieWlasne";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const custom = await getCustomCategories();
  return [
    ...productCategories.map((category) => ({ category })),
    ...custom.map((row) => ({ category: row.slug })),
  ];
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/kategoria/[category]">): Promise<Metadata> {
  const { category } = await params;
  const model = await getCategoryPageModel(category);
  if (!model) {
    return { title: "Kategoria", robots: { index: false, follow: false } };
  }
  const query = await searchParams;
  const ksztalt =
    model.builtin && model.slug === "narozniki"
      ? parseCornerShape(query.ksztalt)
      : null;
  const { locale, t } = await getI18n();
  if (!ksztalt) {
    if (!model.builtin) {
      return stronaMeta({
        title: model.name,
        description: model.description,
        path: `/kategoria/${model.slug}`,
      });
    }
    const settings = await getSettings();
    const cat = model.slug as ProductCategory;
    const intro = await localizeCategoryIntro(
      cat,
      settings.categoryDescriptions?.[cat],
      locale
    );
    return metaKategorii(cat, intro);
  }
  const title = ksztalt === "l" ? t("nav.cornerL") : t("nav.cornerU");
  const description =
    ksztalt === "l" ? t("listing.cornerLDesc") : t("listing.cornerUDesc");
  return stronaMeta({
    title,
    description,
    path: `/kategoria/${model.slug}?ksztalt=${ksztalt}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/kategoria/[category]">) {
  const { category } = await params;
  const model = await getCategoryPageModel(category);
  if (!model) notFound();

  const query = await searchParams;
  const ksztalt =
    model.builtin && model.slug === "narozniki"
      ? parseCornerShape(query.ksztalt)
      : null;
  const [{ locale, t }, products, settings] = await Promise.all([
    getI18n(),
    getPublicProducts(),
    getSettings(),
  ]);
  let filtered = products.filter((p) => p.category === model.slug);
  if (ksztalt) {
    filtered = filtered.filter((p) => productMatchesCornerShape(p, ksztalt));
  }
  const label = ksztalt
    ? ksztalt === "l"
      ? t("nav.cornerL")
      : t("nav.cornerU")
    : model.builtin
      ? translateCategory(locale, model.slug)
      : model.name;
  const description = ksztalt
    ? ksztalt === "l"
      ? t("listing.cornerLDesc")
      : t("listing.cornerUDesc")
    : model.builtin
      ? await localizeCategoryIntro(
          model.slug as ProductCategory,
          settings.categoryDescriptions?.[model.slug as ProductCategory],
          locale
        )
      : model.description;
  const path = ksztalt
    ? `/kategoria/${model.slug}?ksztalt=${ksztalt}`
    : `/kategoria/${model.slug}`;

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista(label, path, filtered),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: label, path },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("listing.category")}
        title={label}
        description={description}
        products={filtered}
        emptyText={t("listing.emptyCategory", { name: label.toLowerCase() })}
      />
      <ShopFooter />
    </>
  );
}
