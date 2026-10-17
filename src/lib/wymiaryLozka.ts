/** Plansze wymiarów łóżka — wklejasz własną albo wybierasz gotową. */

export const BED_DIMENSION_CHARTS = [
  { id: "adele", label: "Adele", src: "/wymiary-lozek/adele.jpg" },
  { id: "apis", label: "Apis", src: "/wymiary-lozek/apis.jpg" },
  { id: "arena", label: "Arena", src: "/wymiary-lozek/arena.jpg" },
  { id: "candy", label: "Candy", src: "/wymiary-lozek/candy.jpg" },
  { id: "como", label: "Como", src: "/wymiary-lozek/como.jpg" },
  { id: "enzo", label: "Enzo", src: "/wymiary-lozek/enzo.jpg" },
  { id: "fiano", label: "Fiano", src: "/wymiary-lozek/fiano.jpg" },
  { id: "silla", label: "Silla", src: "/wymiary-lozek/silla.jpg" },
  { id: "teo", label: "Teo", src: "/wymiary-lozek/teo.jpg" },
] as const;

const PRESET_RE = /^\/wymiary-lozek\/[a-z0-9-]+\.(jpe?g|png|webp)$/i;

export function isAllowedDimensionImage(url: string | undefined | null): boolean {
  const trimmed = (url ?? "").trim();
  if (!trimmed || trimmed.includes("..") || trimmed.length > 400) return false;
  if (PRESET_RE.test(trimmed)) return true;
  return (
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("/api/media/")
  );
}

export function dimensionChartForName(name: string) {
  const haystack = name.trim().toLowerCase();
  if (!haystack) return undefined;
  return BED_DIMENSION_CHARTS.find((chart) =>
    haystack.includes(chart.label.toLowerCase())
  );
}

export function sanitizeDimensionImage(url: unknown): string | undefined {
  if (typeof url !== "string") return undefined;
  const trimmed = url.trim();
  return isAllowedDimensionImage(trimmed) ? trimmed : undefined;
}
