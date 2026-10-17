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
    settings.listingDescriptions?.outlet,
    t("listing.outletDesc", {
      price: t("policy.deliveryPrice"),
      time: settings.deliveryLeadText?.trim() || t("policy.deliveryTime"),
    }) || extraListingIntros.outlet,
    locale
  );
  return stronaMeta({
    title: t("listing.outletTitle"),
    description,
    path: "/outlet",
  });
}

export default async function OutletPage() {
  const [{ locale, t }, all, settings] = await Promise.all([
    getI18n(),
    getPublicProducts(),
    getSettings(),
  ]);
  const products = all.filter((product) => product.outlet && isPurchasable(product));
  const time = settings.deliveryLeadText?.trim() || t("policy.deliveryTime");
  const description = await localizeListingIntro(
    settings.listingDescriptions?.outlet,
    t("listing.outletDesc", {
      price: t("policy.deliveryPrice"),
      time,
    }),
    locale
  );

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista("Outlet", "/outlet", products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.outletTitle"), path: "/outlet" },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("listing.outletEyebrow")}
        title={t("listing.outletTitle")}
        description={description}
        products={products}
        emptyText={t("listing.outletEmpty")}
      />
      <ShopFooter />
    </>
  );
}
