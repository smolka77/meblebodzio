"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Check, ExternalLink, X } from "lucide-react";
import type { Product, ProductColor } from "@/lib/typy";
import { FabricCloseup } from "./ZblizenieTkaniny";
import {
  buildFabricSpecRows,
  extractFabricTraits,
  getFabricAbout,
  getFabricCare,
  getFabricCloseupSrc,
  getFabricMaterial,
  getFabricName,
  getFabricSurcharge,
  getFabricWatermark,
} from "@/lib/infoTkanin";
import { lockPageScroll } from "@/lib/blokadaScrolla";
import { formatPrice } from "@/lib/dane";
import { priceWithOptions } from "@/lib/rozmiary";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function ColorFabricOverlay({
  product,
  color: initialColor,
  onSelectColor,
  onClose,
}: {
  product: Product;
  color: ProductColor;
  onSelectColor: (color: ProductColor) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const [preview, setPreview] = useState(initialColor);

  useEffect(() => {
    setPreview(initialColor);
  }, [initialColor]);

  const closeup = getFabricCloseupSrc(preview);
  const watermark = getFabricWatermark(preview);
  const name = getFabricName(preview);
  const material = getFabricMaterial(preview);
  const about = getFabricAbout(product, preview);
  const care = getFabricCare(product, preview);
  const specRows = buildFabricSpecRows(product, preview);
  const traits = extractFabricTraits(
    about,
    preview.fabricSpecs,
    preview.fabricCare,
    material
  );
  const fabricExtra = getFabricSurcharge(preview);
  const previewUnitPrice = priceWithOptions(product.price, undefined, preview);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const unlockScroll = lockPageScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [onClose]);

  function confirmSelection() {
    onSelectColor(preview);
    onClose();
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center overscroll-none bg-charcoal/55 backdrop-blur-[2px] sm:items-center sm:p-4 md:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${t("product.fabricConfigurator")} — ${name}`}
    >
      <div
        className="relative flex h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-cream shadow-2xl sm:h-auto sm:max-h-[min(90dvh,820px)] sm:rounded-2xl lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-charcoal shadow-sm ring-1 ring-taupe/30 transition hover:bg-white lg:top-4 lg:right-4"
          aria-label={t("header.close")}
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        {/* Preview — compact on phone so the description has room; full column on desktop */}
        <div className="relative shrink-0 lg:w-[52%] lg:self-stretch">
          <div className="relative h-[min(32dvh,240px)] w-full overflow-hidden bg-cream-light sm:h-auto sm:aspect-[5/6] sm:max-h-[min(48dvh,520px)] lg:h-full lg:max-h-none lg:min-h-[min(90dvh,820px)] lg:aspect-auto">
            <FabricCloseup
              src={closeup}
              hex={preview.hex}
              alt={`${name} — ${preview.name}`}
              watermark={watermark}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal/25 to-transparent lg:hidden" />
          </div>
        </div>

        {/* Configurator panel */}
        <div className="flex min-h-0 flex-1 flex-col lg:w-[48%]">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-5 sm:px-7 sm:pt-7 lg:px-8 lg:pt-8">
            <p className="text-[10px] font-medium tracking-[0.28em] text-sand uppercase">
              {t("product.fabricConfigurator")}
            </p>
            <h2 className="mt-1.5 pr-12 font-serif text-[1.45rem] leading-snug text-charcoal sm:mt-2 sm:text-[1.65rem]">
              {name}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {material && (
                <span className="rounded-full bg-cream-light px-3 py-1 text-[11px] font-semibold tracking-wide text-charcoal uppercase">
                  {material}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-charcoal/75">
                <span
                  className="h-3.5 w-3.5 shrink-0 ring-1 ring-charcoal/15 ring-inset"
                  style={{ backgroundColor: preview.hex }}
                />
                {preview.name}
              </span>
            </div>

            {fabricExtra > 0 && (
              <div className="mt-4 rounded-xl border border-terracotta/20 bg-gradient-to-br from-terracotta/[0.07] to-cream px-4 py-3.5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-terracotta uppercase">
                  {t("product.fabricSurchargeTitle")}
                </p>
                <p className="mt-1 text-xl font-semibold text-charcoal">
                  {t("product.fabricSurcharge", { amount: formatPrice(fabricExtra) })}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-charcoal/65">
                  {t("product.fabricPriceWithShade", {
                    price: formatPrice(previewUnitPrice),
                  })}
                </p>
              </div>
            )}

            <p className="mt-5 text-[15px] leading-[1.8] whitespace-pre-line text-charcoal/90 sm:mt-6 sm:text-sm sm:leading-[1.85]">
              {about}
            </p>

            {traits.length > 0 && (
              <div className="mt-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-charcoal/60 uppercase">
                  {t("product.fabricTraits")}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {traits.map((trait) => (
                    <li
                      key={trait}
                      className="inline-flex items-center gap-1.5 rounded-full border border-taupe/35 bg-white px-3 py-1.5 text-xs font-medium text-charcoal"
                    >
                      <Check className="h-3.5 w-3.5 text-terracotta" strokeWidth={2} />
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {specRows.length > 0 && (
              <div className="mt-6 border-t border-taupe/30 pt-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-charcoal/60 uppercase">
                  {t("product.specs")}
                </p>
                <dl className="mt-3 divide-y divide-taupe/20 rounded-xl border border-taupe/25 bg-white">
                  {specRows.map((row, index) => (
                    <div
                      key={`${row.label}-${index}`}
                      className="grid grid-cols-[minmax(0,42%)_1fr] gap-x-3 gap-y-0.5 px-4 py-3 text-sm sm:grid-cols-[minmax(0,38%)_1fr]"
                    >
                      <dt className="font-medium text-charcoal/65">{row.label}</dt>
                      <dd className="text-charcoal">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {care && (
              <div className="mt-5 border-t border-taupe/30 pt-5">
                <p className="text-[11px] font-semibold tracking-[0.14em] text-charcoal/60 uppercase">
                  {t("product.fabricCare")}
                </p>
                <p className="mt-2 text-sm leading-[1.85] whitespace-pre-line text-charcoal/85">
                  {care}
                </p>
              </div>
            )}

            <p className="mt-5 text-xs leading-relaxed text-sand">
              {t("product.fabricColorNote")}
            </p>
          </div>

          {/* Sticky footer */}
          <div className="shrink-0 border-t border-taupe/30 bg-cream/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:px-7 lg:px-8">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/probki-tkanin"
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-taupe/40 bg-white px-5 py-3 text-sm font-medium text-charcoal transition hover:border-charcoal/30 sm:flex-1"
              >
                {t("product.fabricSampleCta")}
                <ExternalLink className="h-4 w-4 opacity-60" strokeWidth={1.5} />
              </Link>
              <button
                type="button"
                onClick={confirmSelection}
                className="inline-flex items-center justify-center rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-cream transition hover:bg-charcoal/85 sm:flex-1"
              >
                {t("product.chooseThisColor")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
