"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, Minus, Plus } from "lucide-react";
import type { Product, ProductColor, ProductSize } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { AddToCartButton } from "./PrzyciskKoszyka";
import { ColorSelector } from "./WyborKoloru";
import { SizeSelector } from "./WyborRozmiaru";
import { OptionSelector } from "./WyborWariantu";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { storePolicies } from "@/lib/zasadySklepu";
import { formatDiscountPercent, hasSalePrice, saleSavings } from "@/lib/ceny";
import { shouldShowOmnibusLowest } from "@/lib/cenaOmnibus";
import { priceWithOptions, productSizes } from "@/lib/rozmiary";
import { getFabricSurcharge } from "@/lib/infoTkanin";
import { productUsesCovers, productUsesFabrics } from "@/lib/szablonyProduktu";
import { NO_PRODUCT_COLOR_ID } from "@/lib/kolory";
import { resolveProductLine } from "@/lib/linieProduktow";
import { ProductLineBadge } from "@/components/sklep/OdznakaLinii";
import { ProductTag } from "@/components/sklep/EtykietaProduktu";
import {
  describeSelectedOptions,
  optionsSurcharge,
  resolveOptionSelection,
  selectableOptions,
  type OptionSelection,
} from "@/lib/opcjeProduktu";
import { computeDeliverySchedule } from "@/lib/terminDostawy";
import { isPurchasable, remainingWarehouseQty, warehouseQty } from "@/lib/stanMagazynu";
import { ProductAverageRating } from "@/components/sklep/GwiazdkiOceny";
import { PayUInstallmentsMini } from "@/components/sklep/WidgetRatyPayU";
import { productKindLabel, collapseRepeatedProductName } from "@/lib/etykietaProduktu";

function quoteContactHref(
  product: Product,
  color?: ProductColor,
  size?: ProductSize,
  optionsText?: string,
  otherFabric?: boolean
) {
  const params = new URLSearchParams({
    wycena: "1",
    produkt: product.name,
    produktSlug: product.slug,
  });
  if (otherFabric) params.set("innaTkanina", "1");
  if (color?.name) params.set("kolor", color.name);
  if (size?.label) params.set("rozmiar", size.label);
  if (optionsText) params.set("warianty", optionsText);
  return `/kontakt?${params.toString()}#formularz`;
}

function InfoRow({
  title,
  value,
  children,
}: {
  title: string;
  value: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-taupe/25">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-[15px] font-medium text-charcoal">{title}</span>
        <span className="flex items-center gap-2 text-sm text-charcoal/70">
          {value}
          <ChevronDown
            className={`h-4 w-4 text-charcoal/50 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-charcoal/75">{children}</div>
      )}
    </div>
  );
}

export function ProductDetail({
  product,
  selectedColor,
  selectedSize,
  selectedOptions,
  onColorChange,
  onColorClear,
  onSizeChange,
  onOptionChange,
}: {
  product: Product;
  selectedColor?: ProductColor;
  selectedSize?: ProductSize;
  selectedOptions?: OptionSelection;
  onColorChange: (color: ProductColor) => void;
  onColorClear?: () => void;
  onSizeChange: (size: ProductSize) => void;
  onOptionChange?: (optionId: string, valueId: string) => void;
}) {
  const onSale = hasSalePrice(product);
  const { t, locale } = useLanguage();
  const { saveConfiguration, removeConfiguration, savedConfigs, cart, checkoutSettings } =
    useShop();
  const deliveryLead =
    checkoutSettings?.deliveryLeadText?.trim() || t("policy.deliveryTime");
  const [quantity, setQuantity] = useState(1);
  const savedConfig = savedConfigs.find(
    (item) =>
      item.productId === product.id &&
      item.colorId === (selectedColor?.id ?? NO_PRODUCT_COLOR_ID)
  );
  const alreadySaved = Boolean(savedConfig);
  const sku = product.details?.productCode;
  const displayName = collapseRepeatedProductName(product.name);
  const kindLabel = productKindLabel(displayName, product.kind);
  const maker = product.manufacturer?.trim();
  const sizes = productSizes(product);
  const options = selectableOptions(product);
  const resolvedOptions = resolveOptionSelection(product, selectedOptions);
  const optionsExtra = optionsSurcharge(resolvedOptions);
  const optionsText = describeSelectedOptions(resolvedOptions);
  const fabricExtra = getFabricSurcharge(selectedColor);
  const unitPrice =
    priceWithOptions(product.price, selectedSize, selectedColor) + optionsExtra;
  const compareAt = onSale
    ? priceWithOptions(product.originalPrice, selectedSize, selectedColor) + optionsExtra
    : undefined;

  const schedule = computeDeliverySchedule(product, new Date(), locale, deliveryLead);
  const productionLabel =
    schedule.productionLabel === storePolicies.productionTimeLabel
      ? t("policy.productionTime")
      : schedule.productionLabel;
  const deliveryCostLabel =
    schedule.deliveryCostLabel === storePolicies.standardDeliveryPriceLabel
      ? t("policy.deliveryPrice")
      : schedule.deliveryCostLabel;
  const line = resolveProductLine(product);
  const stock = warehouseQty(product);
  const remaining = remainingWarehouseQty(product, cart);
  const showTags =
    product.isNew ||
    product.shipping24h ||
    product.readyToShip ||
    product.featured ||
    onSale ||
    line;

  useEffect(() => {
    if (remaining == null) return;
    setQuantity((q) => Math.min(q, Math.max(1, remaining)));
  }, [remaining]);

  return (
    <div className="lg:sticky lg:top-40">
      {showTags && (
        <div className="mb-3 flex flex-nowrap items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {product.shipping24h && (
            <ProductTag id="status-24h">{t("product.shipping24h")}</ProductTag>
          )}
          {product.featured && (
            <ProductTag id="status-bestseller">{t("product.bestseller")}</ProductTag>
          )}
          {product.isNew && (
            <ProductTag id="status-new">{t("product.new")}</ProductTag>
          )}
          {product.readyToShip && !product.shipping24h && (
            <ProductTag id="status-ready">
              {stock != null && stock > 0
                ? `${t("product.ready")} · ${t("product.stockPcs", { n: stock })}`
                : t("product.ready")}
            </ProductTag>
          )}
          {onSale && product.originalPrice && (
            <ProductTag id="status-sale" normalCase>
              {formatDiscountPercent(product.price, product.originalPrice)}
            </ProductTag>
          )}
          <ProductLineBadge line={line} />
        </div>
      )}

      <h1 className="text-[1.65rem] font-semibold leading-tight text-charcoal sm:text-3xl">
        {displayName}
      </h1>
      <div className="mt-1.5 space-y-1">
        {(sku || kindLabel || maker) && (
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-sand">
            {kindLabel && <span className="text-charcoal/70">{kindLabel}</span>}
            {sku && kindLabel && <span aria-hidden>·</span>}
            {sku && <span>{t("product.id", { sku })}</span>}
            {maker && (sku || kindLabel) && <span aria-hidden>·</span>}
            {maker && (
              <span>
                {t("product.manufacturer")}: {maker}
              </span>
            )}
          </p>
        )}
        <ProductAverageRating
          reviews={product.reviews}
          className="flex flex-nowrap items-center gap-2.5 text-[15px] text-charcoal"
        />
      </div>

      <div className="mt-4">
        <p className={`text-3xl font-semibold ${onSale ? "text-terracotta" : "text-charcoal"}`}>
          {formatPrice(unitPrice)}
        </p>
        <PayUInstallmentsMini amount={unitPrice} id={`pdp-${product.id}`} className="mt-2" />
        {fabricExtra > 0 && (
          <p className="mt-1 text-sm text-charcoal/70">
            {t(
              productUsesCovers(product)
                ? "product.coverSurchargeInPrice"
                : "product.fabricSurchargeInPrice",
              { amount: formatPrice(fabricExtra) }
            )}
          </p>
        )}
        {onSale && compareAt != null && (
          <>
            <p className="mt-1 text-base text-sand line-through">
              {formatPrice(compareAt)}
            </p>
            <p className="mt-1 text-sm text-terracotta">
              {t("product.save", {
                amount: formatPrice(saleSavings(unitPrice, compareAt)),
              })}
            </p>
          </>
        )}
        {shouldShowOmnibusLowest(product) && product.lowestPrice30Days != null && (
          <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs leading-relaxed text-charcoal/70">
            {t("product.lowest30", {
              price: formatPrice(product.lowestPrice30Days),
            })}
          </p>
        )}
        {stock != null && stock > 0 ? (
          <p className="mt-2 text-sm font-medium text-charcoal">
            {stock === 1 ? t("product.stockOne") : t("product.stock", { n: stock })}
          </p>
        ) : null}
      </div>

      {sizes.length > 0 && selectedSize && (
        <div className="mt-6">
          <SizeSelector
            sizes={sizes}
            selected={selectedSize}
            onSelect={onSizeChange}
          />
        </div>
      )}

      {options.map((option) => {
        const current = resolvedOptions.find((item) => item.option.id === option.id);
        if (!current) return null;
        return (
          <div key={option.id} className="mt-6">
            <OptionSelector
              option={option}
              selected={current.value}
              onSelect={(value) => onOptionChange?.(option.id, value.id)}
            />
          </div>
        );
      })}

      {(product.colors ?? []).length > 0 ? (
      <div className="mt-6">
        <ColorSelector
          product={product}
          colors={product.colors}
          selected={selectedColor}
          onSelect={onColorChange}
          onClear={onColorClear}
        />
        {productUsesFabrics(product) ? (
          <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-charcoal/50">
            {t("product.otherFabric")}{" "}
            <Link
              href={quoteContactHref(
                product,
                selectedColor,
                selectedSize,
                optionsText,
                true
              )}
              className="text-charcoal/70 underline decoration-taupe/70 underline-offset-4 transition-colors hover:text-charcoal hover:decoration-charcoal/40"
            >
              {t("product.otherFabricCta")}
            </Link>
          </p>
        ) : null}
      </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-12 items-center rounded-full border border-taupe/40 bg-white">
          <button
            type="button"
            aria-label={t("product.qtyDown")}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center text-charcoal"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-[1.75rem] text-center text-sm font-medium">
            {quantity}
          </span>
          <button
            type="button"
            aria-label={t("product.qtyUp")}
            onClick={() =>
              setQuantity((q) =>
                remaining == null ? q + 1 : Math.min(remaining, q + 1)
              )
            }
            disabled={remaining != null && quantity >= remaining}
            className="flex h-12 w-11 items-center justify-center text-charcoal disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <AddToCartButton
          product={product}
          color={selectedColor}
          size={selectedSize}
          options={selectedOptions}
          quantity={quantity}
          requireColor={(product.colors ?? []).length > 0}
          choiceLabel={
            productUsesCovers(product)
              ? t("product.pickCoverFirst")
              : t("product.pickColorFirst")
          }
          className="h-12 flex-1 rounded-full bg-charcoal text-[13px] font-semibold text-cream transition-colors hover:bg-charcoal/85 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <button
          type="button"
          aria-label={alreadySaved ? t("product.favoriteRemove") : t("product.favoriteAdd")}
          onClick={() =>
            alreadySaved && savedConfig
              ? removeConfiguration(savedConfig.id)
              : saveConfiguration(product, selectedColor)
          }
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-taupe/40 bg-white text-charcoal hover:border-charcoal"
        >
          <Heart
            className={`h-5 w-5 ${alreadySaved ? "fill-terracotta text-terracotta" : ""}`}
            strokeWidth={1.5}
            fill={alreadySaved ? "currentColor" : "none"}
          />
        </button>
      </div>

      {!isPurchasable(product) ? (
        <p className="mt-3 text-sm text-sand">{t("product.outNow")}</p>
      ) : remaining === 0 ? (
        <p className="mt-3 text-sm text-sand">{t("cart.stockLimit")}</p>
      ) : null}

      <div className="mt-7">
        {maker ? (
          <InfoRow title={t("product.manufacturer")} value={maker}>
            <p>{maker}</p>
          </InfoRow>
        ) : null}
        {stock != null && stock > 0 ? (
          <InfoRow
            title={t("product.stockTitle")}
            value={t("product.stockPcs", { n: stock })}
          >
            <p>{t("product.stockBody")}</p>
          </InfoRow>
        ) : null}
        {schedule.express ? (
          <InfoRow title={t("product.shippingLabel")} value={t("product.shipping24hValue")}>
            <p>{t("product.shipping24hBody", { date: schedule.deliveryLabel })}</p>
          </InfoRow>
        ) : productionLabel ? (
          <InfoRow title={t("product.productionTime")} value={productionLabel}>
            <p>
              {t("product.productionBody", {
                production: productionLabel,
                transport: deliveryLead,
              })}
            </p>
          </InfoRow>
        ) : null}
        <InfoRow title={t("product.deliveryDate")} value={schedule.deliveryLabel}>
          {schedule.computed ? (
            <p>
              {t("product.deliveryEstimateBody", {
                transport: deliveryLead,
              })}
            </p>
          ) : schedule.express || product.readyToShip ? (
            <p>{t("product.deliveryReady", { time: deliveryLead })}</p>
          ) : (
            <p>{t("product.deliveryEstimateManualBody")}</p>
          )}
        </InfoRow>
        <InfoRow title={t("product.shippingCosts")} value={deliveryCostLabel}>
          <p>
            {t("product.shippingBody", {
              price: deliveryCostLabel,
              pickup: t("policy.pickup"),
            })}
          </p>
        </InfoRow>
        <InfoRow
          title={t("product.return")}
          value={t("product.returnValue", { days: storePolicies.returnsDays })}
        >
          <p>
            {t("product.returnBody", { days: storePolicies.returnsDays })}{" "}
            <Link href="/polityka-zwrotow" className="text-charcoal underline underline-offset-2">
              {t("product.returnPolicy")}
            </Link>
            .
          </p>
        </InfoRow>
      </div>

      <p className="mt-4 text-sm text-charcoal/75">
        {t("product.customQuote")}{" "}
        <Link
          href={quoteContactHref(product, selectedColor, selectedSize, optionsText)}
          className="font-medium text-charcoal underline decoration-taupe underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta"
        >
          {t("product.askQuote")}
        </Link>
      </p>
    </div>
  );
}
