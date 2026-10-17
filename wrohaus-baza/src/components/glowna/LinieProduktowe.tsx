"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  lineAccentClass,
  lineBarClass,
  lineFrameClass,
  lineImages,
  productLines,
} from "@/lib/linieProduktow";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import type { MessageKey } from "@/lib/jezyk";

export function HomeProductLines() {
  const { t } = useLanguage();

  return (
    <section className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
          {productLines.map((line) => {
            const title = t(`line.${line}.title` as MessageKey);
            const tag = t(`line.${line}.tag` as MessageKey);
            return (
              <Link
                key={line}
                href={`/linia/${line}`}
                className="group relative isolate overflow-hidden rounded-2xl bg-charcoal shadow-[0_24px_50px_-32px_rgba(17,17,17,0.55)]"
              >
                <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                  <Image
                    src={lineImages[line]}
                    alt={`${title} — ${tag}`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-charcoal/15" />
                  <div className="absolute inset-0 bg-gradient-to-b from-charcoal/25 via-transparent to-transparent" />
                  <span
                    aria-hidden
                    className={`absolute inset-x-0 top-0 h-[2px] ${lineBarClass[line]}`}
                  />
                  <div
                    aria-hidden
                    className={`pointer-events-none absolute inset-3 rounded-[14px] ring-1 ${lineFrameClass[line]} sm:inset-4`}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-7">
                    <p
                      className={`text-[11px] font-semibold tracking-[0.22em] ${lineAccentClass[line]}`}
                    >
                      {tag}
                    </p>
                    <h2 className="mt-2 font-serif text-3xl text-cream sm:text-4xl">
                      {title}
                    </h2>
                    <p className="mt-2 max-w-[17rem] text-[14px] leading-relaxed text-cream/80">
                      {t(`line.${line}.desc` as MessageKey)}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] text-cream uppercase">
                      {t("home.seeLine")}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
