"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product, ProductLine } from "@/lib/typy";
import { ProductCard } from "@/components/sklep/KartaProduktu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";
import { productLines, resolveProductLine } from "@/lib/linieProduktow";
import { disambiguateProductNames } from "@/lib/etykietaProduktu";
import { hasSalePrice } from "@/lib/ceny";
import { formatPrice, labelForCategory, labelsFromCustom } from "@/lib/dane";
import { startingPrice } from "@/lib/rozmiary";
import { productScore } from "@/lib/opinie";
import type { ListingFilterPreset } from "@/lib/presetListy";
import {
  PRODUCT_ROOMS,
  PRODUCT_STYLES,
  productRooms,
  productStyles,
} from "@/lib/stylePomieszczenia";
import {
  COLOR_FAMILIES,
  productColorFamilies,
  productDimsCm,
} from "@/lib/atrybutyProduktu";
import * as I from "@/components/wzor/ikony";

type MultiKey = "typ" | "pokoj" | "styl" | "kolor" | "material";
type DimKey = "maxW" | "maxH" | "maxD";

interface FilterState extends Record<MultiKey, string[]> {
  promo: boolean;
  fast: boolean;
  max: number;
  maxW: number | null;
  maxH: number | null;
  maxD: number | null;
}

const DIMENSIONS: { key: DimKey; label: string; pick: "width" | "height" | "depth" }[] = [
  { key: "maxW", label: "Szerokość", pick: "width" },
  { key: "maxH", label: "Wysokość", pick: "height" },
  { key: "maxD", label: "Głębokość", pick: "depth" },
];

const SORTS = [
  { id: "pop", label: "Polecane" },
  { id: "asc", label: "Cena: od najniższej" },
  { id: "desc", label: "Cena: od najwyższej" },
  { id: "rating", label: "Najlepiej oceniane" },
  { id: "new", label: "Nowości" },
] as const;

type SortId = (typeof SORTS)[number]["id"];

function passes(product: Product, f: FilterState, skip?: keyof FilterState): boolean {
  if (skip !== "typ" && f.typ.length && !f.typ.includes(product.category)) return false;
  if (skip !== "pokoj" && f.pokoj.length && !productRooms(product).some((r) => f.pokoj.includes(r)))
    return false;
  if (skip !== "styl" && f.styl.length && !productStyles(product).some((s) => f.styl.includes(s)))
    return false;
  if (skip !== "kolor" && f.kolor.length && !productColorFamilies(product).some((c) => f.kolor.includes(c)))
    return false;
  if (skip !== "material" && f.material.length && !(product.materials ?? []).some((m) => f.material.includes(m)))
    return false;
  if (skip !== "max" && startingPrice(product) > f.max) return false;
  if (skip !== "promo" && f.promo && !hasSalePrice(product)) return false;
  if (skip !== "fast" && f.fast && !(product.shipping24h || product.readyToShip)) return false;
  const dims = productDimsCm(product);
  for (const { key, pick } of DIMENSIONS) {
    const limit = f[key];
    if (skip === key || limit == null) continue;
    const value = dims[pick];
    if (value == null || value > limit) return false;
  }
  return true;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

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
  preset,
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
  /** Wstępnie zaznaczone filtry, np. z linku `/produkty?styl=loft`. */
  preset?: ListingFilterPreset;
}) {
  const { t, tp } = useLanguage();
  const { customCategories } = useShop();
  const customLabels = useMemo(() => labelsFromCustom(customCategories), [customCategories]);

  const base = useMemo(
    () =>
      products.filter((p) => (!onlyNew || p.isNew) && (!onlyFeatured || p.featured)),
    [products, onlyNew, onlyFeatured]
  );

  const priceCeil = useMemo(
    () => Math.max(1000, Math.ceil(Math.max(...base.map((p) => startingPrice(p)), 0) / 100) * 100),
    [base]
  );
  const priceFloor = useMemo(
    () => Math.floor(Math.min(...base.map((p) => startingPrice(p)), priceCeil) / 100) * 100,
    [base, priceCeil]
  );

  const dimRanges = useMemo(() => {
    const out = {} as Record<DimKey, { min: number; max: number; known: number } | null>;
    for (const { key, pick } of DIMENSIONS) {
      const values = base
        .map((p) => productDimsCm(p)[pick])
        .filter((v): v is number => v != null);
      out[key] =
        values.length >= 3
          ? {
              min: Math.floor(Math.min(...values) / 5) * 5,
              max: Math.ceil(Math.max(...values) / 5) * 5,
              known: values.length,
            }
          : null;
    }
    return out;
  }, [base]);

  const [filters, setFilters] = useState<FilterState>(() => ({
    typ: preset?.typ ?? [],
    pokoj: preset?.pokoj ?? [],
    styl: preset?.styl ?? [],
    kolor: preset?.kolor ?? [],
    material: preset?.material ?? [],
    promo: false,
    fast: false,
    max: priceCeil,
    maxW: null,
    maxH: null,
    maxD: null,
  }));
  const [lineFilter, setLineFilter] = useState<ProductLine | "">(initialLine);
  const [sort, setSort] = useState<SortId>("pop");
  const [big, setBig] = useState(false);
  const [drawer, setDrawer] = useState(false);

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const lineOk = (p: Product) => !lineFilter || resolveProductLine(p) === lineFilter;

  const shown = useMemo(() => {
    const filtered = base.filter((p) => lineOk(p) && passes(p, filters));
    const score = (p: Product) => productScore(p)?.rating ?? 0;
    if (sort === "asc") filtered.sort((a, b) => startingPrice(a) - startingPrice(b));
    if (sort === "desc") filtered.sort((a, b) => startingPrice(b) - startingPrice(a));
    if (sort === "rating") filtered.sort((a, b) => score(b) - score(a));
    if (sort === "new") filtered.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return disambiguateProductNames(filtered);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, filters, sort, lineFilter]);

  /** Liczniki przy opcjach liczone z pominięciem własnej grupy - widać, ile wyników da zaznaczenie. */
  const countFor = (key: MultiKey, matcher: (p: Product) => boolean) =>
    base.filter((p) => lineOk(p) && passes(p, filters, key) && matcher(p)).length;

  const typOptions = useMemo(
    () =>
      [...new Set(base.map((p) => p.category))].map((slug) => ({
        id: slug,
        label: labelForCategory(slug, customLabels),
      })),
    [base, customLabels]
  );
  const pokojOptions = PRODUCT_ROOMS.filter((room) =>
    base.some((p) => productRooms(p).includes(room.id))
  );
  const stylOptions = PRODUCT_STYLES.filter((style) =>
    base.some((p) => productStyles(p).includes(style.id))
  );
  const kolorOptions = COLOR_FAMILIES.filter((family) =>
    base.some((p) => productColorFamilies(p).includes(family.id))
  );
  const materialOptions = useMemo(
    () => [...new Set(base.flatMap((p) => p.materials ?? []))].sort((a, b) => a.localeCompare(b, "pl")),
    [base]
  );

  const chips: { key: string; label: string; clear: () => void }[] = [];
  (["typ", "pokoj", "styl", "kolor", "material"] as MultiKey[]).forEach((key) => {
    for (const value of filters[key]) {
      const label =
        key === "typ"
          ? labelForCategory(value, customLabels)
          : key === "pokoj"
            ? (PRODUCT_ROOMS.find((r) => r.id === value)?.label ?? value)
            : key === "styl"
              ? (PRODUCT_STYLES.find((s) => s.id === value)?.label ?? value)
              : key === "kolor"
                ? (COLOR_FAMILIES.find((c) => c.id === value)?.label ?? value)
                : value;
      chips.push({ key: `${key}-${value}`, label, clear: () => set(key, filters[key].filter((v) => v !== value)) });
    }
  });
  if (filters.promo) chips.push({ key: "promo", label: "Promocje", clear: () => set("promo", false) });
  if (filters.fast) chips.push({ key: "fast", label: "Wysyłka w 24 h", clear: () => set("fast", false) });
  if (filters.max < priceCeil)
    chips.push({ key: "max", label: `do ${formatPrice(filters.max)}`, clear: () => set("max", priceCeil) });
  for (const { key, label } of DIMENSIONS) {
    const limit = filters[key];
    if (limit != null)
      chips.push({ key, label: `${label} do ${limit} cm`, clear: () => set(key, null) });
  }

  const clearAll = () => {
    setFilters({
      typ: [],
      pokoj: [],
      styl: [],
      kolor: [],
      material: [],
      promo: false,
      fast: false,
      max: priceCeil,
      maxW: null,
      maxH: null,
      maxD: null,
    });
    setLineFilter("");
  };

  // Adres odzwierciedla filtry - link do wyników da się wysłać dalej.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of ["typ", "pokoj", "styl", "kolor", "material"] as MultiKey[]) {
      if (filters[key].length) params.set(key, filters[key].join(","));
      else params.delete(key);
    }
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [filters]);

  const sidebar = (
    <>
      {typOptions.length > 1 && (
        <Group title="Typ mebla" open>
          {typOptions.map((option) => (
            <FilterCheck
              key={option.id}
              label={option.label}
              count={countFor("typ", (p) => p.category === option.id)}
              on={filters.typ.includes(option.id)}
              set={() => set("typ", toggle(filters.typ, option.id))}
            />
          ))}
        </Group>
      )}
      {pokojOptions.length > 1 && (
        <Group title="Pomieszczenie">
          {pokojOptions.map((option) => (
            <FilterCheck
              key={option.id}
              label={option.label}
              count={countFor("pokoj", (p) => productRooms(p).includes(option.id))}
              on={filters.pokoj.includes(option.id)}
              set={() => set("pokoj", toggle(filters.pokoj, option.id))}
            />
          ))}
        </Group>
      )}
      {stylOptions.length > 0 && (
        <Group title="Styl" open>
          {stylOptions.map((option) => (
            <FilterCheck
              key={option.id}
              label={option.label}
              count={countFor("styl", (p) => productStyles(p).includes(option.id))}
              on={filters.styl.includes(option.id)}
              set={() => set("styl", toggle(filters.styl, option.id))}
            />
          ))}
        </Group>
      )}
      {kolorOptions.length > 0 && (
        <Group title="Kolor" open>
          {kolorOptions.map((option) => (
            <FilterCheck
              key={option.id}
              label={option.label}
              swatch={option.swatch}
              count={countFor("kolor", (p) => productColorFamilies(p).includes(option.id))}
              on={filters.kolor.includes(option.id)}
              set={() => set("kolor", toggle(filters.kolor, option.id))}
            />
          ))}
        </Group>
      )}
      {materialOptions.length > 0 && (
        <Group title="Materiał">
          {materialOptions.map((option) => (
            <FilterCheck
              key={option}
              label={option}
              count={countFor("material", (p) => (p.materials ?? []).includes(option))}
              on={filters.material.includes(option)}
              set={() => set("material", toggle(filters.material, option))}
            />
          ))}
        </Group>
      )}
      <Group title="Cena" open>
        <input
          type="range"
          min={priceFloor}
          max={priceCeil}
          step={100}
          value={filters.max}
          onChange={(e) => set("max", +e.target.value)}
          aria-label="Maksymalna cena"
          className="w-full accent-black"
        />
        <div className="mt-1 flex justify-between text-[14px]">
          <span>{formatPrice(priceFloor)}</span>
          <b>do {formatPrice(filters.max)}</b>
        </div>
      </Group>
      {DIMENSIONS.some(({ key }) => dimRanges[key]) && (
        <Group title="Wymiary" open>
          <div className="space-y-4">
            {DIMENSIONS.map(({ key, label }) => {
              const range = dimRanges[key];
              if (!range) return null;
              const value = filters[key] ?? range.max;
              return (
                <div key={key}>
                  <div className="flex justify-between text-[14px]">
                    <span>{label}</span>
                    <b>{filters[key] == null ? "dowolna" : `do ${value} cm`}</b>
                  </div>
                  <input
                    type="range"
                    min={range.min}
                    max={range.max}
                    step={5}
                    value={value}
                    onChange={(e) => {
                      const next = +e.target.value;
                      set(key, next >= range.max ? null : next);
                    }}
                    aria-label={`${label} do`}
                    className="mt-1 w-full accent-black"
                  />
                </div>
              );
            })}
            <p className="text-[12px] leading-snug text-meta">
              Wymiary gabarytowe w cm. Meble bez podanego wymiaru znikają, gdy ustawisz limit.
            </p>
          </div>
        </Group>
      )}
      <Group title="Dostępność" open>
        <FilterCheck label="Promocje" on={filters.promo} set={() => set("promo", !filters.promo)} />
        <FilterCheck label="Wysyłka w 24 h" on={filters.fast} set={() => set("fast", !filters.fast)} />
      </Group>
    </>
  );

  return (
    <main className="bg-white pb-16">
      <div className="pw pt-5">
        <div className="flex items-center gap-1.5 text-[13px]">
          <Link href="/" className="hover:underline">Strona główna</Link>
          <I.Chevron className="h-3 w-3" />
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
          <aside className="hidden w-[270px] shrink-0 lg:block">{sidebar}</aside>
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-line pb-4">
              <button type="button" onClick={() => setDrawer(true)} className="flex h-10 items-center gap-2 rounded-full border border-ink px-5 text-[14px] font-semibold lg:hidden">
                <I.Sliders className="h-4 w-4" />
                Filtry{chips.length ? ` (${chips.length})` : ""}
              </button>
              <span className="hidden text-[14px] lg:block">{tp("listing.count", shown.length)}</span>
              <div className="flex items-center gap-2">
                <div className="hidden overflow-hidden rounded-full border border-line sm:flex" role="group" aria-label="Widok listy">
                  <button type="button" aria-pressed={!big} aria-label="Siatka" onClick={() => setBig(false)} className={`grid h-10 w-11 place-items-center transition ${!big ? "bg-ink text-white" : "hover:bg-soft"}`}>
                    <I.Grid className="h-4 w-4" />
                  </button>
                  <button type="button" aria-pressed={big} aria-label="Duże kafle" onClick={() => setBig(true)} className={`grid h-10 w-11 place-items-center transition ${big ? "bg-ink text-white" : "hover:bg-soft"}`}>
                    <I.Expand className="h-4 w-4" />
                  </button>
                </div>
                <label className="flex items-center gap-2 text-[14px]">
                  <span className="hidden font-semibold sm:inline">Sortuj:</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortId)} className="h-10 cursor-pointer rounded-full border border-ink bg-white px-4 font-medium outline-none">
                    {SORTS.map((option) => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            {chips.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <button key={chip.key} type="button" onClick={chip.clear} className="flex h-8 items-center gap-2 rounded-full bg-accent px-3 text-[13px] font-semibold text-white" aria-label={`Usuń filtr: ${chip.label}`}>
                    {chip.label}
                    <I.Close className="h-3 w-3" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ulink ml-1 text-[13px] font-medium">Wyczyść wszystko</button>
              </div>
            )}
            {shown.length === 0 ? (
              <div className="py-20 text-center">
                <p>{emptyText ?? t("listing.empty")}</p>
                {chips.length > 0 && (
                  <button type="button" onClick={clearAll} className="ulink mt-3 font-medium text-accent">Wyczyść filtry</button>
                )}
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 ${big ? "xl:grid-cols-2" : "xl:grid-cols-3"}`}>
                {shown.map((product) => (
                  <ProductCard key={product.id} product={product} variant="shop" />
                ))}
              </div>
            )}
            <Link href="/doradca" className="mt-12 flex items-center justify-between gap-4 rounded-md bg-paper p-6 transition hover:bg-[#ddd5c7] sm:p-8">
              <span>
                <span className="flex items-center gap-2 text-[13px] font-medium text-accent"><I.Sparkle className="h-4 w-4" />Doradca zakupowy</span>
                <span className="font-display mt-1 block text-[20px] leading-tight sm:text-[24px]">Za dużo możliwości? Dobierzemy meble za Ciebie.</span>
              </span>
              <I.Arrow className="h-5 w-5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawer(false)} />
          <div className="fade-up absolute top-0 bottom-0 left-0 flex w-[88%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b border-line p-5">
              <span className="font-display text-2xl">Filtry</span>
              <button type="button" onClick={() => setDrawer(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft" aria-label="Zamknij filtry"><I.Close className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{sidebar}</div>
            <div className="flex gap-3 border-t border-line p-4">
              <button type="button" onClick={clearAll} className="h-[50px] rounded-full border border-ink px-5 text-[14px] font-semibold">Wyczyść</button>
              <button type="button" onClick={() => setDrawer(false)} className="h-[50px] flex-1 rounded-full bg-accent text-[15px] font-semibold text-white">Pokaż {shown.length}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Group({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
        {title}
        <I.Plus className="h-4 w-4 transition group-open:rotate-45" />
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

function FilterCheck({
  label,
  on,
  set,
  count,
  swatch,
}: {
  label: string;
  on: boolean;
  set: () => void;
  count?: number;
  swatch?: string;
}) {
  const disabled = count === 0 && !on;
  return (
    <label className={`group flex items-center gap-3 py-1.5 text-[15px] ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}>
      <input type="checkbox" checked={on} disabled={disabled} onChange={set} className="peer sr-only" />
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded border-[1.5px] transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent ${on ? "border-ink bg-ink text-white" : "border-ink/40 group-hover:border-ink"}`}>
        {on && <I.Check className="h-3.5 w-3.5" />}
      </span>
      {swatch ? <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-black/15" style={{ backgroundColor: swatch }} aria-hidden /> : null}
      <span className="flex-1">{label}</span>
      {count != null ? <span className="text-[13px] text-meta tabular-nums">{count}</span> : null}
    </label>
  );
}
