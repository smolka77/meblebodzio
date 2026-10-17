"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isLocalUpload } from "@/lib/obrazy";
import type { HomepageSection } from "@/lib/stronaGlowna";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import type { MessageKey } from "@/lib/jezyk";
import {
  lineAccentClass,
  lineBarClass,
  lineFromCollectionCard,
  lineLabels,
} from "@/lib/linieProduktow";

export function HomeCollections({ content }: { content: HomepageSection }) {
  const { t } = useLanguage();

  return (
    <section id="kolekcje" className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        {(content.eyebrow || content.title || content.intro) && (
          <div className="mb-8 sm:mb-10">
            {content.eyebrow && (
              <p className="section-kicker text-terracotta">{content.eyebrow}</p>
            )}
            {content.title && (
              <h2 className="mt-1 font-serif text-[1.65rem] leading-tight text-charcoal sm:text-4xl">
                {content.title}
              </h2>
            )}
            {content.intro && (
              <p className="section-intro mt-3 max-w-xl">{content.intro}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-3 items-stretch gap-1.5 sm:gap-4 md:gap-5">
          {content.cards.map((col, index) => {
            const line = lineFromCollectionCard(col);
            const href = line ? `/linia/${line}` : col.href;
            const title = col.label || (line ? lineLabels[line] : "");
            const tag = line
              ? t(`line.${line}.tag` as MessageKey)
              : null;
            const description =
              col.description ||
              (line ? t(`line.${line}.desc` as MessageKey) : "");
            const cta = line ? t("home.seeLine") : t("home.browseCollection");

            return (
              <Link
                key={`${href}-${index}`}
                href={href}
                className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_16px_40px_-28px_rgba(17,17,17,0.35)] ring-1 ring-charcoal/10 sm:rounded-2xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-cream-light">
                  <Image
                    src={col.image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 33vw, 33vw"
                    unoptimized={isLocalUpload(col.image)}
                  />
                  {line && (
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 top-0 h-[2px] ${lineBarClass[line]}`}
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col px-1.5 py-2 sm:px-4 sm:py-4 md:px-5 md:py-5">
                  {tag && (
                    <p
                      className={`text-[8px] font-semibold tracking-[0.1em] uppercase sm:text-[10px] sm:tracking-[0.16em] md:text-[11px] md:tracking-[0.18em] ${line ? lineAccentClass[line] : "text-sand"}`}
                    >
                      {tag}
                    </p>
                  )}
                  <h3 className="mt-1 font-serif text-[13px] leading-none text-charcoal sm:mt-1.5 sm:text-xl md:text-2xl">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-1.5 text-[10px] leading-snug text-charcoal/70 sm:mt-3 sm:min-h-[4.5rem] sm:text-[13px] sm:leading-relaxed md:text-[15px]">
                      {description}
                    </p>
                  )}
                  <span className="mt-auto inline-flex items-center gap-0.5 pt-2 text-[9px] font-semibold tracking-wide text-charcoal sm:gap-2 sm:pt-4 sm:text-[13px]">
                    {cta}
                    <ArrowRight
                      className="h-3 w-3 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 sm:h-4 sm:w-4"
                      strokeWidth={1.75}
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
