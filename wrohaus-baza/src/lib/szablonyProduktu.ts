import type {
  Product,
  ProductCategory,
  ProductDetails,
  ProductFaq,
  ProductHighlight,
  ProductOption,
  ProductTemplateId,
} from "@/lib/typy";
import { newOption } from "@/lib/opcjeProduktu";
import { FAQ_PRESETS } from "@/lib/szablonyOpisu";

/**
 * Szablony kart produktu — jeden na grupę mebli (wg wytycznych Wrohaus).
 *
 * Szablon decyduje o tym, jakie pola pokazuje formularz w panelu
 * (rodzaj, rozmiary, warianty, tkaniny, wymiary, specyfikacja, atuty,
 * wyróżniki, warstwy materaca) oraz jak wygląda gotowe ogłoszenie.
 * Zasada na stronie: brak wartości = brak pola.
 */

export interface TemplateField {
  label: string;
  /** Podstawowe pole — podpowiadane jako pierwsze. */
  required?: boolean;
  /** Przykładowa wartość / podpowiedź. */
  hint?: string;
  /** Jednostka w panelu — waga to kg, reszta cm. */
  unit?: "cm" | "kg";
  /**
   * Gotowa wartość na ogłoszeniu. W panelu to checkbox:
   * zaznaczone = pokazujemy tę wartość, puste = ukryte.
   */
  defaultValue?: string;
}

export interface TemplateFeatureGroup {
  label: string;
  items: string[];
}

export interface TemplateOptionPreset {
  name: string;
  values: string[];
  afterColor?: boolean;
  hint?: string;
}

export interface ProductTemplate {
  id: ProductTemplateId;
  label: string;
  category: ProductCategory;
  hint: string;
  namePlaceholder: string;
  codePlaceholder: string;
  /** Rodzaj w obrębie kategorii — select w panelu. */
  kinds: string[];
  /** Czy klient wybiera tkaninę i kolor tkaniny. */
  fabrics: boolean;
  /** Czy zamiast tkanin klient wybiera pokrowiec (każdy z własną ceną). */
  covers?: boolean;
  /** Rozmiar / szerokość / powierzchnia spania jako wariant z dopłatą. */
  sizes?: { label: string; hint: string; presets: string[] };
  /** Warianty dodawane od razu (np. strona narożnika). */
  options: TemplateOptionPreset[];
  /** Warianty do dodania jednym kliknięciem, jeśli model je ma. */
  optionSuggestions: TemplateOptionPreset[];
  /** Wskazówki do akapitów opisu (max 2–4 akapity). */
  descriptionGuide: string[];
  /** Najważniejsze cechy / atuty — checkboxy pogrupowane. */
  featureGroups: TemplateFeatureGroup[];
  /** Trzy główne wyróżniki — domyślna treść do edycji. */
  highlights: ProductHighlight[];
  dimensions: TemplateField[];
  specs: TemplateField[];
  /** Budowa / warstwy materaca. */
  layers?: boolean;
  /** Informacja techniczna wspólna dla grupy. */
  disclaimer: string;
  faq: ProductFaq[];
}

const NOTE_UPHOLSTERY =
  "Ze względu na specyfikę produkcji mebli tapicerowanych podane wymiary mogą różnić się od rzeczywistych o kilka centymetrów. Kolory tkanin prezentowane na ekranie mogą nieznacznie odbiegać od rzeczywistych w zależności od ustawień ekranu i oświetlenia.";

const NOTE_CASE_FURNITURE =
  "Ze względu na specyfikę produkcji podane wymiary mogą nieznacznie różnić się od rzeczywistych. Kolory prezentowane na ekranie mogą odbiegać od rzeczywistych w zależności od ustawień monitora i oświetlenia.";

const NOTE_MATTRESS =
  "Wysokość materaca może różnić się o ±1 cm w zależności od partii produkcyjnej. Twardość jest odczuciem subiektywnym i zależy od masy ciała oraz preferencji użytkownika.";

const FAQ_BASE: ProductFaq[] = FAQ_PRESETS.map((item) => ({ ...item }));

const dim = (
  label: string,
  required = false,
  hint?: string,
  unit?: "cm" | "kg"
): TemplateField => ({
  label,
  ...(required ? { required: true } : {}),
  ...(hint ? { hint } : {}),
  ...(unit ? { unit } : {}),
});

const spec = (label: string, hint?: string, defaultValue?: string): TemplateField => ({
  label,
  ...(hint ? { hint } : {}),
  ...(defaultValue ? { defaultValue } : {}),
});

/** Cecha Tak/Nie — w panelu checkbox, na stronie tylko gdy zaznaczona. */
const flag = (label: string): TemplateField =>
  spec(label, "Zaznacz, jeśli dotyczy — puste nie pokazujemy", "Tak");

const UPHOLSTERY_FEATURES: TemplateFeatureGroup[] = [
  {
    label: "Funkcjonalność",
    items: [
      "Funkcja spania",
      "Funkcja spania DL",
      "Pojemnik na pościel",
      "2 pojemniki na pościel",
      "Regulowane zagłówki",
      "Zdejmowane poduchy oparciowe",
      "Tapicerowany tył",
      "Konstrukcja wolnostojąca",
    ],
  },
  {
    label: "Konstrukcja / komfort",
    items: [
      "Sprężyny faliste",
      "Sprężyny bonellowe",
      "Sprężyny kieszeniowe",
      "Pianka T25",
      "Pianka T30",
      "Pianka HR",
    ],
  },
  {
    label: "Konfiguracja",
    items: [
      "Tkanina do wyboru",
      "Kolor do wyboru",
      "Możliwość indywidualnej konfiguracji",
    ],
  },
];

const UPHOLSTERY_DIMENSIONS: TemplateField[] = [
  dim("Szerokość", true, "np. 271 cm"),
  dim("Wysokość", true, "np. 83 cm"),
  dim("Głębokość", true, "np. 172 cm"),
  dim("Wysokość siedziska", false, "np. 42 cm"),
  dim("Głębokość siedziska", false, "np. 68 cm"),
  dim("Powierzchnia spania", false, "np. 150 × 215 cm — tylko z funkcją spania"),
  dim("Wysokość nóżek", false, "np. 2,5 cm"),
  dim("Szerokość siedziska"),
  dim("Szerokość podłokietnika"),
  dim("Wysokość podłokietnika"),
  dim("Wysokość oparcia"),
  dim("Waga", false, "np. 95 kg", "kg"),
];

const UPHOLSTERY_SPECS: TemplateField[] = [
  spec("Tkanina", "np. Tkanina do wyboru"),
  spec("Wypełnienie siedziska", "np. Pianka T30, sprężyna falista"),
  spec("Konstrukcja", "np. Stelaż drewniany"),
  spec("System rozkładania", "DL / Delfin / Puma / Belgijski — puste = brak funkcji spania"),
  spec("Nóżki", "np. Tworzywo / metal / drewno"),
  spec("Montaż", "np. Do samodzielnego montażu"),
  spec("Gwarancja", "np. 2 lata"),
];

const COLOR_OPTION_HINT = "Wybarwienie płyty — jeden produkt z wariantami zamiast osobnych.";
const LED_OPTION: TemplateOptionPreset = {
  name: "Oświetlenie LED",
  values: ["Bez LED", "Z LED"],
  afterColor: true,
  hint: "Dodaj tylko jeśli model ma możliwość LED. Dopłatę wpisz przy „Z LED”.",
};

export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    id: "naroznik",
    label: "Narożnik",
    category: "narozniki",
    hint: "Strona lewa / prawa, tkanina i kolor u góry, funkcja spania, pojemnik.",
    namePlaceholder: "np. Narożnik Luna L-kształtny",
    codePlaceholder: "np. SF-KRD-LUN01",
    kinds: [
      "Narożnik L-kształtny",
      "Narożnik U-kształtny",
      "Narożnik z otomaną",
      "Narożnik modułowy",
      "Inny",
    ],
    fabrics: true,
    options: [
      {
        name: "Strona narożnika",
        values: ["Lewy", "Prawy"],
        hint: "Wariant zakupowy — klient wybiera przed tkaniną. Usuń, jeśli model ma jedną stronę.",
      },
    ],
    optionSuggestions: [],
    descriptionGuide: [
      "Wygląd i charakter: bryła, styl, zastosowanie we wnętrzu.",
      "Komfort: wypełnienie, sprężyny, pianka, poduchy.",
      "Funkcjonalność: funkcja spania, powierzchnia spania, pojemnik, sposób rozkładania.",
      "Ustawienie i personalizacja: tapicerowany tył, wolnostojący, wybór strony, tkaniny i koloru.",
    ],
    featureGroups: [
      ...UPHOLSTERY_FEATURES.slice(0, 2),
      {
        label: "Konfiguracja",
        items: [
          "Strona lewa / prawa",
          "Tkanina do wyboru",
          "Kolor do wyboru",
          "Możliwość indywidualnej konfiguracji",
        ],
      },
    ],
    highlights: [
      {
        title: "Funkcja spania",
        description:
          "Mechanizm rozkładania pozwala szybko przygotować wygodne miejsce do noclegu dla gości.",
        icon: "arrow",
      },
      {
        title: "Komfort siedzenia",
        description:
          "Pianka T30 oraz sprężyna falista zapewniają wygodne podparcie i komfort codziennego użytkowania.",
        icon: "star",
      },
      {
        title: "Solidna konstrukcja",
        description:
          "Rama z drewna i wzmocnione połączenia zapewniają stabilność podczas użytkowania.",
        icon: "check",
      },
    ],
    dimensions: [
      ...UPHOLSTERY_DIMENSIONS,
      dim("Głębokość otomany"),
      dim("Szerokość otomany"),
    ],
    specs: UPHOLSTERY_SPECS,
    disclaimer: NOTE_UPHOLSTERY,
    faq: FAQ_BASE,
  },
  {
    id: "sofa",
    label: "Sofa",
    category: "sofy",
    hint: "Tkanina i kolor u góry, komfort siedzenia, opcjonalna funkcja spania.",
    namePlaceholder: "np. Sofa Milano 3-osobowa",
    codePlaceholder: "np. SF-SOF-MIL01",
    kinds: [
      "Sofa 2-osobowa",
      "Sofa 3-osobowa",
      "Sofa z funkcją spania",
      "Sofa modułowa",
      "Inna",
    ],
    fabrics: true,
    options: [],
    optionSuggestions: [],
    descriptionGuide: [
      "Wygląd i charakter: bryła, styl, zastosowanie we wnętrzu.",
      "Komfort: wypełnienie, sprężyny, pianka, poduchy.",
      "Funkcjonalność: funkcja spania, pojemnik na pościel, sposób rozkładania — jeśli dotyczy.",
      "Personalizacja: tapicerowany tył, wolnostojąca, wybór tkaniny i koloru.",
    ],
    featureGroups: UPHOLSTERY_FEATURES,
    highlights: [
      {
        title: "Komfort siedzenia",
        description:
          "Pianka wysokoelastyczna i sprężyny zapewniają wygodne podparcie i komfort codziennego wypoczynku.",
        icon: "star",
      },
      {
        title: "Solidna konstrukcja",
        description:
          "Rama z drewna i wzmocnione połączenia zapewniają stabilność przez lata użytkowania.",
        icon: "check",
      },
      {
        title: "Tkanina do wyboru",
        description:
          "Wybierz kolekcję tkaniny i kolor, aby dopasować sofę do charakteru salonu.",
        icon: "dot",
      },
    ],
    dimensions: UPHOLSTERY_DIMENSIONS,
    specs: UPHOLSTERY_SPECS,
    disclaimer: NOTE_UPHOLSTERY,
    faq: FAQ_BASE,
  },
  {
    id: "lozko",
    label: "Łóżko tapicerowane",
    category: "lozka",
    hint: "Rozmiar spania jako wariant, tkanina i kolor, pojemnik, stelaż, materac opcjonalny.",
    namePlaceholder: "np. Łóżko tapicerowane Verona",
    codePlaceholder: "np. SF-LZK-VERONA",
    kinds: [
      "Łóżko tapicerowane",
      "Łóżko z pojemnikiem na pościel",
      "Łóżko drewniane",
      "Łóżko młodzieżowe",
      "Inne",
    ],
    fabrics: true,
    sizes: {
      label: "Rozmiar powierzchni spania",
      hint: "To rozmiar materaca. Planszę z wymiarami wklejasz w zakładce Opis — kafelek na stronie pokaże zdjęcie, nie tabelę.",
      presets: ["90×200", "100×200", "120×200", "140×200", "160×200", "180×200", "200×200"],
    },
    options: [],
    optionSuggestions: [
      {
        name: "Materac",
        values: ["Bez materaca"],
        afterColor: true,
        hint: "Dodaj modele materaca z dopłatą — wybrany materac zwiększa cenę.",
      },
    ],
    descriptionGuide: [
      "Wygląd, styl i główna zaleta łóżka.",
      "Komfort i konstrukcja.",
      "Funkcjonalność, np. pojemnik na pościel i sposób otwierania.",
    ],
    featureGroups: [
      {
        label: "Funkcjonalność",
        items: [
          "Pojemnik na pościel",
          "Stelaż w zestawie",
          "Tapicerowany zagłówek",
          "Automat ułatwiający otwieranie pojemnika",
          "Materac opcjonalny",
          "Wolnostojące",
          "Nóżki",
        ],
      },
      {
        label: "Konstrukcja",
        items: ["Stabilna konstrukcja", "Łatwy montaż", "Stelaż metalowy", "Stelaż drewniany"],
      },
      {
        label: "Konfiguracja",
        items: ["Tkanina do wyboru", "Kolor do wyboru"],
      },
    ],
    highlights: [
      {
        title: "Pojemnik na pościel",
        description:
          "Praktyczna przestrzeń pod materacem pozwala wygodnie przechowywać pościel, koce i tekstylia.",
        icon: "check",
      },
      {
        title: "Solidny stelaż",
        description:
          "Stabilny stelaż zapewnia odpowiednie podparcie materaca i komfort użytkowania.",
        icon: "dash",
      },
      {
        title: "Komfortowa sypialnia",
        description:
          "Tapicerowana konstrukcja i wygodny zagłówek zwiększają komfort codziennego wypoczynku.",
        icon: "star",
      },
    ],
    dimensions: [
      dim("Powierzchnia spania", true, "z wybranego rozmiaru, np. 160 × 200 cm"),
      dim("Szerokość całkowita", true, "liczona z materaca + 30 cm"),
      dim("Szerokość zagłówka", true, "liczona z materaca + 30 cm"),
      dim("Długość całkowita", true, "238 cm"),
      dim("Wysokość zagłówka", true, "93 cm"),
      dim("Wysokość skrzyni", true, "33 cm"),
      dim("Wysokość całkowita"),
      dim("Wysokość boku łóżka"),
      dim("Grubość boku"),
      dim("Wysokość nóżek"),
      dim("Głębokość pojemnika"),
      dim("Wysokość powierzchni spania"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Tolerancja wymiarów", false, "np. ±2 cm"),
    ],
    specs: [
      spec("Rodzaj", "np. Łóżko tapicerowane", "łóżko tapicerowane"),
      spec("Konstrukcja", "np. Drewno + płyta meblowa", "drewno + płyta meblowa"),
      spec("Tkanina", "np. Do wyboru", "do wyboru"),
      spec("Stelaż", "np. Metalowy", "metalowy"),
      flag("Stelaż w zestawie"),
      flag("Pojemnik na pościel"),
      spec("Sposób otwierania pojemnika", "np. Podnoszony stelaż", "podnoszony stelaż"),
      flag("Zagłówek tapicerowany"),
      flag("Materac w zestawie"),
      flag("Materac opcjonalny"),
      spec("Nóżki", "np. Tworzywo / metal / drewno", "tworzywo / metal / drewno"),
      spec("Montaż", "np. Do samodzielnego montażu", "do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata", "2 lata"),
    ],
    disclaimer: NOTE_UPHOLSTERY,
    faq: FAQ_BASE,
  },
  {
    id: "lozko-kontynentalne",
    label: "Łóżko kontynentalne",
    category: "lozka",
    hint: "Warstwowa budowa, materac główny w zestawie, pojemniki, wysoka powierzchnia spania.",
    namePlaceholder: "np. Łóżko kontynentalne Verona",
    codePlaceholder: "np. SF-KONT-VERONA",
    kinds: ["Łóżko kontynentalne", "Łóżko kontynentalne z pojemnikami", "Inne"],
    fabrics: true,
    sizes: {
      label: "Rozmiar powierzchni spania",
      hint: "To rozmiar materaca. Planszę z wymiarami wklejasz w zakładce Opis — kafelek na stronie pokaże zdjęcie, nie tabelę.",
      presets: [
        "80×200",
        "90×200",
        "100×200",
        "120×200",
        "140×200",
        "160×200",
        "180×200",
        "200×200",
      ],
    },
    options: [],
    optionSuggestions: [
      {
        name: "Materac nawierzchniowy",
        values: ["Bez topera"],
        afterColor: true,
        hint: "Dodaj toper z dopłatą, jeśli model to umożliwia.",
      },
    ],
    descriptionGuide: [
      "Wygląd, styl i główna zaleta łóżka.",
      "Komfort oraz budowa łóżka kontynentalnego.",
      "Funkcjonalność: pojemnik na pościel, sposób otwierania, wysoka powierzchnia spania.",
    ],
    featureGroups: [
      {
        label: "Funkcjonalność",
        items: [
          "Pojemnik na pościel",
          "Dwa pojemniki na pościel",
          "Automat ułatwiający otwieranie pojemnika",
          "Podnośnik gazowy",
          "Wysoka powierzchnia spania",
          "Tapicerowany zagłówek",
          "Wolnostojące",
          "Nóżki",
        ],
      },
      {
        label: "Materac",
        items: ["Materac główny w zestawie", "Materac bonellowy", "Materac kieszeniowy"],
      },
      {
        label: "Konstrukcja i konfiguracja",
        items: ["Stabilna konstrukcja", "Łatwy montaż", "Tkanina do wyboru", "Kolor do wyboru"],
      },
    ],
    highlights: [
      {
        title: "Komfortowa konstrukcja",
        description:
          "Warstwowa budowa łóżka kontynentalnego zapewnia wygodną i komfortową powierzchnię do codziennego wypoczynku.",
        icon: "star",
      },
      {
        title: "Praktyczne przechowywanie",
        description:
          "Pojemnik pod powierzchnią spania pozwala wygodnie przechowywać pościel, koce i tekstylia.",
        icon: "check",
      },
      {
        title: "Wysoka powierzchnia spania",
        description:
          "Podwyższona konstrukcja zapewnia komfort użytkowania i charakterystyczny wygląd łóżka kontynentalnego.",
        icon: "arrow",
      },
    ],
    dimensions: [
      dim("Powierzchnia spania", true, "z wybranego rozmiaru, np. 160 × 200 cm"),
      dim("Szerokość całkowita", true, "liczona z materaca + 30 cm"),
      dim("Szerokość zagłówka", true, "liczona z materaca + 30 cm"),
      dim("Długość całkowita", true, "238 cm"),
      dim("Wysokość zagłówka", true, "93 cm"),
      dim("Wysokość skrzyni", true, "33 cm"),
      dim("Wysokość całkowita"),
      dim("Wysokość powierzchni spania"),
      dim("Wysokość podstawy"),
      dim("Grubość materaca głównego"),
      dim("Wysokość nóżek"),
      dim("Głębokość pojemnika"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Tolerancja wymiarów", false, "np. ±2 cm"),
    ],
    specs: [
      spec("Rodzaj", "np. Łóżko kontynentalne"),
      spec("Konstrukcja", "np. Drewno + płyta meblowa"),
      spec("Tkanina", "np. Do wyboru"),
      spec("Materac główny", "Bonellowy / Kieszeniowy"),
      spec("Rodzaj sprężyn", "Bonell / Sprężyny kieszeniowe"),
      spec("Rodzaj pianki", "np. Pianka T30"),
      spec("Twardość materaca", "np. H3"),
      spec("Liczba pojemników", "1 / 2"),
      spec("Sposób otwierania pojemnika", "np. Otwieranie od boku"),
      spec("Mechanizm otwierania", "Podnośnik gazowy / Automat sprężynowy"),
      flag("Zagłówek tapicerowany"),
      flag("Materac główny w zestawie"),
      flag("Pojemnik na pościel"),
      spec("Nóżki", "Tworzywo / metal / drewno"),
      flag("Produkt wolnostojący"),
      spec("Montaż", "np. Do samodzielnego montażu", "do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata", "2 lata"),
    ],
    disclaimer: NOTE_UPHOLSTERY,
    faq: FAQ_BASE,
  },
  {
    id: "materac",
    label: "Materac",
    category: "materace",
    hint: "Rozmiary jako warianty, pokrowce (każdy z własną ceną) zamiast tkanin, warstwy, twardość A/B.",
    namePlaceholder: "np. Materac kieszeniowy Dream",
    codePlaceholder: "np. SF-MAT-DREAM",
    kinds: [
      "Kieszeniowy / Pocket",
      "Multipocket",
      "Luxpocket",
      "Bonellowy",
      "Piankowy",
      "Piankowy 7-strefowy",
      "Wysokoelastyczny HR",
      "Lateksowy",
      "Nawierzchniowy",
      "Na stelażu",
      "Kontynentalny",
      "Inny",
    ],
    fabrics: false,
    covers: true,
    sizes: {
      label: "Rozmiar materaca",
      hint: "Jeden model = jeden produkt z wariantami. Każdy rozmiar może mieć własną dopłatę.",
      presets: [
        "80×200",
        "90×200",
        "100×200",
        "120×200",
        "140×200",
        "160×200",
        "180×200",
        "200×200",
      ],
    },
    options: [],
    optionSuggestions: [],
    descriptionGuide: [
      "Rodzaj materaca, główna zaleta i ogólne odczucie podczas użytkowania.",
      "Najważniejsze elementy budowy: sprężyny, pianka HR, memory, kokos, lateks.",
      "Najważniejsze właściwości: strefy, dwustronność, antyalergiczność, dla par, wentylacja.",
    ],
    featureGroups: [
      {
        label: "Konstrukcja",
        items: [
          "7 stref komfortu",
          "Materac dwustronny",
          "Materac jednostronny",
          "Sprężyny kieszeniowe",
          "Multipocket",
          "Luxpocket",
          "Sprężyny bonellowe",
        ],
      },
      {
        label: "Warstwy",
        items: [
          "Pianka wysokoelastyczna HR",
          "Pianka termoelastyczna Memory / VISCO",
          "Pianka poliuretanowa",
          "Lateks",
          "Kokos",
          "Wełna",
          "Hydrożel",
          "Owata",
          "Filc",
        ],
      },
      {
        label: "Właściwości",
        items: [
          "Antyalergiczny",
          "Antygrzybiczny",
          "Właściwości ortopedyczne",
          "Dla par",
          "Nie przenosi drgań",
          "Lato / zima",
          "Samomasujący",
          "Dobra wentylacja",
        ],
      },
      {
        label: "Pokrowiec",
        items: ["Zdejmowany pokrowiec", "Pokrowiec na zamek", "Pokrowiec do prania"],
      },
      {
        label: "Rekomendowany dla",
        items: [
          "Dla jednej osoby",
          "Dla dzieci",
          "Dla nastolatków",
          "Dla seniorów",
          "Dla alergików",
          "Dla osób preferujących miękkie materace",
          "Dla osób preferujących średnio-twarde materace",
          "Dla osób preferujących twarde materace",
        ],
      },
    ],
    highlights: [
      {
        title: "Dopasowanie do ciała",
        description:
          "Konstrukcja materaca zapewnia stabilne podparcie i pomaga równomiernie rozłożyć nacisk ciała.",
        icon: "check",
      },
      {
        title: "Komfort przez całą noc",
        description:
          "Odpowiednio dobrane warstwy zapewniają wygodną powierzchnię snu i komfort codziennego wypoczynku.",
        icon: "star",
      },
      {
        title: "Higieniczny sen",
        description:
          "Przewiewna konstrukcja i zdejmowany pokrowiec pomagają utrzymać materac w czystości.",
        icon: "dot",
      },
    ],
    dimensions: [
      dim("Szerokość", true, "np. 160 cm"),
      dim("Długość", true, "np. 200 cm"),
      dim("Wysokość całkowita", true, "np. 24 cm"),
      dim("Wysokość wkładu"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Tolerancja wysokości", false, "np. ±1 cm"),
    ],
    specs: [
      spec("Rodzaj materaca", "np. Kieszeniowy / Pocket"),
      spec("Twardość — strona A", "H1 miękka / H2 średnio-twarda / H3 twarda / H4 / H5"),
      spec("Twardość — strona B", "puste = materac jednostronny"),
      spec("Liczba stref", "np. 7"),
      spec("Liczba sprężyn", "szt./m² — tylko materace sprężynowe"),
      spec("Rodzaj sprężyn", "Pocket / Multipocket / Luxpocket / Bonell"),
      spec("Materiały", "np. Sprężyny pocket + pianka memory + kokos"),
      spec("Pokrowiec", "nazwa pokrowca"),
      spec("Zamek pokrowca", "błyskawiczny / rozdzielczy"),
      spec("Temperatura prania pokrowca", "np. 60 °C"),
      spec("Sposób pakowania", "rolowany / na płasko"),
      spec("Gwarancja", "np. 5 lat"),
    ],
    layers: true,
    disclaimer: NOTE_MATTRESS,
    faq: FAQ_BASE.slice(0, 1).concat([
      {
        question: "Jaką twardość materaca wybrać?",
        answer:
          "H2 to wybór uniwersalny dla większości osób, H3 dla osób cięższych lub preferujących twardsze podparcie. Materac dwustronny pozwala wypróbować obie strony.",
      },
    ]),
  },
  {
    id: "szafa",
    label: "Szafa",
    category: "szafy",
    hint: "Jeden formularz dla wszystkich szaf: rozmiar, typ drzwi, lustro, kolor, LED — wszystko opcjonalne.",
    namePlaceholder: "np. Szafa Arti 150",
    codePlaceholder: "np. SF-SZF-ARTI150",
    kinds: ["Szafa przesuwna", "Szafa uchylna", "Szafa narożna", "Szafa garderobiana", "Inna"],
    fabrics: true,
    sizes: {
      label: "Rozmiar / szerokość",
      hint: "Każdy wariant może mieć inną cenę (dopłata), ID i wymiary.",
      presets: ["92 cm", "120 cm", "150 cm", "180 cm", "200 cm", "220 cm", "250 cm"],
    },
    options: [],
    optionSuggestions: [
      {
        name: "Typ drzwi",
        values: ["Przesuwne", "Uchylne", "Składane"],
        hint: "Tylko jeśli model występuje w kilku wariantach drzwi.",
      },
      {
        name: "Lustro",
        values: ["Bez lustra", "Z lustrem"],
        hint: "Tylko jeśli model występuje w obu wersjach.",
      },
      {
        name: "Kolor / wybarwienie",
        values: ["Biały", "Cashmere", "Czarny", "Dąb artisan", "Dąb sonoma"],
        hint: COLOR_OPTION_HINT,
      },
      LED_OPTION,
    ],
    descriptionGuide: [
      "Wygląd, styl, kolor, fronty, lustro.",
      "Wnętrze szafy: półki, drążki, szuflady i organizacja przestrzeni.",
      "System drzwi, prowadnice, push-to-open, cichy domyk, LED, materiały i funkcjonalność.",
    ],
    featureGroups: [
      {
        label: "Typ / funkcjonalność",
        items: [
          "Drzwi przesuwne",
          "Drzwi uchylne",
          "Lustro",
          "Półki",
          "Drążek na ubrania",
          "Szuflady",
          "Duża przestrzeń do przechowywania",
        ],
      },
      {
        label: "Mechanizmy",
        items: [
          "Aluminiowe prowadnice",
          "Cichy domyk",
          "Push-to-open",
          "Pełny wysuw szuflad",
          "Regulowane stopki",
        ],
      },
      {
        label: "Dodatkowe",
        items: [
          "Oświetlenie LED",
          "LED w zestawie",
          "LED opcjonalne",
          "Metalowe uchwyty",
          "Bezuchwytowe fronty",
          "Obrzeża ABS",
          "Do samodzielnego montażu",
        ],
      },
    ],
    highlights: [
      {
        title: "Przemyślane wnętrze",
        description:
          "Półki i drążki pomagają wygodnie uporządkować ubrania i dodatki.",
        icon: "check",
      },
      {
        title: "Dużo miejsca",
        description:
          "Pojemne wnętrze pozwala funkcjonalnie wykorzystać przestrzeń sypialni lub garderoby.",
        icon: "star",
      },
      {
        title: "Wygodne użytkowanie",
        description:
          "Dobrze zaprojektowany system drzwi zapewnia komfortowy dostęp do wnętrza.",
        icon: "arrow",
      },
    ],
    dimensions: [
      dim("Szerokość", true, "np. 150 cm"),
      dim("Wysokość", true, "np. 216 cm"),
      dim("Głębokość", true, "np. 61 cm"),
      dim("Szerokość lustra"),
      dim("Wysokość lustra"),
      dim("Wymiary półek"),
      dim("Wymiary szuflad"),
      dim("Długość drążka"),
      dim("Wysokość nóżek / stopek"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Maksymalne obciążenie półki", false, "np. 15 kg"),
      dim("Tolerancja wymiarów", false, "np. ±2%"),
    ],
    specs: [
      spec("Typ drzwi", "przesuwne / uchylne / składane"),
      spec("Liczba drzwi", "np. 2"),
      spec("Lustro", "np. Tak, 1 lustro na drzwiach środkowych — puste = brak"),
      spec("Grubość lustra"),
      spec("Materiał korpusu", "np. Płyta laminowana"),
      spec("Materiał frontów", "np. Płyta laminowana + lustro"),
      spec("Tył mebla", "np. Płyta HDF"),
      spec("Kolor korpusu"),
      spec("Kolor frontów"),
      spec("Obrzeża", "np. ABS"),
      spec("Liczba półek"),
      spec("Liczba drążków"),
      spec("Liczba szuflad"),
      spec("System otwierania", "uchwyty / push-to-open / bezuchwytowy"),
      spec("Prowadnice / zawiasy", "aluminiowe / Quadro / pełny wysuw / cichy domyk"),
      spec("Uchwyty", "metalowe / tworzywo / wpuszczane / frezowane / brak"),
      spec("Stopki / nóżki", "ślizgi / regulowane stopki / metalowe"),
      spec("Oświetlenie LED", "LED w zestawie / opcjonalne / za dopłatą, rodzaj, barwa"),
      spec("Montaż", "np. Do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata"),
    ],
    disclaimer: NOTE_CASE_FURNITURE,
    faq: FAQ_BASE.slice(0, 1).concat([
      {
        question: "Czy szafa jest dostarczana w paczkach do samodzielnego montażu?",
        answer:
          "Tak — szafa jest pakowana w paczki płaskie z instrukcją montażu. Na życzenie wycenimy montaż na miejscu.",
      },
    ]),
  },
  {
    id: "komoda",
    label: "Komoda / witryna",
    category: "komody",
    hint: "Wspólny formularz dla komód i witryn: przeszklenie, LED, szuflady, nóżki — pokazujemy tylko to, co dotyczy modelu.",
    namePlaceholder: "np. Komoda Epiro / Witryna Sento",
    codePlaceholder: "np. SF-KOM-EPIRO",
    kinds: ["Komoda", "Witryna", "Komoda z przeszkleniem", "Witryna przeszklona", "Inny"],
    fabrics: true,
    sizes: {
      label: "Wariant / rozmiar",
      hint: "Jeśli model występuje w kilku szerokościach — jeden produkt z wariantami.",
      presets: ["120 cm", "150 cm", "180 cm", "200 cm"],
    },
    options: [],
    optionSuggestions: [
      {
        name: "Kolor / wybarwienie",
        values: ["Cashmere", "Czarny", "Biały", "Beżowy", "Dąb jasny", "Dąb ciemny"],
        hint: COLOR_OPTION_HINT,
      },
      LED_OPTION,
    ],
    descriptionGuide: [
      "Wygląd i design: styl, bryła, kolorystyka, fronty, nóżki, ryflowania, przeszklenie.",
      "Przechowywanie / ekspozycja: drzwi, szuflady, półki, szklane półki, część ekspozycyjna.",
      "Funkcjonalność i wykonanie: push-to-open, cichy domyk, prowadnice, LED, szkło hartowane, materiały.",
    ],
    featureGroups: [
      {
        label: "Przechowywanie",
        items: [
          "Pojemne szuflady",
          "Zamykane szafki",
          "Otwarte półki",
          "Półki ekspozycyjne",
          "Szklane półki",
          "Zamykane schowki",
        ],
      },
      {
        label: "Ekspozycja",
        items: ["Przeszklony front", "Szkło hartowane", "Szkło antisol", "Oświetlenie LED"],
      },
      {
        label: "Mechanizmy",
        items: [
          "Push-to-open",
          "Cichy domyk",
          "Pełny wysuw szuflad",
          "Amortyzowane zamykanie",
          "Bezuchwytowe otwieranie",
          "Wpuszczane uchwyty",
        ],
      },
      {
        label: "Konstrukcja",
        items: [
          "Płyta laminowana",
          "MDF",
          "Obrzeża ABS",
          "Metalowe nóżki",
          "Drewniane nóżki",
          "Regulowane stopki",
        ],
      },
      {
        label: "Design",
        items: [
          "Ryflowane fronty",
          "Frezowane fronty",
          "Matowe wykończenie",
          "Połysk",
          "Dekor drewnopodobny",
          "Zaokrąglone krawędzie",
        ],
      },
      {
        label: "Pozostałe",
        items: ["LED w zestawie", "Do samodzielnego montażu"],
      },
    ],
    highlights: [
      {
        title: "Praktyczne przechowywanie",
        description:
          "Przemyślany układ półek, szuflad i zamykanych przestrzeni pomaga wygodnie uporządkować rzeczy.",
        icon: "check",
      },
      {
        title: "Wygodne użytkowanie",
        description:
          "Nowoczesne systemy otwierania i wysokiej jakości mechanizmy zwiększają komfort codziennego korzystania z mebla.",
        icon: "arrow",
      },
      {
        title: "Dopieszczony design",
        description:
          "Starannie wykończone fronty i dopasowane detale nadają meblowi nowoczesny charakter.",
        icon: "star",
      },
    ],
    dimensions: [
      dim("Szerokość", true),
      dim("Wysokość", true),
      dim("Głębokość", true),
      dim("Wysokość nóżek"),
      dim("Wymiary szuflad"),
      dim("Wymiary półek"),
      dim("Wymiary szklanych półek"),
      dim("Wymiary otwartych wnęk"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Maksymalne obciążenie blatu"),
      dim("Maksymalne obciążenie półki"),
      dim("Maksymalne obciążenie szklanej półki"),
      dim("Tolerancja wymiarów", false, "np. ±2%"),
    ],
    specs: [
      spec("Rodzaj produktu", "Komoda / Witryna"),
      spec("Materiał korpusu", "płyta laminowana / MDF / drewno"),
      spec("Materiał frontów", "płyta laminowana / MDF frezowany / MDF lakierowany / szkło"),
      spec("Kolor korpusu"),
      spec("Kolor frontów"),
      spec("Wykończenie", "matowe / połysk / strukturalne / drewnopodobne"),
      spec("Rodzaj frontów", "gładkie / ryflowane / frezowane / przeszklone"),
      spec("Obrzeża", "np. ABS"),
      spec("Liczba drzwi"),
      spec("Liczba szuflad"),
      spec("Liczba półek"),
      spec("Liczba szklanych półek"),
      spec("Liczba otwartych wnęk"),
      spec("Liczba zamykanych schowków"),
      spec("Rodzaj szkła", "hartowane / antisol / przezroczyste / przyciemniane — tylko przeszklenie"),
      spec("Grubość szkła", "mm"),
      spec("System otwierania", "push-to-open / uchwyty / wpuszczane / frezowane / bezuchwytowe"),
      spec("Prowadnice szuflad", "pełny wysuw / cichy domyk / kulkowe — tylko z szufladami"),
      spec("Zawiasy / zamykanie", "cichy domyk / amortyzacja / standardowe"),
      spec("Oświetlenie LED", "LED w zestawie / opcjonalne, punkty, barwa światła"),
      spec("Nóżki / stopki", "metalowe / drewniane / tworzywo"),
      spec("Kolor nóżek", "czarny / złoty / szampański / chrom"),
      spec("Wysokość nóżek", "cm"),
      spec("Uchwyty", "metalowe / wpuszczane / frezowane"),
      spec("Kolor uchwytów"),
      spec("Montaż", "np. Do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata"),
    ],
    disclaimer: NOTE_CASE_FURNITURE,
    faq: FAQ_BASE.slice(0, 1),
  },
  {
    id: "szafka-rtv",
    label: "Szafka RTV",
    category: "szafki-rtv",
    hint: "Rozmiar, kolor, LED — opcjonalne. Otwór na przewody, wnęki, szuflady, nóżki.",
    namePlaceholder: "np. Szafka RTV Nordic 180",
    codePlaceholder: "np. SF-RTV-NOR180",
    kinds: ["Szafka RTV stojąca", "Szafka RTV wisząca", "Szafka RTV z LED", "Inna"],
    fabrics: true,
    sizes: {
      label: "Rozmiar / szerokość",
      hint: "Każdy wariant może mieć inną cenę, ID, wymiary i wagę.",
      presets: ["150 cm", "155 cm", "180 cm", "200 cm"],
    },
    options: [],
    optionSuggestions: [
      {
        name: "Kolor / wybarwienie",
        values: ["Cashmere", "Czarny", "Dąb naturalny", "Biały"],
        hint: COLOR_OPTION_HINT,
      },
      LED_OPTION,
    ],
    descriptionGuide: [
      "Wygląd, styl, kolor, fronty, nogi, uchwyty, ryflowania.",
      "Przechowywanie: drzwi, półki, szuflady, otwarte wnęki.",
      "System otwierania, cichy domyk, otwór na przewody, LED i materiały.",
    ],
    featureGroups: [
      {
        label: "Przechowywanie",
        items: ["Otwór na przewody", "Otwarta wnęka", "Zamykane szafki", "Półki", "Szuflady"],
      },
      {
        label: "Mechanizmy",
        items: [
          "Push-to-open",
          "Cichy domyk",
          "Bezuchwytowe fronty",
          "Metalowe uchwyty",
          "Wpuszczane uchwyty",
        ],
      },
      {
        label: "Design",
        items: ["Ryflowane fronty", "Frezowane fronty", "Zaokrąglone krawędzie", "Oświetlenie LED"],
      },
      {
        label: "Konstrukcja",
        items: [
          "Metalowe nóżki",
          "Nóżki MDF",
          "Regulowane stopki",
          "Obrzeża ABS",
          "LED w zestawie",
          "LED opcjonalne",
          "Do samodzielnego montażu",
        ],
      },
    ],
    highlights: [
      {
        title: "Praktyczne przechowywanie",
        description:
          "Półki, szafki i wnęki pomagają wygodnie uporządkować sprzęt RTV i akcesoria.",
        icon: "check",
      },
      {
        title: "Wygodne użytkowanie",
        description:
          "Dobrze dobrane mechanizmy otwierania zapewniają komfort podczas codziennego korzystania.",
        icon: "arrow",
      },
      {
        title: "Nowoczesny design",
        description:
          "Starannie wykończone fronty, nogi i detale nadają szafce charakterystyczny wygląd.",
        icon: "star",
      },
    ],
    dimensions: [
      dim("Szerokość", true),
      dim("Wysokość", true),
      dim("Głębokość", true),
      dim("Wysokość nóżek"),
      dim("Grubość płyty"),
      dim("Wymiary półek"),
      dim("Wymiary wnęk"),
      dim("Wymiary szuflad"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Maksymalne obciążenie blatu"),
      dim("Tolerancja wymiarów", false, "np. ±2%"),
    ],
    specs: [
      spec("Materiał korpusu", "np. Płyta laminowana"),
      spec("Materiał frontów", "płyta laminowana / MDF / MDF frezowany"),
      spec("Kolor korpusu"),
      spec("Kolor frontów"),
      spec("Rodzaj frontów", "gładkie / ryflowane / frezowane / zaokrąglone"),
      spec("Wykończenie", "mat / połysk / strukturalne / drewnopodobne"),
      spec("Obrzeża", "np. ABS"),
      spec("Liczba drzwi"),
      spec("Liczba szuflad"),
      spec("Liczba półek"),
      spec("Liczba otwartych wnęk"),
      spec("System otwierania", "push-to-open / uchwyty / bezuchwytowe / wpuszczane"),
      spec("Zawiasy / mechanizm", "cichy domyk / amortyzacja / standardowe"),
      flag("Otwór na kable"),
      spec("Uchwyty", "metalowe / złote / wpuszczane"),
      spec("Nóżki", "metalowe / MDF / drewniane"),
      spec("Kolor nóżek"),
      spec("Wysokość nóżek", "cm"),
      spec("Oświetlenie LED", "LED w zestawie / opcjonalne / za dopłatą, rodzaj, barwa"),
      spec("Montaż", "np. Do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata"),
    ],
    disclaimer: NOTE_CASE_FURNITURE,
    faq: FAQ_BASE.slice(0, 1),
  },
  {
    id: "szafka-nocna",
    label: "Szafka nocna",
    category: "szafki",
    hint: "Kolor jako wariant, szuflady, półka, push-to-open, wykończenie.",
    namePlaceholder: "np. Szafka nocna Bari",
    codePlaceholder: "np. SF-SZN-BAR01",
    kinds: ["Szafka nocna", "Szafka nocna wisząca", "Stolik nocny", "Inna"],
    fabrics: true,
    options: [],
    optionSuggestions: [
      {
        name: "Kolor / wybarwienie",
        values: ["Cashmere", "Biały", "Czarny", "Dąb"],
        hint: COLOR_OPTION_HINT,
      },
    ],
    descriptionGuide: [
      "Wygląd: styl, kolor, forma, charakter mebla, zastosowanie w sypialni.",
      "Funkcjonalność: szuflady, półki, sposób otwierania, przechowywanie.",
      "Wykonanie: materiał, wykończenie, prowadnice, obrzeża, nóżki / stopki.",
    ],
    featureGroups: [
      {
        label: "Przechowywanie",
        items: ["Szuflada", "2 szuflady", "3 szuflady", "Otwarta półka", "Zamknięta półka", "Drzwiczki"],
      },
      {
        label: "Mechanizmy",
        items: [
          "Push-to-open",
          "Cichy domyk",
          "Prowadnice kulkowe",
          "Prowadnice z pełnym wysuwem",
          "Bezuchwytowy front",
        ],
      },
      {
        label: "Konstrukcja",
        items: [
          "Płyta laminowana",
          "Płyta MDF",
          "Drewno",
          "Obrzeża ABS",
          "Zaokrąglone krawędzie",
          "Ukryte łączniki",
          "Regulowane stopki",
          "Nóżki",
        ],
      },
      {
        label: "Wykończenie",
        items: [
          "Matowe wykończenie",
          "Połysk",
          "Drewnopodobna struktura",
          "Gładkie wykończenie",
          "Odporna na zarysowania powierzchnia",
          "Łatwa w czyszczeniu",
        ],
      },
      {
        label: "Pozostałe",
        items: ["Do samodzielnego montażu", "Dostępne różne kolory"],
      },
    ],
    highlights: [
      {
        title: "Wygodne przechowywanie",
        description:
          "Szuflada i praktyczna półka zapewniają miejsce na najpotrzebniejsze rzeczy przy łóżku.",
        icon: "check",
      },
      {
        title: "Komfortowe otwieranie",
        description:
          "Nowoczesny system otwierania pozwala wygodnie korzystać z szuflady bez tradycyjnych uchwytów.",
        icon: "arrow",
      },
      {
        title: "Solidne wykonanie",
        description:
          "Trwałe materiały i zabezpieczone krawędzie zwiększają odporność mebla na codzienne użytkowanie.",
        icon: "dash",
      },
    ],
    dimensions: [
      dim("Szerokość", true, "np. 51 cm"),
      dim("Wysokość", true, "np. 52 cm"),
      dim("Głębokość", true, "np. 38 cm"),
      dim("Wysokość nóżek / stopek"),
      dim("Szerokość szuflady"),
      dim("Głębokość szuflady"),
      dim("Wysokość szuflady"),
      dim("Wysokość otwartej półki"),
      dim("Waga", false, "np. 25 kg", "kg"),
      dim("Tolerancja wymiarów", false, "np. ±2%"),
    ],
    specs: [
      spec("Rodzaj produktu", "np. Szafka nocna"),
      spec("Seria / model", "np. BARI"),
      spec("Materiał korpusu", "np. Płyta laminowana"),
      spec("Materiał frontu", "np. Płyta laminowana"),
      spec("Wykończenie", "np. Matowe, drewnopodobna struktura"),
      spec("Kolor", "np. Cashmere"),
      spec("Obrzeża", "np. ABS"),
      spec("Liczba szuflad", "np. 1"),
      spec("Liczba półek", "np. 1 otwarta półka"),
      spec("System otwierania", "np. Push-to-open"),
      spec("Prowadnice", "np. Cichy domyk"),
      spec("Uchwyty", "np. Brak — system bezuchwytowy"),
      spec("Nóżki / stopki", "np. Regulowane stopki"),
      spec("Montaż", "np. Do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata"),
    ],
    disclaimer: NOTE_CASE_FURNITURE,
    faq: FAQ_BASE.slice(0, 1),
  },
  {
    id: "ogolny",
    label: "Inny produkt",
    category: "fotele",
    hint: "Uniwersalna karta — fotele, stoliki, oświetlenie, akcesoria. Sam dobierasz pola.",
    namePlaceholder: "np. Fotel Nube",
    codePlaceholder: "np. SF-FOT-NUBE",
    kinds: [],
    fabrics: true,
    options: [],
    optionSuggestions: [
      {
        name: "Kolor / wybarwienie",
        values: ["Biały", "Czarny", "Dąb"],
        hint: COLOR_OPTION_HINT,
      },
    ],
    descriptionGuide: [
      "Wygląd, styl i główna zaleta produktu.",
      "Komfort, materiały i wykonanie.",
      "Funkcjonalność i zastosowanie.",
    ],
    featureGroups: [
      {
        label: "Cechy",
        items: [
          "Tkanina do wyboru",
          "Kolor do wyboru",
          "Stabilna konstrukcja",
          "Łatwy montaż",
          "Do samodzielnego montażu",
          "Regulowane stopki",
          "Obrzeża ABS",
        ],
      },
    ],
    highlights: [
      {
        title: "Solidna konstrukcja",
        description:
          "Trwałe materiały i wzmocnione połączenia zapewniają stabilność przez lata użytkowania.",
        icon: "check",
      },
      {
        title: "Komfort na co dzień",
        description: "Starannie dobrane materiały i proporcje zapewniają wygodę użytkowania.",
        icon: "star",
      },
      {
        title: "Dopracowany design",
        description: "Ponadczasowa forma i wykończenie pasują do nowoczesnych i klasycznych wnętrz.",
        icon: "dot",
      },
    ],
    dimensions: [
      dim("Szerokość", true),
      dim("Wysokość", true),
      dim("Głębokość", true),
      dim("Waga", false, "np. 25 kg", "kg"),
    ],
    specs: [
      spec("Materiał"),
      spec("Wykończenie"),
      spec("Konstrukcja"),
      spec("Montaż", "np. Do samodzielnego montażu"),
      spec("Gwarancja", "np. 2 lata"),
    ],
    disclaimer: NOTE_CASE_FURNITURE,
    faq: FAQ_BASE.slice(0, 1),
  },
];

const TEMPLATE_BY_ID = new Map(PRODUCT_TEMPLATES.map((template) => [template.id, template]));

export const PRODUCT_TEMPLATE_IDS = PRODUCT_TEMPLATES.map((template) => template.id);

export function isProductTemplateId(value: unknown): value is ProductTemplateId {
  return typeof value === "string" && TEMPLATE_BY_ID.has(value as ProductTemplateId);
}

export function getProductTemplate(id: ProductTemplateId | undefined | null): ProductTemplate {
  return (id && TEMPLATE_BY_ID.get(id)) || TEMPLATE_BY_ID.get("ogolny")!;
}

const CATEGORY_DEFAULT_TEMPLATE: Partial<Record<ProductCategory, ProductTemplateId>> = {
  sofy: "sofa",
  narozniki: "naroznik",
  lozka: "lozko",
  materace: "materac",
  szafy: "szafa",
  komody: "komoda",
  "szafki-rtv": "szafka-rtv",
  szafki: "szafka-nocna",
};

/** Szablon dla kategorii (produkty zapisane przed wprowadzeniem szablonów). */
export function templateIdForCategory(category: ProductCategory): ProductTemplateId {
  return CATEGORY_DEFAULT_TEMPLATE[category] ?? "ogolny";
}

export function resolveProductTemplate(
  product: Pick<Product, "templateId" | "category">
): ProductTemplate {
  if (product.templateId && TEMPLATE_BY_ID.has(product.templateId)) {
    return TEMPLATE_BY_ID.get(product.templateId)!;
  }
  return getProductTemplate(templateIdForCategory(product.category));
}

export function productUsesCovers(
  product: Pick<Product, "templateId" | "category">
): boolean {
  return Boolean(resolveProductTemplate(product).covers);
}

export function productUsesFabrics(
  product: Pick<Product, "templateId" | "category" | "colors">
): boolean {
  if (productUsesCovers(product)) return false;
  const template = resolveProductTemplate(product);
  if (template.fabrics) return (product.colors?.length ?? 0) > 0;
  return (product.colors ?? []).some((color) => Boolean(color.fabricId));
}

/** Kategorie, w których szablon dopuszcza rozmiar / szerokość jako wariant. */
export function templateHasSizes(template: ProductTemplate): boolean {
  return Boolean(template.sizes);
}

export function optionFromPreset(preset: TemplateOptionPreset): ProductOption {
  const option = newOption(preset.name, preset.values);
  return preset.afterColor ? { ...option, afterColor: true } : option;
}

/** Wszystkie propozycje atutów z szablonu — płaska lista. */
export function templateFeatureList(template: ProductTemplate): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of template.featureGroups) {
    for (const item of group.items) {
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
    }
  }
  return out;
}

/**
 * Struktura „Opis i spec.” wg szablonu: puste wiersze wymiarów i specyfikacji
 * z etykietami, nota techniczna, FAQ. Trzy wyróżniki zostają odznaczone —
 * admin zaznacza je w panelu, jeśli pasują do modelu.
 */
export function seedDetailsFromTemplate(
  template: ProductTemplate,
  current?: Partial<ProductDetails>
): ProductDetails {
  return {
    longDescription: current?.longDescription ?? "",
    productCode: current?.productCode ?? "",
    disclaimer: template.disclaimer,
    showDisclaimer: true,
    storyImage: current?.storyImage,
    dimensionImage: current?.dimensionImage,
    highlights: current?.highlights?.length
      ? current.highlights.map((item) => ({ ...item }))
      : [],
    features: [],
    layers: template.layers ? [{ name: "", thickness: "", description: "" }] : [],
    dimensions: template.dimensions.map((field) => ({ label: field.label, value: "" })),
    specs: template.specs.map((field) => ({ label: field.label, value: "" })),
    faq: template.faq.map((item) => ({ ...item })),
  };
}

/** Wartości, których nie pokazujemy klientowi („NIE”, „brak danych”, „nie dotyczy”). */
const HIDDEN_VALUES = new Set([
  "nie",
  "no",
  "brak",
  "brak danych",
  "nie dotyczy",
  "n/d",
  "n/a",
  "-",
  "—",
  "–",
]);

export function isVisibleSpecValue(value: string | undefined | null): boolean {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return false;
  return !HIDDEN_VALUES.has(trimmed.toLowerCase());
}

export function isToggleSpec(field: TemplateField | undefined): boolean {
  return Boolean(field?.defaultValue?.trim());
}
