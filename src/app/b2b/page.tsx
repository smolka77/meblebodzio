import { Building2, Handshake, Ruler } from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { B2bForm } from "@/components/strony/FormularzB2b";
import { company } from "@/lib/firma";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Meble dla hoteli i biur",
  description:
    "Wyposażenie wnętrz na zamówienie: hotele, apartamenty, biura i projektanci. Wycena B2B, powtarzalne serie, polska produkcja.",
  path: "/b2b",
});

const offers = [
  {
    icon: Building2,
    title: "Hotele i apartamenty",
    text: "Powtarzalne modele, stała paleta tkanin i terminy dopasowane do otwarcia obiektu.",
  },
  {
    icon: Ruler,
    title: "Architekci i projektanci",
    text: "Wsparcie przy doborze, próbki tkanin i wycena pod konkretny projekt.",
  },
  {
    icon: Handshake,
    title: "Partnerzy handlowi",
    text: "Warunki hurtowe i stała współpraca dla sklepów oraz dystrybutorów.",
  },
];

export default function B2bPage() {
  return (
    <PageShell
      eyebrow="Współprace"
      title="Wrohaus dla firm"
      description="Hotele, apartamenty, biura i projektanci — meble polskiej produkcji, wycena pod kontrakt i stała współpraca B2B."
      heroImage="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85"
      path="/b2b"
    >
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
            {offers.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8"
              >
                <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.75} />
                <h2 className="mt-4 font-serif text-xl text-charcoal">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/70">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="formularz"
        className="scroll-mt-28 border-t border-taupe/30 bg-cream-light py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <p className="section-kicker tracking-[0.12em] uppercase">
                Formularz B2B
              </p>
              <h2 className="mt-2 font-serif text-3xl text-charcoal">
                Napisz, jak możemy współpracować
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-sand">
                Opisz obiekt, zakres i orientacyjną liczbę sztuk. Odpowiadamy
                na zapytania firmowe {company.openingHoursDetail}.
              </p>
              <div className="mt-10 space-y-3 border-t border-taupe/30 pt-10 text-sm text-charcoal/80">
                <p>Wycena kontraktowa i powtarzalne zamówienia</p>
                <p>Próbki tkanin do biura lub na budowę</p>
                <p>Polska produkcja — kontrola terminu i jakości</p>
              </div>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] lg:p-10">
              <B2bForm />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
