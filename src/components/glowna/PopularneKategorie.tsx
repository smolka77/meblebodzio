import Image from "next/image";
import Link from "next/link";
import { isLocalUpload } from "@/lib/obrazy";
import type { HomepageSection } from "@/lib/stronaGlowna";

export function HomePopularCategories({ content }: { content: HomepageSection }) {
  return (
    <section className="section-y !py-10 sm:!py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {content.eyebrow && (
              <p className="text-[10px] tracking-[0.28em] text-sand uppercase">
                {content.eyebrow}
              </p>
            )}
            <h2 className="mt-2 font-serif text-2xl text-charcoal sm:text-3xl md:text-4xl">
              {content.title}
            </h2>
            {content.intro && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-sand">
                {content.intro}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {content.cards.map((cat, index) => (
            <Link
              key={`${cat.href}-${index}`}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl bg-cream-light sm:rounded-3xl"
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={isLocalUpload(cat.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                  <h3 className="font-serif text-2xl text-cream">{cat.label}</h3>
                  {cat.description && (
                    <p className="mt-2 text-sm text-cream/80">{cat.description}</p>
                  )}
                  <span className="mt-4 inline-flex min-h-[40px] items-center rounded-full bg-cream px-5 text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase">
                    Zobacz
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
