"use client";

import type { ProductColor } from "@/lib/typy";
import { isVideoUrl } from "@/lib/obrazy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { getFabricSwatchSrc, getFabricSurcharge, getFabricWatermark, getColorShadeName } from "@/lib/infoTkanin";
import { formatPrice } from "@/lib/dane";
import { FabricWatermarkBadge } from "./ZnakWodnyTkaniny";
import { useLanguage } from "@/kontekst/KontekstJezyka";

function isLightHex(hex: string): boolean {
  const h = hex.toLowerCase();
  return h === "#f5f0eb" || h === "#e8e0d4" || h === "#d4c9b8" || h === "#e8e4dc";
}

export function ColorSwatchButton({
  color,
  selected,
  onSelect,
  size = "md",
  showLabel = false,
  showSurcharge = false,
  deselectLabel,
}: {
  color: ProductColor;
  selected: boolean;
  onSelect: () => void;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showSurcharge?: boolean;
  deselectLabel?: string;
}) {
  const swatch = getFabricSwatchSrc(color);
  const watermark = getFabricWatermark(color);
  const surcharge = getFabricSurcharge(color);
  const shadeName = getColorShadeName(color);
  const isLight = !swatch && isLightHex(color.hex);
  const dim =
    size === "sm"
      ? "h-10 w-10"
      : size === "lg"
        ? "h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
        : "h-12 w-12 sm:h-14 sm:w-14";

  return (
    <button
      type="button"
      title={shadeName}
      onClick={onSelect}
      className={`group flex shrink-0 flex-col items-center gap-1.5 ${showLabel ? "w-[4.75rem] sm:w-[5.25rem]" : ""}`}
      aria-label={selected && deselectLabel ? deselectLabel : shadeName}
      aria-pressed={selected}
    >
      <span
        className={`relative overflow-hidden rounded-lg transition-all duration-300 ${dim} ${
          selected
            ? "ring-2 ring-charcoal ring-offset-2 ring-offset-cream"
            : "ring-1 ring-taupe/50 hover:ring-charcoal/40"
        }`}
        style={swatch ? undefined : { backgroundColor: color.hex }}
      >
        {swatch &&
          (isVideoUrl(swatch) ? (
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
              alt={shadeName}
              fill
              className="object-cover"
              sizes="72px"
            />
          ))}
        {isLight && (
          <span className="absolute inset-0 ring-1 ring-inset ring-black/10" />
        )}
        <FabricWatermarkBadge src={watermark} size="sm" />
        {showLabel && (
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-charcoal/70 px-1 py-0.5 text-center text-[9px] font-semibold leading-tight text-cream">
            <span className="line-clamp-2">{shadeName}</span>
          </span>
        )}
      </span>
      {showLabel && (
        <span
          className={`max-w-full text-center text-[11px] leading-tight sm:text-xs ${
            selected ? "font-semibold text-charcoal" : "text-charcoal/70"
          }`}
        >
          <span className="line-clamp-2">{shadeName}</span>
        </span>
      )}
      {showSurcharge && surcharge > 0 && (
        <span className="text-[10px] font-semibold text-terracotta">
          +{formatPrice(surcharge)}
        </span>
      )}
    </button>
  );
}

export function ColorSwatchRow({
  colors,
  selected,
  onSelect,
  size = "md",
  showLabels = false,
  showSurcharges = false,
  scrollable = false,
  className = "",
}: {
  colors: ProductColor[];
  selected?: ProductColor;
  onSelect: (color: ProductColor) => void;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
  showSurcharges?: boolean;
  scrollable?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  return (
    <div
      className={`flex gap-2.5 ${
        scrollable
          ? "overflow-x-auto px-1.5 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          : "flex-wrap py-1"
      } ${className}`}
    >
      {colors.map((color) => {
        const isSelected = color.id === selected?.id;
        const shadeName = getColorShadeName(color);
        return (
          <ColorSwatchButton
            key={color.id}
            color={color}
            selected={isSelected}
            onSelect={() => onSelect(color)}
            size={size}
            showLabel={showLabels}
            showSurcharge={showSurcharges}
            deselectLabel={
              isSelected
                ? t("product.deselectColor", { name: shadeName })
                : undefined
            }
          />
        );
      })}
    </div>
  );
}
