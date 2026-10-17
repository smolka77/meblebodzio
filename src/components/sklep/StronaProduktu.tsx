"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product, ProductColor } from "@/lib/typy";
import { ProductGallery } from "@/components/sklep/GaleriaProduktu";
import { ProductDetail } from "@/components/sklep/SzczegolyProduktu";
import { ProductRichContent } from "@/components/sklep/OpisProduktu";
import { ProductReviewsSection } from "@/components/sklep/OpinieProduktu";
import { CompleteTheSet } from "@/components/sklep/DobierzDoZestawu";
import { defaultSize, productSizes } from "@/lib/rozmiary";
import {
  defaultOptionSelection,
  galleryMirrorsForSide,
  type OptionSelection,
} from "@/lib/opcjeProduktu";

export function ProductPageClient({
  product,
  suggestedMattress,
  lineSet,
}: {
  product: Product;
  suggestedMattress?: Product;
  lineSet?: {
    name: string;
    slug: string;
    products: Product[];
  };
}) {
  const searchParams = useSearchParams();
  const colors = product.colors ?? [];
  const fromQuery = colors.find(
    (color) => color.id === searchParams.get("kolor")
  );
  const sizes = productSizes(product);
  const [selectedColor, setSelectedColor] = useState<ProductColor | undefined>(
    fromQuery
  );
  const [colorGalleryOn, setColorGalleryOn] = useState(Boolean(fromQuery));
  const fromSize = sizes.find((size) => size.id === searchParams.get("rozmiar"));
  const [selectedSize, setSelectedSize] = useState(
    fromSize ?? defaultSize(product)
  );
  const [selectedOptions, setSelectedOptions] = useState<OptionSelection>(() =>
    defaultOptionSelection(product)
  );

  function pickColor(color: ProductColor) {
    setSelectedColor(color);
    setColorGalleryOn(true);
  }

  function clearColor() {
    setSelectedColor(undefined);
    setColorGalleryOn(false);
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-12">
        <ProductGallery
          product={product}
          selectedColor={selectedColor}
          showColorPhotos={colorGalleryOn}
          mirror={galleryMirrorsForSide(product, selectedOptions)}
        />
        <ProductDetail
          product={product}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedOptions={selectedOptions}
          onColorChange={pickColor}
          onColorClear={clearColor}
          onSizeChange={setSelectedSize}
          onOptionChange={(optionId, valueId) =>
            setSelectedOptions((prev) => ({ ...prev, [optionId]: valueId }))
          }
        />
      </div>
      <div className="mt-10 space-y-3 pb-8">
        <CompleteTheSet
          products={lineSet?.products ?? []}
          lineName={lineSet?.name || undefined}
          lineHref={lineSet?.slug ? `/linie/${lineSet.slug}` : undefined}
        />
        <ProductRichContent
          product={product}
          details={product.details}
          selectedSize={selectedSize}
          suggestedMattress={suggestedMattress}
        />
      </div>
      <ProductReviewsSection reviews={product.reviews ?? []} />
    </>
  );
}
