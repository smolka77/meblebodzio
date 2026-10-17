import Link from "next/link";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { FaqAccordion } from "@/components/strony/FaqHarmonijka";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import { getFaqCategories } from "@/lib/serwer/faq";
import { jsonLdFaqPage, stronaMeta } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeFaqCategories } from "@/lib/jezyk/trescCms";

export const dynamic = "force-dynamic";

export const metadata = stronaMeta({
  title: "Pytania i odpowiedzi",
  description:
    `Dostawa ${storePolicies.deliveryTimeLabel}, ${storePolicies.returnsLabel}, ${storePolicies.warrantyLabel} i płatności PayU. Odpowiedzi przed zakupem mebli i wyposażenia domu.`,
  path: "/faq",
});

export default async function FaqPage() {
  const [faqRaw, locale] = await Promise.all([
    getFaqCategories(),
    getRequestLocale(),
  ]);
  const faqCategories = await localizeFaqCategories(faqRaw, locale);
  const faqItems = faqCategories.flatMap((category) => category.items);

  return (
    <PageShell
      eyebrow="Pomoc"
      title="Najczęściej zadawane pytania"
      description="Zebraliśmy odpowiedzi na pytania, które pojawiają się najczęściej. Nie znalazłeś tego, czego szukasz? Napisz do nas."
      path="/faq"
    >
      <DaneStrukturalne dane={jsonLdFaqPage(faqItems)} />
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <FaqAccordion categories={faqCategories} />
        </div>
      </section>

      <section className="border-t border-taupe/30 bg-cream-light py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                title: "Dostawa",
                text: "Terminy, koszty i wniesienie mebli",
                href: "/dostawa",
              },
              {
                title: "Zwroty",
                text: "14 dni, adres zwrotu i formularz odstąpienia",
                href: "/polityka-zwrotow",
              },
              {
                title: "Gwarancja",
                text: `${storePolicies.warrantyYears} lata ochrony na każdy produkt`,
                href: "/gwarancja",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-all hover:shadow-md"
              >
                <h3 className="font-serif text-xl text-charcoal group-hover:underline">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-sand">{card.text}</p>
                <span className="mt-4 inline-block text-[10px] tracking-[0.2em] text-charcoal uppercase">
                  Dowiedz się więcej →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <h2 className="font-serif text-3xl text-charcoal">
            Nadal masz pytania?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-sand">
            Nasz zespół chętnie pomoże. Kontakt {company.openingHoursDetail}.
          </p>
          <Link
            href="/kontakt"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-charcoal px-10 py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
          >
            Napisz do nas
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
