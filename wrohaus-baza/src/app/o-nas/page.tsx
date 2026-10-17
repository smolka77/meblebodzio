import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { company } from "@/lib/firma";
import { isLocalUpload } from "@/lib/obrazy";
import { getAbout } from "@/lib/serwer/oNas";
import { stronaMeta } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeAbout } from "@/lib/jezyk/trescCms";

export async function generateMetadata(): Promise<Metadata> {
  const [aboutRaw, locale] = await Promise.all([getAbout(), getRequestLocale()]);
  if (aboutRaw.archived) {
    return { title: "O nas", robots: { index: false, follow: false } };
  }
  const about = await localizeAbout(aboutRaw, locale);
  return stronaMeta({
    title: about.metaTitle,
    description: about.metaDescription,
    path: "/o-nas",
  });
}

export default async function AboutPage() {
  const [aboutRaw, locale] = await Promise.all([getAbout(), getRequestLocale()]);
  if (aboutRaw.archived) notFound();
  const about = await localizeAbout(aboutRaw, locale);

  const storyLocal = isLocalUpload(about.story.image);
  const stats = about.stats.filter((item) => item.value.trim() || item.label.trim());
  const values = about.values.items.filter(
    (item) => item.title.trim() || item.text.trim()
  );
  const milestones = about.timeline.items.filter(
    (item) => item.year.trim() || item.event.trim()
  );

  return (
    <PageShell
      eyebrow={about.hero.eyebrow}
      title={about.hero.title}
      description={about.hero.description}
      heroImage={about.hero.image}
      path="/o-nas"
    >
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-cream-light sm:rounded-3xl">
              {storyLocal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={about.story.image}
                  alt={about.story.imageAlt}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={about.story.image}
                  alt={about.story.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
            </div>
            <div>
              {about.story.kicker.trim() ? (
                <p className="section-kicker tracking-[0.12em] uppercase">
                  {about.story.kicker}
                </p>
              ) : null}
              <h2 className="mt-3 font-serif text-3xl text-charcoal md:text-4xl">
                {about.story.title}
              </h2>
              {about.story.paragraph1.trim() ? (
                <p className="mt-6 text-sm leading-[1.9] text-charcoal/80">
                  {about.story.paragraph1}
                </p>
              ) : null}
              {about.story.paragraph2.trim() ? (
                <p className="mt-4 text-sm leading-[1.9] text-charcoal/80">
                  {about.story.paragraph2}
                </p>
              ) : null}
              <p className="mt-6 text-xs leading-relaxed text-sand">
                Sprzedawca: {company.sellerLine}. Kontakt:{" "}
                <a href={`mailto:${company.email}`} className="underline underline-offset-2">
                  {company.emailDisplay}
                </a>
                .
              </p>
              {stats.length > 0 ? (
                <div className="mt-10 grid grid-cols-3 gap-6 border-t border-taupe/30 pt-10">
                  {stats.map((stat) => (
                    <div key={`${stat.value}-${stat.label}`}>
                      <p className="font-serif text-3xl text-charcoal">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[10px] tracking-[0.15em] text-sand uppercase">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {values.length > 0 ? (
        <section className="bg-cream-light py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-14 text-center">
              {about.values.kicker.trim() ? (
                <p className="section-kicker tracking-[0.12em] uppercase">
                  {about.values.kicker}
                </p>
              ) : null}
              <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
                {about.values.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {values.map((v, i) => (
                <div
                  key={`${v.number}-${v.title}-${i}`}
                  className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]"
                >
                  {v.number.trim() ? (
                    <span className="font-serif text-4xl text-taupe">
                      {v.number}
                    </span>
                  ) : null}
                  <h3 className="mt-4 font-serif text-xl text-charcoal">
                    {v.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-sand">
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {milestones.length > 0 ? (
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            {about.timeline.kicker.trim() ? (
              <p className="text-center section-kicker tracking-[0.12em] uppercase">
                {about.timeline.kicker}
              </p>
            ) : null}
            <h2 className="mt-2 text-center font-serif text-3xl text-charcoal">
              {about.timeline.title}
            </h2>
            <div className="mt-14 space-y-0">
              {milestones.map((m, i) => (
                <div
                  key={`${m.year}-${i}`}
                  className="relative flex gap-8 border-l border-taupe/40 pb-12 pl-8 last:pb-0"
                >
                  <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-charcoal" />
                  <span className="w-16 shrink-0 font-serif text-xl text-charcoal">
                    {m.year}
                  </span>
                  <p className="text-sm leading-relaxed text-charcoal/80">
                    {m.event}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-taupe/30 bg-charcoal py-20 text-cream">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <h2 className="font-serif text-3xl md:text-4xl">{about.cta.title}</h2>
          {about.cta.text.trim() ? (
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-cream/70">
              {about.cta.text}
            </p>
          ) : null}
          <Link
            href={about.cta.buttonHref}
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full border border-cream/30 px-10 py-4 text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors hover:bg-cream hover:text-charcoal"
          >
            {about.cta.buttonLabel}
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
