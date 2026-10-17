"use client";

import Link from "next/link";
import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { disambiguateProductNames } from "@/lib/etykietaProduktu";

export function HomeProductRail({
  id,
  eyebrow,
  title,
  intro,
  href,
  hrefLabel,
  products,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  intro?: string;
  href: string;
  hrefLabel?: string;
  products: Product[];
}) {
  const { t } = useLanguage();
  const label = hrefLabel ?? t("home.seeAll");
  const cards = disambiguateProductNames(products);
  if (cards.length === 0) return null;

  return (
    <section id={id} className="page-gutter scroll-mt-28 py-12 sm:py-16">
      <div className="page-width">
        <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
          <div>
            {eyebrow && (
              <p className="section-kicker text-terracotta">{eyebrow}</p>
            )}
            <h2 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">
              {title}
            </h2>
            {intro && (
              <p className="section-intro mt-2 max-w-xl">{intro}</p>
            )}
          </div>
          <Link
            href={href}
            className="hidden shrink-0 text-[15px] font-semibold text-charcoal underline decoration-taupe underline-offset-4 transition-colors hover:text-terracotta sm:inline"
          >
            {label}
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {cards.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} variant="shop" />
          ))}
        </div>
        <Link
          href={href}
          className="mt-6 flex min-h-[48px] items-center justify-center rounded-full border border-charcoal text-[15px] font-semibold text-charcoal sm:hidden"
        >
          {label}
        </Link>
      </div>
    </section>
  );
}
