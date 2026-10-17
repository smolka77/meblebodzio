"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchProducts } from "@/lib/wyszukiwanie";
import { formatPrice, labelForCategory, labelsFromCustom } from "@/lib/dane";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import type { Product } from "@/lib/typy";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const { t, tp } = useLanguage();
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchProducts(query, products, extraLabels);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label={t("header.closeSearch")}
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-0 max-h-full overflow-y-auto bg-cream shadow-xl sm:mt-24 sm:max-w-2xl sm:rounded-2xl sm:border sm:border-taupe/30">
        <div className="flex items-center gap-4 border-b border-taupe/30 px-6 py-5">
          <Search className="h-5 w-5 shrink-0 text-sand" strokeWidth={1.5} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("header.search")}
            className="flex-1 bg-transparent text-base text-charcoal placeholder:text-sand focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label={t("header.close")}
            className="text-sand transition-colors hover:text-charcoal"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-6 py-4">
          {query.trim() === "" ? (
            <p className="py-8 text-center text-sm text-sand">
              {t("search.hint")}
            </p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-sand">
              {t("search.noResults", { query })}
            </p>
          ) : (
            <>
              <p className="mb-4 section-kicker tracking-[0.12em] uppercase">
                {tp("search.results", results.length)}
              </p>
              <ul className="divide-y divide-taupe/20">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/produkt/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 py-4 transition-colors hover:bg-cream-light/80"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-cream-light">
                        <Image
                          src={product.image}
                          alt={`${collapseRepeatedProductName(product.name)} — widok z przodu`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-lg text-charcoal">
                          {collapseRepeatedProductName(product.name)}
                        </p>
                        <p className="text-xs text-sand">
                          {labelForCategory(product.category, extraLabels)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-charcoal">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
