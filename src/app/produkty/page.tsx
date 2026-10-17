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
    "Pełna oferta Wrohaus: sofy, narożniki, szafy, łóżka i materace z polskiej manufaktury. 14 dni na zwrot, 2 lata gwarancji, dostawa 1–10 dni roboczych.",
  path: "/produkty",
});

export default async function ProductsPage({
  searchParams,
}: PageProps<"/produkty">) {
  const query = await searchParams;
  const widok = typeof query.widok === "string" ? query.widok : "";
  const [{ t }, products] = await Promise.all([getI18n(), getPublicProducts()]);
  const title =
    widok === "nowosci" ? "Nowości" : widok === "bestsellery" ? "Bestsellery" : t("listing.allFurniture");

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
        title={title}
        description={widok ? undefined : t("listing.allFurnitureDesc")}
        products={products}
        onlyNew={widok === "nowosci"}
        onlyFeatured={widok === "bestsellery"}
      />
      <ShopFooter />
    </>
  );
}
