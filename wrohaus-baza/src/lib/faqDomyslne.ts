import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import type { FaqCategory } from "@/lib/typy";

/** Domyślna treść FAQ — używana przy pierwszym uruchomieniu sklepu. */
export function getDefaultFaqCategories(): FaqCategory[] {
  return [
    {
      id: "zamowienia",
      title: "Zamówienia",
      items: [
        {
          id: "zam-1",
          question: "Jak złożyć zamówienie w sklepie Wrohaus?",
          answer:
            "Wybierz produkt, dodaj go do koszyka i przejdź do kasy. Możesz kupić jako gość — podaj imię i e-mail, konto nie jest wymagane — albo zaloguj się. Zaakceptuj regulamin i kliknij „Zamawiam i płacę”. Płatność realizuje PayU (BLIK, karta, Apple Pay, raty, szybki przelew). Potwierdzenie otrzymasz na e-mail.",
        },
        {
          id: "zam-2",
          question: "Czy mogę zmienić lub anulować zamówienie?",
          answer: `Zmiana lub anulowanie po stronie sklepu (np. inny kolor, rezygnacja przed produkcją) jest możliwa, jeśli produkcja jeszcze się nie rozpoczęła — zazwyczaj w ciągu 24 godzin od złożenia zamówienia. Napisz na ${company.emailDisplay} albo przez formularz kontaktowy i podaj numer zamówienia. To nie jest to samo co ustawowe odstąpienie od umowy: konsument może odstąpić w ciągu ${storePolicies.returnsDays} dni od otrzymania mebla — szczegóły w Polityce zwrotów.`,
        },
        {
          id: "zam-3",
          question: "Jak długo trwa produkcja mebli na zamówienie?",
          answer: `Standardowy czas produkcji to ${storePolicies.productionTimeLabel}, w zależności od modelu i wybranej konfiguracji tapicerki. Dokładny termin podajemy w potwierdzeniu zamówienia. Po produkcji dostawa na terenie Polski trwa zwykle ${storePolicies.deliveryTimeLabel}.`,
        },
      ],
    },
    {
      id: "dostawa",
      title: "Dostawa",
      items: [
        {
          id: "dos-1",
          question: "Ile kosztuje dostawa?",
          answer: `Dostawa standardowa kosztuje ${storePolicies.standardDeliveryPriceLabel}. Koszt zależy od gabarytu produktu i lokalizacji — wyświetlamy go przed finalizacją zamówienia. Możesz też wybrać ${storePolicies.pickupTitle.toLowerCase()} bez opłaty za transport (${storePolicies.pickupHoursLabel}, po umówieniu).`,
        },
        {
          id: "dos-2",
          question: "Czy wnosicie meble do mieszkania?",
          answer: `Nie — cena dostawy standardowej nie obejmuje wniesienia na piętro ani ustawienia w pokoju. Kurier zostawia mebel w umówionym miejscu na poziomie wejścia (np. drzwi budynku, korytarz, garaż). Jeśli potrzebujesz wniesienia, napisz przed zamówieniem na ${company.emailDisplay} — wycenimy to osobno.`,
        },
        {
          id: "dos-3",
          question: "W jakim czasie realizowana jest dostawa?",
          answer: `Po zakończeniu produkcji dostawa trwa zwykle ${storePolicies.deliveryTimeLabel} na terenie Polski. Kurier kontaktuje się telefonicznie w celu ustalenia terminu. Sofy i narożniki zwykle jadą w całości; szafy, łóżka i meble skrzyniowe mogą być w paczkach do samodzielnego montażu — to jest napisane na karcie produktu.`,
        },
      ],
    },
    {
      id: "zwroty",
      title: "Zwroty",
      items: [
        {
          id: "zwr-1",
          question: "Ile mam czasu na zwrot?",
          answer: `Konsument ma ${storePolicies.returnsDays} dni na odstąpienie od umowy od otrzymania mebla — bez podawania przyczyny. Możesz rozpakować i sprawdzić mebel tak jak w sklepie stacjonarnym. Nie wymagamy oryginalnego opakowania. Jeśli korzystasz z mebla poza tym zakresem, możemy rozliczyć zmniejszenie wartości. Meble na wymiar (art. 38 pkt 3) mogą być wyłączone. Szczegóły: Polityka zwrotów.`,
        },
        {
          id: "zwr-2",
          question: "Jak zgłosić zwrot?",
          answer: `Wyślij e-mail na ${company.emailDisplay} albo skorzystaj z formularza odstąpienia na stronie sklepu. Podaj numer zamówienia. Adres zwrotu: ${company.returnsAddress}. Odpowiadamy ${company.openingHoursDetail}.`,
        },
        {
          id: "zwr-3",
          question: "Kiedy otrzymam zwrot pieniędzy?",
          answer:
            "Zwrot środków realizujemy w ciągu 14 dni od otrzymania oświadczenia o odstąpieniu. Możemy wstrzymać zwrot do chwili otrzymania mebla albo dowodu nadania — które zdarzenie nastąpi wcześniej. Pieniądze wracają na ten sam instrument płatniczy w PayU (karta, BLIK, przelew). Bezpośrednie koszty odesłania mebla ponosi klient.",
        },
      ],
    },
    {
      id: "produkty",
      title: "Produkty i konfiguracja",
      items: [
        {
          id: "pro-1",
          question: "Czy mogę zamówić próbkę tkaniny?",
          answer:
            "Wybierz rodzaj tkaniny i odcień na stronie Próbki tkanin, podaj adres dostawy i wyślij prośbę — wyślemy próbki pocztą.",
        },
        {
          id: "pro-2",
          question: "Czy meble można konfigurować na wymiar?",
          answer:
            "Wybrane modele narożników i sof oferujemy w konfiguracji modułowej. Skontaktuj się z doradcą, aby ustalić wymiary i układ dopasowany do Twojego wnętrza.",
        },
        {
          id: "pro-3",
          question: "Jak dbać o tapicerkę?",
          answer:
            "Do każdego produktu dołączamy kartę pielęgnacji. Ogólnie zalecamy regularne odkurzanie miękką końcówką i natychmiastowe usuwanie plam zgodnie z instrukcją dla danego materiału.",
        },
      ],
    },
    {
      id: "platnosci",
      title: "Płatności",
      items: [
        {
          id: "pla-1",
          question: "Jakie formy płatności akceptujecie?",
          answer:
            "Płatności obsługuje PayU S.A.: BLIK, karta Visa/Mastercard, szybki przelew oraz raty / odroczona płatność, jeśli są włączone przy kasie. Waluta: PLN.",
        },
        {
          id: "pla-2",
          question: "Czy płatność jest bezpieczna?",
          answer:
            "Tak. Transakcje realizuje PayU S.A. (Poznań, KRS 0000274399) z szyfrowaniem SSL i standardem PCI DSS. Wrohaus nie przechowuje numeru karty ani kodu CVV.",
        },
      ],
    },
  ];
}
