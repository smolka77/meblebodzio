"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { MouseEvent } from "react";
import type { Product, ProductSize } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import { matchingMattressSize } from "@/lib/sugerowanyMaterac";
import { priceWithSize } from "@/lib/rozmiary";
import { isPurchasable } from "@/lib/stanMagazynu";
import { defaultOptionSelection } from "@/lib/opcjeProduktu";

export function SuggestedMattressTile({
  mattress,
  bedSize,
}: {
  mattress: Product;
  bedSize?: ProductSize;
}) {
  const { addToCart } = useShop();
  const { t } = useLanguage();
  const name = collapseRepeatedProductName(mattress.name);
  const size = matchingMattressSize(mattress, bedSize);
  const price = priceWithSize(mattress.price, size);
  const canBuy = isPurchasable(mattress);

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    addToCart(mattress, 1, undefined, size, defaultOptionSelection(mattress));
  }

  return (
    <section className="rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8">
      <h2 className="text-xl font-semibold text-charcoal">
        {t("product.suggestedMattress")}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-charcoal/70">
        {size
          ? t("product.suggestedMattressHint", { size: size.label })
          : t("product.suggestedMattressHintGeneric")}
      </p>
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={`/produkt/${mattress.slug}`}
          className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl bg-cream/60 p-3 transition-colors hover:bg-cream"
        >
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream-light sm:h-28 sm:w-28">
            <StoreImage
              src={mattress.image}
              alt={name}
              fill
              sizes="112px"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-charcoal/55 uppercase">
              {t("cat.materace")}
            </p>
            <h3 className="mt-1 text-base font-semibold leading-snug text-charcoal">
              {name}
            </h3>
            {mattress.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-charcoal/70">
                {mattress.description}
              </p>
            ) : null}
            <p className="mt-2 text-base font-semibold text-charcoal">
              {formatPrice(price)}
              {size ? (
                <span className="ml-2 text-sm font-medium text-charcoal/55">
                  {size.label}
                </span>
              ) : null}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col gap-2 sm:w-48">
          {canBuy ? (
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-charcoal px-4 text-[11px] font-semibold tracking-[0.08em] text-cream uppercase transition-colors hover:bg-charcoal/85"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("product.addMattress")}
            </button>
          ) : (
            <p className="rounded-full border border-taupe/40 px-4 py-2.5 text-center text-[11px] font-semibold tracking-[0.08em] text-charcoal/55 uppercase">
              {t("product.soldOut")}
            </p>
          )}
          <Link
            href={`/produkt/${mattress.slug}`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-taupe/40 px-4 text-[11px] font-semibold tracking-[0.08em] text-charcoal uppercase transition-colors hover:border-charcoal/40"
          >
            {t("product.viewMattress")}
          </Link>
        </div>
      </div>
    </section>
  );
}
