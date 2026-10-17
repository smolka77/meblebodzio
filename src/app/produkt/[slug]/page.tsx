import { Suspense } from "react";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ProductPageClient } from "@/components/sklep/StronaProduktu";
import { HomeProductRail } from "@/components/glowna/PasekProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts, getPublicProductBySlug, getProductSlugRedirect } from "@/lib/serwer/produkty";
import { localizeProducts } from "@/lib/jezyk/tlumaczOgloszenie";
import { pickRelatedProducts } from "@/lib/losowyProdukt";
import { productsForCompleteSet } from "@/lib/zestawLinii";
import { getFurnitureLines } from "@/lib/serwer/linieMeblowe";
import { resolveSuggestedMattress } from "@/lib/sugerowanyMaterac";
import { jsonLdFaqPage, jsonLdOkuszki, jsonLdProdukt, metaProduktu } from "@/lib/seo";
import { expandProductCopy } from "@/lib/znacznikiOpisu";
import { getI18n } from "@/lib/jezyk/serwer";
import { translateCategory } from "@/lib/jezyk";
import {
  getCategoryDisplayName,
  isCategorySlugPublic,
} from "@/lib/serwer/kategorieWlasne";
import { isBuiltinProductCategory } from "@/lib/dane";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getPublicProducts({ translate: false });
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/produkt/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);
  if (!product) {
    const target = await getProductSlugRedirect(slug);
    if (target) permanentRedirect(`/produkt/${target}`);
    return { title: "Produkt" };
  }
  return metaProduktu(product);
}

export default async function ProductPage({
  params,
}: PageProps<"/produkt/[slug]">) {
  const { slug } = await params;
  const lines = await getFurnitureLines();
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    const target = await getProductSlugRedirect(slug);
    if (target) permanentRedirect(`/produkt/${target}`);
    notFound();
  }

  const { locale, t } = await getI18n();
  const [all, categoryPublic] = await Promise.all([
    getPublicProducts({ translate: false }),
    isCategorySlugPublic(product.category),
  ]);
  const related = await localizeProducts(
    pickRelatedProducts(all, slug, 4, product.category),
    locale
  );
  const current = all.find((item) => item.id === product.id) ?? product;
  const lineMates = productsForCompleteSet(all, current);
  const furnitureLine = current.furnitureLineId
    ? lines.find((line) => line.id === current.furnitureLineId)
    : undefined;
  const lineSet =
    lineMates.length > 0
      ? {
          name: furnitureLine?.name ?? "",
          slug: furnitureLine?.slug ?? "",
          products: await localizeProducts(lineMates, locale),
        }
      : undefined;
  const suggestedMattressRaw = resolveSuggestedMattress(all, product);
  const suggestedMattress = suggestedMattressRaw
    ? (await localizeProducts([suggestedMattressRaw], locale))[0]
    : undefined;
  const categoryName = isBuiltinProductCategory(product.category)
    ? translateCategory(locale, product.category)
    : await getCategoryDisplayName(product.category);
  const categoryPath = categoryPublic
    ? `/kategoria/${product.category}`
    : "/produkty";

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdProdukt(product),
          jsonLdFaqPage(
            (product.details?.faq ?? []).map((item) => ({
              question: item.question ?? "",
              answer: expandProductCopy(item.answer, product),
            }))
          ),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            {
              name: categoryName,
              path: categoryPath,
            },
            { name: product.name, path: `/produkt/${product.slug}` },
          ]),
        ]}
      />
      <Header />
      <main>
        <div className="page-gutter pt-5 pb-10 sm:pt-6">
          <div className="page-width">
            <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[13px] text-meta">
              <Link href="/" className="hover:text-charcoal">
                {t("product.home")}
              </Link>
              <span>/</span>
              <Link
                href={categoryPath}
                className="hover:text-charcoal"
              >
                {categoryName}
              </Link>
              <span>/</span>
              <span className="line-clamp-1 text-charcoal">{product.name}</span>
            </nav>

            <Suspense fallback={<div className="min-h-[40vh]" />}>
              <ProductPageClient
                product={product}
                suggestedMattress={suggestedMattress}
                lineSet={lineSet}
              />
            </Suspense>
          </div>
        </div>

        <HomeProductRail
          title={t("product.related")}
          href={categoryPath}
          products={related}
        />
      </main>
      <ShopFooter />
    </>
  );
}
