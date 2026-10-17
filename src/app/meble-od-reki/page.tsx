import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";
import { extraListingIntros } from "@/lib/listingi";
import { localizeListingIntro } from "@/lib/jezyk/trescCms";
import { isPurchasable } from "@/lib/stanMagazynu";
import { getSettings } from "@/lib/serwer/ustawienia";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ locale, t }, settings] = await Promise.all([getI18n(), getSettings()]);
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["meble-od-reki"],
    t("listing.readyDesc", {
      price: t("policy.deliveryPrice"),
      time: t("policy.deliveryTime"),
    }) || extraListingIntros["meble-od-reki"],
    locale
  );
  return stronaMeta({
    title: t("listing.readyTitle"),
    description,
    path: "/meble-od-reki",
  });
}

export default async function ReadyStockPage() {
  const [{ locale, t }, all, settings] = await Promise.all([
    getI18n(),
    getPublicProducts(),
    getSettings(),
  ]);
  const products = all.filter((p) => p.readyToShip && isPurchasable(p));
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["meble-od-reki"],
    t("listing.readyDesc", {
      price: t("policy.deliveryPrice"),
      time: t("policy.deliveryTime"),
    }),
    locale
  );

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista("Meble od ręki", "/meble-od-reki", products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.readyTitle"), path: "/meble-od-reki" },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("listing.readyEyebrow")}
        title={t("listing.readyTitle")}
        description={description}
        products={products}
        emptyText={t("listing.readyEmpty")}
      />
      <ShopFooter />
    </>
  );
}
