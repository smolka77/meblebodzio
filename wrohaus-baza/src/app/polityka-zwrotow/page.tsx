import Link from "next/link";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { LegalDocument, P, Ul } from "@/components/strony/DokumentPrawny";
import { company, legalUpdated } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import { stronaMeta } from "@/lib/seo";

export const metadata = stronaMeta({
  title: "Polityka zwrotów",
  description:
    "14 dni na odstąpienie od umowy, adres zwrotu, koszty odesłania i zwrot środków na to samo konto PayU.",
  path: "/polityka-zwrotow",
});

export default function ReturnsPolicyPage() {
  const sections = [
    {
      id: "termin",
      title: "Termin 14 dni",
      content: (
        <>
          <P>
            Konsument oraz przedsiębiorca na prawach konsumenta mogą odstąpić od
            umowy zawartej na odległość w terminie {storePolicies.returnsDays} dni
            bez podawania przyczyny i bez ponoszenia kosztów innych niż przewidziane
            ustawą (w szczególności bezpośrednie koszty zwrotu rzeczy).
          </P>
          <P>
            Termin liczy się od dnia, w którym Klient lub wskazana przez niego osoba
            trzecia inna niż przewoźnik weszła w posiadanie rzeczy. Przy wielu
            rzeczach dostarczanych osobno — od objęcia w posiadanie ostatniej rzeczy.
          </P>
        </>
      ),
    },
    {
      id: "adres",
      title: "Adres zwrotu i zgłoszenie",
      content: (
        <>
          <P>Oświadczenie o odstąpieniu i zwrot towaru kieruj na:</P>
          <P>
            {company.returnsAddress}
            <br />
            e-mail:{" "}
            <a href={`mailto:${company.email}`} className="underline underline-offset-2">
              {company.emailDisplay}
            </a>
          </P>
          <P>
            Możesz skorzystać z{" "}
            <Link href="/formularz-odstapienia" className="underline underline-offset-2">
              wzoru formularza odstąpienia
            </Link>
            . Formularz nie jest obowiązkowy — wystarczy jednoznaczne oświadczenie
            (e-mail lub list).
          </P>
          <P>
            Aby zachować termin, wystarczy wysłać oświadczenie przed jego upływem.
            Rzecz należy odesłać lub przekazać Sprzedawcy niezwłocznie, nie później
            niż w ciągu 14 dni od dnia odstąpienia.
          </P>
        </>
      ),
    },
    {
      id: "stan",
      title: "Stan towaru i opakowanie",
      content: (
        <>
          <P>
            Możesz rozpakować i sprawdzić mebel w zakresie niezbędnym do stwierdzenia
            jego charakteru, cech i funkcjonowania — tak jak w sklepie stacjonarnym.
            Nie wymagamy oryginalnego opakowania jako warunku odstąpienia.
          </P>
          <P>
            Ponosisz odpowiedzialność za zmniejszenie wartości rzeczy wynikające z
            korzystania z niej w sposób wykraczający poza konieczny do stwierdzenia
            charakteru, cech i funkcjonowania. Prosimy o zabezpieczenie mebla na czas
            transportu zwrotnego (najlepiej w opakowaniu fabrycznym, jeśli je
            zachowałeś).
          </P>
        </>
      ),
    },
    {
      id: "koszty",
      title: "Koszty zwrotu",
      content: (
        <>
          <P>
            Bezpośrednie koszty odesłania mebla ponosi Klient. Nie zwracamy kosztów
            transportu zwrotnego. Szacunek tych kosztów, które pokrywa Klient, to{" "}
            {storePolicies.returnCostEstimateLabel} (kwota orientacyjna; rzeczywisty
            koszt zależy od wagi, wymiarów i lokalizacji). Kwota z tego przedziału
            nie jest zwrotem od sklepu.
          </P>
        </>
      ),
    },
    {
      id: "srodki",
      title: "Zwrot płatności (PayU)",
      content: (
        <>
          <P>
            Zwrotu wszystkich otrzymanych płatności dokonujemy niezwłocznie, nie
            później niż w ciągu 14 dni od dnia otrzymania oświadczenia o odstąpieniu.
            Możemy wstrzymać się ze zwrotem do chwili otrzymania rzeczy lub dowodu jej
            odesłania — w zależności od tego, które zdarzenie nastąpi wcześniej.
          </P>
          <P>
            Zwrot następuje tym samym sposobem płatności, którego użyto w pierwotnej
            transakcji (w tym na ten sam instrument w PayU: karta, BLIK, przelew),
            chyba że wyraźnie zgodzisz się na inny sposób. Nie ponosisz opłat z tytułu
            zwrotu środków.
          </P>
        </>
      ),
    },
    {
      id: "wylaczenia",
      title: "Kiedy prawo odstąpienia nie przysługuje",
      content: (
        <>
          <P>
            Zgodnie z art. 38 ustawy o prawach konsumenta prawo odstąpienia nie
            przysługuje m.in., gdy umowa dotyczy:
          </P>
          <Ul
            items={[
              "rzeczy nieprefabrykowanej, wyprodukowanej według specyfikacji konsumenta lub służącej zaspokojeniu jego zindywidualizowanych potrzeb (np. meble na wymiar, nietypowa konfiguracja wykonana na indywidualne zamówienie)",
              "rzeczy ulegającej szybkiemu zepsuciu lub mającej krótki termin przydatności",
              "rzeczy dostarczanej w zapieczętowanym opakowaniu, której po otwarciu nie można zwrócić ze względu na ochronę zdrowia lub względy higieniczne, jeżeli opakowanie zostało otwarte",
            ]}
          />
          <P>
            Produkty katalogowe z oferty Sklepu (gotowe modele w standardowych
            wymiarach i tkaninach) co do zasady podlegają odstąpieniu. O wyłączeniu
            informujemy przed złożeniem zamówienia.
          </P>
        </>
      ),
    },
    {
      id: "pouczenie",
      title: "Pouczenie o odstąpieniu od umowy",
      content: (
        <>
          <P>
            Poniższe pouczenie odpowiada załącznikowi nr 1 do ustawy o prawach
            konsumenta.
          </P>
          <P>
            Mają Państwo prawo odstąpić od niniejszej umowy w terminie 14 dni bez
            podania jakiejkolwiek przyczyny. Termin do odstąpienia od umowy wygasa
            po upływie 14 dni od dnia, w którym weszli Państwo w posiadanie rzeczy
            lub w którym osoba trzecia inna niż przewoźnik i wskazana przez Państwa
            weszła w posiadanie rzeczy.
          </P>
          <P>
            Aby skorzystać z prawa odstąpienia od umowy, muszą Państwo poinformować
            nas ({company.returnsAddress},{" "}
            {company.emailDisplay}) o swojej decyzji o odstąpieniu od niniejszej
            umowy w drodze jednoznacznego oświadczenia (pismo wysłane pocztą lub
            e-mailem). Mogą Państwo skorzystać z wzoru formularza odstąpienia od
            umowy, jednak nie jest to obowiązkowe.
          </P>
          <P>
            Aby zachować termin do odstąpienia od umowy, wystarczy, aby wysłali
            Państwo informację dotyczącą wykonania przysługującego Państwu prawa
            odstąpienia od umowy przed upływem terminu do odstąpienia od umowy.
          </P>
          <P>
            W przypadku odstąpienia od niniejszej umowy zwracamy Państwu wszystkie
            otrzymane od Państwa płatności, w tym koszty dostarczenia rzeczy (z
            wyjątkiem dodatkowych kosztów wynikających z wybranego przez Państwa
            sposobu dostarczenia innego niż najtańszy zwykły sposób dostarczenia
            oferowany przez nas), niezwłocznie, a w każdym przypadku nie później niż
            14 dni od dnia, w którym zostaliśmy poinformowani o Państwa decyzji o
            wykonaniu prawa odstąpienia od niniejszej umowy. Zwrotu płatności
            dokonamy przy użyciu takich samych sposobów płatności, jakie zostały
            przez Państwa użyte w pierwotnej transakcji, chyba że wyraźnie zgodzili
            się Państwo na inne rozwiązanie; w każdym przypadku nie poniosą Państwo
            żadnych opłat w związku z tym zwrotem. To pouczenie dotyczy zwrotu
            zapłaty otrzymanej przy zamówieniu. Kosztów odesłania mebla do nas nie
            zwracamy — ponosi je Klient (szacunek{" "}
            {storePolicies.returnCostEstimateLabel} nie jest kwotą zwracaną).
          </P>
          <P>
            Możemy wstrzymać się ze zwrotem płatności do czasu otrzymania rzeczy lub
            do czasu dostarczenia nam dowodu jej odesłania, w zależności od tego,
            które zdarzenie nastąpi wcześniej.
          </P>
          <P>
            Proszę odesłać lub przekazać nam rzecz na adres: {company.returnsAddress},
            niezwłocznie, a w każdym razie nie później niż 14 dni od dnia, w którym
            poinformowali nas Państwo o odstąpieniu od niniejszej umowy. Termin jest
            zachowany, jeżeli odeślą Państwo rzecz przed upływem terminu 14 dni.
          </P>
          <P>
            Będą Państwo musieli ponieść bezpośrednie koszty zwrotu rzeczy. Koszty
            te szacuje się maksymalnie na około {storePolicies.returnCostEstimateLabel}.
          </P>
          <P>
            Odpowiadają Państwo tylko za zmniejszenie wartości rzeczy wynikające z
            korzystania z niej w sposób inny niż konieczny do stwierdzenia charakteru,
            cech i funkcjonowania rzeczy.
          </P>
        </>
      ),
    },
    {
      id: "reklamacje",
      title: "Reklamacje a zwrot",
      content: (
        <P>
          Odstąpienie od umowy (zwrot w 14 dni) jest niezależne od reklamacji z
          tytułu niezgodności towaru z umową oraz od gwarancji sprzedawcy (
          {storePolicies.warrantyLabel}). Reklamacje: {company.emailDisplay},{" "}
          {company.fullAddress}. Szczegóły w{" "}
          <Link href="/regulamin" className="underline underline-offset-2">
            Regulaminie
          </Link>{" "}
          i na stronie{" "}
          <Link href="/gwarancja" className="underline underline-offset-2">
            Gwarancja
          </Link>
          .
        </P>
      ),
    },
  ];

  return (
    <PageShell
      eyebrow="Dokument prawny"
      title="Polityka zwrotów"
      description="14 dni na odstąpienie, adres zwrotu, koszty odesłania mebla i zwrot środków na to samo konto PayU."
    >
      <LegalDocument updated={legalUpdated} sections={sections} />
    </PageShell>
  );
}
