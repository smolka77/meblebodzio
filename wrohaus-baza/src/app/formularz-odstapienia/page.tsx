import { PageShell } from "@/components/strony/PowlokaStrony";
import { PrintButton } from "@/components/strony/PrzyciskDruku";
import { company, legalUpdated } from "@/lib/firma";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Formularz odstąpienia",
  description:
    `Wzór oświadczenia o odstąpieniu od umowy do wydruku albo wysłania na ${company.email}.`,
  path: "/formularz-odstapienia",
});

export default function WithdrawalFormPage() {
  const mailHref = `mailto:${company.email}?subject=${encodeURIComponent(
    "Oświadczenie o odstąpieniu od umowy — Wrohaus"
  )}`;

  return (
    <PageShell
      eyebrow="Dokument prawny"
      title="Formularz odstąpienia"
      description="Wzór z ustawy o prawach konsumenta. Wypełnij i wyślij e-mailem albo wydrukuj i nadaj listem. Formularz nie jest obowiązkowy."
    >
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 print:hidden">
            <a
              href={mailHref}
              className="inline-flex min-h-[44px] items-center rounded-full bg-charcoal px-6 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase"
            >
              Wyślij e-mailem
            </a>
            <PrintButton />
            <a
              href="/polityka-zwrotow"
              className="inline-flex min-h-[44px] items-center px-2 text-[11px] tracking-[0.12em] text-sand uppercase underline underline-offset-4"
            >
              Polityka zwrotów
            </a>
          </div>

          <article className="mt-10 rounded-2xl border border-taupe/40 bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-10">
            <p className="text-center text-[10px] tracking-[0.18em] text-sand uppercase">
              Załącznik nr 2 do ustawy o prawach konsumenta
            </p>
            <h2 className="mt-3 text-center font-serif text-2xl text-charcoal">
              Wzór formularza odstąpienia od umowy
            </h2>
            <p className="mt-3 text-center text-sm text-sand">
              (formularz ten należy wypełnić i odesłać tylko w przypadku chęci
              odstąpienia od umowy)
            </p>

            <div className="mt-10 space-y-6 text-sm leading-relaxed text-charcoal/85">
              <p>
                <span className="text-[10px] tracking-[0.16em] text-sand uppercase">
                  Adresat
                </span>
                <br />
                {company.returnsAddress}
                <br />
                {company.emailDisplay}
              </p>
              <p>
                Ja/My(*) niniejszym informuję/informujemy(*) o moim/naszym(*)
                odstąpieniu od umowy sprzedaży następujących rzeczy(*) / o
                świadczenie następującej usługi(*):
              </p>
              <div className="min-h-16 border-b border-taupe/50" />
              <p>
                Data zawarcia umowy(*) / odbioru(*):
                <span className="ml-3 inline-block min-w-[12rem] border-b border-taupe/50" />
              </p>
              <p>
                Imię i nazwisko konsumenta(-ów):
                <span className="ml-3 inline-block min-w-[14rem] border-b border-taupe/50" />
              </p>
              <p>
                Adres konsumenta(-ów):
              </p>
              <div className="min-h-12 border-b border-taupe/50" />
              <p>
                Podpis konsumenta(-ów) (tylko jeżeli formularz jest przesyłany w
                wersji papierowej):
              </p>
              <div className="min-h-16 border-b border-taupe/50" />
              <p>
                Data:
                <span className="ml-3 inline-block min-w-[10rem] border-b border-taupe/50" />
              </p>
              <p className="text-xs text-sand">(*) Niepotrzebne skreślić.</p>
            </div>
          </article>

          <p className="mt-8 text-xs leading-relaxed text-sand">
            Aktualizacja: {legalUpdated}. Pełne pouczenie:{" "}
            <a href="/polityka-zwrotow#pouczenie" className="underline underline-offset-2">
              Polityka zwrotów
            </a>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
