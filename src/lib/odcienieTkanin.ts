import type { Fabric, FabricShade, ProductColor } from "@/lib/typy";
import { isVideoUrl } from "@/lib/obrazy";

const SHADE_SEP = "::";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `shade-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeFabricShades(raw: unknown): FabricShade[] {
  if (!Array.isArray(raw)) return [];
  const out: FabricShade[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Partial<FabricShade>;
    const name = rec.name?.trim() || "";
    const image = rec.image?.trim() || undefined;
    if (!name && !image) continue;
    const hex = rec.hex?.trim() || "#D4C9B8";
    let id = rec.id?.trim() || newId();
    if (seen.has(id)) id = newId();
    seen.add(id);
    out.push({ id, name, hex, ...(image ? { image } : {}) });
  }
  return out;
}

export function fabricShades(fabric: Fabric): FabricShade[] {
  const stored = sanitizeFabricShades(fabric.colors);
  if (stored.length > 0) return stored;
  return [
    {
      id: "default",
      name: fabric.name,
      hex: fabric.colorHex?.trim() || "#D4C9B8",
      image: fabric.image?.trim() || undefined,
    },
  ];
}

export function fabricShadeCount(fabric: Fabric): number {
  return fabricShades(fabric).length;
}

export function isStillImageSrc(src?: string | null): boolean {
  const url = src?.trim();
  return Boolean(url && !isVideoUrl(url));
}

export function fabricStillSrc(fabric: Fabric): string | undefined {
  const image = fabric.image?.trim();
  if (image && !isVideoUrl(image)) return image;
  return undefined;
}

export function fabricVideoSrc(fabric: Fabric): string | undefined {
  const video = fabric.video?.trim();
  if (video) return video;
  const image = fabric.image?.trim();
  if (image && isVideoUrl(image)) return image;
  return undefined;
}

/** Zdjęcie tego odcienia; wideo tkaniny nie zastępuje kafelka koloru. */
export function shadeStillSrc(fabric: Fabric, shade?: FabricShade): string | undefined {
  const shadeImage = shade?.image?.trim();
  if (shadeImage && !isVideoUrl(shadeImage)) return shadeImage;
  return fabricStillSrc(fabric);
}

export function resolveFabricShade(
  color: ProductColor,
  fabric: Fabric
): FabricShade | undefined {
  const shades = fabricShades(fabric);
  if (color.id.startsWith(`${fabric.id}${SHADE_SEP}`)) {
    const shadeId = color.id.slice(fabric.id.length + SHADE_SEP.length);
    const byId = shades.find((item) => item.id === shadeId);
    if (byId) return byId;
  }
  const name = color.name.trim().toLowerCase();
  if (name) {
    const byName = shades.find((item) => item.name.trim().toLowerCase() === name);
    if (byName) return byName;
  }
  if (shades.length === 1) return shades[0];
  return undefined;
}

export function parentFabricId(id: string): string {
  const idx = id.indexOf(SHADE_SEP);
  return idx === -1 ? id : id.slice(0, idx);
}

export function productColorIdForShade(fabric: Fabric, shade: FabricShade): string {
  const shades = fabric.colors?.length ? fabric.colors : [];
  if (shades.length <= 1 && shade.id === "default") return fabric.id;
  if (shades.length === 1 && shades[0].id === shade.id) return fabric.id;
  return `${fabric.id}${SHADE_SEP}${shade.id}`;
}

export function productColorFromShade(fabric: Fabric, shade: FabricShade): ProductColor {
  const label = shade.name.trim() || fabric.name;
  const still = shadeStillSrc(fabric, shade);
  const video = fabricVideoSrc(fabric);
  return {
    id: productColorIdForShade(fabric, shade),
    name: label,
    hex: shade.hex,
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
      fabric.surcharge && fabric.surcharge > 0
        ? Math.round(fabric.surcharge)
        : undefined,
  };
}

export function expandFabricToProductColors(fabric: Fabric): ProductColor[] {
  return fabricShades(fabric).map((shade) => productColorFromShade(fabric, shade));
}

export function colorBelongsToFabric(color: ProductColor, fabricId: string): boolean {
  if (!fabricId) return false;
  if (color.fabricId) return color.fabricId === fabricId;
  if (color.id === fabricId) return true;
  return color.id.startsWith(`${fabricId}${SHADE_SEP}`);
}

export function isFabricSelected(colors: ProductColor[], fabricId: string): boolean {
  return colors.some((color) => colorBelongsToFabric(color, fabricId));
}

export function isShadeSelected(
  colors: ProductColor[],
  fabric: Fabric,
  shade: FabricShade
): boolean {
  const id = productColorIdForShade(fabric, shade);
  return colors.some((color) => color.id === id);
}

export function toggleShadeInColors(
  colors: ProductColor[],
  fabric: Fabric,
  shade: FabricShade
): ProductColor[] {
  const id = productColorIdForShade(fabric, shade);
  if (colors.some((color) => color.id === id)) {
    return colors.filter((color) => color.id !== id);
  }
  return [...colors, productColorFromShade(fabric, shade)];
}

function sampleItemFromShade(
  fabric: Fabric,
  shade: FabricShade,
  id: string,
  name: string
): Fabric {
  const still = shadeStillSrc(fabric, shade);
  return {
    ...fabric,
    id,
    name,
    colorHex: shade.hex,
    image: still ?? "",
    video: still ? undefined : fabricVideoSrc(fabric),
  };
}

export function expandFabricAsSampleItems(fabric: Fabric): Fabric[] {
  const shades = fabricShades(fabric);
  if (shades.length <= 1) {
    const shade = shades[0] ?? {
      id: "default",
      name: fabric.name,
      hex: fabric.colorHex?.trim() || "#D4C9B8",
      image: fabricStillSrc(fabric),
    };
    return [sampleItemFromShade(fabric, shade, fabric.id, fabric.name)];
  }
  return shades.map((shade) =>
    sampleItemFromShade(
      fabric,
      shade,
      `${fabric.id}${SHADE_SEP}${shade.id}`,
      shade.name.trim() ? `${fabric.name} — ${shade.name}` : fabric.name
    )
  );
}

export function resolveSampleFabricSelection(
  fabrics: Fabric[],
  fabricIds: string[]
): { ids: string[]; names: string[] } | null {
  const byId = new Map(fabrics.map((f) => [f.id, f]));
  const ids: string[] = [];
  const names: string[] = [];

  for (const raw of fabricIds) {
    const parentId = parentFabricId(raw);
    const fabric = byId.get(parentId);
    if (!fabric) return null;
    ids.push(raw);
    if (raw === parentId) {
      names.push(fabric.name);
      continue;
    }
    const shadeId = raw.slice(parentId.length + SHADE_SEP.length);
    const shade = fabricShades(fabric).find((s) => s.id === shadeId);
    names.push(shade?.name ? `${fabric.name} — ${shade.name}` : fabric.name);
  }

  return { ids, names };
}
