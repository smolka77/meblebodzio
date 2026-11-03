"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/typy";
import {
  SET_COUPON_CODE,
  SET_DISCOUNT_PERCENT,
  lookItems,
  lookTotals,
  type Look,
} from "@/lib/aranzacje";
import { formatPrice } from "@/lib/dane";
import { useShop } from "@/kontekst/KontekstSklepu";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import * as I from "@/components/wzor/ikony";

export function KupCalyLook({
  looks,
  products,
  variant = "home",
}: {
  looks: Look[];
  products: Product[];
  variant?: "home" | "detail";
}) {
  const router = useRouter();
  const { addToCart } = useShop();
  const [lookSlug, setLookSlug] = useState(looks[0]?.slug ?? "");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const look = looks.find((item) => item.slug === lookSlug) ?? looks[0];
  const items = useMemo(() => (look ? lookItems(look, products) : []), [look, products]);
  if (!look || items.length === 0) return null;

  const totals = lookTotals(items);
  const active = items.find((item) => item.product.slug === activeSlug) ?? items[0];
  const Heading = variant === "detail" ? "h1" : "h2";

  function pickLook(slug: string) {
    setLookSlug(slug);
    setActiveSlug(null);
  }

  function buySet() {
    for (const { product } of items) addToCart(product, 1, product.colors?.[0]);
    router.push(`/koszyk?kupon=${SET_COUPON_CODE}`);
  }

  const inner = (
    <div className="grid items-start gap-8 lg:grid-cols-[380px_1fr] lg:gap-14 xl:grid-cols-[420px_1fr]">
      <div className="order-2 lg:order-1">
        <p className="text-[13px] font-medium text-meta">Kup cały look</p>
        <Heading className="font-display mt-2.5 text-[30px] leading-[1.05] tracking-[-0.035em] sm:text-[40px]">
          {look.title}
        </Heading>
        <p className="mt-4 text-[16px] leading-relaxed">{look.intro}</p>

        <ul className="mt-6 border-t border-forest/15">
          {items.map(({ product }, index) => {
            const on = active.product.id === product.id;
            return (
              <li key={product.id} className="flex items-center border-b border-forest/15">
                <button
                  type="button"
                  onMouseEnter={() => setActiveSlug(product.slug)}
                  onFocus={() => setActiveSlug(product.slug)}
                  onClick={() => setActiveSlug(product.slug)}
                  className={`flex min-w-0 flex-1 items-center gap-3 py-3.5 text-left transition ${
                    on ? "" : "opacity-65 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${
                      on ? "bg-forest text-white" : "bg-white"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">
                    {product.name}
                  </span>
                  <span className="text-[14.5px] font-semibold">{formatPrice(product.price)}</span>
                </button>
                <Link
                  href={`/produkt/${product.slug}`}
                  aria-label={`Zobacz ${product.name}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition hover:bg-white"
                >
                  <I.Chevron className="h-4 w-4" />
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[13px] text-meta">
              Cały zestaw
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11.5px] font-semibold text-white">
                −{SET_DISCOUNT_PERCENT}%
              </span>
            </div>
            <div className="text-[24px] font-semibold tracking-[-0.02em]">
              {formatPrice(totals.discounted)}{" "}
              <span className="text-[15px] font-normal text-meta line-through">
                {formatPrice(totals.sum)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={buySet}
            className="grid h-12 place-items-center rounded-full bg-accent px-7 text-[15px] font-semibold text-white transition hover:bg-accent-dark"
          >
            Kup cały zestaw
          </button>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-meta">
          Dodamy wszystkie meble w wersji podstawowej, a rabat {SET_DISCOUNT_PERCENT}% naliczymy
          w koszyku (kod {SET_COUPON_CODE}). Kolor i wariant zmienisz na karcie produktu.
        </p>
      </div>

      <div className="order-1 min-w-0 lg:order-2">
        {looks.length > 1 ? (
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="tablist">
            {looks.map((item) => (
              <button
                key={item.slug}
                type="button"
                role="tab"
                aria-selected={item.slug === look.slug}
                onClick={() => pickLook(item.slug)}
                className={`h-10 shrink-0 rounded-full border px-5 text-[14px] font-medium transition ${
                  item.slug === look.slug
                    ? "border-forest bg-forest text-white"
                    : "border-forest/25 bg-white/60 hover:border-forest"
                }`}
              >
                {item.tab}
              </button>
            ))}
          </div>
        ) : null}
        <div
          className="relative mx-auto w-full overflow-hidden rounded-md bg-paper"
          style={{
            aspectRatio: look.ratio,
            maxWidth: look.ratio < 1 ? "min(100%, 540px)" : undefined,
          }}
        >
          <StoreImage
            src={look.image}
            alt={look.title}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            position={look.position}
          />
          {items.map(({ spot, product }) => {
            const on = active.product.id === product.id;
            const above = spot.y > 62;
            const toLeft = spot.x > 58;
            return (
              <div
                key={product.id}
                className={`absolute ${on ? "z-20" : "z-10"}`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <button
                  type="button"
                  aria-label={product.name}
                  onClick={() => setActiveSlug(product.slug)}
                  onMouseEnter={() => setActiveSlug(product.slug)}
                  className={`hotspot-pulse relative grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow-[0_4px_14px_rgba(0,0,0,.28)] transition hover:scale-110 ${
                    on ? "" : "opacity-90"
                  }`}
                >
                  <span className={`relative h-2.5 w-2.5 rounded-full bg-ink transition ${on ? "scale-150" : ""}`} />
                </button>
                {on ? (
                  <Link
                    href={`/produkt/${product.slug}`}
                    className={`fade-up absolute flex w-[230px] gap-3 rounded-md bg-white p-2.5 shadow-[0_14px_40px_-12px_rgba(0,0,0,.4)] sm:w-[260px] sm:p-3 ${
                      above ? "bottom-5" : "top-5"
                    } ${toLeft ? "right-2" : "left-2"}`}
                  >
                    <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-soft sm:h-16 sm:w-16">
                      <StoreImage src={product.image} alt="" fill sizes="64px" />
                    </span>
                    <span className="min-w-0 self-center">
                      <span className="block truncate text-[14px] leading-snug font-semibold">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-[14px] font-semibold">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                    <I.Chevron className="h-4 w-4 shrink-0 self-center" />
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (variant === "detail") return inner;

  return (
    <section className="mt-16 bg-sage py-14 lg:mt-24 lg:py-20">
      <div className="pw">{inner}</div>
    </section>
  );
}
