"use client";

import Link from "next/link";
import type { Product } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { hasSalePrice } from "@/lib/ceny";
import { shouldShowOmnibusLowest } from "@/lib/cenaOmnibus";
import { hasSizePriceRange, startingPrice } from "@/lib/rozmiary";
import { hasOptionPriceRange } from "@/lib/opcjeProduktu";
import { hasColorPriceRange } from "@/lib/infoTkanin";
import { arrangementPhotoUrl } from "@/lib/zdjeciaProduktu";
import { ProductAverageRating } from "@/components/sklep/GwiazdkiOceny";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import { productAvailability } from "@/lib/atrybutyProduktu";
import { isPurchasable } from "@/lib/stanMagazynu";

const AVAILABILITY_DOT = {
  ready: "bg-emerald-600",
  fast: "bg-amber-500",
  made: "bg-ink/35",
} as const;

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
        fit="cover"
        className={
          hoverPreview
            ? "transition-opacity duration-500 group-hover:opacity-0"
            : undefined
        }
        sizes={sizes}
      />
      {hoverPreview && arrangement ? (
        <StoreImage
          src={arrangement}
          alt={`${name} — aranżacja`}
          fill
          fit="cover"
          className="pointer-events-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          sizes={sizes}
        />
      ) : null}
    </>
  );
}

export function ProductCard({
  product,
  variant = "shop",
  cta,
}: {
  product: Product;
  variant?: "editorial" | "shop";
  /** Przycisk pod ceną, np. „Zobacz warianty” — w sekcjach sprzedażowych. */
  cta?: string;
}) {
  const onSale = hasSalePrice(product);
  const availability = productAvailability(product);
  const purchasable = isPurchasable(product);
  const swatches = (product.colors ?? []).slice(0, 5);
  const moreSwatches = Math.max(0, (product.colors ?? []).length - swatches.length);
  const listPrice = startingPrice(product);
  const fromPrice =
    hasSizePriceRange(product) ||
    hasOptionPriceRange(product) ||
    hasColorPriceRange(product);
  const displayName = collapseRepeatedProductName(product.name);
  const arrangementSrc = arrangementPhotoUrl(product);
  const hoverPreview =
    Boolean(arrangementSrc) && arrangementSrc !== product.image;
  const badge = product.featured
    ? "Bestseller"
    : product.isNew
      ? "Nowość"
      : onSale
        ? "Promocja"
        : undefined;
  const installment = Math.max(1, Math.round(listPrice / 20));
  const showOmnibus =
    shouldShowOmnibusLowest(product) && product.lowestPrice30Days != null;

  return (
    <article className="group">
      <div className="relative">
        <Link
          href={`/produkt/${product.slug}`}
          className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#f4f4f4]"
        >
          <CardPhotoStack
            image={product.image}
            arrangement={arrangementSrc}
            hoverPreview={hoverPreview}
            name={displayName}
            sizes="(max-width: 1024px) 50vw, 25vw"
          />
        </Link>
        {badge && (
          <span className="absolute top-3 left-3 rounded-full border border-ink/80 bg-white px-2.5 py-1 text-[12px] leading-none font-medium text-ink">
            {badge}
          </span>
        )}
      </div>
      <div className="px-0.5 pt-3">
        <Link
          href={`/produkt/${product.slug}`}
          className="block text-[15px] leading-tight font-bold tracking-[0.04em] text-ink uppercase"
        >
          {displayName}
        </Link>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-ink">
            {product.description}
          </p>
        ) : null}
        <ProductAverageRating
          reviews={product.reviews}
          rating={product.rating}
          count={product.reviewCount}
          size={15}
          color="#f5c518"
          className="mt-2 flex flex-nowrap items-center gap-1.5 text-[13.5px] text-ink"
        />
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[26px] leading-none font-bold tracking-[-0.03em] text-ink">
            {fromPrice ? `od ${formatPrice(listPrice)}` : formatPrice(listPrice)}
          </span>
          {onSale && product.originalPrice ? (
            <span className="text-[15px] text-ink/75 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
        </div>
        {showOmnibus ? (
          <p className="mt-1 text-[12px] leading-snug text-ink/80">
            Najniższa cena z 30 dni przed obniżką {formatPrice(product.lowestPrice30Days!)}
          </p>
        ) : null}
        <p className="mt-1 text-[14px] font-semibold text-ink">
          {formatPrice(installment)} x 20 rat 0%
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] font-semibold text-ink">
          <span
            aria-hidden
            className={`h-2 w-2 shrink-0 rounded-full ${purchasable ? AVAILABILITY_DOT[availability.tone] : "bg-ink/20"}`}
          />
          {purchasable ? availability.label : "Chwilowo niedostępny"}
          {purchasable && availability.detail ? (
            <span className="font-normal text-meta">· {availability.detail}</span>
          ) : null}
        </p>
        {swatches.length > 1 ? (
          <ul className="mt-2.5 flex items-center gap-1.5" aria-label="Dostępne kolory">
            {swatches.map((color) => (
              <li
                key={color.id}
                title={color.name}
                className="h-4 w-4 rounded-full ring-1 ring-black/15"
                style={{ backgroundColor: color.hex }}
              />
            ))}
            {moreSwatches > 0 ? (
              <li className="text-[12px] text-meta">+{moreSwatches}</li>
            ) : null}
          </ul>
        ) : null}
        {cta ? (
          <Link
            href={`/produkt/${product.slug}`}
            className="mt-4 grid h-11 place-items-center rounded-full border border-ink text-[14.5px] font-semibold text-ink transition hover:bg-ink hover:text-white"
          >
            {cta}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
