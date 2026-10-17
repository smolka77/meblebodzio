import Link from "next/link";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import type { HomepageBenefits } from "@/lib/stronaGlowna";

export function HomeBenefits({
  content,
  aboutArchived = false,
}: {
  content: HomepageBenefits;
  aboutArchived?: boolean;
}) {
  const workshopClass =
    "group relative min-h-[340px] overflow-hidden rounded-2xl sm:min-h-[400px] lg:min-h-full";
  const workshopHref = aboutArchived ? "" : content.workshop.href;

  const workshopInner = (
    <>
      <StoreImage
        src={content.workshop.image}
        alt={content.workshop.alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/35 to-charcoal/5" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="text-[14px] font-semibold tracking-[0.12em] text-terracotta uppercase">
          {content.workshop.kicker}
        </p>
        <h3 className="mt-2 font-serif text-3xl leading-tight text-cream sm:text-4xl">
          {content.workshop.title}
        </h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-cream/80">
          {content.workshop.body}
        </p>
      </div>
    </>
  );

  return (
    <section className="page-gutter py-12 sm:py-16">
      <div className="page-width">
        <p className="section-kicker text-terracotta">{content.eyebrow}</p>
        <h2 className="mt-1 font-serif text-3xl text-charcoal sm:text-4xl">
          {content.title}
        </h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-5">
          {workshopHref ? (
            <Link href={workshopHref} className={workshopClass}>
              {workshopInner}
            </Link>
          ) : (
            <div className={workshopClass}>{workshopInner}</div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex flex-col justify-between rounded-2xl bg-charcoal px-6 py-7 text-cream sm:px-8 sm:py-8">
              <p className="font-serif text-[4.5rem] leading-none tracking-[-0.06em] text-terracotta sm:text-7xl">
                {content.returns.highlight}
              </p>
              <div className="mt-6">
                <h3 className="text-xl font-semibold">{content.returns.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-cream/70">
                  {content.returns.body}
                </p>
                {content.returns.linkLabel && content.returns.linkHref ? (
                  <Link
                    href={content.returns.linkHref}
                    className="mt-4 inline-block text-[13px] font-medium text-cream underline decoration-terracotta/70 underline-offset-4 hover:text-terracotta"
                  >
                    {content.returns.linkLabel}
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl bg-white px-6 py-7 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:px-8 sm:py-8">
              <p className="font-serif text-[2.75rem] leading-none tracking-[-0.05em] text-charcoal sm:text-5xl">
                {content.shipping.highlight}
              </p>
              <div className="mt-6">
                <h3 className="text-xl font-semibold text-charcoal">
                  {content.shipping.title}
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-charcoal/70">
                  {content.shipping.body}
                </p>
                {content.shipping.linkLabel && content.shipping.linkHref ? (
                  <Link
                    href={content.shipping.linkHref}
                    className="mt-4 inline-block text-[13px] font-medium text-terracotta underline decoration-terracotta/40 underline-offset-4 hover:text-terracotta/80"
                  >
                    {content.shipping.linkLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
