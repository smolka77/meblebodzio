"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { Product, ProductColor } from "@/lib/typy";
import { isVideoUrl } from "@/lib/obrazy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import {
  getFabricMaterial,
  getFabricName,
  getFabricSurcharge,
  getFabricSwatchSrc,
} from "@/lib/infoTkanin";
import { productUsesCovers } from "@/lib/szablonyProduktu";
import { formatPrice } from "@/lib/dane";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { ColorSwatchRow } from "./KafelkiKolorow";
import { ColorFabricOverlay } from "./NakladkaTkaniny";

interface ColorSelectorProps {
  product: Product;
  colors: ProductColor[];
  selected?: ProductColor;
  onSelect: (color: ProductColor) => void;
  onClear?: () => void;
}

export function ColorSelector({
  product,
  colors,
  selected,
  onSelect,
  onClear,
}: ColorSelectorProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const covers = productUsesCovers(product);
  const swatch = selected ? getFabricSwatchSrc(selected) : undefined;
  const fabricName = selected ? getFabricName(selected) : "";
  const material = selected ? getFabricMaterial(selected) : "";
  const extra = getFabricSurcharge(selected);

  function handleSwatch(color: ProductColor) {
    if (selected?.id === color.id) {
      setOpen(false);
      onClear?.();
      return;
    }
    onSelect(color);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-semibold text-charcoal">
          {covers ? t("product.coverLabel") : t("product.colorLabel")}
        </p>
        <p
          className={`truncate text-sm ${
            selected ? "text-charcoal" : "text-charcoal/50"
          }`}
        >
          {selected
            ? !covers && fabricName !== selected.name
              ? `${fabricName} · ${selected.name}`
              : selected.name
            : t("product.colorPick")}
        </p>
      </div>

      <ColorSwatchRow
        colors={colors}
        selected={selected}
        onSelect={handleSwatch}
        showLabels
        showSurcharges
        className="mt-3"
      />

      {extra > 0 && (
        <p className="mt-2 text-xs font-medium text-terracotta">
          {t(covers ? "product.coverSurcharge" : "product.fabricSurcharge", {
            amount: formatPrice(extra),
          })}
        </p>
      )}

      {selected && !covers && (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group mt-4 flex w-full items-center gap-3.5 rounded-xl border border-taupe/35 bg-white p-3.5 text-left transition hover:border-charcoal/25 hover:shadow-[0_8px_24px_-12px_rgba(17,17,17,0.18)] sm:p-4"
          >
            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-taupe/30 sm:h-16 sm:w-16">
              {swatch ? (
                isVideoUrl(swatch) ? (
                  <video
                    src={swatch}
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <StoreImage
                    src={swatch}
                    alt={fabricName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )
              ) : (
                <span
                  className="block h-full w-full"
                  style={{ backgroundColor: selected.hex }}
                />
              )}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-charcoal">
                {t("product.fabricMore")}
              </span>
              <span className="mt-0.5 block truncate text-xs text-charcoal/65">
                {material ? `${material} · ` : ""}
                {fabricName}
                {fabricName !== selected.name ? ` · ${selected.name}` : ""}
              </span>
            </span>

            <ArrowUpRight
              className="h-5 w-5 shrink-0 text-charcoal/45 transition group-hover:text-charcoal"
              strokeWidth={1.5}
            />
          </button>

          {open && (
            <ColorFabricOverlay
              product={product}
              color={selected}
              onSelectColor={onSelect}
              onClose={() => setOpen(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
