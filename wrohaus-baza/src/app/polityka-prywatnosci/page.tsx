import { PageShell } from "@/components/strony/PowlokaStrony";
import { LegalDocument, P, Ul } from "@/components/strony/DokumentPrawny";
import { company, legalUpdated } from "@/lib/firma";
import { payu } from "@/lib/payu";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Polityka prywatności",
  description:
    "Administrator danych, cele i podstawy RODO, PayU S.A. jako odbiorca, prawa klienta i bezpieczeństwo w Wrohaus.",
  path: "/polityka-prywatnosci",
});

export default function PrivacyPage() {
  const sections = [
    {
      id: "administrator",
      title: "Administrator danych",
      content: (
        <>
          <P>
            Administratorem danych osobowych Klientów Sklepu jest {company.sellerLine}.
            Kontakt: e-mail{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-2">
              {company.emailDisplay}
            </a>
            , adres: {company.fullAddress}, {company.openingHoursDetail}.
          </P>
          <P>
            Administrator nie wyznaczył inspektora ochrony danych. W sprawach
            RODO wystarczy kontakt pod powyższym adresem e-mail.
          </P>
          <P>
            Niezależnym administratorem danych związanych z realizacją płatności
            online jest {payu.legalName}, {payu.address}, KRS {payu.krs}, NIP{" "}
            {payu.nip}, kapitał zakładowy {payu.shareCapital} (wpłacony w całości).
            Polityka prywatności PayU:{" "}
            <a
              href={payu.privacyUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              poland.payu.com/privacy-portal
            </a>
            .
          </P>
        </>
      ),
    },
    {
      id: "zakres",
      title: "Jakie dane zbieramy",
      content: (
        <>
          <P>W ramach korzystania ze Sklepu możemy przetwarzać:</P>
          <Ul
            items={[
              "Dane identyfikacyjne: imię, nazwisko",
              "Dane kontaktowe: adres e-mail, numer telefonu, adres dostawy i korespondencyjny",
              "Dane zamówienia: pozycje, cena, status, historia zakupów",
              "Dane płatności przekazywane do PayU (kwota, tytuł, dane odbiorcy) — Sklep nie zapisuje pełnego numeru karty ani kodu CVV",
              "Dane konta: login, hasło w postaci hasza",
              "Dane techniczne: adres IP, typ przeglądarki, pliki cookies zgodnie z Polityką cookies",
              "Treść korespondencji (formularz, czat, e-mail)",
            ]}
          />
        </>
      ),
    },
    {
      id: "cele",
      title: "Cele i podstawy prawne",
      content: (
        <>
          <P>Dane przetwarzamy w następujących celach i na następujących podstawach RODO:</P>
          <Ul
            items={[
              "Zawarcie i wykonanie umowy sprzedaży, obsługa konta, dostawa, kontakt w sprawie zamówienia — art. 6 ust. 1 lit. b RODO",
              "Płatności online za pośrednictwem PayU — art. 6 ust. 1 lit. b RODO (umowa) oraz — po stronie PayU — własne podstawy PayU jako administratora",
              "Wystawianie faktur, księgowość, obowiązki podatkowe — art. 6 ust. 1 lit. c RODO",
              "Reklamacje, rękojmia, gwarancja, odstąpienie od umowy — art. 6 ust. 1 lit. b, c i f RODO",
              "Ustalenie, dochodzenie i obrona roszczeń — art. 6 ust. 1 lit. f RODO",
              "Odpowiedź na zapytania z formularza kontaktowego i czatu — art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy, gdy pytasz o produkt lub zamówienie) albo art. 6 ust. 1 lit. f RODO (uzasadniony interes: obsługa korespondencji). Nie opieramy tej odpowiedzi wyłącznie na zgodzie.",
              "Newsletter i marketing e-mail — wyłącznie za zgodą, art. 6 ust. 1 lit. a RODO",
              "Analityka odwiedzin Sklepu — wyłącznie za zgodą na cookies analityczne, art. 6 ust. 1 lit. a RODO",
              "Remarketing (w tym Meta) — wyłącznie za zgodą na cookies marketingowe, art. 6 ust. 1 lit. a RODO",
            ]}
          />
          <P>
            Podanie danych oznaczonych jako wymagane przy zamówieniu jest niezbędne
            do zawarcia umowy. Brak tych danych uniemożliwia realizację zakupu.
          </P>
        </>
      ),
    },
    {
      id: "odbiorcy",
      title: "Odbiorcy danych",
      content: (
        <>
          <P>
            Dane mogą być ujawniane podmiotom, które muszą je otrzymać, aby Sklep
            działał zgodnie z prawem i umową:
          </P>
          <Ul
            items={[
              `${payu.legalName} (KRS ${payu.krs}, NIP ${payu.nip}) — operator płatności; PayU jest samodzielnym administratorem danych płatniczych`,
              "Firmy kurierskie i transportowe — w zakresie niezbędnym do dostawy lub odbioru zwrotu",
              "Dostawca hostingu i utrzymania serwera Sklepu",
              "Biuro rachunkowe i doradcy prawni",
              "Podmioty uprawnione na podstawie przepisów (np. urząd skarbowy, sąd)",
            ]}
          />
          <P>
            Nie sprzedajemy danych osobowych. Narzędzia analityczne i reklamowe
            (w tym Meta Pixel) nie są uruchamiane bez Twojej zgody na odpowiednią
            kategorię cookies.
          </P>
        </>
      ),
    },
    {
      id: "payu",
      title: "PayU jako administrator płatności",
      content: (
        <>
          <P>{payu.privacyNotice}</P>
          <P>{payu.privacyNoticeMore}</P>
          <P>
            Więcej informacji o zasadach przetwarzania danych przez PayU:{" "}
            <a
              href={payu.privacyUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Polityka prywatności PayU
            </a>
            . Zasady płatności:{" "}
            <a
              href={payu.paymentTermsUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Regulamin pojedynczej transakcji płatniczej PayU
            </a>
            .
          </P>
        </>
      ),
    },
    {
      id: "okres",
      title: "Okres przechowywania",
      content: (
        <Ul
          items={[
            "Dane zamówień i faktur — przez okres wymagany przepisami rachunkowymi i podatkowymi (co do zasady 5 lat od końca roku podatkowego)",
            "Dane konta — do usunięcia konta, z zastrzeżeniem dokumentów, które musimy zachować ustawowo",
            "Korespondencja reklamacyjna — do przedawnienia roszczeń, zwykle do 6 lat",
            "Zgody marketingowe — do cofnięcia zgody",
            "Cookies analityczne i marketingowe — zgodnie z Polityką cookies, nie dłużej niż 12 miesięcy od zgody, o ile wcześniej jej nie cofniesz",
          ]}
        />
      ),
    },
    {
      id: "prawa",
      title: "Twoje prawa",
      content: (
        <>
          <P>Przysługuje Ci:</P>
          <Ul
            items={[
              "dostęp do danych oraz kopia danych",
              "sprostowanie (poprawienie) danych",
              "usunięcie danych („prawo do bycia zapomnianym”) — gdy pozwalają na to przepisy",
              "ograniczenie przetwarzania",
              "przenoszenie danych",
              "sprzeciw wobec przetwarzania opartego na art. 6 ust. 1 lit. f RODO",
              "cofnięcie zgody w dowolnym momencie (bez wpływu na zgodność przetwarzania przed cofnięciem)",
              "skarga do Prezesa Urzędu Ochrony Danych Osobowych (uodo.gov.pl)",
            ]}
          />
          <P>
            Wniosek złóż na{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-2">
              {company.emailDisplay}
            </a>
            . Odpowiadamy bez zbędnej zwłoki, nie później niż w ciągu 30 dni.
          </P>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Pliki cookies",
      content: (
        <P>
          Zasady stosowania cookies, w tym możliwość zgody i odmowy, opisuje osobna{" "}
          <a href="/polityka-cookies" className="underline underline-offset-2">
            Polityka cookies
          </a>
          . Cookies niezbędne (koszyk, sesja logowania, bezpieczeństwo) działają
          bez zgody. Cookies analityczne i marketingowe — wyłącznie po Twojej
          zgodzie na daną kategorię.
        </P>
      ),
    },
    {
      id: "bezpieczenstwo",
      title: "Bezpieczeństwo",
      content: (
        <P>
          Stosujemy środki techniczne i organizacyjne: szyfrowanie HTTPS (SSL/TLS),
          ograniczenie dostępu do panelu administracyjnego, kopie zapasowe oraz
          hasła w postaci nieodwracalnego hasza. Płatności kartą realizuje PayU
          zgodnie z PCI DSS. Sklep nie przechowuje pełnych danych kart płatniczych.
        </P>
      ),
    },
    {
      id: "przekazanie",
      title: "Przekazanie poza EOG",
      content: (
        <P>
          Zasadniczo przetwarzamy dane na terenie Europejskiego Obszaru
          Gospodarczego. PayU S.A. ma siedzibę w Polsce. Jeżeli w przyszłości
          skorzystamy z narzędzia z siedzibą poza EOG (np. po zgodzie na analitykę),
          poinformujemy o tym w Polityce cookies i zapewnimy mechanizm zgodny z
          RODO (decyzja stwierdzająca odpowiedni stopień ochrony albo standardowe
          klauzule umowne).
        </P>
      ),
    },
    {
      id: "zmiany",
      title: "Zmiany polityki",
      content: (
        <P>
          Aktualna wersja jest zawsze pod adresem /polityka-prywatnosci. O istotnych
          zmianach poinformujemy w Sklepie. Polityka obowiązuje od {legalUpdated} r.
        </P>
      ),
    },
  ];

  return (
    <PageShell
      eyebrow="Ochrona danych"
      title="Polityka prywatności"
      description="Informacje wymagane przez RODO i PayU: kto jest administratorem, po co przetwarzamy dane, kto je otrzymuje i jakie masz prawa."
    >
      <LegalDocument updated={legalUpdated} sections={sections} />
    </PageShell>
  );
}
