import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";
import { extraListingIntros, isSevenDayListing } from "@/lib/listingi";
import { localizeListingIntro } from "@/lib/jezyk/trescCms";
import { isPurchasable } from "@/lib/stanMagazynu";
import { getSettings } from "@/lib/serwer/ustawienia";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [{ locale, t }, settings] = await Promise.all([getI18n(), getSettings()]);
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["meble-do-7-dni"],
    t("listing.sevenDaysDesc", {
      price: t("policy.deliveryPrice"),
      time: t("policy.deliveryTime"),
    }) || extraListingIntros["meble-do-7-dni"],
    locale
  );
  return stronaMeta({
    title: t("listing.sevenDaysTitle"),
    description,
    path: "/meble-do-7-dni",
  });
}

export default async function SevenDayFurniturePage() {
  const [{ locale, t }, all, settings] = await Promise.all([
    getI18n(),
    getPublicProducts(),
    getSettings(),
  ]);
  const products = all.filter((p) => isSevenDayListing(p) && isPurchasable(p));
  const description = await localizeListingIntro(
    settings.listingDescriptions?.["meble-do-7-dni"],
    t("listing.sevenDaysDesc", {
      price: t("policy.deliveryPrice"),
      time: t("policy.deliveryTime"),
    }),
    locale
  );

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista("Meble do 7 dni", "/meble-do-7-dni", products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.sevenDaysTitle"), path: "/meble-do-7-dni" },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("listing.sevenDaysEyebrow")}
        title={t("listing.sevenDaysTitle")}
        description={description}
        products={products}
        emptyText={t("listing.sevenDaysEmpty")}
      />
      <ShopFooter />
    </>
  );
}
