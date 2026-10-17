"use client";

import {
  productBadgeBase,
  productCardBadgeBase,
  tagInlineStyle,
  type ProductTagId,
} from "@/lib/tagi";
import { useProductTag } from "@/kontekst/KontekstTagow";

export function ProductTag({
  id,
  children,
  className = "",
  variant = "default",
  normalCase = false,
}: {
  id: ProductTagId;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "card";
  normalCase?: boolean;
}) {
  const tag = useProductTag(id);
  const base = variant === "card" ? productCardBadgeBase : productBadgeBase;

  return (
    <span
      className={`${base} ${tag.uppercase && !normalCase ? "uppercase" : ""} ${className}`.trim()}
      style={tagInlineStyle(tag)}
    >
      {children}
    </span>
  );
}
