"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { HERO, type UspIcon } from "@/lib/glownaTresc";
import { produktyLabel } from "@/lib/liczebniki";
import * as I from "./ikony";

const SLIDE_MS = 6500;

const USP_ICONS: Record<UspIcon, (props: { className?: string }) => React.ReactNode> = {
  truck: I.Truck,
  flag: I.Flag,
  return: I.Return,
  card: I.Card,
};

export function HeroGlowny({ counts }: { counts: Record<string, number> }) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const active = HERO.slides[slide];

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setSlide((current) => (current + 1) % HERO.slides.length),
      SLIDE_MS
    );
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <section aria-label="Meble tworzone dla pięknych wnętrz" className="pw pt-4 lg:pt-6">
      <div
        className="overflow-hidden rounded-md bg-forest"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative h-[520px] sm:h-[580px] lg:h-[640px]">
          {HERO.slides.map((item, index) => (
            <div
              key={item.image}
              aria-hidden={index !== slide}
              className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
                index === slide ? "opacity-100" : "opacity-0"
              }`}
            >
              <StoreImage
                src={item.image}
                alt={index === slide ? item.alt : ""}
                fill
                priority={index === 0}
                sizes="(min-width: 1536px) 1650px, 100vw"
                position={item.position}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10 lg:bg-gradient-to-r lg:from-black/60 lg:via-black/20 lg:to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 pb-16 sm:p-10 sm:pb-16 lg:inset-y-0 lg:max-w-[720px] lg:justify-center lg:p-16 lg:pb-16">
            <span className="w-fit text-[14px] font-medium text-white/90">
              {HERO.eyebrow}
            </span>
            <h1 className="font-display mt-5 text-[38px] leading-[1.02] tracking-[-0.04em] text-white sm:text-[54px] xl:text-[66px]">
              {HERO.claim}
            </h1>
            <p className="mt-4 text-[18px] text-white/90 sm:text-[20px]">{HERO.sub}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={HERO.cta.href}
                className="grid h-12 place-items-center rounded-full bg-accent px-8 text-[15px] font-semibold text-white transition hover:bg-accent-dark"
              >
                {HERO.cta.label}
              </Link>
              <Link
                href={HERO.secondaryCta.href}
                className="grid h-12 place-items-center rounded-full border border-white/70 px-7 text-[15px] font-semibold text-white transition hover:bg-white hover:text-forest"
              >
                {HERO.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-3 sm:right-6 sm:bottom-5 sm:left-auto sm:w-auto lg:right-8">
            <div className="flex gap-2" role="group" aria-label="Wybór ujęcia">
              {HERO.slides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  aria-label={`Ujęcie ${index + 1}: ${item.caption}`}
                  aria-current={index === slide}
                  onClick={() => setSlide(index)}
                  className="group grid h-6 place-items-center"
                >
                  <span
                    className={`block h-[3px] rounded-full bg-white transition-all duration-300 ${
                      index === slide ? "w-9" : "w-5 opacity-50 group-hover:opacity-80"
                    }`}
                  />
                </button>
              ))}
            </div>
            <Link
              href={active.href}
              className="hidden items-center gap-2 rounded-md bg-white px-4 py-2.5 text-[14.5px] shadow-sm transition hover:bg-paper sm:flex"
            >
              <span className="font-medium">{active.caption}</span>
              <span className="text-meta">· {produktyLabel(counts[active.category] ?? 0)}</span>
              <I.Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <ul className="grid grid-cols-2 bg-white lg:grid-cols-4">
          {HERO.usp.map((item, index) => {
            const Icon = USP_ICONS[item.icon];
            return (
              <li
                key={item.title}
                className={`flex items-center gap-3.5 px-5 py-4 sm:px-7 lg:justify-center ${
                  index % 2 === 1 ? "border-l border-line" : ""
                } ${index >= 2 ? "border-t border-line lg:border-t-0" : ""} ${
                  index > 0 ? "lg:border-l lg:border-line" : "lg:border-l-0"
                }`}
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage text-forest">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-[14.5px] font-semibold">{item.title}</div>
                  <div className="text-[14px] text-meta">{item.text}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
