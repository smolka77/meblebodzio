import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";

export const metadata = stronaMeta({
  title: "Sklep z meblami",
  description:
    "Pełna oferta Wrohaus: sofy, narożniki, szafy, łóżka i materace z polskiej manufaktury. 14 dni na zwrot, 2 lata gwarancji, dostawa do 5 dni roboczych.",
  path: "/produkty",
});

export default async function ProductsPage() {
  const [{ t }, products] = await Promise.all([getI18n(), getPublicProducts()]);

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
        eyebrow={t("listing.offer")}
        title={t("listing.allFurniture")}
        description={t("listing.allFurnitureDesc")}
        products={products}
      />
      <ShopFooter />
    </>
  );
}
