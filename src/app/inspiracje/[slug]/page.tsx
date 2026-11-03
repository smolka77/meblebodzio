import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { KartaAranzacji } from "@/components/wnetrza/KartaAranzacji";
import { KupCalyLook } from "@/components/wnetrza/KupCalyLook";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { LOOKS, findLook, lookItems } from "@/lib/aranzacje";
import { roomInfo, styleInfo } from "@/lib/stylePomieszczenia";
import { getPublicProducts } from "@/lib/serwer/produkty";
import { jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import * as I from "@/components/wzor/ikony";

export function generateStaticParams() {
  return LOOKS.map((look) => ({ slug: look.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/inspiracje/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const look = findLook(slug);
  if (!look) return { title: "Inspiracje", robots: { index: false, follow: false } };
  return stronaMeta({
    title: look.title,
    description: look.intro,
    path: `/inspiracje/${look.slug}`,
  });
}

export default async function LookPage({ params }: PageProps<"/inspiracje/[slug]">) {
  const { slug } = await params;
  const look = findLook(slug);
  if (!look) notFound();

  const products = await getPublicProducts();
  const items = lookItems(look, products);
  const others = LOOKS.filter((item) => item.slug !== look.slug).slice(0, 3);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdOkuszki([
            { name: "Strona główna", path: "/" },
            { name: "Inspiracje", path: "/inspiracje" },
            { name: look.title, path: `/inspiracje/${look.slug}` },
          ]),
        ]}
      />
      <Header />
      <main className="bg-cream pb-16">
        <div className="pw pt-5">
          <div className="flex flex-wrap items-center gap-1.5 text-[13px]">
            <Link href="/" className="hover:underline">
              Strona główna
            </Link>
            <I.Chevron className="h-3 w-3" />
            <Link href="/inspiracje" className="hover:underline">
              Inspiracje
            </Link>
            <I.Chevron className="h-3 w-3" />
            <span className="font-semibold">{look.title}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[12.5px] font-semibold">
              {roomInfo(look.room).label}
            </span>
            {look.styles.map((style) => (
              <Link
                key={style}
                href={`/inspiracje?styl=${style}`}
                className="rounded-full border border-line px-3 py-1 text-[12.5px] font-medium transition hover:border-ink"
              >
                {styleInfo(style).label}
              </Link>
            ))}
          </div>
        </div>

        <div className="pw mt-8">
          <KupCalyLook looks={[look]} products={products} variant="detail" />
        </div>

        {items.length > 0 ? (
          <section className="pw pt-16 lg:pt-20">
            <h2 className="font-display text-[26px] leading-tight sm:text-[34px]">
              Meble z tej aranżacji
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {items.map(({ product }) => (
                <ProductCard key={product.id} product={product} cta="Zobacz warianty" />
              ))}
            </div>
          </section>
        ) : null}

        <section className="pw pt-16 lg:pt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-[26px] leading-tight sm:text-[34px]">
              Zobacz też
            </h2>
            <Link
              href="/inspiracje"
              className="ulink hidden items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
            >
              Wszystkie inspiracje
              <I.Arrow className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3 lg:gap-5">
            {others.map((item) => (
              <li key={item.slug} className="h-[320px]">
                <KartaAranzacji look={item} products={products} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <ShopFooter />
    </>
  );
}
