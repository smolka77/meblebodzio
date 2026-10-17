"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { mediaSrcSet, sizedMediaUrl } from "@/lib/obrazy";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export type HeroSlide = {
  image: string;
  title: string;
  eyebrow?: string;
  href: string;
  cta: string;
};

export function HomeHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const slide = slides[index] ?? slides[0];
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const go = useCallback(
    (dir: number) => {
      if (count < 2) return;
      setIndex((i) => (i + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count < 2 || paused) return;
    const id = window.setInterval(() => go(1), 6500);
    return () => window.clearInterval(id);
  }, [count, paused, go]);

  if (!slide) return null;

  return (
    <section className="page-gutter pt-3 sm:pt-4">
      <div
        className="page-width relative overflow-hidden rounded-2xl bg-cream-light sm:rounded-[1.75rem]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="relative aspect-[4/3] w-full touch-pan-y sm:aspect-[16/9] sm:min-h-[460px] lg:aspect-[2/1] lg:min-h-[520px]"
          onTouchStart={(e) => {
            const t = e.changedTouches[0];
            touchStart.current = { x: t.clientX, y: t.clientY };
            setPaused(true);
          }}
          onTouchEnd={(e) => {
            const start = touchStart.current;
            touchStart.current = null;
            setPaused(false);
            if (!start || count < 2) return;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x;
            const dy = t.clientY - start.y;
            if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
            swiped.current = true;
            go(dx < 0 ? 1 : -1);
          }}
          onTouchCancel={() => {
            touchStart.current = null;
            setPaused(false);
          }}
          onClickCapture={(e) => {
            if (!swiped.current) return;
            e.preventDefault();
            e.stopPropagation();
            swiped.current = false;
          }}
        >
          {slides.map((item, i) => (
            <div
              key={`${item.image}-${i}`}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={i !== index}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sizedMediaUrl(item.image, i === 0 ? 768 : 640)}
                srcSet={mediaSrcSet(item.image)}
                sizes="100vw"
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ objectPosition: "center center" }}
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-charcoal/10 to-transparent sm:bg-gradient-to-r sm:from-charcoal/45 sm:via-charcoal/10 sm:to-transparent" />

          <div className="absolute inset-0 flex items-end p-5 pb-14 sm:p-10 sm:pb-12 lg:p-14">
            <div className="max-w-xl text-cream">
              {slide.eyebrow && (
                <p className="mb-1.5 text-[13px] font-semibold tracking-[0.12em] text-cream/90 uppercase sm:mb-2 sm:text-[15px]">
                  {slide.eyebrow}
                </p>
              )}
              <h2 className="font-serif text-[1.7rem] leading-[1.12] sm:text-4xl md:text-5xl lg:text-[3.35rem]">
                {slide.title}
              </h2>
              <Link
                href={slide.href}
                className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-terracotta px-7 text-[12px] font-semibold text-cream transition-colors hover:bg-terracotta/90 sm:mt-7 sm:min-h-[48px] sm:px-8"
              >
                {slide.cta}
              </Link>
            </div>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                aria-label={t("home.prevSlide")}
                onClick={() => go(-1)}
                className="absolute top-1/2 left-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 text-charcoal shadow-sm transition-colors hover:bg-white sm:flex"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label={t("home.nextSlide")}
                onClick={() => go(1)}
                className="absolute top-1/2 right-3 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/95 text-charcoal shadow-sm transition-colors hover:bg-white sm:flex"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-7">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={t("home.slideN", { n: i + 1 })}
                    onClick={() => setIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? "w-7 bg-cream" : "w-2 bg-cream/55"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
