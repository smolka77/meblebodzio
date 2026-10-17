import { isVideoUrl } from "./obrazy";
import type { Fabric } from "./typy";

export interface FabricStyleGroup {
  id: string;
  material: string;
  tagline: string;
  fabrics: Fabric[];
  previewFabric: Fabric;
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "en", { sensitivity: "base", numeric: true });
}

function styleSlug(material: string): string {
  const slug = material
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || "tkanina";
}

export function getFabricMaterialGroup(fabric: Fabric): string {
  const material = fabric.material?.trim();
  if (material) return material;
  const first = fabric.name.trim().split(/\s+/)[0];
  return first || "Tkanina";
}

export function fabricColorLabel(fabric: Fabric, material?: string): string {
  const mat = (material ?? getFabricMaterialGroup(fabric)).trim();
  const name = fabric.name.trim();
  if (mat && name.toLowerCase().startsWith(mat.toLowerCase())) {
    const rest = name.slice(mat.length).trim().replace(/^[-–—]\s*/, "");
    if (rest) return rest;
  }
  const parts = name.split(/\s+/);
  if (parts.length > 1) return parts.slice(1).join(" ");
  return name;
}

function pickPreviewFabric(fabrics: Fabric[]): Fabric {
  return (
    fabrics.find((f) => f.video?.trim() || f.image?.trim()) ??
    fabrics[0]
  );
}

function groupTagline(fabrics: Fabric[]): string {
  const withDesc = fabrics.find((f) => f.description?.trim());
  if (withDesc?.description?.trim()) {
    return withDesc.description.trim();
  }
  const specs = fabrics.find((f) => f.specs?.trim());
  if (specs?.specs?.trim()) {
    const firstLine = specs.specs.split("\n").find((line) => line.trim());
    if (firstLine) return firstLine.trim();
  }
  return `${fabrics.length} ${
    fabrics.length === 1 ? "odcień" : fabrics.length < 5 ? "odcienie" : "odcieni"
  } w palecie Wrohaus.`;
}

export function groupFabricsByStyle(fabrics: Fabric[]): FabricStyleGroup[] {
  const map = new Map<string, Fabric[]>();

  for (const fabric of fabrics) {
    const material = getFabricMaterialGroup(fabric);
    const key = material.toLowerCase();
    const list = map.get(key) ?? [];
    list.push(fabric);
    map.set(key, list);
  }

  const groups: FabricStyleGroup[] = [];

  for (const [, list] of map) {
    const sorted = [...list].sort((a, b) => compareText(a.name, b.name));
    const material = getFabricMaterialGroup(sorted[0]);
    groups.push({
      id: styleSlug(material),
      material,
      tagline: groupTagline(sorted),
      fabrics: sorted,
      previewFabric: pickPreviewFabric(sorted),
    });
  }

  return groups.sort((a, b) => compareText(a.material, b.material));
}

/** Zdjęcie odcienia / tkaniny; wideo tylko gdy nie ma klatki. */
export function fabricPreviewSrc(fabric: Fabric): string {
  const image = fabric.image?.trim() || "";
  if (image && !isVideoUrl(image)) return image;
  return fabric.video?.trim() || image;
}
