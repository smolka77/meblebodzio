import { PageShell } from "@/components/strony/PowlokaStrony";
import { LegalDocument, P, Ul } from "@/components/strony/DokumentPrawny";
import { company, legalUpdated } from "@/lib/firma";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Polityka cookies",
  description:
    "Niezbędne cookies i te wymagające zgody. Równa możliwość akceptacji i odmowy w sklepie Wrohaus.",
  path: "/polityka-cookies",
});

export default function CookiePolicyPage() {
  const sections = [
    {
      id: "czym",
      title: "Czym są cookies",
      content: (
        <P>
          Pliki cookies to niewielkie informacje zapisywane na urządzeniu
          (przeglądarka), potrzebne do działania strony, zapamiętania sesji albo —
          za zgodą — do statystyk. Podstawa: Prawo komunikacji elektronicznej oraz
          RODO. Administratorem jest {company.sellerLine}.
        </P>
      ),
    },
    {
      id: "zgoda",
      title: "Zgoda i odmowa",
      content: (
        <>
          <P>
            Przy pierwszej wizycie pokazujemy baner z równorzędnymi opcjami:
            akceptacją wszystkich cookies opcjonalnych oraz ich odrzuceniem.
            Cookies niezbędne działają zawsze — bez nich nie działa koszyk,
            logowanie ani bezpieczeństwo sesji. Osobno możesz włączyć analitykę
            oraz marketing (remarketing Meta), gdy te narzędzia będą używane.
          </P>
          <P>
            Zgodę możesz zmienić w każdej chwili: link „Ustawienia cookies” w
            stopce albo ponowne otwarcie banera. Odmowa nie blokuje zakupów.
          </P>
        </>
      ),
    },
    {
      id: "niezbedne",
      title: "Cookies niezbędne",
      content: (
        <>
          <P>Stosujemy je na podstawie prawnie uzasadnionego interesu i art. 6 ust. 1 lit. b/f RODO, bez wymogu zgody:</P>
          <Ul
            items={[
              "sesja logowania do konta i panelu (m.in. plik sesyjny SOFSESSID)",
              "koszyk i preferencje zakupowe w przeglądarce",
              "zabezpieczenie formularzy i sesji",
              "zapis Twojej decyzji o cookies (żeby nie pytać przy każdej podstronie)",
              "identyfikator czatu obsługi klienta (pierwsza strona, wyłącznie do prowadzenia rozmowy)",
            ]}
          />
        </>
      ),
    },
    {
      id: "analityczne",
      title: "Cookies analityczne (zgoda)",
      content: (
        <>
          <P>
            Po wyrażeniu zgody Sklep może zapisywać anonimowy identyfikator sesji
            odwiedzin (statystyki ścieżki, koszyk — na potrzeby ulepszania Sklepu).
            Bez zgody te pomiary nie są włączane.
          </P>
          <P>
            Analityka nie jest narzędziem reklamowym. Remarketing (w tym Meta Pixel)
            wymaga osobnej zgody marketingowej poniżej.
          </P>
        </>
      ),
    },
    {
      id: "marketingowe",
      title: "Cookies marketingowe (zgoda)",
      content: (
        <>
          <P>
            Ta kategoria jest przeznaczona na remarketing, w tym Meta Pixel
            (Facebook / Instagram), gdy Sklep go uruchomi. Bez zgody marketingowej
            nie ładujemy pikseli reklamowych ani podobnych narzędzi.
          </P>
          <P>
            Zgodę możesz dać przyciskiem „Akceptuję wszystkie” albo osobno w
            ustawieniach cookies. Odmowa nie blokuje zakupów. Cofnięcie zgody:
            „Ustawienia cookies” w stopce.
          </P>
        </>
      ),
    },
    {
      id: "okres",
      title: "Okres i zarządzanie",
      content: (
        <>
          <Ul
            items={[
              "Cookies sesyjne — do zamknięcia przeglądarki",
              "Cookies stałe — maksymalnie 12 miesięcy, o ile wcześniej nie cofniesz zgody",
              "Możesz też usunąć cookies w ustawieniach przeglądarki",
            ]}
          />
          <P>
            Szczegóły przetwarzania danych osobowych:{" "}
            <a href="/polityka-prywatnosci" className="underline underline-offset-2">
              Polityka prywatności
            </a>
            .
          </P>
        </>
      ),
    },
  ];

  return (
    <PageShell
      eyebrow="Ochrona danych"
      title="Polityka cookies"
      description="Niezbędne cookies działają zawsze. Analityczne i marketingowe — tylko po zgodzie. Akceptacja i odmowa są równoważne."
    >
      <LegalDocument updated={legalUpdated} sections={sections} />
    </PageShell>
  );
}
