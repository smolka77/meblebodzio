"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { isLocalUpload } from "@/lib/obrazy";
import { labelForCategory } from "@/lib/dane";
import {
  MAX_LOOK_HOTSPOTS,
  newLookHotspot,
  type HomepageLookHotspot,
} from "@/lib/stronaGlowna";
import type { Product } from "@/lib/typy";

function percentFromPoint(
  clientX: number,
  clientY: number,
  el: HTMLElement
): { x: number; y: number } {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return { x: 50, y: 50 };
  const x = ((clientX - rect.left) / rect.width) * 100;
  const y = ((clientY - rect.top) / rect.height) * 100;
  return {
    x: Math.round(Math.min(98, Math.max(2, x)) * 10) / 10,
    y: Math.round(Math.min(98, Math.max(2, y)) * 10) / 10,
  };
}

export function LookHotspotEditor({
  image,
  hotspots,
  products,
  onChange,
}: {
  image: string;
  hotspots: HomepageLookHotspot[];
  products: Product[];
  onChange: (hotspots: HomepageLookHotspot[]) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; moved: boolean } | null>(null);
  const skipClickRef = useRef(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    hotspots[0]?.id ?? null
  );

  const bySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products]
  );

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) =>
        a.name.localeCompare(b.name, "pl", { sensitivity: "base" })
      ),
    [products]
  );

  function updateSpot(id: string, patch: Partial<HomepageLookHotspot>) {
    onChange(hotspots.map((spot) => (spot.id === id ? { ...spot, ...patch } : spot)));
  }

  function addAt(x: number, y: number) {
    if (hotspots.length >= MAX_LOOK_HOTSPOTS) return;
    const spot = newLookHotspot(x, y);
    onChange([...hotspots, spot]);
    setSelectedId(spot.id);
  }

  function onCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    if (skipClickRef.current) {
      skipClickRef.current = false;
      return;
    }
    if (!canvasRef.current) return;
    const { x, y } = percentFromPoint(e.clientX, e.clientY, canvasRef.current);
    addAt(x, y);
  }

  function onBallPointerDown(
    e: React.PointerEvent<HTMLButtonElement>,
    id: string
  ) {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(id);
    dragRef.current = { id, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onBallPointerMove(
    e: React.PointerEvent<HTMLButtonElement>,
    id: string
  ) {
    const drag = dragRef.current;
    if (!drag || drag.id !== id || !canvasRef.current) return;
    if (e.buttons === 0) return;
    drag.moved = true;
    skipClickRef.current = true;
    const { x, y } = percentFromPoint(e.clientX, e.clientY, canvasRef.current);
    updateSpot(id, { x, y });
  }

  function onBallPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    e.stopPropagation();
    if (dragRef.current?.moved) skipClickRef.current = true;
    dragRef.current = null;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-sand uppercase">Kulki na zdjęciu</p>
        <p className="mt-1 text-xs leading-relaxed text-sand">
          Kliknij na zdjęciu, żeby dodać kulkę. Przeciągnij, żeby przesunąć.
          Pod każdą kulką wybierz produkt ze sklepu.
        </p>
      </div>

      {image ? (
        <div
          ref={canvasRef}
          onClick={onCanvasClick}
          className="relative aspect-[4/5] w-full max-w-md cursor-crosshair overflow-hidden rounded-xl border border-taupe/30 bg-cream-light select-none"
        >
          <Image
            src={image}
            alt="Aranżacja — ustaw kulki"
            fill
            className="pointer-events-none object-cover object-center"
            sizes="(max-width: 768px) 100vw, 448px"
            unoptimized={isLocalUpload(image)}
          />
          {hotspots.map((spot, index) => {
            const product = bySlug.get(spot.productSlug);
            const selected = selectedId === spot.id;
            return (
              <button
                key={spot.id}
                type="button"
                aria-label={
                  product
                    ? `Kulka ${index + 1}: ${product.name}`
                    : `Kulka ${index + 1}: wybierz produkt`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(spot.id);
                }}
                onPointerDown={(e) => onBallPointerDown(e, spot.id)}
                onPointerMove={(e) => onBallPointerMove(e, spot.id)}
                onPointerUp={onBallPointerUp}
                onPointerCancel={onBallPointerUp}
                className={`absolute z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full bg-white text-charcoal shadow-[0_8px_20px_-8px_rgba(17,17,17,0.45)] ring-2 transition-transform ${
                  selected
                    ? "z-20 scale-110 ring-terracotta"
                    : "ring-black/5 hover:scale-105"
                }`}
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                <span className="relative text-[12px] font-semibold leading-none">
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-taupe/40 bg-cream-light/50 px-4 py-6 text-center text-sm text-sand">
          Najpierw wrzuć zdjęcie aranżacji — wtedy ustawisz kulki.
        </p>
      )}

      {hotspots.length >= MAX_LOOK_HOTSPOTS && (
        <p className="text-xs text-sand">
          Limit to {MAX_LOOK_HOTSPOTS} kulek na jednym zdjęciu.
        </p>
      )}

      {hotspots.length === 0 && image ? (
        <p className="text-xs text-sand">
          Brak kulek. Kliknij na zdjęciu albo dodaj ręcznie.
        </p>
      ) : null}

      <ul className="space-y-3">
        {hotspots.map((spot, index) => {
          const product = bySlug.get(spot.productSlug);
          const selected = selectedId === spot.id;
          return (
            <li
              key={spot.id}
              className={`space-y-3 rounded-lg border p-4 ${
                selected ? "border-terracotta/50 bg-cream-light/40" : "border-taupe/30"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedId(spot.id)}
                  className="text-xs font-medium tracking-wide text-charcoal uppercase"
                >
                  Kulka {index + 1}
                  {product ? ` · ${product.name}` : " · bez produktu"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = hotspots.filter((item) => item.id !== spot.id);
                    onChange(next);
                    setSelectedId((current) =>
                      current === spot.id ? (next[0]?.id ?? null) : current
                    );
                  }}
                  className="p-1.5 text-sand hover:text-red-600"
                  aria-label={`Usuń kulkę ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Produkt</label>
                <select
                  value={spot.productSlug}
                  onChange={(e) => {
                    updateSpot(spot.id, { productSlug: e.target.value });
                    setSelectedId(spot.id);
                  }}
                  className="mt-1 w-full rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
                >
                  <option value="">Wybierz produkt…</option>
                  {sortedProducts.map((item) => (
                    <option key={item.id} value={item.slug}>
                      {item.name} · {labelForCategory(item.category)}
                      {!item.inStock ? " (brak na stanie)" : ""}
                    </option>
                  ))}
                </select>
                {spot.productSlug && !product && (
                  <p className="mt-1 text-xs text-red-600">
                    Ten produkt już nie istnieje w katalogu. Wybierz inny.
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        disabled={!image || hotspots.length >= MAX_LOOK_HOTSPOTS}
        onClick={() => addAt(50, 50)}
        className="inline-flex items-center gap-2 text-sm text-charcoal disabled:opacity-40"
      >
        <Plus className="h-4 w-4" /> Dodaj kulkę na środku
      </button>
    </div>
  );
}
