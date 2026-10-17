import Link from "next/link";
import { RotateCcw, Clock, Truck, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { DeliveryMethodIcon } from "@/components/dostawa/IkonaMetodyDostawy";
import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import { activeDeliveryMethods } from "@/lib/dostawa";
import { getDelivery } from "@/lib/serwer/dostawa";
import { stronaMeta } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeDelivery } from "@/lib/jezyk/trescCms";

export const metadata = stronaMeta({
  title: "Dostawa mebli",
  description: `Dostawa mebli i wyposażenia domu w ${storePolicies.deliveryTimeLabel}, koszt ${storePolicies.standardDeliveryPriceLabel}. ${storePolicies.returnsLabel} i odbiór z magazynu.`,
  path: "/dostawa",
});

export default async function DeliveryPage() {
  const [deliveryRaw, locale] = await Promise.all([
    getDelivery(),
    getRequestLocale(),
  ]);
  const delivery = await localizeDelivery(deliveryRaw, locale);
  const methods = activeDeliveryMethods(delivery.methods);

  return (
    <PageShell
      eyebrow="Pomoc"
      title="Dostawa i zwroty"
      description={`Dbamy o to, aby Twój mebel dotarł bezpiecznie i w dogodnym terminie. Masz też ${storePolicies.returnsLabel.toLowerCase()} — bez zbędnych formalności.`}
      heroImage="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85"
      path="/dostawa"
    >
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="section-kicker tracking-[0.12em] uppercase">
              {delivery.methodsSection.kicker}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {delivery.methodsSection.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {methods.map((opt) => (
              <div
                key={opt.id}
                className={`relative flex flex-col rounded-2xl p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-md ${
                  opt.highlight ? "bg-charcoal text-cream" : "bg-white"
                }`}
              >
                {opt.highlight && (
                  <span className="absolute -top-3 left-8 rounded-full bg-cream px-3 py-1 text-[9px] tracking-[0.2em] text-charcoal uppercase">
                    Polecane
                  </span>
                )}
                <DeliveryMethodIcon
                  icon={opt.icon}
                  className={`h-6 w-6 ${opt.highlight ? "text-cream/70" : "text-sand"}`}
                />
                <h3
                  className={`mt-6 font-serif text-2xl ${opt.highlight ? "text-cream" : "text-charcoal"}`}
                >
                  {opt.title}
                </h3>
                <p
                  className={`mt-1 text-sm font-medium ${opt.highlight ? "text-cream/80" : "text-charcoal"}`}
                >
                  {opt.priceLabel}
                </p>
                <p
                  className={`mt-4 text-sm leading-relaxed ${opt.highlight ? "text-cream/70" : "text-sand"}`}
                >
                  {opt.description}
                </p>
                <ul className="mt-6 flex-1 space-y-2">
                  {opt.features.map((feature) => (
                    <li
                      key={`${opt.id}-${feature}`}
                      className={`flex gap-2 text-sm ${opt.highlight ? "text-cream/80" : "text-charcoal/80"}`}
                    >
                      <span className={opt.highlight ? "text-cream/50" : "text-sand"}>
                        —
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-taupe/30 bg-cream-light py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14">
            <p className="section-kicker tracking-[0.12em] uppercase">
              {delivery.stepsSection.kicker}
            </p>
            <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {delivery.stepsSection.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {delivery.steps.map((step) => (
              <div key={step.id} className="relative">
                <span className="font-serif text-5xl text-taupe">{step.step}</span>
                <h3 className="mt-4 font-serif text-xl text-charcoal">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sand">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="rounded-2xl bg-cream-light p-10 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] lg:p-14">
              <RotateCcw className="h-8 w-8 text-sand" strokeWidth={1.2} />
              <h2 className="mt-6 font-serif text-3xl text-charcoal">
                {storePolicies.returnsLabel}
              </h2>
              <p className="mt-4 text-sm leading-[1.9] text-charcoal/80">
                Konsument ma {storePolicies.returnsDays} dni na odstąpienie od umowy
                bez podawania przyczyny. Nie wymagamy oryginalnego opakowania.
                Adres zwrotu: {company.returnsAddress}. Zwrot środków — na ten sam
                instrument płatniczy (PayU), w ciągu 14 dni.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  `Zgłoś zwrot na ${company.emailDisplay} albo wzorem formularza`,
                  "Odeślij mebel na adres zwrotu albo umów odbiór kurierem",
                  "Zwrot płatności na to samo konto / kartę / BLIK",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm text-charcoal/80"
                  >
                    <ShieldCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-sand"
                      strokeWidth={1.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/polityka-zwrotow"
                className="mt-8 inline-block text-[11px] tracking-[0.16em] text-charcoal uppercase underline underline-offset-4"
              >
                Pełna polityka zwrotów i pouczenie
              </Link>
            </div>
            <div className="space-y-8">
              {[
                {
                  icon: Clock,
                  title: "Terminy dostawy",
                  text: `Produkcja: ${storePolicies.productionTimeLabel}. Dostawa: ${storePolicies.deliveryTimeLabel} po zakończeniu produkcji lub ${storePolicies.pickupTitle.toLowerCase()}.`,
                },
                {
                  icon: Truck,
                  title: "Obszar dostawy",
                  text: "Dostarczamy na terenie całej Polski. W przypadku trudno dostępnych lokalizacji skontaktujemy się indywidualnie.",
                },
                {
                  icon: Truck,
                  title: "Co obejmuje cena dostawy",
                  text: "Transport do umówionego miejsca na poziomie wejścia (zwykle drzwi budynku). Wniesienie na piętro i ustawienie w mieszkaniu nie są w cenie. Sofy i narożniki zwykle jadą w całości; szafy i meble skrzyniowe mogą być do samodzielnego montażu — to jest na karcie produktu.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-6 border-b border-taupe/30 pb-8"
                >
                  <Icon className="h-5 w-5 shrink-0 text-sand" strokeWidth={1.5} />
                  <div>
                    <h3 className="font-serif text-xl text-charcoal">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sand">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-taupe/30 bg-charcoal py-16 text-cream">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <p className="text-sm text-cream/70">
            Masz pytania o dostawę lub zwrot?
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/faq"
              className="rounded-full border border-cream/30 px-8 py-3 text-[11px] tracking-[0.2em] uppercase transition-colors hover:bg-cream hover:text-charcoal"
            >
              Zobacz FAQ
            </Link>
            <Link
              href="/kontakt"
              className="rounded-full bg-cream px-8 py-3 text-[11px] font-semibold tracking-[0.12em] text-charcoal uppercase transition-colors hover:bg-cream/90"
            >
              Skontaktuj się
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
