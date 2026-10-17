import type { Product } from "@/lib/typy";
import { listingMedia } from "@/lib/zdjeciaProduktu";

const COPY_SUFFIX = /\s*\(kopia(?:\s+\d+)?\)\s*$/i;

export function copyListingName(name: string): string {
  const trimmed = name.trim();
  const base = trimmed.replace(COPY_SUFFIX, "").trim() || trimmed;
  return `${base} (kopia)`;
}

/**
 * Nowe ogłoszenie z tej samej linii: opis, zdjęcia, tkaniny i warianty zostają.
 * Bez id/slug (nowy wpis), bez opinii i historii cen, od razu jako szkic.
 */
export function cloneProductListing(product: Product): Omit<Product, "id" | "slug"> {
  const cloned = structuredClone(product);
  const media = listingMedia(cloned);
  return {
    name: copyListingName(cloned.name),
    category: cloned.category,
    line: cloned.line,
    furnitureLineId: cloned.furnitureLineId,
    price: cloned.price,
    originalPrice: cloned.originalPrice,
    costNet: cloned.costNet,
    marginPercent: cloned.marginPercent,
    image: media.image,
    images: media.images,
    aspectRatio: cloned.aspectRatio,
    description: cloned.description,
    inStock: cloned.inStock,
    featured: false,
    isNew: cloned.isNew,
    readyToShip: cloned.readyToShip,
    outlet: cloned.outlet,
    manualPrice: cloned.manualPrice,
    stockQty: cloned.stockQty,
    shipping24h: cloned.shipping24h,
    shipsIn7Days: cloned.shipsIn7Days,
    templateId: cloned.templateId,
    kind: cloned.kind,
    productionTime: cloned.productionTime,
    deliveryEstimate: cloned.deliveryEstimate,
    deliveryCost: cloned.deliveryCost,
    manufacturer: cloned.manufacturer,
    colors: cloned.colors,
    sizes: cloned.sizes,
    options: cloned.options,
    suggestedMattressId: cloned.suggestedMattressId,
    details: cloned.details
      ? { ...cloned.details, productCode: "" }
      : cloned.details,
    manualUrl: cloned.manualUrl,
    packageCount: cloned.packageCount,
    reviews: [],
    draft: true,
    seoTitle: cloned.seoTitle,
    seoDescription: cloned.seoDescription,
  };
}
