"use client";

import Link from "next/link";
import { useLanguage } from "@/kontekst/KontekstJezyka";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  dark?: boolean;
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  dark = false,
}: PageHeroProps) {
  const { t } = useLanguage();
  if (image) {
    return (
      <section className="px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-charcoal sm:rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/45 to-charcoal/20" />
          <div className="relative px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
            <nav className="mb-6 text-[11px] text-cream/60">
              <Link href="/" className="transition-colors hover:text-cream">
                {t("product.home")}
              </Link>
              <span className="mx-2">/</span>
              <span className="text-cream/80">{title}</span>
            </nav>
            {eyebrow && (
              <p className="section-kicker tracking-[0.12em] text-cream/80 uppercase">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-3 max-w-3xl font-serif text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
              {title}
            </h1>
            {description && (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-cream/85 sm:text-lg">
                {description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={dark ? "bg-charcoal text-cream" : ""}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <nav
          className={`mb-6 text-[11px] ${dark ? "text-cream/50" : "text-sand"}`}
        >
          <Link
            href="/"
            className={`transition-colors ${dark ? "hover:text-cream" : "hover:text-charcoal"}`}
          >
            {t("product.home")}
          </Link>
          <span className="mx-2">/</span>
          <span className={dark ? "text-cream/80" : "text-charcoal"}>{title}</span>
        </nav>
        {eyebrow && (
          <p
            className={`section-kicker tracking-[0.12em] uppercase ${dark ? "text-cream/80" : "text-charcoal"}`}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={`mt-2 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl ${dark ? "text-cream" : "text-charcoal"}`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`mt-4 max-w-2xl text-base leading-relaxed sm:text-lg ${dark ? "text-cream/80" : "text-charcoal/70"}`}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
