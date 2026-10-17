"use client";

import type { ProductOption, ProductOptionValue } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { useLanguage } from "@/kontekst/KontekstJezyka";

/** Wariant zakupowy (strona narożnika, typ drzwi, lustro, LED, materac…) — kafelki wyboru. */
export function OptionSelector({
  option,
  selected,
  onSelect,
}: {
  option: ProductOption;
  selected: ProductOptionValue;
  onSelect: (value: ProductOptionValue) => void;
}) {
  const { t } = useLanguage();
  const twoUp = option.values.length === 2;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-charcoal">{option.name}</p>
        <p className="text-sm text-charcoal">{selected.label}</p>
      </div>
      <div className={`mt-3 grid gap-2 ${twoUp ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
        {option.values.map((value) => {
          const isSelected = value.id === selected.id;
          return (
            <button
              key={value.id}
              type="button"
              onClick={() => onSelect(value)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                isSelected
                  ? "border-charcoal bg-white shadow-[0_8px_20px_-16px_rgba(17,17,17,0.45)] ring-1 ring-charcoal"
                  : "border-taupe/40 bg-cream/40 hover:border-charcoal/40"
              }`}
            >
              <span className="block text-[15px] font-semibold tracking-wide text-charcoal">
                {value.label}
              </span>
              <span
                className={`mt-0.5 block text-xs ${isSelected ? "text-charcoal/70" : "text-sand"}`}
              >
                {value.surcharge > 0
                  ? t("product.sizeSurcharge", { amount: formatPrice(value.surcharge) })
                  : t("product.sizeIncluded")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
