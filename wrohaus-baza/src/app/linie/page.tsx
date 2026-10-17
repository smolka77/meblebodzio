import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { getPublicProducts } from "@/lib/serwer/produkty";
import {
  getFurnitureLines,
  productsInFurnitureLine,
} from "@/lib/serwer/linieMeblowe";
import { jsonLdOkuszki, stronaMeta } from "@/lib/seo";
import { getI18n } from "@/lib/jezyk/serwer";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return stronaMeta({
    title: t("listing.lines"),
    description: t("listing.linesDesc"),
    path: "/linie",
  });
}

export default async function FurnitureLinesPage() {
  const [{ t }, lines, products] = await Promise.all([
    getI18n(),
    getFurnitureLines(),
    getPublicProducts(),
  ]);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdOkuszki([
            { name: t("product.home"), path: "/" },
            { name: t("listing.lines"), path: "/linie" },
          ]),
        ]}
      />
      <Header />
      <main className="pb-16 pt-8 sm:pb-20 sm:pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="section-kicker uppercase tracking-[0.12em]">
            {t("nav.lines")}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-charcoal sm:text-4xl">
            {t("listing.lines")}
          </h1>
          <p className="section-intro mt-3 max-w-2xl">{t("listing.linesDesc")}</p>

          {lines.length === 0 ? (
            <p className="mt-10 text-sm text-sand">{t("listing.linesEmpty")}</p>
          ) : (
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lines.map((line) => {
                const count = productsInFurnitureLine(products, line.id).length;
                return (
                  <li key={line.id}>
                    <Link
                      href={`/linie/${line.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-taupe/25 bg-white shadow-[0_16px_40px_-32px_rgba(17,17,17,0.45)] transition-shadow hover:shadow-[0_20px_48px_-28px_rgba(17,17,17,0.55)]"
                    >
                      <div className="relative aspect-[16/10] bg-cream-light">
                        {line.image ? (
                          <StoreImage
                            src={line.image}
                            alt={line.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-[center_45%] transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-cream to-taupe/30" />
                        )}
                      </div>
                      <div className="px-5 py-4">
                        <h2 className="font-serif text-xl text-charcoal">
                          {line.name}
                        </h2>
                        {line.description ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-sand">
                            {line.description}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs font-medium tracking-[0.12em] text-sand uppercase">
                          {t("listing.folderCount", { n: String(count) })}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <ShopFooter />
    </>
  );
}
