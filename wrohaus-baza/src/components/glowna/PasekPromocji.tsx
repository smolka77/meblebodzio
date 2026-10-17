"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { isLocalUpload } from "@/lib/obrazy";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import {
  formatDiscountPercent,
  saleDiscountPercent,
  saleSavings,
} from "@/lib/ceny";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function HomePromoStrip({
  product,
  saleCount,
  maxDiscount,
  fromPrice,
}: {
  product: Product;
  saleCount: number;
  maxDiscount: number;
  fromPrice: number;
}) {
  const { t, tp } = useLanguage();
  if (!product.originalPrice) return null;

  const moreCount = Math.max(0, saleCount - 1);

  return (
    <section className="page-gutter pt-4">
      <div className="page-width flex flex-col overflow-hidden rounded-2xl border-[3px] border-terracotta bg-white shadow-[0_12px_32px_-12px_rgba(196,81,47,0.35)] md:flex-row md:items-stretch">
        <Link
          href={`/produkt/${product.slug}`}
          className="relative aspect-[16/10] w-full shrink-0 bg-cream-light md:aspect-auto md:w-[200px] md:min-h-[11.5rem] lg:w-[240px]"
        >
          <Image
            src={product.image}
            alt={`${collapseRepeatedProductName(product.name)} — widok z przodu`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 240px"
            unoptimized={isLocalUpload(product.image)}
          />
          <span className="absolute top-3 left-3 rounded-full bg-terracotta px-2.5 py-1 text-[12px] font-bold tracking-tight text-cream shadow-[0_4px_12px_-4px_rgba(196,81,47,0.55)] sm:px-3 sm:py-1.5 sm:text-[13px]">
            {formatDiscountPercent(product.price, product.originalPrice)}
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-5 py-4 md:px-6">
          <p className="text-[13px] font-semibold tracking-wide text-terracotta uppercase sm:text-[15px]">
            {t("home.promoTo", { n: maxDiscount })}
          </p>
          <Link
            href={`/produkt/${product.slug}`}
            className="mt-1 font-serif text-[1.35rem] leading-tight text-charcoal hover:text-sand md:truncate md:text-2xl"
          >
            {collapseRepeatedProductName(product.name)}
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-lg font-semibold text-charcoal sm:text-xl">
              {formatPrice(product.price)}
            </span>
            <span className="text-sm text-sand line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-sm text-terracotta">
              {t("product.save", {
                amount: formatPrice(
                  saleSavings(product.price, product.originalPrice)
                ),
              })}
            </span>
          </div>
          <p className="mt-2 text-sm leading-snug text-sand">
            {moreCount > 0
              ? tp("home.moreSale", moreCount, { price: formatPrice(fromPrice) })
              : t("home.sameQuality", {
                  n: saleDiscountPercent(product.price, product.originalPrice),
                })}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 px-5 pb-5 md:px-6 md:py-5">
          <Link
            href={`/produkt/${product.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-terracotta px-6 text-[13px] font-semibold whitespace-nowrap text-cream transition-colors hover:bg-terracotta/90 md:px-7"
          >
            {t("home.buySale")}
          </Link>
          <Link
            href="/promocje"
            className="inline-flex min-h-[40px] items-center justify-center text-[13px] font-medium whitespace-nowrap text-terracotta underline decoration-terracotta/40 underline-offset-4 hover:text-terracotta/80"
          >
            {t("home.allSales")}
          </Link>
        </div>
      </div>
    </section>
  );
}
