"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Product, ProductLine } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { productLines, resolveProductLine } from "@/lib/linieProduktow";
import { disambiguateProductNames } from "@/lib/etykietaProduktu";
import { hasSalePrice } from "@/lib/ceny";
import { formatPrice } from "@/lib/dane";
import { startingPrice } from "@/lib/rozmiary";
import { Check, Chevron } from "@/components/wzor/ikony";

export function ShopListing({
  eyebrow,
  title,
  description,
  products,
  emptyText,
  showLineFilter = true,
  initialLine = "",
  onlyNew = false,
  onlyFeatured = false,
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
  onlyNew?: boolean;
  onlyFeatured?: boolean;
  accentLine?: ProductLine;
  bannerImage?: string;
}) {
  const { t, tp } = useLanguage();
  const [lineFilter, setLineFilter] = useState<ProductLine | "">(initialLine);
  const [sort, setSort] = useState("pop");
  const [promo, setPromo] = useState(false);
  const [fast, setFast] = useState(false);
  const [max, setMax] = useState(20000);
  const [filters, setFilters] = useState(false);

  const shown = useMemo(() => {
    let filtered = products.filter((p) => startingPrice(p) <= max);
    if (onlyNew) filtered = filtered.filter((p) => p.isNew);
    if (onlyFeatured) filtered = filtered.filter((p) => p.featured);
    if (lineFilter) filtered = filtered.filter((p) => resolveProductLine(p) === lineFilter);
    if (promo) filtered = filtered.filter((p) => hasSalePrice(p));
    if (fast) filtered = filtered.filter((p) => p.shipping24h || p.readyToShip);
    if (sort === "asc") filtered = [...filtered].sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "desc") filtered = [...filtered].sort((a, b) => startingPrice(b) - startingPrice(a));
    return disambiguateProductNames(filtered);
  }, [products, lineFilter, sort, promo, fast, max, onlyNew, onlyFeatured]);

  const sidebar = (
    <>
      <div className="border-b border-line py-5">
        <div className="mb-3 text-[15px] font-semibold">Cena</div>
        <input type="range" min={200} max={20000} step={100} value={max} onChange={(e) => setMax(+e.target.value)} className="w-full accent-black" />
        <div className="mt-1 flex justify-between text-[14px]"><span>200 zł</span><b>do {formatPrice(max)}</b></div>
      </div>
      <div className="border-b border-line py-5">
        <div className="mb-3 text-[15px] font-semibold">Dostępność</div>
        <FilterCheck label="Promocje" on={promo} set={() => setPromo(!promo)} />
        <FilterCheck label="Wysyłka w 24 h" on={fast} set={() => setFast(!fast)} />
      </div>
    </>
  );

  return (
    <main className="bg-white pb-16">
      <div className="pw pt-5">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Link href="/" className="hover:underline">Strona główna</Link>
          <Chevron className="h-3 w-3" />
          <span className="font-semibold">{title}</span>
        </div>
        <h1 className="font-display mt-4 text-[32px] leading-tight tracking-[-0.035em] sm:text-[44px]">
          {title} <span className="align-middle font-sans text-[16px] font-medium text-meta">({shown.length})</span>
        </h1>
        {description && <p className="mt-2 max-w-3xl text-[15px] leading-relaxed">{description}</p>}
        {showLineFilter && (
          <div className="no-scrollbar mt-5 flex gap-2.5 overflow-x-auto pb-1">
            <button type="button" onClick={() => setLineFilter("")} className={`grid h-10 shrink-0 place-items-center rounded-full border px-5 text-[14px] font-medium transition ${lineFilter === "" ? "border-ink" : "border-line hover:border-ink"}`}>{t("listing.allLines")}</button>
            {productLines.map((line) => (
              <button key={line} type="button" onClick={() => setLineFilter(line)} className={`grid h-10 shrink-0 place-items-center rounded-full border px-5 text-[14px] font-medium transition ${lineFilter === line ? "border-ink" : "border-line hover:border-ink"}`}>{t(`product.line.${line}`)}</button>
            ))}
          </div>
        )}
        <div className="mt-6 flex gap-10">
          <aside className="hidden w-[260px] shrink-0 lg:block">{sidebar}</aside>
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
              <button type="button" onClick={() => setFilters(true)} className="h-10 rounded-full border border-ink px-5 text-[14px] font-semibold lg:hidden">Filtry</button>
              <div className="hidden items-center gap-2 lg:flex">
                {promo && <span className="flex h-8 items-center gap-2 rounded-full bg-accent px-3 text-[13px] font-semibold text-white">Promocje <button type="button" onClick={() => setPromo(false)}>×</button></span>}
                {fast && <span className="flex h-8 items-center gap-2 rounded-full bg-accent px-3 text-[13px] font-semibold text-white">Wysyłka 24 h <button type="button" onClick={() => setFast(false)}>×</button></span>}
                <span className="text-[14px]">{tp("listing.count", shown.length)}</span>
              </div>
              <label className="flex items-center gap-2 text-[14px]">
                <span className="hidden font-semibold sm:inline">Sortuj:</span>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-10 cursor-pointer rounded-full border border-ink bg-white px-4 font-medium outline-none">
                  <option value="pop">Polecane</option>
                  <option value="asc">Cena: od najniższej</option>
                  <option value="desc">Cena: od najwyższej</option>
                </select>
              </label>
            </div>
            {shown.length === 0 ? (
              <div className="py-20 text-center">{emptyText ?? t("listing.empty")}</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 xl:grid-cols-3">
                {shown.map((product) => (
                  <ProductCard key={product.id} product={product} variant="shop" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {filters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setFilters(false)} />
          <div className="fade-up absolute top-0 bottom-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-white p-6">
            <div className="flex items-center justify-between"><span className="font-display text-2xl">Filtry</span><button type="button" onClick={() => setFilters(false)} className="text-sm font-semibold underline">Zamknij</button></div>
            {sidebar}
            <button type="button" onClick={() => setFilters(false)} className="mt-6 h-[50px] w-full rounded-full bg-accent text-[15px] font-semibold text-white">Pokaż {shown.length}</button>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterCheck({ label, on, set }: { label: string; on: boolean; set: () => void }) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 py-1.5 text-[15px]" onClick={(e) => { e.preventDefault(); set(); }}>
      <span className={`grid h-5 w-5 place-items-center rounded border-[1.5px] transition ${on ? "border-ink bg-ink text-white" : "border-ink/40 group-hover:border-ink"}`}>
        {on && <Check className="h-3.5 w-3.5" />}
      </span>
      {label}
    </label>
  );
}
