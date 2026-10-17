import type { HomepageHero } from "@/lib/stronaGlowna";

export function Hero({ hero }: { hero: HomepageHero }) {
  return (
    <section className="relative h-[62dvh] min-h-[420px] max-h-[720px] overflow-hidden sm:h-[68vh] sm:min-h-[480px] sm:max-h-[800px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hero.image}
        alt={hero.title}
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/50 to-cream/10 sm:bg-gradient-to-r sm:from-cream/70 sm:via-cream/25 sm:to-transparent" />

      <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-10 sm:items-center sm:px-6 sm:pb-0 lg:px-8">
        <div className="max-w-lg animate-fade-in-up">
          {hero.eyebrow && (
            <p className="mb-3 text-[10px] tracking-[0.3em] text-sand uppercase sm:mb-4">
              {hero.eyebrow}
            </p>
          )}
          <h2 className="font-serif text-[1.75rem] leading-[1.15] text-charcoal sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            {hero.title}
          </h2>
          <a
            href={hero.buttonHref}
            className="mt-6 inline-flex min-h-[48px] items-center justify-center bg-charcoal px-8 py-3.5 text-[11px] font-medium tracking-[0.25em] text-cream uppercase transition-all active:scale-[0.98] sm:mt-8 sm:px-10 sm:py-4 hover:bg-charcoal/85"
          >
            {hero.buttonLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
