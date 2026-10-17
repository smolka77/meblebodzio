"use client";

import { useMemo, useState } from "react";
import type { Product, ProductLine } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { productLines, resolveProductLine, lineAccentClass } from "@/lib/linieProduktow";
import { disambiguateProductNames } from "@/lib/etykietaProduktu";

export function ShopListing({
  eyebrow,
  title,
  description,
  products,
  emptyText,
  showLineFilter = true,
  initialLine = "",
  accentLine,
  bannerImage,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
  emptyText?: string;
  showLineFilter?: boolean;
  initialLine?: ProductLine | "";
  accentLine?: ProductLine;
  bannerImage?: string;
}) {
  const { t, tp } = useLanguage();
  const [lineFilter, setLineFilter] = useState<ProductLine | "">(initialLine);

  const shown = useMemo(() => {
    const filtered = lineFilter
      ? products.filter((p) => resolveProductLine(p) === lineFilter)
      : products;
    return disambiguateProductNames(filtered);
  }, [products, lineFilter]);

  return (
    <main className={bannerImage ? "pb-16 sm:pb-20" : "pb-16 pt-8 sm:pb-20 sm:pt-10"}>
      {bannerImage ? (
        <div className="relative mb-8 h-48 overflow-hidden sm:mb-10 sm:h-64 lg:h-80">
          <StoreImage
            src={bannerImage}
            alt={title}
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
            <p className="text-[11px] font-medium tracking-[0.16em] text-cream/80 uppercase">
              {eyebrow}
            </p>
            <h1 className="mt-1 font-serif text-3xl text-cream sm:text-4xl">{title}</h1>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          {bannerImage ? null : (
            <>
          <p className={`section-kicker uppercase tracking-[0.12em] ${accentLine ? lineAccentClass[accentLine] : ""}`}>
            {eyebrow}
          </p>
          <h1 className={`mt-2 font-serif text-3xl sm:text-4xl ${accentLine ? lineAccentClass[accentLine] : "text-charcoal"}`}>
            {title}
          </h1>
            </>
          )}
          {description && (
            <p className="section-intro mt-3 max-w-2xl">
              {description}
            </p>
          )}
          {showLineFilter && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium tracking-[0.14em] text-sand uppercase">
              {t("listing.line")}:
            </span>
            <button
              type="button"
              onClick={() => setLineFilter("")}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                lineFilter === ""
                  ? "bg-charcoal text-cream"
                  : "bg-white text-charcoal/70 shadow-[0_4px_12px_-8px_rgba(17,17,17,0.2)] hover:text-charcoal"
              }`}
            >
              {t("listing.allLines")}
            </button>
            {productLines.map((line) => (
              <button
                key={line}
                type="button"
                onClick={() => setLineFilter(line)}
                className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  lineFilter === line
                    ? "bg-charcoal text-cream"
                    : "bg-white text-charcoal/70 shadow-[0_4px_12px_-8px_rgba(17,17,17,0.2)] hover:text-charcoal"
                }`}
              >
                {t(`product.line.${line}`)}
              </button>
            ))}
          </div>
          )}
          {shown.length > 0 && (
            <p className="mt-2 text-[15px] text-charcoal/60">
              {tp("listing.count", shown.length)}
            </p>
          )}
        </div>
        {shown.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-16 text-center text-sm text-sand shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
            {emptyText ?? t("listing.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} variant="shop" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
