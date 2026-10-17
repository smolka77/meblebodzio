"use client";

import type { ProductLine } from "@/lib/typy";
import { lineToTagId } from "@/lib/tagi";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { ProductTag } from "@/components/sklep/EtykietaProduktu";

export function ProductLineBadge({
  line,
  className = "",
  variant = "default",
}: {
  line: ProductLine;
  className?: string;
  variant?: "default" | "card";
}) {
  const { t } = useLanguage();
  return (
    <ProductTag id={lineToTagId(line)} className={className} variant={variant}>
      {t(`product.line.${line}`)}
    </ProductTag>
  );
}
