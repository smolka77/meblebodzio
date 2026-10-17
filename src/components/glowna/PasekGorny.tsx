"use client";

import { useLanguage } from "@/kontekst/KontekstJezyka";

export function PromoTopBar() {
  const { t } = useLanguage();
  const items = [
    t("top.madeInPoland"),
    t("top.delivery"),
    t("top.returns"),
    t("top.warranty"),
  ];

  return (
    <div className="border-b-[3px] border-terracotta bg-charcoal text-cream">
      <div className="promo-reel py-1.5 text-[13px] font-medium tracking-wide sm:hidden">
        <div className="promo-reel-track">
          <PromoSet items={items} />
          <PromoSet items={items} hidden />
        </div>
      </div>

      <div className="page-gutter hidden sm:block">
        <div className="page-width flex items-center justify-center gap-8 py-2.5 text-[13px] font-medium tracking-wide">
          {items.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PromoSet({
  items,
  hidden,
}: {
  items: string[];
  hidden?: boolean;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-8 pr-8"
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <span key={`${hidden ? "dup-" : ""}${item}`} className="whitespace-nowrap">
          {item}
        </span>
      ))}
    </div>
  );
}
