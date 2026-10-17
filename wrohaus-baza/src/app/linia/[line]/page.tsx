import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { isProductLine, productLines, resolveProductLine } from "@/lib/linieProduktow";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import type { ProductLine } from "@/lib/typy";
import { getI18n } from "@/lib/jezyk/serwer";
import type { MessageKey } from "@/lib/jezyk";

export function generateStaticParams() {
  return productLines.map((line) => ({ line }));
}

export async function generateMetadata({
  params,
}: PageProps<"/linia/[line]">): Promise<Metadata> {
  const { line } = await params;
  if (!isProductLine(line)) return { title: "Linia" };
  const { t } = await getI18n();
  return stronaMeta({
    title: t(`line.${line}.title` as MessageKey),
    description: t(`line.${line}.desc` as MessageKey),
    path: `/linia/${line}`,
  });
}

export default async function ProductLinePage({
  params,
}: PageProps<"/linia/[line]">) {
  const { line } = await params;
  if (!isProductLine(line)) notFound();

  const productLine = line as ProductLine;
  const [{ t }, products] = await Promise.all([getI18n(), getPublicProducts()]);
  const filtered = products.filter((p) => resolveProductLine(p) === productLine);
  const title = t(`line.${productLine}.title` as MessageKey);
  const description = t(`line.${productLine}.desc` as MessageKey);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista(title, `/linia/${productLine}`, filtered),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: title, path: `/linia/${productLine}` },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t(`line.${productLine}.tag` as MessageKey)}
        title={title}
        description={description}
        products={filtered}
        showLineFilter={false}
        initialLine={productLine}
        accentLine={productLine}
        emptyText={t("listing.empty")}
      />
      <ShopFooter />
    </>
  );
}
