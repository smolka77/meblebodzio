import { PageShell } from "@/components/strony/PowlokaStrony";
import { LegalDocument, P, Ul } from "@/components/strony/DokumentPrawny";
import { company, legalUpdated } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import { payu } from "@/lib/payu";
import { stronaMeta } from "@/lib/seo";
import { getSettings } from "@/lib/serwer/ustawienia";

export const metadata = stronaMeta({
  title: "Regulamin sklepu",
  description:
    "Zasady zamówień, płatności PayU, dostawy, zwrotów i reklamacji w sklepie internetowym Wrohaus.",
  path: "/regulamin",
});

export default async function TermsPage() {
  const settings = await getSettings();
  const contactPhone = settings.phone?.trim();
  const phoneContact = contactPhone ? `, telefon ${contactPhone}` : "";

  const sections = [
    {
      id: "postanowienia",
      title: "Postanowienia ogólne",
      content: (
        <>
          <P>
            Niniejszy Regulamin określa zasady korzystania ze sklepu
            internetowego {company.brandName} dostępnego pod adresem{" "}
            {company.domain} („Sklep”) oraz zasady zawierania umów sprzedaży
            na odległość.
          </P>
          <P>
            Sprzedawcą i właścicielem Sklepu jest {company.sellerLine}. Nazwa
            handlowa widoczna na stronie i na wyciągu płatności:{" "}
            {company.statementName}.
          </P>
          <P>
            Kontakt z obsługą klienta: e-mail{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-2">
              {company.emailDisplay}
            </a>
            {company.phoneDisplay ? (
              <>
                , telefon {company.phoneDisplay}
              </>
            ) : phoneContact ? (
              phoneContact
            ) : null}
            , adres korespondencyjny: {company.fullAddress}, godziny:{" "}
            {company.openingHoursDetail}.
          </P>
          <P>
            Język Sklepu i umów: polski. Waluta: polski złoty (PLN). Ceny są
            cenami brutto i zawierają podatek VAT. Sprzedawca prowadzi sprzedaż
            na terenie Polski.
          </P>
          <P>
            Regulamin jest nieodpłatnie udostępniany przed zawarciem umowy, w
            sposób umożliwiający jego pobranie, utrwalenie i wydrukowanie.
          </P>
        </>
      ),
    },
    {
      id: "definicje",
      title: "Definicje",
      content: (
        <Ul
          items={[
            "Konsument — osoba fizyczna zawierająca umowę niezwiązaną bezpośrednio z jej działalnością gospodarczą lub zawodową.",
            "Przedsiębiorca na prawach konsumenta — osoba fizyczna zawierająca umowę bezpośrednio związaną z jej działalnością gospodarczą, gdy z treści umowy wynika, że nie ma ona dla niej charakteru zawodowego.",
            `Sprzedawca — ${company.legalName}, NIP ${company.nip}, REGON ${company.regon}, ${company.fullAddress}.`,
            "Klient — Konsument, Przedsiębiorca na prawach konsumenta albo inny przedsiębiorca korzystający ze Sklepu.",
            "Produkt — meble tapicerowane, materace, szafy i pozostałe towary z oferty Sklepu, wraz z opisem, ceną i zdjęciem na karcie produktu.",
            "PayU — PayU S.A. z siedzibą w Poznaniu, operator płatności internetowych.",
          ]}
        />
      ),
    },
    {
      id: "skladanie",
      title: "Składanie zamówień i zawarcie umowy",
      content: (
        <>
          <P>
            Zamówienia można składać 24 godziny na dobę przez koszyk w Sklepie.
            Klient dodaje Produkt, podaje dane do realizacji (imię, nazwisko,
            adres e-mail, telefon, adres dostawy), akceptuje Regulamin i
            Politykę prywatności, a następnie klika przycisk „Zamawiam i płacę”.
            Kliknięcie tego przycisku oznacza obowiązek zapłaty.
          </P>
          <P>
            Umowa sprzedaży zostaje zawarta z chwilą potwierdzenia przyjęcia
            zamówienia przez Sprzedawcę (e-mail). Potwierdzenie zawiera m.in.
            dane Sprzedawcy, główne cechy Produktu, cenę, koszty dostawy, dane
            PayU oraz pouczenie o prawie odstąpienia.
          </P>
          <P>
            Czas realizacji zamówienia (produkcja + przygotowanie do wysyłki):{" "}
            {storePolicies.productionTimeLabel}, liczony w dniach roboczych od
            zaksięgowania płatności. Następnie dostawa standardowa trwa{" "}
            {storePolicies.deliveryTimeLabel}. Produkty oznaczone jako meble od
            ręki są wysyłane bez etapu produkcji, w terminie dostawy wskazanym
            na karcie.
          </P>
          <P>
            Sprzedawca może odmówić realizacji przy błędnych danych, braku
            płatności albo braku dostępności Produktu — w takim wypadku
            niezwłocznie informuje Klienta i zwraca otrzymane środki tą samą
            metodą płatności.
          </P>
        </>
      ),
    },
    {
      id: "ceny",
      title: "Ceny, płatności i PayU",
      content: (
        <>
          <P>
            Ceny na kartach Produktów zawierają VAT i są podane w PLN. Koszt
            dostawy i ewentualne inne opłaty są zawsze wskazane w koszyku przed
            złożeniem zamówienia. Zmiana cen nie dotyczy już złożonych zamówień.
          </P>
          <P>Dostępne metody płatności (obsługiwane przez PayU, o ile włączone w Sklepie):</P>
          <Ul
            items={[
              "BLIK",
              "Szybki przelew (Pay-by-link)",
              "Karta płatnicza (Visa, Mastercard)",
              "Raty PayU / odroczona płatność — jeśli udostępnione przy kasie",
            ]}
          />
          <P>
            Płatność jest realizowana przez {payu.legalName}, {payu.address},
            KRS {payu.krs}, NIP {payu.nip}, kapitał zakładowy {payu.shareCapital}{" "}
            (wpłacony w całości). Środki są pobierane w chwili złożenia
            zlecenia płatniczego (przy płatności natychmiastowej) albo zgodnie z
            harmonogramem rat. PayU nie przechowuje danych kart w Sklepie —
            Sklep nie zapisuje pełnego numeru karty.
          </P>
          <P>{payu.paymentOrderNotice}</P>
          <P>
            {payu.paymentTermsNotice}{" "}
            <a
              href={payu.termsUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              Dokumenty prawne PayU
            </a>
            .
          </P>
          <P>
            Transmisja danych jest szyfrowana protokołem SSL/TLS. PayU stosuje
            standardy PCI DSS. Zwrot środków za transakcję PayU następuje na ten
            sam instrument płatniczy, którym zapłacono.
          </P>
        </>
      ),
    },
    {
      id: "dostawa",
      title: "Dostawa i ograniczenia",
      content: (
        <>
          <P>
            Dostawa na terenie Polski: firmy kurierskie albo transport własny
            Sprzedawcy. Koszt dostawy standardowej:{" "}
            {storePolicies.standardDeliveryPriceLabel} (dokładna kwota w koszyku).{" "}
            {storePolicies.pickupTitle} — bezpłatnie, po umówieniu terminu.
          </P>
          <P>
            Ograniczenia: Sklep nie prowadzi sprzedaży poza Polską. Przy
            lokalizacjach trudno dostępnych Sprzedawca może zaproponować inny
            koszt lub odbiór własny. Ryzyko utraty i uszkodzenia towaru przechodzi
            na Konsumenta z chwilą jego objęcia w posiadanie.
          </P>
        </>
      ),
    },
    {
      id: "odstapienie",
      title: "Prawo odstąpienia od umowy",
      content: (
        <>
          <P>
            Konsument i Przedsiębiorca na prawach konsumenta mogą odstąpić od
            umowy zawartej na odległość w terminie {storePolicies.returnsDays} dni
            bez podania przyczyny. Termin liczy się od objęcia Produktu w
            posiadanie (przy kilku przesyłkach — od objęcia ostatniej).
          </P>
          <P>
            Szczegółowa procedura, adres zwrotu, skutki odstąpienia i wzór
            oświadczenia:{" "}
            <a href="/polityka-zwrotow" className="underline underline-offset-2">
              Polityka zwrotów
            </a>{" "}
            oraz{" "}
            <a href="/formularz-odstapienia" className="underline underline-offset-2">
              formularz odstąpienia
            </a>
            . Pouczenie zgodne z ustawą o prawach konsumenta znajduje się na
            stronie polityki zwrotów.
          </P>
          <P>
            Prawo odstąpienia nie przysługuje m.in. w odniesieniu do Produktów
            niemających prefabrykowanego charakteru, wyprodukowanych według
            specyfikacji Klienta lub służących zaspokojeniu jego
            zindywidualizowanych potrzeb (art. 38 pkt 3 ustawy o prawach
            konsumenta) — np. meble na wymiar. O wyłączeniu Klient jest
            informowany przed złożeniem zamówienia.
          </P>
        </>
      ),
    },
    {
      id: "reklamacje",
      title: "Reklamacje, rękojmia i gwarancja",
      content: (
        <>
          <P>
            Sprzedawca odpowiada z tytułu niezgodności towaru z umową (rękojmia)
            na zasadach ustawy o prawach konsumenta. Dodatkowo udziela gwarancji
            jakości sprzedawcy na {storePolicies.warrantyYears} lata. Treść
            gwarancji:{" "}
            <a href="/gwarancja" className="underline underline-offset-2">
              Gwarancja
            </a>
            .
          </P>
          <P>
            Reklamacje: e-mail{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-2">
              {company.emailDisplay}
            </a>
            {contactPhone ? (
              <>
                , telefon{" "}
                <a href={`tel:${contactPhone.replace(/\s/g, "")}`} className="underline underline-offset-2">
                  {contactPhone}
                </a>
              </>
            ) : null}{" "}
            albo listownie: {company.fullAddress}. Zgłoszenie powinno zawierać
            dane Klienta, numer zamówienia, opis wady i żądanie. Odpowiedź w
            ciągu 14 dni kalendarzowych, {company.openingHoursDetail}.
          </P>
        </>
      ),
    },
    {
      id: "dane",
      title: "Dane osobowe i cookies",
      content: (
        <>
          <P>
            Administratorem danych w Sklepie jest Sprzedawca. Zasady:{" "}
            <a href="/polityka-prywatnosci" className="underline underline-offset-2">
              Polityka prywatności
            </a>
            . W zakresie płatności administratorem jest również {payu.legalName}{" "}
            —{" "}
            <a
              href={payu.privacyUrl}
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              polityka prywatności PayU
            </a>
            .
          </P>
          <P>
            Pliki cookies:{" "}
            <a href="/polityka-cookies" className="underline underline-offset-2">
              Polityka cookies
            </a>
            .
          </P>
        </>
      ),
    },
    {
      id: "pozostale",
      title: "Pozasądowe spory i postanowienia końcowe",
      content: (
        <>
          <P>
            Europejska platforma ODR (Online Dispute Resolution) została zamknięta
            20 lipca 2025 r. i nie przyjmuje już sporów. Konsument może skorzystać
            z pozasądowego rozwiązywania sporów w Polsce: Rzecznik Praw Konsumenta,
            mediacja UOKiK oraz stałe polubowne sądy konsumenckie przy wojewódzkich
            inspektoratach Inspekcji Handlowej. Wykaz podmiotów ADR:{" "}
            <a
              href="https://www.uokik.gov.pl/"
              className="underline underline-offset-2"
              target="_blank"
              rel="noreferrer"
            >
              uokik.gov.pl
            </a>
            .
          </P>
          <P>
            Prawem właściwym jest prawo polskie. W sprawach nieuregulowanych
            stosuje się Kodeks cywilny oraz ustawę o prawach konsumenta.
          </P>
          <P>
            Zmiana Regulaminu wchodzi w życie po 14 dniach od publikacji w
            Sklepie i nie dotyczy umów zawartych wcześniej. Regulamin obowiązuje
            od {legalUpdated} r.
          </P>
        </>
      ),
    },
  ];

  return (
    <PageShell
      eyebrow="Dokument prawny"
      title="Regulamin sklepu"
      description="Warunki sprzedaży, płatności PayU, dostawy, zwrotów i reklamacji w sklepie Wrohaus."
    >
      <LegalDocument updated={legalUpdated} sections={sections} />
    </PageShell>
  );
}
