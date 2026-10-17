"use client";

import Image from "next/image";
import Link from "next/link";
import { isLocalUpload } from "@/lib/obrazy";
import type { HomepageSection } from "@/lib/stronaGlowna";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function HomeQuickCategories({
  section,
}: {
  section: HomepageSection;
}) {
  const { t } = useLanguage();
  if (section.cards.length === 0) return null;

  return (
    <section className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        <div className="mb-8 sm:mb-10">
          {section.eyebrow && (
            <p className="section-kicker text-terracotta">{section.eyebrow}</p>
          )}
          <h2 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">
            {section.title}
          </h2>
          {section.intro && (
            <p className="section-intro mt-3 max-w-xl">{section.intro}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {section.cards.map((item, index) => {
            const inner = (
              <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                <Image
                  src={item.image}
                  alt={item.label}
                  fill
                  className={`object-cover ${
                    item.comingSoon
                      ? "grayscale-[0.25]"
                      : "transition-transform duration-700 group-hover:scale-105"
                  }`}
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  unoptimized={isLocalUpload(item.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                  <h3 className="font-serif text-xl text-cream sm:text-2xl">
                    {item.label}
                  </h3>
                  <span className="hidden rounded-full bg-cream px-3 py-1.5 text-[11px] font-semibold text-charcoal sm:inline">
                    {item.comingSoon ? t("home.soon") : t("home.see")}
                  </span>
                </div>
              </div>
            );

            if (item.comingSoon) {
              return (
                <div
                  key={`${item.href}-${item.label}-${index}`}
                  className="relative overflow-hidden rounded-2xl bg-cream-light"
                >
                  {inner}
                </div>
              );
            }

            return (
              <Link
                key={`${item.href}-${item.label}-${index}`}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl bg-cream-light"
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
