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
}: {
  product: Product;
  variant?: "editorial" | "shop";
}) {
  const onSale = hasSalePrice(product);
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
      </div>
    </article>
  );
}
