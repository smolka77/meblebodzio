import type { Fabric, Product, ProductColor } from "./typy";
import {
  colorBelongsToFabric,
  expandFabricToProductColors,
  fabricShades,
  fabricStillSrc,
  fabricVideoSrc,
  isFabricSelected as isFabricShadeSelected,
  isShadeSelected,
  isStillImageSrc,
  productColorFromShade,
  resolveFabricShade,
  shadeStillSrc,
} from "./odcienieTkanin";
import { isVideoUrl } from "./obrazy";

function normalizeFabricSurcharge(value: unknown): number | undefined {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return Math.round(amount);
}

export function getFabricSurcharge(color?: ProductColor | null): number {
  if (!color) return 0;
  return normalizeFabricSurcharge(color.fabricSurcharge) ?? 0;
}

export function setColorSurcharge(color: ProductColor, amount: unknown): ProductColor {
  const surcharge = Math.max(0, Math.round(Number(amount) || 0));
  return { ...color, fabricSurcharge: surcharge > 0 ? surcharge : 0 };
}

export function minColorSurcharge(product: Pick<Product, "colors">): number {
  const colors = product.colors ?? [];
  if (!colors.length) return 0;
  return Math.min(...colors.map((color) => getFabricSurcharge(color)));
}

export function hasColorPriceRange(product: Pick<Product, "colors">): boolean {
  const extras = (product.colors ?? []).map((color) => getFabricSurcharge(color));
  if (extras.length < 2) return false;
  return Math.min(...extras) !== Math.max(...extras);
}

export function emptyCover(): ProductColor {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `cover-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    name: "",
    hex: "#E8E0D4",
    fabricSurcharge: 0,
  };
}

export function snapshotFabricOntoColor(
  color: ProductColor,
  fabric: Fabric
): ProductColor {
  const still = fabricStillSrc(fabric);
  const video = fabricVideoSrc(fabric);
  return {
    ...color,
    fabricId: fabric.id,
    hex: fabric.colorHex?.trim() || color.hex,
    name:
      !color.name.trim() || color.name === "Nowy kolor"
        ? fabric.name
        : color.name,
    fabricName: fabric.name,
    fabricMaterial: fabric.material?.trim() || undefined,
    fabricImage: still,
    fabricMedia: still ?? video,
    fabricWatermark: fabric.watermark?.trim() || undefined,
    fabricSpecs: fabric.specs?.trim() || undefined,
    fabricAbout: fabric.description?.trim() || undefined,
    fabricCare: fabric.care?.trim() || undefined,
    fabricSurcharge: normalizeFabricSurcharge(fabric.surcharge),
  };
}

export function detachFabricFromColor(color: ProductColor): ProductColor {
  return {
    ...color,
    fabricId: undefined,
    fabricName: undefined,
    fabricMaterial: undefined,
    fabricImage: undefined,
    fabricMedia: undefined,
    fabricWatermark: undefined,
    fabricSpecs: undefined,
    fabricAbout: undefined,
    fabricCare: undefined,
    fabricSurcharge: undefined,
  };
}

/** Live catalog fields on the storefront — keeps the product's own name/hex. */
export function mergeLiveFabric(
  color: ProductColor,
  fabric: Fabric | undefined
): ProductColor {
  if (!fabric) return color;
  const shade = resolveFabricShade(color, fabric);
  const liveStill = shadeStillSrc(fabric, shade);
  const storedStill = isStillImageSrc(color.fabricImage)
    ? color.fabricImage!.trim()
    : undefined;
  const still = liveStill || storedStill;
  const video = fabricVideoSrc(fabric);
  return {
    ...color,
    fabricId: fabric.id,
    fabricName: fabric.name,
    fabricMaterial: fabric.material?.trim() || undefined,
    fabricImage: still,
    fabricMedia: still ?? video,
    fabricWatermark: fabric.watermark?.trim() || undefined,
    fabricSpecs: fabric.specs?.trim() || undefined,
    fabricAbout: fabric.description?.trim() || undefined,
    fabricCare: fabric.care?.trim() || undefined,
    fabricSurcharge:
      color.fabricSurcharge != null
        ? color.fabricSurcharge > 0
          ? Math.round(color.fabricSurcharge)
          : 0
        : normalizeFabricSurcharge(fabric.surcharge),
  };
}

function firstStillSrc(...candidates: (string | undefined)[]): string | undefined {
  for (const raw of candidates) {
    const src = raw?.trim();
    if (src && !isVideoUrl(src)) return src;
  }
  return undefined;
}

export function getFabricMedia(product: Product, color: ProductColor): string {
  return (
    firstStillSrc(
      color.fabricImage,
      color.image,
      ...(color.images ?? []),
      color.fabricMedia
    ) ||
    color.fabricMedia?.trim() ||
    color.fabricImage?.trim() ||
    color.image?.trim() ||
    product.image
  );
}

/** Close-up in the overlay — shade photo first; fabric video only when this color has no still. */
export function getFabricCloseupSrc(color: ProductColor): string | undefined {
  return (
    firstStillSrc(color.fabricImage, color.fabricMedia) ||
    color.fabricMedia?.trim() ||
    color.fabricImage?.trim() ||
    undefined
  );
}

/** Still for the color tile — never the parent fabric animation. */
export function getFabricSwatchSrc(color: ProductColor): string | undefined {
  return firstStillSrc(
    color.fabricImage,
    color.image,
    ...(color.images ?? []),
    color.fabricMedia
  );
}

export function colorFromFabric(fabric: Fabric): ProductColor {
  return snapshotFabricOntoColor(
    {
      id: fabric.id,
      name: fabric.name,
      hex: fabric.colorHex?.trim() || "#D4C9B8",
    },
    fabric
  );
}

export function findColorByFabricId(
  colors: ProductColor[],
  fabricId: string
): ProductColor | undefined {
  return colors.find((color) => color.fabricId === fabricId || color.id === fabricId);
}

export function isFabricSelected(colors: ProductColor[], fabricId: string): boolean {
  return isFabricShadeSelected(colors, fabricId);
}

export function toggleFabricInColors(
  colors: ProductColor[],
  fabric: Fabric
): ProductColor[] {
  const shades = fabricShades(fabric);
  if (shades.length > 1) {
    const missing = shades.filter((shade) => !isShadeSelected(colors, fabric, shade));
    if (missing.length === 0) {
      return colors.filter((color) => !colorBelongsToFabric(color, fabric.id));
    }
    return [
      ...colors.filter((color) => color.id !== fabric.id),
      ...missing.map((shade) => productColorFromShade(fabric, shade)),
    ];
  }
  if (isFabricSelected(colors, fabric.id)) {
    return colors.filter((color) => !colorBelongsToFabric(color, fabric.id));
  }
  return [...colors, ...expandFabricToProductColors(fabric)];
}

export { toggleShadeInColors } from "./odcienieTkanin";

export function moveProductColor(
  colors: ProductColor[],
  index: number,
  dir: -1 | 1
): ProductColor[] {
  const target = index + dir;
  if (target < 0 || target >= colors.length) return colors;
  const next = [...colors];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function getFabricName(color: ProductColor): string {
  return color.fabricName?.trim() || color.name;
}

/** Nazwa odcienia na kafelku — osobno od nazwy tkaniny. */
export function getColorShadeName(color: ProductColor): string {
  const shade = color.name?.trim();
  const fabric = color.fabricName?.trim();
  if (shade && fabric && shade !== fabric) return shade;
  return shade || fabric || "Kolor";
}

/** Etykieta w koszyku i na zamówieniu: tkanina · odcień. */
export function describeCartColor(color: ProductColor): string {
  const fabric = color.fabricName?.trim();
  const shade = color.name?.trim();
  if (fabric && shade && fabric !== shade) return `${fabric} · ${shade}`;
  return shade || fabric || "";
}

export function colorHasDistinctShade(color: ProductColor): boolean {
  const shade = color.name?.trim();
  const fabric = color.fabricName?.trim();
  return Boolean(shade && fabric && shade !== fabric);
}

export function getFabricWatermark(color: ProductColor): string | undefined {
  return color.fabricWatermark?.trim() || undefined;
}

export function getFabricSpec(
  product: Product,
  color: ProductColor
): string | undefined {
  if (color.fabricSpecs?.trim()) return color.fabricSpecs.trim();
  return product.details?.specs?.find((spec) =>
    /tkanina|tapicer/i.test(spec.label)
  )?.value;
}

export function getFabricAbout(product: Product, color: ProductColor): string {
  if (color.fabricAbout?.trim()) return color.fabricAbout.trim();

  const highlight = product.details?.highlights?.find((item) =>
    /tkanina|welur|boucle|len|tapicer|easy clean/i.test(
      `${item.title} ${item.description}`
    )
  );
  if (highlight) return highlight.description;

  const spec = getFabricSpec(product, color);
  if (spec) {
    return `Wybrany odcień ${color.name} pokazuje tę tkaninę w naturalnym świetle salonu. ${spec}`;
  }

  return `Odcień ${color.name} jest częścią palety tapicerki tego modelu. Kolor na ekranie może delikatnie różnić się od rzeczywistego — warto zobaczyć tkaninę w swoim wnętrzu.`;
}

export function getFabricCare(
  product: Product,
  color: ProductColor
): string | undefined {
  if (color.fabricCare?.trim()) return color.fabricCare.trim();
  return product.details?.faq?.find((item) =>
    /czyś|pielęgn|prać|pranie|odkurz/i.test(`${item.question} ${item.answer}`)
  )?.answer;
}

export function getFabricMaterial(color: ProductColor): string | undefined {
  return color.fabricMaterial?.trim() || undefined;
}

export type FabricSpecRow = { label: string; value: string };

/** Parses free-text specs into label/value rows (Selsey-style grid). */
export function parseFabricSpecRows(spec: string | undefined): FabricSpecRow[] {
  if (!spec?.trim()) return [];
  const rows: FabricSpecRow[] = [];
  const lines = spec.split(/\n+/).map((line) => line.trim()).filter(Boolean);

  for (const line of lines) {
    const colon = line.match(/^([^:–—-]+?)\s*[:–—-]\s*(.+)$/);
    if (colon) {
      rows.push({ label: colon[1].trim(), value: colon[2].trim() });
      continue;
    }
    if (/^[-•*]\s/.test(line)) {
      rows.push({ label: "—", value: line.replace(/^[-•*]\s*/, "") });
    }
  }

  if (rows.length > 0) return rows;

  const parts = spec
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    return parts.map((value) => ({ label: "Specyfikacja", value }));
  }
  return [{ label: "Specyfikacja", value: spec.trim() }];
}

const FABRIC_TRAIT_RULES: { pattern: RegExp; label: string }[] = [
  { pattern: /hydrofob|wodoodporn/i, label: "Hydrofobowa" },
  { pattern: /easy\s*clean|łatw.*czy/i, label: "Easy Clean" },
  { pattern: /bezpieczn.*dzieci|przyjazn.*dzieci|dla\s+dzieci/i, label: "Przyjazna dzieciom" },
  { pattern: /zwierz/i, label: "Przyjazna zwierzętom" },
  { pattern: /trudnozapal|trudnopaln|ognioodporn/i, label: "Trudnozapalna" },
  { pattern: /soft\s*touch|mił.*dotyk/i, label: "Soft touch" },
  { pattern: /martindale|odporn.*ścier/i, label: "Odporna na ścieranie" },
  { pattern: /pilling|mechac|antypilling/i, label: "Niska skłonność do pillingu" },
  { pattern: /przyjazn.*środowisk|eko/i, label: "Przyjazna środowisku" },
  { pattern: /przewiewn/i, label: "Przewiewna" },
  { pattern: /trwał|wytrzymał/i, label: "Trwała" },
];

/** Keyword badges extracted from fabric copy (like Selsey property chips). */
export function extractFabricTraits(...texts: (string | undefined)[]): string[] {
  const blob = texts.filter(Boolean).join(" ");
  if (!blob.trim()) return [];
  const found: string[] = [];
  for (const rule of FABRIC_TRAIT_RULES) {
    if (rule.pattern.test(blob)) found.push(rule.label);
  }
  return found;
}

export function buildFabricSpecRows(
  product: Product,
  color: ProductColor
): FabricSpecRow[] {
  const rows = parseFabricSpecRows(getFabricSpec(product, color));
  const material = getFabricMaterial(color);
  if (material && !rows.some((row) => /typ|materiał|tkanin/i.test(row.label))) {
    rows.unshift({ label: "Typ tkaniny", value: material });
  }
  if (!rows.some((row) => /nazwa|kolor/i.test(row.label))) {
    rows.unshift({ label: "Kolor", value: color.name });
  }
  return rows;
}
