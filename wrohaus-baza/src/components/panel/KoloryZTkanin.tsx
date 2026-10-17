"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { Fabric, FabricShade, ProductCategory, ProductColor } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { isLocalUpload, isVideoUrl } from "@/lib/obrazy";
import { FabricWatermarkBadge } from "@/components/sklep/ZnakWodnyTkaniny";
import {
  isFabricSelected,
  moveProductColor,
  toggleFabricInColors,
  toggleShadeInColors,
  getColorShadeName,
  colorHasDistinctShade,
  setColorSurcharge,
} from "@/lib/infoTkanin";
import {
  fabricShades,
  isShadeSelected,
  parentFabricId,
} from "@/lib/odcienieTkanin";
import { fabricsForProductPicker, fabricRoleForCategory } from "@/lib/rolaTkaniny";
import {
  panelHintClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

function FabricPreviewMedia({ fabric }: { fabric: Fabric }) {
  const src = fabric.video?.trim() || fabric.image?.trim();
  if (!src) {
    return (
      <div className="relative h-full w-full">
        <div
          className="h-full w-full"
          style={{ backgroundColor: fabric.colorHex || "#D4C9B8" }}
        />
        <FabricWatermarkBadge src={fabric.watermark} size="sm" />
      </div>
    );
  }
  return (
    <div className="relative h-full w-full">
      {fabric.video && isVideoUrl(fabric.video) ? (
        <video
          src={fabric.video}
          muted
          loop
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <Image
          src={fabric.image}
          alt={fabric.name}
          fill
          className="object-cover"
          sizes="240px"
          unoptimized={isLocalUpload(fabric.image)}
        />
      )}
      <FabricWatermarkBadge src={fabric.watermark} size="sm" />
    </div>
  );
}

function SelectedColorCard({
  color,
  fabric,
  index,
  total,
  onRemove,
  onMove,
  onSurcharge,
}: {
  color: ProductColor;
  fabric?: Fabric;
  index: number;
  total: number;
  onRemove: () => void;
  onMove: (dir: -1 | 1) => void;
  onSurcharge: (amount: number) => void;
}) {
  const fabricLabel = fabric?.name ?? color.fabricName ?? color.name;
  const shadeLabel = getColorShadeName(color);
  const showShade = colorHasDistinctShade(color);
  const swatch =
    (color.fabricImage && !isVideoUrl(color.fabricImage) && color.fabricImage) ||
    (fabric?.image && !isVideoUrl(fabric.image) && fabric.image) ||
    undefined;

  return (
    <div className="relative w-[148px] shrink-0 rounded-xl border border-charcoal/15 bg-white p-2 shadow-sm">
      {index === 0 && (
        <span className="absolute -top-2 left-2 z-10 rounded-full bg-charcoal px-2 py-0.5 text-[9px] font-semibold tracking-wide text-cream uppercase">
          Domyślny
        </span>
      )}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-cream-light">
        {swatch ? (
          <Image
            src={swatch}
            alt={shadeLabel}
            fill
            className="object-cover"
            sizes="140px"
            unoptimized={isLocalUpload(swatch)}
          />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: color.hex }} />
        )}
        <span className="absolute inset-x-0 bottom-0 bg-charcoal/75 px-2 py-1.5 text-center text-[11px] font-semibold leading-tight text-cream">
          {shadeLabel}
        </span>
      </div>
      <p className="mt-2 truncate text-xs font-semibold text-charcoal">
        {showShade ? shadeLabel : fabricLabel}
      </p>
      {showShade && (
        <p className="truncate text-[11px] text-charcoal/60">{fabricLabel}</p>
      )}
      <label className="mt-2 block">
        <span className="text-[10px] font-semibold tracking-wide text-charcoal/55 uppercase">
          Dopłata (zł)
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={color.fabricSurcharge ?? fabric?.surcharge ?? 0}
          onChange={(e) => onSurcharge(Number(e.target.value) || 0)}
          className="mt-1 w-full rounded-md border border-taupe/30 bg-white px-2 py-1.5 text-xs text-charcoal"
        />
      </label>
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-taupe/30 text-charcoal disabled:opacity-35"
          aria-label="Przesuń w lewo"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove(1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-taupe/30 text-charcoal disabled:opacity-35"
          aria-label="Przesuń w prawo"
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
          aria-label="Usuń"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

const CATEGORIES_WITHOUT_FABRIC = new Set<ProductCategory>([
  "materace",
  "oswietlenie",
  "stoliki",
]);

type ColorsPatch = ProductColor[] | ((prev: ProductColor[]) => ProductColor[]);

export function ProductFabricColorsField({
  fabrics,
  colors,
  onChange,
  category,
  initiallyWithoutFabrics = false,
  allowSkip = true,
}: {
  fabrics: Fabric[];
  colors: ProductColor[];
  onChange: (colors: ColorsPatch) => void;
  category?: ProductCategory;
  initiallyWithoutFabrics?: boolean;
  allowSkip?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [skipFabrics, setSkipFabrics] = useState(
    () =>
      allowSkip &&
      colors.length === 0 &&
      (initiallyWithoutFabrics ||
        (category != null && CATEGORIES_WITHOUT_FABRIC.has(category)))
  );

  useEffect(() => {
    if (!allowSkip) {
      setSkipFabrics(false);
      return;
    }
    if (colors.length > 0) {
      setSkipFabrics(false);
      return;
    }
    if (category && CATEGORIES_WITHOUT_FABRIC.has(category)) {
      setSkipFabrics(true);
      onChange([]);
    }
  }, [allowSkip, category]);

  const fabricById = useMemo(
    () => new Map(fabrics.map((fabric) => [fabric.id, fabric])),
    [fabrics]
  );

  const legacyColors = useMemo(
    () =>
      colors.filter((color) => {
        const fabricId = color.fabricId ?? parentFabricId(color.id);
        return !fabricById.has(fabricId);
      }),
    [colors, fabricById]
  );

  const filteredFabrics = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...fabricsForProductPicker(fabrics, category)].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return a.name.localeCompare(b.name, "pl");
    });
    if (!q) return list;
    return list.filter(
      (fabric) =>
        fabric.name.toLowerCase().includes(q) ||
        fabric.material.toLowerCase().includes(q)
    );
  }, [fabrics, query, category]);

  function patchColors(updater: (prev: ProductColor[]) => ProductColor[]) {
    onChange(updater);
  }

  function toggleFabric(fabric: Fabric) {
    if (skipFabrics) return;
    patchColors((prev) => toggleFabricInColors(prev, fabric));
  }

  function toggleShade(fabric: Fabric, shade: FabricShade) {
    if (skipFabrics) return;
    patchColors((prev) => toggleShadeInColors(prev, fabric, shade));
  }

  function setWithoutFabrics(skip: boolean) {
    setSkipFabrics(skip);
    if (skip) onChange([]);
  }

  function removeColor(color: ProductColor) {
    patchColors((prev) => prev.filter((item) => item.id !== color.id));
  }

  function moveColor(index: number, dir: -1 | 1) {
    patchColors((prev) => moveProductColor(prev, index, dir));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-taupe/25 bg-gradient-to-br from-cream via-white to-cream-light p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-charcoal">
              <Sparkles className="h-4 w-4 text-terracotta" />
              Kolory / tkaniny na stronie produktu
            </p>
            <p className={`mt-1 max-w-xl ${panelHintClass}`}>
              {fabricRoleForCategory(category) === "plyta"
                ? "Zaznacz kolory płyty z katalogu (Tkaniny i próbki → Kolor mebla). Nie trafią do katalogu próbek tkanin."
                : "Zaznacz tkaniny z katalogu. Przy każdej możesz ustawić dopłatę do ceny tego mebla. Potem przypisz zdjęcie mebla w kolorze — klient zobaczy je po kliknięciu próbki."}
            </p>
          </div>
          <Link
            href="/admin/tkaniny"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-xs font-semibold text-charcoal hover:bg-cream-light"
          >
            Katalog tkanin
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        {allowSkip && (
        <label className="mt-5 flex items-start gap-3 rounded-xl border border-taupe/30 bg-white/80 px-4 py-3">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={skipFabrics}
            onChange={(e) => setWithoutFabrics(e.target.checked)}
          />
          <span>
            <span className="text-sm font-semibold text-charcoal">
              Bez wyboru tkaniny
            </span>
            <span className={`mt-0.5 block ${panelMetaClass}`}>
              Zaznacz, jeśli produkt nie ma tapicerki — na stronie nie pokażemy
              kolorów. Pasuje do materacy, szaf, lampek.
            </span>
          </span>
        </label>
        )}

        <div className="mt-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={panelLabelClass}>
              Wybrane ({colors.length})
            </p>
            {colors.length > 0 && (
              <p className={panelMetaClass}>Pierwsza = domyślny kolor po wejściu na stronę</p>
            )}
          </div>

          {skipFabrics ? (
            <div className="rounded-xl border border-taupe/30 bg-white/70 px-4 py-6 text-center">
              <p className="text-sm font-semibold text-charcoal">
                Produkt bez wyboru tkaniny
              </p>
              <p className={`mt-1 ${panelMetaClass}`}>
                Na stronie nie będzie kolorów — klient od razu doda produkt do koszyka.
              </p>
            </div>
          ) : colors.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-taupe/35 bg-white/70 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-charcoal">Jeszcze nic nie wybrano</p>
              <p className={`mt-1 ${panelMetaClass}`}>
                Kliknij kafelki tkanin poniżej albo zaznacz „Bez wyboru tkaniny”.
              </p>
            </div>
          ) : (
            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
              {colors.map((color, index) => {
                const fabricId = color.fabricId ?? parentFabricId(color.id);
                const fabric = fabricById.get(fabricId);
                return (
                  <SelectedColorCard
                    key={color.id}
                    color={color}
                    fabric={fabric}
                    index={index}
                    total={colors.length}
                    onRemove={() => removeColor(color)}
                    onMove={(dir) => moveColor(index, dir)}
                    onSurcharge={(amount) =>
                      patchColors((prev) =>
                        prev.map((item) =>
                          item.id === color.id ? setColorSurcharge(item, amount) : item
                        )
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {!skipFabrics && legacyColors.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-charcoal">Stare kolory bez tkaniny z katalogu</p>
          <p className={`mt-1 ${panelMetaClass}`}>
            Usuń je i wybierz tkaniny z katalogu poniżej — tak działa nowy sposób przypisywania.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {legacyColors.map((color) => (
              <li
                key={color.id}
                className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-medium text-charcoal"
              >
                {color.name}
                <button
                  type="button"
                  onClick={() => removeColor(color)}
                  className="text-amber-800 hover:text-red-700"
                  aria-label={`Usuń ${color.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!skipFabrics && (
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={panelLabelClass}>Katalog tkanin</p>
            <p className={panelMetaClass}>
              Kliknij kafelek, żeby dodać lub usunąć tę tkaninę. Przy kilku odcieniach
              odhaczasz konkretny kolor — reszta zostaje na ogłoszeniu.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-charcoal/45" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Szukaj po nazwie lub materiale…"
              className="w-full rounded-lg border border-taupe/30 py-2.5 pr-3 pl-9 text-sm font-medium text-charcoal placeholder:text-charcoal/45 focus:border-charcoal focus:outline-none"
            />
          </div>
        </div>

        {fabrics.length === 0 ? (
          <div className="rounded-2xl border border-taupe/25 bg-white px-5 py-10 text-center">
            <p className="text-sm font-semibold text-charcoal">Katalog tkanin jest pusty</p>
            <p className={`mt-2 ${panelHintClass}`}>
              Najpierw dodaj tkaniny w panelu — potem wróć tutaj i je zaznacz.
            </p>
            <Link
              href="/admin/tkaniny"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm font-semibold text-cream hover:bg-charcoal/90"
            >
              Otwórz katalog tkanin
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        ) : filteredFabrics.length === 0 ? (
          <p className={`rounded-xl border border-taupe/25 bg-white px-4 py-6 text-center ${panelMetaClass}`}>
            Brak wyników dla „{query.trim()}”.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredFabrics.map((fabric) => {
              const shades = fabricShades(fabric);
              const multiShade = shades.length > 1;
              const selected = isFabricSelected(colors, fabric.id);
              return (
                <li key={fabric.id}>
                  <div
                    className={`overflow-hidden rounded-2xl border-2 bg-white transition-all ${
                      selected
                        ? "border-charcoal shadow-[0_12px_28px_-18px_rgba(17,17,17,0.35)] ring-2 ring-charcoal/10"
                        : "border-taupe/25 hover:border-charcoal/35 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFabric(fabric)}
                      className="group relative w-full text-left"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-cream-light">
                        <FabricPreviewMedia fabric={fabric} />
                        <div
                          className={`absolute inset-0 transition-colors ${
                            selected ? "bg-charcoal/10" : "bg-charcoal/0 group-hover:bg-charcoal/5"
                          }`}
                        />
                        <span
                          className={`absolute top-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-all ${
                            selected
                              ? "border-charcoal bg-charcoal text-cream scale-100"
                              : "border-white/90 bg-white/90 text-transparent scale-95 group-hover:scale-100"
                          }`}
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        {!fabric.active && (
                          <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-charcoal/70 uppercase">
                            Nieaktywna
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 p-3 pb-0">
                        <p className="truncate text-sm font-semibold text-charcoal">{fabric.name}</p>
                        <p className="truncate text-xs font-medium text-charcoal/70">{fabric.material}</p>
                        {fabric.surcharge != null && fabric.surcharge > 0 && (
                          <p className="text-[11px] font-semibold text-terracotta">
                            +{formatPrice(fabric.surcharge)}
                          </p>
                        )}
                      </div>
                    </button>
                    <div className="p-3 pt-2">
                      {multiShade ? (
                        <div className="flex flex-wrap gap-1">
                          {shades.slice(0, 8).map((shade) => {
                            const shadeOn = isShadeSelected(colors, fabric, shade);
                            return (
                              <button
                                key={shade.id}
                                type="button"
                                onClick={() => toggleShade(fabric, shade)}
                                className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                                  shadeOn
                                    ? "bg-charcoal text-cream"
                                    : "bg-cream-light text-charcoal hover:bg-charcoal/10"
                                }`}
                                title={
                                  shadeOn
                                    ? `Usuń odcień ${shade.name || shade.hex}`
                                    : `Dodaj odcień ${shade.name || shade.hex}`
                                }
                              >
                                <span
                                  className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40"
                                  style={{ backgroundColor: shade.hex }}
                                />
                                {shade.name || shade.hex}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span
                          className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-charcoal/15"
                          style={{ backgroundColor: fabric.colorHex || "#D4C9B8" }}
                          title={fabric.colorHex}
                        />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      )}
    </div>
  );
}
