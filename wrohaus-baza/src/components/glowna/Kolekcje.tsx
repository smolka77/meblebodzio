import Image from "next/image";
import Link from "next/link";
import { isLocalUpload } from "@/lib/obrazy";
import type { HomepageSection } from "@/lib/stronaGlowna";

export function Collections({ content }: { content: HomepageSection }) {
  return (
    <section className="section-y bg-cream-light">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-14">
          {content.eyebrow && (
            <p className="text-[10px] tracking-[0.3em] text-sand uppercase">
              {content.eyebrow}
            </p>
          )}
          <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
            {content.title}
          </h2>
          {content.intro && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-sand">
              {content.intro}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
          {content.cards.map((col, index) => (
            <div key={`${col.href}-${index}`} className="group flex flex-col">
              <Link
                href={col.href}
                className="relative aspect-[3/4] overflow-hidden bg-cream-light"
              >
                <Image
                  src={col.image}
                  alt={col.label}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized={isLocalUpload(col.image)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <h3 className="font-serif text-xl text-cream sm:text-2xl">
                    {col.label}
                  </h3>
                  {col.description && (
                    <p className="mt-2 text-sm text-cream/85">{col.description}</p>
                  )}
                  <span className="mt-2 inline-block text-[10px] tracking-[0.2em] text-cream/80 uppercase opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    Przeglądaj →
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
