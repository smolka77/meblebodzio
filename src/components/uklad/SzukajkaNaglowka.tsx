"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchProducts } from "@/lib/wyszukiwanie";
import { formatPrice, labelForCategory, labelsFromCustom } from "@/lib/dane";
import { isLocalUpload } from "@/lib/obrazy";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import type { Product } from "@/lib/typy";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";

export function HeaderSearch({ className }: { className?: string } = {}) {
  const { t } = useLanguage();
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const results = searchProducts(query, products, extraLabels);
  const showPanel = open && query.trim().length > 0;

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={wrapRef} className={className ?? "relative hidden min-w-0 max-w-[680px] flex-1 lg:block"}>
      <div className="flex h-[52px] items-center gap-3 rounded-full border border-transparent bg-soft px-6 transition focus-within:border-ink focus-within:bg-white">
        <Search className="h-5 w-5 shrink-0" strokeWidth={1.6} />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Czego szukasz? Np. sofa rozkładana, krzesło dębowe…"
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-meta [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            aria-label={t("header.clear")}
            onClick={() => {
              setQuery("");
              setOpen(false);
            }}
            className="text-sand hover:text-charcoal"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-[80] max-h-[min(70vh,28rem)] overflow-y-auto rounded-2xl border border-taupe/25 bg-white shadow-[0_20px_50px_-20px_rgba(17,17,17,0.28)]">
          {results.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-sand">
              {t("search.noResults", { query })}
            </p>
          ) : (
            <ul>
              {results.slice(0, 8).map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/produkt/${product.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-cream-light/80"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-light">
                      <Image
                        src={product.image}
                        alt={`${collapseRepeatedProductName(product.name)} — widok z przodu`}
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={isLocalUpload(product.image)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium text-charcoal">
                        {collapseRepeatedProductName(product.name)}
                      </p>
                      <p className="text-xs text-sand">
                          {labelForCategory(product.category, extraLabels)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-charcoal">
                      {formatPrice(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
