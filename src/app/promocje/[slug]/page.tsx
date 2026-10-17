import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { getLivePromotions, getPromotionBySlug } from "@/lib/serwer/promocje";
import { isPromotionLive, productsInPromotion } from "@/lib/promocje";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const promotions = await getLivePromotions();
  return promotions.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/promocje/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const promo = await getPromotionBySlug(slug);
  if (!promo || !isPromotionLive(promo)) {
    return { title: "Promocja", robots: { index: false, follow: false } };
  }
  return stronaMeta({
    title: promo.title,
    description: promo.description || promo.title,
    path: `/promocje/${promo.slug}`,
  });
}

export default async function PromotionPage({
  params,
}: PageProps<"/promocje/[slug]">) {
  const { slug } = await params;
  const promo = await getPromotionBySlug(slug);
  if (!promo || !isPromotionLive(promo)) notFound();

  const [{ t }, all] = await Promise.all([getI18n(), getPublicProducts()]);
  const products = productsInPromotion(all, promo).filter((p) => p.inStock);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista(promo.title, `/promocje/${promo.slug}`, products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.sale"), path: "/promocje" },
            { name: promo.title, path: `/promocje/${promo.slug}` },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("listing.sale")}
        title={promo.title}
        description={promo.description || t("listing.saleDesc")}
        products={products}
        emptyText={t("listing.saleEmpty")}
      />
      <ShopFooter />
    </>
  );
}
