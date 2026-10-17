"use client";

import { Check, ChevronDown } from "lucide-react";
import type { Product, ProductDetails, ProductSize } from "@/lib/typy";
import { company } from "@/lib/firma";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { translateListingLabel } from "@/lib/jezyk/etykietyOgloszenia";
import { visibleProductDisclaimer } from "@/lib/notaPrawna";
import { expandProductCopy } from "@/lib/znacznikiOpisu";
import { FormattedProductDescription, HighlightTitleRow } from "@/lib/atutyOpisu";
import { isVisibleSpecValue } from "@/lib/szablonyProduktu";
import { dimensionsForSize } from "@/lib/rozmiary";
import { ProductAverageRating } from "@/components/sklep/GwiazdkiOceny";
import { SuggestedMattressTile } from "@/components/sklep/KafelekMateraca";
import { StoreImage } from "@/components/sklep/ObrazSklepu";

const sectionClass =
  "rounded-2xl bg-white px-5 py-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.14)] sm:px-8 sm:py-8";

export function ProductRichContent({
  product,
  details,
  selectedSize,
  suggestedMattress,
}: {
  product: Product;
  details?: ProductDetails;
  selectedSize?: ProductSize;
  suggestedMattress?: Product;
}) {
  const { t, locale } = useLanguage();
  const description = expandProductCopy(
    details?.longDescription || product.description,
    product
  );
  const highlights = (details?.highlights ?? []).filter(
    (item) => item.title?.trim() || item.description?.trim()
  );
  const features = (details?.features ?? []).map((f) => f.trim()).filter(Boolean);
  const layers = (details?.layers ?? []).filter((layer) => layer.name?.trim());
  // Puste wiersze z szablonu (lub „—”, „brak”, „nie dotyczy”) nie trafiają na stronę.
  const specs = (details?.specs ?? []).filter(
    (item) => item.label?.trim() && isVisibleSpecValue(item.value)
  );
  const dimensions = dimensionsForSize(
    details?.dimensions,
    selectedSize,
    product
  ).filter(
    (item) => item.label?.trim() && isVisibleSpecValue(item.value)
  );
  const dimensionImage = details?.dimensionImage?.trim();
  const faq = (details?.faq ?? []).filter(
    (item) => item.question?.trim() && item.answer?.trim()
  );
  const nota = visibleProductDisclaimer(details);

  return (
    <div className="space-y-3">
      <section className={sectionClass}>
        <h2 className="text-xl font-semibold text-charcoal">{t("product.desc")}</h2>
        <div className="mt-4">
          <FormattedProductDescription text={description} />
        </div>
        {features.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold tracking-wide text-charcoal/70 uppercase">
              {t("product.features")}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="inline-flex items-center gap-1.5 rounded-full border border-taupe/40 bg-cream/50 px-3 py-1.5 text-[13px] text-charcoal"
                >
                  <Check className="h-3.5 w-3.5 text-terracotta" strokeWidth={2.25} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        {highlights.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold tracking-wide text-charcoal/70 uppercase">
              {t("product.highlights")}
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item.title || item.description}
                  className="rounded-xl border border-taupe/30 bg-cream/40 p-4"
                >
                  <HighlightTitleRow icon={item.icon} title={item.title} />
                  {item.description && (
                    <p className="mt-2 text-sm leading-relaxed text-charcoal/75">
                      {expandProductCopy(item.description, product)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {nota ? (
          <p className="mt-5 text-sm leading-relaxed text-charcoal/70">*{nota}</p>
        ) : null}
        {details?.productCode && (
          <div className="mt-5">
            <p className="text-sm text-charcoal/70">{t("product.id", { sku: details.productCode })}</p>
            <ProductAverageRating
              reviews={product.reviews}
              className="mt-1.5 flex flex-nowrap items-center gap-2 text-[15px] text-charcoal"
            />
          </div>
        )}
        <p className="mt-4 text-sm text-charcoal/70">
          {t("product.responsible", {
            company: company.legalName,
            address: company.fullAddress,
          })}
        </p>
      </section>

      {suggestedMattress ? (
        <SuggestedMattressTile mattress={suggestedMattress} bedSize={selectedSize} />
      ) : null}

      {layers.length > 0 && (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.layers")}</h2>
          <p className="mt-1 text-sm text-charcoal/60">{t("product.layersHint")}</p>
          <ol className="mt-4 space-y-2">
            {layers.map((layer, index) => (
              <li
                key={`${layer.name}-${index}`}
                className="flex gap-4 rounded-xl border border-taupe/30 bg-cream/40 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-cream">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="text-[15px] font-medium text-charcoal">{layer.name}</p>
                    {layer.thickness && (
                      <p className="text-sm text-charcoal/70">{layer.thickness}</p>
                    )}
                  </div>
                  {layer.description && (
                    <p className="mt-1 text-sm leading-relaxed text-charcoal/75">
                      {layer.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {dimensionImage ? (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.dims")}</h2>
          <div className="relative mt-4 aspect-square w-full overflow-hidden rounded-xl bg-white">
            <StoreImage
              src={dimensionImage}
              alt={t("product.dims")}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
        </section>
      ) : dimensions.length > 0 ? (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.dims")}</h2>
          <dl className="mt-4 divide-y divide-taupe/25">
            {dimensions.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-2 gap-4 py-3 text-[15px] sm:grid-cols-[1fr_auto]"
              >
                <dt className="text-charcoal/70">
                  {translateListingLabel(item.label, locale)}
                </dt>
                <dd className="text-right font-medium text-charcoal">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {specs.length > 0 && (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.specs")}</h2>
          <dl className="mt-4 divide-y divide-taupe/25">
            {specs.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-1 gap-1 py-3.5 text-[15px] sm:grid-cols-[minmax(140px,32%)_1fr] sm:gap-8"
              >
                <dt className="text-charcoal/70">{item.label}</dt>
                <dd className="text-charcoal">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {faq.length > 0 && (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.faq")}</h2>
          <div className="mt-3 divide-y divide-taupe/25">
            {faq.map((item) => (
              <details key={item.question} className="group">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[15px] font-medium text-charcoal [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-charcoal/50 transition-transform group-open:rotate-180"
                    strokeWidth={1.5}
                  />
                </summary>
                <p className="pb-4 text-sm leading-relaxed text-charcoal/75">
                  {expandProductCopy(item.answer, product)}
                </p>
              </details>
            ))}
          </div>
        </section>
      )}
      {(product.manualUrl || (product.packageCount && product.packageCount > 0)) && (
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold text-charcoal">{t("product.manual")}</h2>
          <div className="mt-4 space-y-2 text-[15px] text-charcoal">
            {product.packageCount && product.packageCount > 0 ? (
              <p>{t("product.packagesValue", { n: product.packageCount })}</p>
            ) : null}
            {product.manualUrl ? (
              <a
                href={product.manualUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex font-medium underline underline-offset-2"
              >
                {t("product.manualDownload")}
              </a>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
