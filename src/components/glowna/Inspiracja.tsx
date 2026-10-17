"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { HomepageLook } from "@/lib/stronaGlowna";
import { formatPrice } from "@/lib/dane";
import { isLocalUpload } from "@/lib/obrazy";
import { formatDiscountPercent, hasSalePrice } from "@/lib/ceny";

export type LookHotspot = {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  x: number;
  y: number;
};

const LOOK_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85";

function canHover() {
  return window.matchMedia("(hover: hover)").matches;
}

export function HomeInspirationLook({
  hotspots,
  content,
}: {
  hotspots: LookHotspot[];
  content: HomepageLook;
}) {
  const [active, setActive] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const activeSpot = hotspots.find((spot) => spot.id === active) ?? null;

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setActive(null);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <section className="overflow-x-hidden py-10 sm:py-12 lg:py-16">
      <div className="mx-auto grid max-w-[80rem] lg:grid-cols-2 lg:items-stretch lg:gap-14 lg:px-8">
        <div className="px-4 sm:px-6 lg:flex lg:flex-col lg:px-0 lg:py-1">
          <div>
            <p className="section-kicker text-terracotta">{content.eyebrow}</p>
            <h2 className="mt-2 font-serif text-[1.75rem] leading-[1.15] text-charcoal sm:text-4xl lg:text-[2.75rem]">
              {content.title}
            </h2>
            <p className="mt-3 max-w-lg text-[15px] leading-[1.7] text-charcoal/75 sm:mt-4 sm:leading-[1.8]">
              {content.intro}
            </p>
            {content.intro2 && (
              <p className="mt-3 hidden max-w-lg text-[15px] leading-[1.8] text-charcoal/75 sm:block">
                {content.intro2}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 px-4 sm:mt-8 sm:px-6 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:px-0">
        <div
          ref={wrapRef}
          className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl lg:aspect-[4/5]"
        >
          <div className="absolute inset-0 bg-cream-light">
            <Image
              src={content.image || LOOK_IMAGE_FALLBACK}
              alt={`${content.title} — aranżacja salonu Wrohaus`}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized={isLocalUpload(content.image || LOOK_IMAGE_FALLBACK)}
            />
          </div>

          {hotspots.map((spot) => (
            <HotspotMarker
              key={spot.id}
              spot={spot}
              active={active === spot.id}
              onActivate={() => setActive(spot.id)}
              onDeactivate={() =>
                setActive((current) => (current === spot.id ? null : current))
              }
            />
          ))}

          {activeSpot && (
            <Link
              href={`/produkt/${activeSpot.slug}`}
              className="absolute inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-2xl bg-white/95 p-2.5 shadow-[0_16px_40px_-16px_rgba(17,17,17,0.45)] ring-1 ring-black/5 backdrop-blur-sm lg:hidden"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-light">
                <Image
                  src={activeSpot.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                  unoptimized={isLocalUpload(activeSpot.image)}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-[16px] text-charcoal">
                  {activeSpot.name}
                </p>
                <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-charcoal">
                  {formatPrice(activeSpot.price)}
                  {hasSalePrice(activeSpot) && activeSpot.originalPrice && (
                    <>
                      <span className="text-xs font-normal text-sand line-through">
                        {formatPrice(activeSpot.originalPrice)}
                      </span>
                      <span className="text-[11px] font-semibold text-terracotta">
                        {formatDiscountPercent(
                          activeSpot.price,
                          activeSpot.originalPrice
                        )}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <span className="rounded-full bg-cream-light px-3 py-1.5 text-[11px] font-semibold text-charcoal">
                Zobacz
              </span>
            </Link>
          )}
        </div>
        </div>

        <div className="px-4 pt-6 sm:px-6 lg:col-start-1 lg:row-start-2 lg:flex lg:flex-col lg:px-0 lg:pt-0">
          {hotspots.length > 0 && (
            <div>
              <p className="text-[15px] font-semibold text-charcoal lg:mt-7">
                {content.listLabel}
              </p>
              <ul className="mt-3 flex flex-col gap-2.5 sm:gap-3">
                {hotspots.map((spot) => {
                  const onSale = hasSalePrice(spot);
                  const isActive = active === spot.id;
                  return (
                    <li key={spot.id}>
                      <Link
                        href={`/produkt/${spot.slug}`}
                        onMouseEnter={() => setActive(spot.id)}
                        onMouseLeave={() => {
                          if (canHover()) setActive(null);
                        }}
                        className={`flex min-h-[4.75rem] items-center gap-3 rounded-2xl bg-white p-2.5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] ring-1 transition-all sm:min-h-0 sm:gap-4 sm:p-3 ${
                          isActive
                            ? "ring-terracotta"
                            : "ring-transparent hover:ring-terracotta/50"
                        }`}
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-light sm:h-20 sm:w-20">
                          <Image
                            src={spot.image}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                            unoptimized={isLocalUpload(spot.image)}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-[17px] leading-snug text-charcoal sm:truncate sm:text-lg">
                            {spot.name}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[15px] font-semibold text-charcoal">
                            {formatPrice(spot.price)}
                            {onSale && spot.originalPrice && (
                              <span className="text-sm font-normal text-sand line-through">
                                {formatPrice(spot.originalPrice)}
                              </span>
                            )}
                            {onSale && spot.originalPrice && (
                              <span className="text-[12px] font-semibold text-terracotta">
                                {formatDiscountPercent(
                                  spot.price,
                                  spot.originalPrice
                                )}
                              </span>
                            )}
                          </p>
                        </div>
                        <span className="hidden rounded-full bg-cream-light px-3 py-1.5 text-[12px] font-semibold text-charcoal sm:inline">
                          Zobacz
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <Link
            href={content.ctaHref}
            className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center rounded-full bg-charcoal px-7 text-[15px] font-semibold text-cream transition-colors hover:bg-charcoal/85 sm:w-fit lg:mt-8"
          >
            {content.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function HotspotMarker({
  spot,
  active,
  onActivate,
  onDeactivate,
}: {
  spot: LookHotspot;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  const openLeft = spot.x >= 55;
  const openUp = spot.y > 58;
  const onSale = hasSalePrice(spot);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!canHover() && !active) {
      e.preventDefault();
      onActivate();
    }
  }

  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 ${active ? "z-20" : "z-10"}`}
      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
      onMouseEnter={() => {
        if (canHover()) onActivate();
      }}
      onMouseLeave={() => {
        if (canHover()) onDeactivate();
      }}
    >
      <Link
        href={`/produkt/${spot.slug}`}
        onClick={handleClick}
        aria-label={`${spot.name}, ${formatPrice(spot.price)}`}
        className="relative flex h-11 w-11 touch-manipulation items-center justify-center rounded-full bg-white text-charcoal shadow-[0_8px_20px_-8px_rgba(17,17,17,0.45)] ring-1 ring-black/5 transition-transform hover:scale-105 lg:h-10 lg:w-10"
      >
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-white/70 [animation-duration:2.4s]" />
        <Plus className="relative h-4 w-4" strokeWidth={2} />
      </Link>

      <Link
        href={`/produkt/${spot.slug}`}
        className={`absolute z-20 hidden w-[220px] rounded-2xl border border-taupe/20 bg-white p-2.5 shadow-[0_18px_40px_-18px_rgba(17,17,17,0.35)] transition-all lg:block ${
          openLeft ? "right-0" : "left-0"
        } ${openUp ? "bottom-[calc(100%+12px)]" : "top-[calc(100%+12px)]"} ${
          active
            ? "visible translate-y-0 opacity-100"
            : "invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-light">
            <Image
              src={spot.image}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
              unoptimized={isLocalUpload(spot.image)}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-charcoal">
              {spot.name}
            </p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-sm font-semibold text-charcoal">
              {formatPrice(spot.price)}
              {onSale && spot.originalPrice && (
                <span className="text-xs font-normal text-sand line-through">
                  {formatPrice(spot.originalPrice)}
                </span>
              )}
            </p>
            {onSale && spot.originalPrice && (
              <p className="text-[11px] font-medium text-terracotta">
                {formatDiscountPercent(spot.price, spot.originalPrice)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
