"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { useLanguage } from "@/kontekst/KontekstJezyka";

const DESKTOP_VISIBLE = 4;
const MOBILE_VISIBLE = 2;

export function CompleteTheSet({
  products,
  lineName,
  lineHref,
}: {
  products: Product[];
  lineName?: string;
  lineHref?: string;
}) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(DESKTOP_VISIBLE);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setVisible(mq.matches ? DESKTOP_VISIBLE : MOBILE_VISIBLE);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const max = Math.max(0, products.length - visible);
    setIndex((current) => Math.min(current, max));
  }, [products.length, visible]);

  if (products.length === 0) return null;

  const max = Math.max(0, products.length - visible);
  const canPrev = index > 0;
  const canNext = index < max;

  function go(dir: number) {
    setIndex((current) => Math.min(max, Math.max(0, current + dir)));
  }

  return (
    <section className="rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-charcoal">
            {t("product.completeSet")}
          </h2>
          {lineName ? (
            <p className="mt-1 text-sm text-charcoal/70">
              {t("product.completeSetHint", { line: lineName })}
            </p>
          ) : null}
        </div>
        {lineHref ? (
          <Link
            href={lineHref}
            className="text-[15px] font-semibold text-charcoal underline decoration-taupe underline-offset-4 transition-colors hover:text-terracotta"
          >
            {t("home.seeAll")}
          </Link>
        ) : null}
      </div>

      <div className="relative">
        {canPrev ? (
          <button
            type="button"
            aria-label={t("home.prevSlide")}
            onClick={() => go(-1)}
            className="absolute top-1/2 left-0 z-10 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-charcoal shadow-[0_8px_20px_-10px_rgba(17,17,17,0.45)] transition-colors hover:bg-cream-light sm:-translate-x-1/3"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
        ) : null}
        {canNext ? (
          <button
            type="button"
            aria-label={t("home.nextSlide")}
            onClick={() => go(1)}
            className="absolute top-1/2 right-0 z-10 flex h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-charcoal shadow-[0_8px_20px_-10px_rgba(17,17,17,0.45)] transition-colors hover:bg-cream-light sm:translate-x-1/3"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        ) : null}

        <div
          className="overflow-hidden"
          style={
            {
              "--set-gap": "1rem",
              "--set-visible": visible,
              "--set-index": index,
              "--set-item":
                "calc((100% - (var(--set-visible) - 1) * var(--set-gap)) / var(--set-visible))",
              "--set-step": "calc(var(--set-item) + var(--set-gap))",
            } as CSSProperties
          }
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap: "var(--set-gap)",
              transform: "translateX(calc(-1 * var(--set-index) * var(--set-step)))",
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-0 shrink-0"
                style={{ width: "var(--set-item)" }}
              >
                <ProductCard product={product} variant="shop" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
