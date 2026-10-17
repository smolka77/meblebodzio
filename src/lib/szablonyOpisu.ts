import type {
  ProductDetails,
  ProductDimension,
  ProductFaq,
  ProductHighlight,
  ProductSpec,
} from "@/lib/typy";

export type DescriptionTemplateId = "sofa" | "naroznik" | "lozko" | "pusty";

export interface DescriptionTemplate {
  id: DescriptionTemplateId;
  label: string;
  hint: string;
  details: Pick<
    ProductDetails,
    "longDescription" | "highlights" | "specs" | "dimensions" | "faq"
  >;
}

const baseDimensions: ProductDimension[] = [
  { label: "Szerokość", value: "" },
  { label: "Wysokość", value: "" },
  { label: "Głębokość", value: "" },
  { label: "Wysokość siedziska", value: "" },
  { label: "Głębokość siedziska", value: "" },
];

export const HIGHLIGHT_PRESETS: ProductHighlight[] = [
  {
    title: "Tkanina Easy Clean",
    description:
      "Miękka tapicerka o podwyższonej odporności na plamy — wystarczy woda i delikatne detergenty.",
    icon: "check",
  },
  {
    title: "Solidna konstrukcja",
    description:
      "Rama z drewna bukowego i wzmocnione połączenia zapewniają stabilność przez lata użytkowania.",
    icon: "dash",
  },
  {
    title: "Komfort siedzenia",
    description:
      "Pianka HR i sprężyny Bonell dają sprężyste, wygodne podparcie bez szybkiego odkształcania.",
    icon: "star",
  },
  {
    title: "Funkcja spania",
    description:
      "Mechanizm rozkładania pozwala szybko przygotować wygodne miejsce do noclegu dla gości.",
    icon: "arrow",
  },
];

export const SPEC_PRESETS: ProductSpec[] = [
  { label: "Tapicerka", value: "" },
  { label: "Wypełnienie siedziska", value: "" },
  { label: "Konstrukcja", value: "" },
  { label: "Nóżki", value: "" },
  { label: "System rozkładania", value: "" },
];

export const DIMENSION_PRESETS: ProductDimension[] = baseDimensions;

export const FAQ_PRESETS: ProductFaq[] = [
  {
    question: "Jaki jest czas realizacji zamówienia?",
    answer:
      "Standardowa produkcja trwa {{produkcja}}. Po zakończeniu produkcji dostawa zajmuje {{dostawa}}.",
  },
  {
    question: "Jak dbać o tapicerkę?",
    answer:
      "Regularnie odkurzaj miękką końcówką. Plamy usuń odrobiną wody z łagodnym detergentem — unikaj szorowania.",
  },
  {
    question: "Czy mogę zwrócić produkt?",
    answer:
      "Tak — masz {{zwrot}} na odstąpienie od umowy bez podawania przyczyny (zgodnie z regulaminem sklepu).",
  },
];

export const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
  {
    id: "sofa",
    label: "Sofa",
    hint: "Opis, atuty, specyfikacja i FAQ pod model tapicerowany",
    details: {
      longDescription:
        "{{marka}} prezentuje sofę stworzoną do codziennego relaksu w salonie. Miękka tapicerka, wyważone proporcje i stabilna konstrukcja sprawiają, że mebel dobrze odnajduje się w nowoczesnych i klasycznych aranżacjach. Dostawa {{dostawa}} po zakończeniu produkcji ({{produkcja}}).",
      highlights: HIGHLIGHT_PRESETS.slice(0, 3),
      specs: SPEC_PRESETS.slice(0, 4),
      dimensions: baseDimensions,
      faq: FAQ_PRESETS.slice(0, 2),
    },
  },
  {
    id: "naroznik",
    label: "Narożnik",
    hint: "Szablon z funkcją spania, wymiarami i FAQ",
    details: {
      longDescription:
        "Narożnik {{marka}} łączy przestronną strefę wypoczynku z praktyczną funkcją spania. Zaokrąglone boki i pojemnik na pościel ułatwiają codzienne użytkowanie, a tapicerka Easy Clean pomaga utrzymać jasny odcień w czystości.",
      highlights: HIGHLIGHT_PRESETS,
      specs: SPEC_PRESETS,
      dimensions: [
        ...baseDimensions,
        { label: "Powierzchnia spania", value: "" },
      ],
      faq: FAQ_PRESETS,
    },
  },
  {
    id: "lozko",
    label: "Łóżko / materac",
    hint: "Krótszy opis pod sypialnię",
    details: {
      longDescription:
        "Model {{marka}} zaprojektowano z myślą o regenerującym śnie. Stabilna baza, dopasowane wsparcie i starannie dobrane materiały tworzą spójną całość w sypialni. Gwarancja: {{gwarancja}}.",
      highlights: HIGHLIGHT_PRESETS.slice(1, 3),
      specs: [
        { label: "Materiał pokrowca", value: "" },
        { label: "Wypełnienie / system", value: "" },
        { label: "Twardość", value: "" },
      ],
      dimensions: [
        { label: "Szerokość", value: "" },
        { label: "Długość", value: "" },
        { label: "Wysokość", value: "" },
      ],
      faq: FAQ_PRESETS.slice(0, 2),
    },
  },
  {
    id: "pusty",
    label: "Pusta struktura",
    hint: "Same sekcje i wiersze do wypełnienia — bez gotowego tekstu",
    details: {
      longDescription: "",
      highlights: [{ title: "", description: "" }],
      specs: [{ label: "Tapicerka", value: "" }],
      dimensions: [{ label: "Szerokość", value: "" }],
      faq: [{ question: "", answer: "" }],
    },
  },
];
