import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { ShopListing } from "@/components/sklep/ListaProduktow";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { getPublicProducts } from "@/lib/serwer/produkty";
import {
  getFurnitureLineBySlug,
  getFurnitureLines,
  productsInFurnitureLine,
} from "@/lib/serwer/linieMeblowe";
import { jsonLdLista, jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateStaticParams() {
  const lines = await getFurnitureLines();
  return lines.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/linie/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const line = await getFurnitureLineBySlug(slug);
  if (!line) {
    return { title: "Linia", robots: { index: false, follow: false } };
  }
  return stronaMeta({
    title: line.name,
    description: line.description || line.name,
    path: `/linie/${line.slug}`,
  });
}

export default async function FurnitureLineFolderPage({
  params,
}: PageProps<"/linie/[slug]">) {
  const { slug } = await params;
  const line = await getFurnitureLineBySlug(slug);
  if (!line) notFound();

  const [{ t }, all] = await Promise.all([getI18n(), getPublicProducts()]);
  const products = productsInFurnitureLine(all, line.id);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdLista(line.name, `/linie/${line.slug}`, products),
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.lines"), path: "/linie" },
            { name: line.name, path: `/linie/${line.slug}` },
          ]),
        ]}
      />
      <Header />
      <ShopListing
        eyebrow={t("nav.lines")}
        title={line.name}
        description={line.description}
        products={products}
        showLineFilter={false}
        emptyText={t("listing.lineEmpty")}
        bannerImage={line.image}
      />
      <ShopFooter />
    </>
  );
}
