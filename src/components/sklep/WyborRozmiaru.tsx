"use client";

import type { ProductSize } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function SizeSelector({
  sizes,
  selected,
  onSelect,
}: {
  sizes: ProductSize[];
  selected: ProductSize;
  onSelect: (size: ProductSize) => void;
}) {
  const { t } = useLanguage();

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-charcoal">{t("product.size")}</p>
        <p className="text-sm text-charcoal">{selected.label}</p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sizes.map((size) => {
          const isSelected = size.id === selected.id;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={isSelected}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                isSelected
                  ? "border-charcoal bg-white shadow-[0_8px_20px_-16px_rgba(17,17,17,0.45)] ring-1 ring-charcoal"
                  : "border-taupe/40 bg-cream/40 hover:border-charcoal/40"
              }`}
            >
              <span className="block text-[15px] font-semibold tracking-wide text-charcoal">
                {size.label}
              </span>
              <span
                className={`mt-0.5 block text-xs ${
                  isSelected ? "text-charcoal/70" : "text-sand"
                }`}
              >
                {size.surcharge > 0
                  ? t("product.sizeSurcharge", { amount: formatPrice(size.surcharge) })
                  : t("product.sizeIncluded")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
