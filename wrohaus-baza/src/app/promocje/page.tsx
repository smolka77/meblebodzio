import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { PromotionProductGrid } from "@/components/sklep/SiatkaPromocji";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { getLivePromotions } from "@/lib/serwer/promocje";
import { getSettings } from "@/lib/serwer/ustawienia";
import { hasSalePrice } from "@/lib/ceny";
import { productsInPromotion } from "@/lib/promocje";
import { extraListingIntros } from "@/lib/listingi";
import { localizeListingIntro } from "@/lib/jezyk/trescCms";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";

export const dynamic = "force-dynamic";

async function promotionsIntro() {
  const [{ locale, t }, settings] = await Promise.all([getI18n(), getSettings()]);
  const description = await localizeListingIntro(
    settings.listingDescriptions?.promocje,
    t("listing.saleDesc") || extraListingIntros.promocje,
    locale
  );
  return { locale, t, description };
}

export async function generateMetadata(): Promise<Metadata> {
  const { t, description } = await promotionsIntro();
  return stronaMeta({
    title: t("listing.sale"),
    description,
    path: "/promocje",
  });
}

export default async function PromotionsPage() {
  const [{ t, description }, all, campaigns] = await Promise.all([
    promotionsIntro(),
    getPublicProducts(),
    getLivePromotions(),
  ]);
  const saleProducts = all.filter((p) => p.inStock && hasSalePrice(p));
  const assigned = new Set(campaigns.flatMap((item) => item.productIds));
  const leftover = saleProducts.filter((product) => !assigned.has(product.id));
  const campaignBlocks = campaigns
    .map((campaign) => ({
      campaign,
      products: productsInPromotion(all, campaign).filter((p) => p.inStock),
    }))
    .filter((block) => block.products.length > 0);

  if (campaignBlocks.length === 0) {
    return (
      <>
        <DaneStrukturalne
          dane={[
            jsonLdLista("Promocje mebli", "/promocje", saleProducts),
            jsonLdOkuszki([
              { name: t("product.home"), path: "/" },
              { name: t("listing.sale"), path: "/promocje" },
            ]),
          ]}
        />
        <Header />
        <ShopListing
          eyebrow={t("listing.offer")}
          title={t("listing.sale")}
          description={description}
          products={saleProducts}
          emptyText={t("listing.saleEmpty")}
        />
        <ShopFooter />
      </>
    );
  }

  const listed = campaignBlocks.flatMap((block) => block.products);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista("Promocje mebli", "/promocje", listed),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.sale"), path: "/promocje" },
          ]),
        ]}
      />
      <Header />
      <main className="pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="page-gutter">
          <div className="page-width mb-2">
            <p className="section-kicker uppercase tracking-[0.12em]">
              {t("listing.offer")}
            </p>
            <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
              {t("listing.sale")}
            </h1>
            <p className="section-intro mt-3 max-w-2xl">{description}</p>
          </div>
        </div>
        {campaignBlocks.map(({ campaign, products }) => (
          <PromotionProductGrid
            key={campaign.id}
            title={campaign.title}
            description={campaign.description}
            href={`/promocje/${campaign.slug}`}
            products={products}
          />
        ))}
        {leftover.length > 0 ? (
          <PromotionProductGrid
            title={t("listing.otherSales")}
            products={leftover}
          />
        ) : null}
      </main>
      <ShopFooter />
    </>
  );
}
