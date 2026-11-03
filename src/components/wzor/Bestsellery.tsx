"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { hasSalePrice } from "@/lib/ceny";
import * as I from "./ikony";

const TABS = [
  { id: "bestsellery", label: "Bestsellery", href: "/produkty?widok=bestsellery" },
  { id: "nowosci", label: "Nowości", href: "/produkty?widok=nowosci" },
  { id: "promocje", label: "Promocje", href: "/promocje" },
] as const;

const VISIBLE = 6;

export function Bestsellery({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("bestsellery");

  const lists = useMemo(() => {
    const live = products.filter((product) => !product.draft);
    const featured = live.filter((product) => product.featured);
    return {
      bestsellery: (featured.length ? featured : live).slice(0, VISIBLE),
      nowosci: live.filter((product) => product.isNew).slice(0, VISIBLE),
      promocje: live.filter((product) => hasSalePrice(product)).slice(0, VISIBLE),
    };
  }, [products]);

  const tabs = TABS.filter((item) => lists[item.id].length > 0);
  const current = tabs.find((item) => item.id === tab) ?? tabs[0];
  if (!current) return null;

  return (
    <section className="pw pt-16 lg:pt-24" id="bestsellery">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-[13px] font-medium text-meta">Najchętniej wybierane</p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Tu są nasze bestsellery
          </h2>
        </div>
        <Link
          href={current.href}
          className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
        >
          Zobacz wszystkie
          <I.Arrow className="h-4 w-4" />
        </Link>
      </div>

      {tabs.length > 1 ? (
        <div className="mb-8 flex gap-6 border-b border-line" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={current.id === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 pb-3 text-[15px] font-medium transition ${
                current.id === item.id
                  ? "border-ink"
                  : "border-transparent text-meta hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
        {lists[current.id].map((product) => (
          <ProductCard key={product.id} product={product} cta="Zobacz warianty" />
        ))}
      </div>
    </section>
  );
}
