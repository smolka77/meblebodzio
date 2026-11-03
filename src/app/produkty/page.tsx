import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";
import { parseListingPreset } from "@/lib/presetListy";
import { storePolicies } from "@/lib/zasadySklepu";
import { PRODUCT_ROOMS, PRODUCT_STYLES } from "@/lib/stylePomieszczenia";

export const metadata = stronaMeta({
  title: "Sklep z meblami",
  description:
    `Pełna oferta Wrohaus: sofy, narożniki, szafy, łóżka i materace z polskiej manufaktury. ${storePolicies.returnsLabel}, ${storePolicies.warrantyLabel}, dostawa ${storePolicies.deliveryTimeLabel}.`,
  path: "/produkty",
});

export default async function ProductsPage({
  searchParams,
}: PageProps<"/produkty">) {
  const query = await searchParams;
  const widok = typeof query.widok === "string" ? query.widok : "";
  const preset = parseListingPreset(query);
  const [{ t }, products] = await Promise.all([getI18n(), getPublicProducts()]);

  // Jeden filtr z menu (styl, pomieszczenie) dostaje własny nagłówek strony.
  const onlyStyle = preset.styl?.length === 1 && !preset.pokoj && !preset.typ ? preset.styl[0] : null;
  const onlyRoom = preset.pokoj?.length === 1 && !preset.styl && !preset.typ ? preset.pokoj[0] : null;
  const styleInfo = PRODUCT_STYLES.find((style) => style.id === onlyStyle);
  const roomInfo = PRODUCT_ROOMS.find((room) => room.id === onlyRoom);

  const title =
    widok === "nowosci"
      ? "Nowości"
      : widok === "bestsellery"
        ? "Bestsellery"
        : styleInfo
          ? `Styl ${styleInfo.label.toLowerCase()}`
          : roomInfo
            ? roomInfo.label
            : t("listing.allFurniture");
  const description = widok
    ? undefined
    : (styleInfo?.blurb ?? roomInfo?.blurb ?? t("listing.allFurnitureDesc"));

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista("Sklep z meblami", "/produkty", products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.allFurniture"), path: "/produkty" },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        key={JSON.stringify(preset)}
        eyebrow={t("listing.offer")}
        title={title}
        description={description}
        products={products}
        onlyNew={widok === "nowosci"}
        onlyFeatured={widok === "bestsellery"}
        preset={preset}
      />
      <ShopFooter />
    </>
  );
}
