"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import type { Product, ProductColor } from "@/lib/typy";
import { productDimsCm } from "@/lib/atrybutyProduktu";
import { getProductColorImage } from "@/lib/zdjeciaProduktu";
import * as I from "@/components/wzor/ikony";

const PodgladWPokoju = dynamic(
  () => import("./PodgladWPokoju").then((module) => module.PodgladWPokoju),
  { ssr: false }
);

/** Przycisk „Zobacz w swoim pokoju” - otwiera podgląd na zdjęciu pokoju klienta. */
export function PreviewInRoomButton({
  product,
  color,
}: {
  product: Product;
  color?: ProductColor;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Wycinanie tła działa na zdjęciach z tej samej domeny (bez ograniczeń CORS).
  const sources = [color ? getProductColorImage(color, product.image) : "", product.image]
    .filter((src, index, all) => src && src.startsWith("/") && all.indexOf(src) === index);
  if (sources.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-charcoal/70 bg-white text-[14.5px] font-semibold text-charcoal transition hover:bg-charcoal hover:text-cream"
      >
        <I.Camera className="h-5 w-5" />
        Zobacz w swoim pokoju
        <span className="rounded bg-terracotta px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
          AR
        </span>
      </button>
      {open ? (
        <PodgladWPokoju
          name={product.name}
          slug={product.slug}
          sources={sources}
          widthCm={productDimsCm(product).width}
          onClose={close}
        />
      ) : null}
    </>
  );
}
