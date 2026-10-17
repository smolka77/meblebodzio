import {
  Shield,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  MapPin,
} from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Gwarancja 2 lata",
  description: `${storePolicies.warrantyLabel} na meble i wyposażenie domu. Co obejmuje, jak zgłosić reklamację i jak długo trwa naprawa.`,
  path: "/gwarancja",
});

const covered = [
  "Wady fabryczne konstrukcji i ramy",
  "Defekty mechanizmów (np. funkcja spania)",
  "Pęknięcia i pęcherze w piankach",
  "Odkształcenia sprężyn i zawieszeń",
  "Wady montażowe wykonane przez Wrohaus",
];

const notCovered = [
  "Normalne zużycie materiałów i tapicerki",
  "Uszkodzenia mechaniczne spowodowane przez użytkownika",
  "Plamy i przebarwienia wynikające z niewłaściwej pielęgnacji",
  "Modyfikacje produktu przez osoby trzecie",
  "Uszkodzenia powstałe podczas transportu organizowanego przez klienta",
];

const claimSteps = [
  {
    step: "01",
    title: "Zgłoś reklamację",
    text: `Napisz na ${company.emailDisplay}. Dołącz numer zamówienia i opis wady. Odpowiadamy ${company.openingHoursDetail}.`,
  },
  {
    step: "02",
    title: "Weryfikacja",
    text: "Nasz zespół techniczny rozpatruje zgłoszenie w ciągu 14 dni. Możemy poprosić o zdjęcia.",
  },
  {
    step: "03",
    title: "Rozwiązanie",
    text: "Naprawa, wymiana elementu lub — w uzasadnionych przypadkach — wymiana produktu albo zwrot środków.",
  },
];

export default function WarrantyPage() {
  return (
    <PageShell
      eyebrow="Pomoc"
      title={storePolicies.warrantyLabel}
      description={`Każdy mebel Wrohaus objęty jest ${storePolicies.warrantyYears}-letnią gwarancją sprzedawcy. Stawiamy na jakość, która wytrzymuje lata codziennego użytkowania.`}
      heroImage="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=85"
      path="/gwarancja"
    >
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <Shield className="h-12 w-12 text-sand" strokeWidth={1} />
            <p className="mt-6 font-serif text-7xl text-charcoal md:text-8xl">
              {storePolicies.warrantyYears} lata
            </p>
            <p className="mt-2 text-[11px] tracking-[0.3em] text-sand uppercase">
              Gwarancji sprzedawcy
            </p>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-charcoal/80">
              Gwarancja sprzedawcy (Wrohaus) obejmuje wady fabryczne i konstrukcyjne.
              Liczy się od daty dostarczenia produktu i wymaga przechowywania dowodu
              zakupu. Niezależnie od tej gwarancji przysługuje Ci rękojmia
              (niezgodność towaru z umową) na zasadach ustawy o prawach konsumenta.
              Treść gwarancji jest na tej stronie.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-taupe/30 bg-cream-light py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="rounded-2xl bg-cream p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] lg:p-10">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-charcoal" strokeWidth={1.5} />
                <h2 className="font-serif text-2xl text-charcoal">
                  Co obejmuje gwarancja
                </h2>
              </div>
              <ul className="mt-8 space-y-4">
                {covered.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-charcoal/80"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-charcoal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] lg:p-10">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-sand" strokeWidth={1.5} />
                <h2 className="font-serif text-2xl text-charcoal">
                  Czego gwarancja nie obejmuje
                </h2>
              </div>
              <ul className="mt-8 space-y-4">
                {notCovered.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-sand"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-sand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-14">
            <p className="section-kicker tracking-[0.12em] uppercase">
              Procedura
            </p>
            <h2 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              Jak zgłosić reklamację
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {claimSteps.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-md"
              >
                <span className="font-serif text-4xl text-taupe">{s.step}</span>
                <h3 className="mt-4 font-serif text-xl text-charcoal">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-sand">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-taupe/30 bg-charcoal py-20 text-cream">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <FileText className="h-6 w-6 text-cream/60" strokeWidth={1.5} />
              <h2 className="mt-4 font-serif text-3xl">Potrzebujesz pomocy?</h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/70">
                Do każdego produktu dołączamy kartę gwarancyjną. W razie wątpliwości
                skontaktuj się z naszym działem reklamacji.
              </p>
            </div>
            <div className="space-y-6">
              <a
                href={`mailto:${company.email}`}
                className="flex items-center gap-4 rounded-2xl border border-cream/20 p-5 transition-colors hover:border-cream/40"
              >
                <Mail className="h-5 w-5 text-cream/70" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-cream/50 uppercase">
                    E-mail
                  </p>
                  <p className="text-sm text-cream">{company.emailDisplay}</p>
                  <p className="mt-1 text-xs text-cream/60">{company.openingHoursShort}</p>
                </div>
              </a>
              <div className="flex items-center gap-4 rounded-2xl border border-cream/20 p-5">
                <MapPin className="h-5 w-5 text-cream/70" strokeWidth={1.5} />
                <div>
                  <p className="text-[10px] tracking-[0.2em] text-cream/50 uppercase">
                    Adres korespondencji
                  </p>
                  <p className="text-sm text-cream">{company.fullAddress}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 max-w-2xl text-center text-sm leading-relaxed text-cream/70">
            Regulamin sklepu odsyła tutaj po szczegóły gwarancji. Warunki rękojmi
            (niezgodność towaru z umową) wynikają z ustawy o prawach konsumenta.
          </div>
        </div>
      </section>
    </PageShell>
  );
}
