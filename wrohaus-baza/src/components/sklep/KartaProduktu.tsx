"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import {
  formatDiscountPercent,
  hasSalePrice,
  saleSavings,
} from "@/lib/ceny";
import { shouldShowOmnibusLowest } from "@/lib/cenaOmnibus";
import { hasSizePriceRange, startingPrice } from "@/lib/rozmiary";
import { hasOptionPriceRange } from "@/lib/opcjeProduktu";
import { hasColorPriceRange } from "@/lib/infoTkanin";
import { computeDeliverySchedule } from "@/lib/terminDostawy";
import { storePolicies } from "@/lib/zasadySklepu";
import { resolveProductLine } from "@/lib/linieProduktow";
import { ProductLineBadge } from "@/components/sklep/OdznakaLinii";
import { ProductTag } from "@/components/sklep/EtykietaProduktu";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { arrangementPhotoUrl, productAspectClass } from "@/lib/zdjeciaProduktu";
import { ProductAverageRating } from "@/components/sklep/GwiazdkiOceny";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import { isPurchasable, warehouseQty } from "@/lib/stanMagazynu";

function CardPhotoStack({
  image,
  arrangement,
  hoverPreview,
  name,
  sizes,
}: {
  image: string;
  arrangement?: string;
  hoverPreview: boolean;
  name: string;
  sizes: string;
}) {
  return (
    <>
      <StoreImage
        src={image}
        alt={`${name} — widok z przodu`}
        fill
        className={
          hoverPreview
            ? "object-cover transition-opacity duration-500 group-hover:opacity-0"
            : "object-cover transition-transform duration-700 group-hover:scale-105"
        }
        sizes={sizes}
      />
      {hoverPreview && arrangement ? (
        <StoreImage
          src={arrangement}
          alt={`${name} — aranżacja`}
          fill
          className="pointer-events-none object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          sizes={sizes}
        />
      ) : null}
    </>
  );
}

export function ProductCard({
  product,
  variant = "shop",
}: {
  product: Product;
  variant?: "editorial" | "shop";
}) {
  const { addToCart, checkoutSettings } = useShop();
  const { t, locale } = useLanguage();
  const onSale = hasSalePrice(product);
  const canBuy = isPurchasable(product);
  const stock = warehouseQty(product);
  const listPrice = startingPrice(product);
  const fromPrice =
    hasSizePriceRange(product) ||
    hasOptionPriceRange(product) ||
    hasColorPriceRange(product);
  const line = resolveProductLine(product);
  const displayName = collapseRepeatedProductName(product.name);
  const deliveryLead =
    checkoutSettings?.deliveryLeadText?.trim() || t("policy.deliveryTime");
  const schedule = computeDeliverySchedule(product, new Date(), locale, deliveryLead);
  const productionLabel =
    schedule.productionLabel === storePolicies.productionTimeLabel
      ? t("policy.productionTime")
      : schedule.productionLabel;
  const shipLine = schedule.express
    ? t("product.ship24h")
    : product.readyToShip
      ? t("product.shipReady")
      : productionLabel
        ? t("product.shipProduction", { time: productionLabel })
        : t("product.shipIn", { time: deliveryLead });

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  }

  const arrangementSrc = arrangementPhotoUrl(product);
  const hoverPreview =
    Boolean(arrangementSrc) && arrangementSrc !== product.image;

  if (variant === "shop") {
    return (
      <div className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.2)] transition-shadow hover:shadow-[0_16px_32px_-16px_rgba(17,17,17,0.28)]">
        <Link href={`/produkt/${product.slug}`} className="block">
          <div className={`relative overflow-hidden bg-cream-light ${productAspectClass(product.aspectRatio)}`}>
            <CardPhotoStack
              image={product.image}
              arrangement={arrangementSrc}
              hoverPreview={hoverPreview}
              name={displayName}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
              {product.shipping24h && (
                <ProductTag id="status-24h" variant="card">
                  {t("product.shipping24h")}
                </ProductTag>
              )}
              {product.featured && (
                <ProductTag id="status-bestseller" variant="card">
                  {t("product.bestseller")}
                </ProductTag>
              )}
              {product.isNew && (
                <ProductTag id="status-new" variant="card">
                  {t("product.new")}
                </ProductTag>
              )}
              {product.readyToShip && !product.shipping24h && (
                <ProductTag id="status-ready" variant="card">
                  {stock != null && stock > 0
                    ? `${t("product.ready")} · ${t("product.stockPcs", { n: stock })}`
                    : t("product.ready")}
                </ProductTag>
              )}
            </div>
            {onSale && product.originalPrice && (
              <ProductTag
                id="status-sale"
                variant="card"
                normalCase
                className="absolute top-3 right-3 shadow-[0_4px_12px_-4px_rgba(196,81,47,0.55)]"
              >
                {formatDiscountPercent(product.price, product.originalPrice)}
              </ProductTag>
            )}
            {!canBuy && (
              <ProductTag id="status-sold-out" variant="card" className="absolute bottom-3 left-3">
                {t("product.soldOut")}
              </ProductTag>
            )}
          </div>
          <div className="px-3 pt-3 pb-1 sm:px-4 sm:pt-4">
            <ProductLineBadge line={line} className="mb-2" variant="card" />
            <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-charcoal sm:text-sm">
              {displayName}
            </h3>
            <ProductAverageRating
              reviews={product.reviews}
              className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-charcoal"
            />
            <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="text-base font-semibold text-charcoal sm:text-lg">
                {fromPrice
                  ? t("product.fromPrice", { price: formatPrice(listPrice) })
                  : formatPrice(listPrice)}
              </span>
              {onSale && product.originalPrice && (
                <span className="text-sm text-sand line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
            {onSale && product.originalPrice && (
              <p className="mt-0.5 text-[11px] text-terracotta">
                {t("product.save", {
                  amount: formatPrice(saleSavings(product.price, product.originalPrice)),
                })}
              </p>
            )}
            {shouldShowOmnibusLowest(product) && product.lowestPrice30Days != null && (
              <p className="mt-1 text-[11px] leading-snug text-charcoal/50">
                {t("product.lowest30", {
                  price: formatPrice(product.lowestPrice30Days),
                })}
              </p>
            )}
            <p className="mt-1.5 text-[13px] text-charcoal/65">{shipLine}</p>
            {stock != null && stock > 0 ? (
              <p className="mt-0.5 text-[12px] font-medium text-charcoal/80">
                {stock === 1 ? t("product.stockOne") : t("product.stock", { n: stock })}
              </p>
            ) : null}
          </div>
        </Link>
        {canBuy && (
          <div className="mt-auto px-3 pt-2 pb-3 sm:px-4 sm:pb-4">
            <button
              type="button"
              onClick={handleAdd}
              className="flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full bg-charcoal px-2 text-[10px] font-semibold tracking-[0.04em] text-cream uppercase transition-colors hover:bg-charcoal/85 sm:gap-2 sm:px-3 sm:text-[11px] sm:tracking-[0.12em]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t("product.toCart")}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link href={`/produkt/${product.slug}`} className="block">
        <div className={`relative overflow-hidden bg-cream-light ${productAspectClass(product.aspectRatio)}`}>
          <CardPhotoStack
            image={product.image}
            arrangement={arrangementSrc}
            hoverPreview={hoverPreview}
            name={displayName}
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          {onSale && product.originalPrice && (
            <ProductTag
              id="status-sale"
              variant="card"
              normalCase
              className="absolute top-3 right-3 shadow-[0_4px_12px_-4px_rgba(196,81,47,0.55)]"
            >
              {formatDiscountPercent(product.price, product.originalPrice)}
            </ProductTag>
          )}
          <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {product.shipping24h && (
              <ProductTag id="status-24h" variant="card">
                {t("product.shipping24h")}
              </ProductTag>
            )}
            {product.featured && (
              <ProductTag id="status-bestseller" variant="card">
                {t("product.bestseller")}
              </ProductTag>
            )}
            {product.isNew && (
              <ProductTag id="status-new" variant="card">
                {t("product.new")}
              </ProductTag>
            )}
            {product.readyToShip && !product.shipping24h && (
              <ProductTag id="status-ready" variant="card">
                {stock != null && stock > 0
                  ? `${t("product.ready")} · ${t("product.stockPcs", { n: stock })}`
                  : t("product.ready")}
              </ProductTag>
            )}
          </div>
          {!canBuy && (
            <ProductTag id="status-sold-out" variant="card" className="absolute bottom-3 left-3">
              {t("product.soldOut")}
            </ProductTag>
          )}
        </div>
        <div className="mt-4">
          <ProductLineBadge line={line} className="mb-2" variant="card" />
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-charcoal">
              {fromPrice
                ? t("product.fromPrice", { price: formatPrice(listPrice) })
                : formatPrice(listPrice)}
            </span>
            {onSale && product.originalPrice && (
              <>
                <span className="text-sm text-sand line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-[10px] tracking-wide text-terracotta uppercase">
                  {t("product.save", {
                    amount: formatPrice(saleSavings(product.price, product.originalPrice)),
                  })}
                </span>
              </>
            )}
          </div>
          {stock != null && stock > 0 ? (
            <p className="mt-1 text-xs font-medium text-charcoal/80">
              {stock === 1 ? t("product.stockOne") : t("product.stock", { n: stock })}
            </p>
          ) : null}
        </div>
      </Link>
      {canBuy && (
        <button
          type="button"
          onClick={handleAdd}
          className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 border border-charcoal py-3 text-[10px] tracking-[0.15em] text-charcoal uppercase transition-all active:bg-charcoal active:text-cream md:py-2.5 md:opacity-0 md:group-hover:opacity-100 md:hover:bg-charcoal md:hover:text-cream"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {t("product.addToCart")}
        </button>
      )}
    </div>
  );
}
