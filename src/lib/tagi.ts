import type { CSSProperties } from "react";
import type { ProductLine } from "./typy";

export type ProductTagId =
  | "status-new"
  | "status-ready"
  | "status-24h"
  | "status-bestseller"
  | "status-sale"
  | "status-sold-out"
  | "line-smart"
  | "line-comfort"
  | "line-premium";

export type ProductTagGroup = "status" | "line";

export interface ProductTagDefinition {
  id: ProductTagId;
  group: ProductTagGroup;
  name: string;
  hint: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  uppercase: boolean;
}

export interface ProductTagsConfig {
  tags: ProductTagDefinition[];
}

const HEX = /^#[0-9A-Fa-f]{6}$/;

export function sanitizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!HEX.test(trimmed)) return fallback;
  return trimmed.toUpperCase();
}

export const DEFAULT_PRODUCT_TAGS: ProductTagsConfig = {
  tags: [
    {
      id: "status-new",
      group: "status",
      name: "Nowość",
      hint: "Produkty oznaczone jako nowe — karta i strona produktu",
      backgroundColor: "#5F6B54",
      textColor: "#F8F7F4",
      uppercase: true,
    },
    {
      id: "status-ready",
      group: "status",
      name: "Od ręki",
      hint: "Gotowe do szybkiej wysyłki",
      backgroundColor: "#6E8578",
      textColor: "#F8F7F4",
      uppercase: true,
    },
    {
      id: "status-24h",
      group: "status",
      name: "Wysyłka 24H",
      hint: "Produkt gotowy do wysłania w 24 godziny — kafelek i karta produktu",
      backgroundColor: "#111111",
      textColor: "#F8F7F4",
      borderColor: "#C4512F",
      uppercase: true,
    },
    {
      id: "status-bestseller",
      group: "status",
      name: "Bestseller",
      hint: "Najchętniej kupowane modele — kafelek i karta produktu",
      backgroundColor: "#C9A227",
      textColor: "#111111",
      uppercase: true,
    },
    {
      id: "status-sale",
      group: "status",
      name: "Promocja",
      hint: "Rabat procentowy na karcie i stronie produktu",
      backgroundColor: "#C4512F",
      textColor: "#F8F7F4",
      uppercase: false,
    },
    {
      id: "status-sold-out",
      group: "status",
      name: "Wyprzedane",
      hint: "Brak na stanie — karta produktu",
      backgroundColor: "#B8B0A3",
      textColor: "#111111",
      uppercase: true,
    },
    {
      id: "line-smart",
      group: "line",
      name: "Smart",
      hint: "Linia produktowa Smart",
      backgroundColor: "#EDE7DF",
      textColor: "#111111",
      borderColor: "#D8D0C4",
      uppercase: true,
    },
    {
      id: "line-comfort",
      group: "line",
      name: "Comfort",
      hint: "Linia produktowa Comfort",
      backgroundColor: "#7A6B55",
      textColor: "#F8F7F4",
      uppercase: true,
    },
    {
      id: "line-premium",
      group: "line",
      name: "Premium",
      hint: "Linia produktowa Premium",
      backgroundColor: "#111111",
      textColor: "#F8F7F4",
      borderColor: "#C4512F",
      uppercase: true,
    },
  ],
};

export function lineToTagId(line: ProductLine): ProductTagId {
  return `line-${line}` as ProductTagId;
}

export function mergeProductTags(stored?: Partial<ProductTagsConfig>): ProductTagsConfig {
  const byId = new Map<ProductTagId, ProductTagDefinition>();
  for (const fallback of DEFAULT_PRODUCT_TAGS.tags) {
    byId.set(fallback.id, { ...fallback });
  }

  for (const raw of stored?.tags ?? []) {
    if (!raw?.id || !byId.has(raw.id)) continue;
    const base = byId.get(raw.id)!;
    byId.set(raw.id, {
      ...base,
      name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : base.name,
      hint: typeof raw.hint === "string" && raw.hint.trim() ? raw.hint.trim() : base.hint,
      backgroundColor: sanitizeHexColor(raw.backgroundColor, base.backgroundColor),
      textColor: sanitizeHexColor(raw.textColor, base.textColor),
      borderColor: raw.borderColor
        ? sanitizeHexColor(raw.borderColor, base.borderColor ?? base.backgroundColor)
        : base.borderColor,
      uppercase: typeof raw.uppercase === "boolean" ? raw.uppercase : base.uppercase,
    });
  }

  return {
    tags: DEFAULT_PRODUCT_TAGS.tags.map((tag) => byId.get(tag.id)!),
  };
}

export function tagStyleRecord(
  config: ProductTagsConfig
): Record<ProductTagId, ProductTagDefinition> {
  return Object.fromEntries(config.tags.map((tag) => [tag.id, tag])) as Record<
    ProductTagId,
    ProductTagDefinition
  >;
}

export function tagInlineStyle(tag: ProductTagDefinition): CSSProperties {
  return {
    backgroundColor: tag.backgroundColor,
    color: tag.textColor,
    boxShadow: tag.borderColor ? `inset 0 0 0 1px ${tag.borderColor}` : undefined,
  };
}

export const productBadgeBase =
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.07em] sm:px-3 sm:py-1 sm:text-[12px]";

export const productCardBadgeBase =
  "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-bold tracking-tight sm:px-3 sm:py-1.5 sm:text-[13px]";
