import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { isLocalUpload } from "@/lib/obrazy";
import type { HomepageSection } from "@/lib/stronaGlowna";

export function CategoryLinks({ content }: { content: HomepageSection }) {
  return (
    <section className="section-y border-t border-taupe/30 bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:mb-14 sm:gap-6 md:flex-row md:items-end">
          <div className="max-w-md">
            {content.eyebrow && (
              <p className="text-[10px] tracking-[0.3em] text-sand uppercase">
                {content.eyebrow}
              </p>
            )}
            <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {content.title}
            </h2>
            {content.intro && (
              <p className="mt-4 text-sm leading-relaxed text-sand">
                {content.intro}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
          {content.cards.map((cat, index) => (
            <div key={`${cat.href}-${index}`} className="group flex flex-col">
              <Link href={cat.href} className="relative aspect-[4/5] overflow-hidden bg-cream-light">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={isLocalUpload(cat.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-90" />
                <span className="absolute top-5 left-5 text-[10px] tracking-[0.3em] text-cream/70 uppercase">
                  0{index + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <h3 className="font-serif text-xl text-cream sm:text-2xl md:text-3xl">
                    {cat.label}
                  </h3>
                  {cat.description && (
                    <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-cream/80">
                      {cat.description}
                    </p>
                  )}
                </div>
              </Link>

              <Link
                href={cat.href}
                className="mt-4 flex min-h-[52px] items-center justify-between border-b border-taupe/40 pb-3 transition-colors active:border-charcoal sm:mt-5 sm:pb-4 group-hover:border-charcoal"
              >
                <span className="text-[10px] tracking-[0.22em] text-charcoal uppercase">
                  Przeglądaj kategorie
                </span>
                <span className="flex h-11 w-11 items-center justify-center border border-taupe/50 text-charcoal transition-all duration-300 group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-cream">
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
