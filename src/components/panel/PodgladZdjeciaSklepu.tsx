"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ImageIcon,
  Minus,
  Monitor,
  Plus,
  ShoppingBag,
  Smartphone,
} from "lucide-react";
import type { ProductAspectRatio, ProductColor, ProductLine } from "@/lib/typy";
import { productAspectClass } from "@/lib/zdjeciaProduktu";
import { formatPrice } from "@/lib/dane";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { FormattedProductDescription } from "@/lib/atutyOpisu";
import { lineLabels, resolveProductLine } from "@/lib/linieProduktow";

export interface ProductPagePreviewContext {
  name?: string;
  price?: number;
  productCode?: string;
  colors?: Pick<ProductColor, "name" | "hex">[];
  line?: ProductLine;
  isNew?: boolean;
  categoryLabel?: string;
  aspectRatio?: ProductAspectRatio;
  description?: string;
}

type PreviewDevice = "desktop" | "mobile";

function DeviceToggle({
  value,
  onChange,
}: {
  value: PreviewDevice;
  onChange: (value: PreviewDevice) => void;
}) {
  return (
    <div
      className="flex shrink-0 rounded-lg border border-taupe/25 bg-cream-light p-0.5"
      role="tablist"
      aria-label="Widok urządzenia"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === "desktop"}
        onClick={() => onChange("desktop")}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-[11px] ${
          value === "desktop"
            ? "bg-white text-charcoal shadow-sm"
            : "text-charcoal/55 hover:text-charcoal"
        }`}
      >
        <Monitor className="h-3.5 w-3.5" strokeWidth={1.75} />
        Komputer
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={value === "mobile"}
        onClick={() => onChange("mobile")}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-[11px] ${
          value === "mobile"
            ? "bg-white text-charcoal shadow-sm"
            : "text-charcoal/55 hover:text-charcoal"
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" strokeWidth={1.75} />
        Telefon
      </button>
    </div>
  );
}

function ProductPreviewDetails({
  context,
  name,
  line,
  priceLabel,
  colors,
  displayColors,
  mobile,
}: {
  context: ProductPagePreviewContext;
  name: string;
  line: ProductLine;
  priceLabel: string;
  colors: Pick<ProductColor, "name" | "hex">[];
  displayColors: Pick<ProductColor, "name" | "hex">[];
  mobile?: boolean;
}) {
  return (
    <div className="pointer-events-none min-w-0 select-none">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {context.isNew && (
          <span className="rounded-full bg-[#5c6b4a] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-cream uppercase">
            Nowość
          </span>
        )}
        <span className="rounded-full bg-[#a8957a] px-2 py-0.5 text-[9px] font-semibold tracking-wide text-cream uppercase">
          {lineLabels[line]}
        </span>
      </div>

      <h3
        className={`font-semibold leading-tight text-charcoal ${
          mobile ? "text-[15px]" : "truncate text-base sm:text-lg"
        }`}
      >
        {name}
      </h3>
      {context.productCode?.trim() && (
        <p className="mt-1 truncate text-[10px] font-medium text-charcoal/80">
          ID produktu — {context.productCode.trim()}
        </p>
      )}

      <p className={`mt-2 font-semibold text-charcoal ${mobile ? "text-xl" : "text-xl sm:text-2xl"}`}>
        {priceLabel}
      </p>

      {colors.length > 0 ? (
      <div className="mt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-charcoal">Kolor / tkanina</p>
          <p className="truncate text-[10px] text-charcoal">
            {colors[0]?.name ?? "Wybrany kolor"}
          </p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {displayColors.map((color, i) => (
            <span
              key={`${color.name}-${i}`}
              className={`rounded-lg ring-1 ring-taupe/50 ${
                mobile ? "h-9 w-9" : "h-8 w-8 sm:h-9 sm:w-9"
              } ${i === 0 ? "ring-2 ring-charcoal ring-offset-1" : ""}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-9 items-center rounded-full border border-taupe/40 bg-white">
          <span className="flex h-9 w-8 items-center justify-center text-charcoal">
            <Minus className="h-3 w-3" />
          </span>
          <span className="min-w-[1.25rem] text-center text-[11px] font-medium">1</span>
          <span className="flex h-9 w-8 items-center justify-center text-charcoal">
            <Plus className="h-3 w-3" />
          </span>
        </div>
        <span className="h-9 flex-1 rounded-full bg-charcoal text-center text-[10px] font-semibold leading-9 text-cream">
          Dodaj do koszyka
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-taupe/40 bg-white">
          <Heart className="h-3.5 w-3.5 text-charcoal" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-3 space-y-0 border-t border-taupe/20">
        {["Przewidywana data dostawy", "Koszty i opcje dostawy", "Zwrot"].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between border-b border-taupe/20 py-2"
          >
            <span className="truncate text-[10px] font-medium text-charcoal">{row}</span>
            <ChevronRight className="h-3 w-3 shrink-0 rotate-90 text-charcoal/40" />
          </div>
        ))}
      </div>
      <ProductPreviewDescription text={context.description} />
    </div>
  );
}

function ProductPreviewDescription({ text }: { text?: string }) {
  const value = text?.trim();
  if (!value) return null;
  return (
    <div className="mt-4 border-t border-taupe/20 pt-3">
      <p className="text-[11px] font-semibold text-charcoal">Opis</p>
      <div className="mt-2 [&_p]:text-[11px] [&_p]:leading-relaxed [&_li]:text-[11px]">
        <FormattedProductDescription text={value} />
      </div>
    </div>
  );
}

function ProductPreviewGallery({
  images,
  activeIndex,
  onActiveIndexChange,
  name,
  hasImage,
  currentSrc,
  canNavigate,
  showThumbnails,
  go,
  aspectRatio,
}: {
  images: string[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
  name: string;
  hasImage: boolean;
  currentSrc: string;
  canNavigate: boolean;
  showThumbnails: boolean;
  go: (dir: number) => void;
  aspectRatio?: ProductAspectRatio;
}) {
  const slideCount = images.length;

  return (
    <div className="min-w-0">
      <div
        className={`relative overflow-hidden rounded-2xl bg-cream-light ${productAspectClass(aspectRatio)}`}
      >
        {hasImage ? (
          <StoreImage
            src={currentSrc}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 320px"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 font-medium text-charcoal/60">
            <ImageIcon className="h-10 w-10 opacity-35" strokeWidth={1.25} />
            <span className="px-4 text-center text-xs">Dodaj zdjęcie produktu</span>
          </div>
        )}

        {canNavigate && hasImage && (
          <>
            <button
              type="button"
              aria-label="Poprzednie zdjęcie"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Następne zdjęcie"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-charcoal/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-2 z-10 flex items-center justify-center gap-1">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Zdjęcie ${i + 1}`}
                  onClick={() => onActiveIndexChange?.(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-5 bg-cream" : "w-1.5 bg-white/75"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {showThumbnails && slideCount > 1 && hasImage && (
        <div className="mt-2 flex justify-center gap-1.5">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => onActiveIndexChange?.(i)}
              className={`relative h-10 w-10 overflow-hidden rounded-lg bg-cream-light sm:h-11 sm:w-11 ${
                i === activeIndex
                  ? "ring-2 ring-charcoal ring-offset-1"
                  : "ring-1 ring-taupe/40"
              }`}
            >
              <StoreImage
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductPageMockPreview({
  images,
  activeIndex,
  onActiveIndexChange,
  context = {},
  loading = false,
}: {
  images: string[];
  activeIndex: number;
  onActiveIndexChange?: (index: number) => void;
  context?: ProductPagePreviewContext;
  loading?: boolean;
}) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const currentSrc = images[activeIndex] ?? images[0];
  const hasImage = Boolean(currentSrc?.trim());
  const slideCount = images.length;
  const canNavigate = slideCount > 1 && Boolean(onActiveIndexChange);
  const isMobile = device === "mobile";

  const name = context.name?.trim() || "Nazwa produktu";
  const category = context.categoryLabel?.trim() || "Kategoria";
  const line = resolveProductLine({
    line: context.line,
    price: context.price ?? 0,
  });
  const priceLabel =
    context.price && context.price > 0 ? formatPrice(context.price) : "— zł";
  const colors = context.colors?.filter((color) => color.hex?.trim()) ?? [];
  const displayColors = colors.slice(0, 5);

  function go(dir: number) {
    if (!canNavigate || !onActiveIndexChange) return;
    const next = (activeIndex + dir + slideCount) % slideCount;
    onActiveIndexChange(next);
  }

  const gallery = (
    <ProductPreviewGallery
      images={images}
      activeIndex={activeIndex}
      onActiveIndexChange={onActiveIndexChange}
      name={name}
      hasImage={hasImage}
      currentSrc={currentSrc}
      canNavigate={canNavigate}
      showThumbnails={!isMobile}
      go={go}
      aspectRatio={context.aspectRatio}
    />
  );

  const details = (
    <ProductPreviewDetails
      context={context}
      name={name}
      line={line}
      priceLabel={priceLabel}
      colors={colors}
      displayColors={displayColors}
      mobile={isMobile}
    />
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-taupe/25 bg-[#f7f4ef] shadow-[0_12px_40px_-24px_rgba(17,17,17,0.25)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-taupe/20 bg-white/90 px-3 py-2 sm:px-4">
        <ShoppingBag className="h-4 w-4 shrink-0 text-terracotta" strokeWidth={1.75} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-charcoal">
            Podgląd strony produktu
          </p>
          <p className="truncate text-[10px] text-sand">
            {isMobile ? "Widok telefonu" : "Widok komputera"} · tak widzi klient
          </p>
        </div>
        <DeviceToggle value={device} onChange={setDevice} />
        <span className="hidden shrink-0 rounded-full bg-cream-light px-2 py-0.5 text-[9px] font-semibold tracking-wide text-charcoal/70 uppercase ring-1 ring-taupe/25 sm:inline">
          Live demo
        </span>
      </div>

      <div className="p-3 sm:p-4">
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl bg-cream-light/60 text-sm font-medium text-charcoal/75">
            Wgrywanie zdjęcia…
          </div>
        ) : isMobile ? (
          <div className="mx-auto max-w-[340px]">
            <div className="rounded-[1.75rem] border-[3px] border-charcoal/85 bg-charcoal/85 p-2 shadow-[0_20px_50px_-20px_rgba(17,17,17,0.45)]">
              <div className="flex justify-center pb-1.5 pt-0.5">
                <span className="h-1 w-14 rounded-full bg-white/25" />
              </div>
              <div className="overflow-hidden rounded-[1.35rem] bg-[#f7f4ef]">
                <div className="max-h-[520px] overflow-y-auto px-3 py-3">
                  <p className="mb-3 truncate text-[9px] font-medium text-charcoal/75">
                    Strona główna / {category} / {name}
                  </p>
                  <div className="space-y-4">
                    {gallery}
                    {details}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[10px] font-medium text-charcoal/75">
              Na telefonie miniatury pod galerią są ukryte — tylko kropki i strzałki.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 truncate text-[10px] font-medium text-charcoal/75">
              Strona główna / {category} / {name}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] sm:items-start">
              {gallery}
              {details}
            </div>
          </>
        )}

        {!hasImage && !loading && (
          <p className="mt-3 text-center text-xs font-medium leading-relaxed text-charcoal/80">
            Uzupełnij nazwę i cenę w formularzu — podgląd od razu pokaże stronę produktu.
          </p>
        )}
      </div>
    </div>
  );
}

export function StorefrontImagePreviewPanel({
  src,
  loading = false,
  context,
}: {
  src?: string;
  alt?: string;
  compact?: boolean;
  loading?: boolean;
  context?: ProductPagePreviewContext;
}) {
  const images = src?.trim() ? [src] : [];
  return (
    <ProductPageMockPreview
      images={images}
      activeIndex={0}
      context={context}
      loading={loading}
    />
  );
}
