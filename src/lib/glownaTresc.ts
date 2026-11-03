import type { ProductCategory } from "@/lib/typy";
import { storePolicies } from "@/lib/zasadySklepu";

/**
 * Treści strony głównej w jednym miejscu - komponenty tylko je układają.
 * Opinie, zdjęcia klientów i liczby (2 300+, 14 manufaktur…) to treści demonstracyjne:
 * przed startem sprzedaży podmień je na własne, zweryfikowane dane.
 */

export const HERO = {
  eyebrow: "Kolekcja jesień 2026",
  claim: "Meble tworzone dla pięknych wnętrz.",
  sub: "Komfort, design, jakość.",
  cta: { label: "Zobacz kolekcje", href: "/kategoria/kolekcje" },
  secondaryCta: { label: "Dobierz meble", href: "/doradca" },
  slides: [
    {
      image: "/wzor/living-cream.jpg",
      alt: "Jasny salon z kremową sofą i fotelem boucle",
      caption: "Salon w stylu skandynawskim",
      href: "/inspiracje/salon-skandynawski",
      category: "sofy" as ProductCategory,
      position: "50% 60%",
    },
    {
      image: "/wzor/bedroom.jpg",
      alt: "Sypialnia z tapicerowanym łóżkiem",
      caption: "Sypialnia z miękkim zagłówkiem",
      href: "/inspiracje/sypialnia-klasyczna",
      category: "lozka" as ProductCategory,
      position: "50% 50%",
    },
    {
      image: "/wzor/living-bright.jpg",
      alt: "Widny salon z jasnymi meblami",
      caption: "Jasny salon z narożnikiem",
      href: "/kategoria/narozniki",
      category: "narozniki" as ProductCategory,
      position: "50% 55%",
    },
  ],
  usp: [
    { icon: "truck", title: "Wysyłka 24 h", text: "Modele z magazynu" },
    { icon: "flag", title: "Polska produkcja", text: "Z manufaktur w Polsce" },
    { icon: "return", title: storePolicies.returnsLabel, text: "Bez podawania przyczyny" },
    { icon: "card", title: "Raty 0%", text: "20 rat, decyzja w 15 minut" },
  ],
} as const;

export type UspIcon = (typeof HERO.usp)[number]["icon"];

export interface CategoryTile {
  label: string;
  href: string;
  image: string;
  categories: ProductCategory[];
  /** Zdjęcie produktowe na jasnym tle zamiast aranżacji. */
  studio?: boolean;
  position?: string;
}

export const CATEGORY_TILES: CategoryTile[] = [
  {
    label: "Sofy i narożniki",
    href: "/produkty?typ=sofy,narozniki",
    image: "/wzor/living-bright.jpg",
    categories: ["sofy", "narozniki"],
  },
  {
    label: "Łóżka",
    href: "/kategoria/lozka",
    image: "/wzor/bedroom.jpg",
    categories: ["lozka"],
  },
  {
    label: "Komody",
    href: "/kategoria/komody",
    image: "/wzor/living-orange.jpg",
    categories: ["komody"],
    position: "50% 58%",
  },
  {
    label: "Szafy",
    href: "/kategoria/szafy",
    image: "/katalog/szafa-haven.jpg",
    categories: ["szafy"],
    studio: true,
  },
  {
    label: "Stoły i stoliki",
    href: "/kategoria/stoliki",
    image: "/wzor/dining.jpg",
    categories: ["stoliki"],
  },
  {
    label: "Regały i szafki",
    href: "/kategoria/szafki",
    image: "/wzor/cabinet.jpg",
    categories: ["szafki"],
  },
  {
    label: "Szafki RTV",
    href: "/kategoria/szafki-rtv",
    image: "/wzor/j8.jpg",
    categories: ["szafki-rtv"],
  },
  {
    label: "Materace",
    href: "/kategoria/materace",
    image: "/wzor/u4.jpg",
    categories: ["materace"],
  },
];

export const COLLECTION_SLUGS = [
  {
    slug: "kolekcja-terra",
    name: "Terra",
    tagline: "Naturalny len i dąb",
    description: "Sofa, fotel i stolik z litego dębu w jednej, spokojnej palecie.",
    image: "/katalog/kolekcja-terra.jpg",
  },
  {
    slug: "kolekcja-aurora",
    name: "Aurora",
    tagline: "Miękkie, jasne formy",
    description: "Przestronny zestaw wypoczynkowy w jasnej tapicerce na każdy salon.",
    image: "/katalog/kolekcja-aurora.jpg",
  },
  {
    slug: "kolekcja-nest",
    name: "Nest",
    tagline: "Boucle i domowy komfort",
    description: "Narożnik, fotel i puf w miękkiej tkaninie boucle - gniazdo na wieczory.",
    image: "/katalog/kolekcja-nest.jpg",
  },
];

export interface ReviewEntry {
  author: string;
  city: string;
  product: string;
  text: string;
  rating: 4 | 5;
}

export const REVIEW_SUMMARY = {
  average: "4,8",
  count: "2 300+",
  distribution: [
    { stars: 5, percent: 84 },
    { stars: 4, percent: 12 },
    { stars: 3, percent: 3 },
    { stars: 2, percent: 1 },
    { stars: 1, percent: 0 },
  ],
};

export const REVIEWS: ReviewEntry[] = [
  { author: "Anna", city: "Wrocław", product: "Sofa", text: "Kolor na żywo jeszcze ładniejszy niż na zdjęciach. Siedzi się rewelacyjnie.", rating: 5 },
  { author: "Marek", city: "Poznań", product: "Fotel", text: "Dotarł w dwa dni, a obiecana tkanina jest dokładnie taka, jak na próbce.", rating: 5 },
  { author: "Kasia", city: "Kraków", product: "Łóżko", text: "Stelaż solidny, montaż zajął kwadrans. Polecam każdemu.", rating: 5 },
  { author: "Tomasz", city: "Gdańsk", product: "Narożnik", text: "Kurier wniósł na 4. piętro bez windy. Pełen profesjonalizm.", rating: 5 },
  { author: "Ola", city: "Łódź", product: "Lampa", text: "Świetna jakość wykonania, daje bardzo przyjemne światło.", rating: 5 },
  { author: "Paweł", city: "Warszawa", product: "Komoda", text: "Wygląda drożej, niż kosztowała. Fronty równe, uchwyty solidne.", rating: 4 },
];

export interface UgcEntry {
  image: string;
  author: string;
  city: string;
  productSlug: string;
}

/** „Wasze wnętrza” - klikalny feed zdjęć klientów (shoppable). */
export const UGC: UgcEntry[] = [
  { image: "/wzor/j7.jpg", author: "Anna", city: "Wrocław", productSlug: "sofa-bergen" },
  { image: "/wzor/j5.jpg", author: "Kasia", city: "Kraków", productSlug: "lozko-loft" },
  { image: "/wzor/j3.jpg", author: "Ola", city: "Łódź", productSlug: "fotel-boucle" },
  { image: "/wzor/j1.jpg", author: "Marek", city: "Poznań", productSlug: "materac-cloud-sleep" },
  { image: "/wzor/j4.jpg", author: "Tomasz", city: "Gdańsk", productSlug: "sofa-linen" },
  { image: "/wzor/j6.jpg", author: "Paweł", city: "Warszawa", productSlug: "stolik-boczny-nook" },
];

export const WHY_US = {
  eyebrow: "Dlaczego my",
  title: "Autorska kolekcja, zaprojektowana we Wrocławiu",
  text: "Każdy model zaczynamy od szkicu w naszym studiu, a kończymy w polskich manufakturach. Testujemy pianki, tkaniny i stelaże, żeby mebel służył latami, a nie sezon.",
  image: "/brand/manufaktura.jpg",
  imageAlt: "Magazyn i manufaktura w Kątach Wrocławskich",
  items: [
    { icon: "flag", value: "100%", label: "Polska produkcja", text: "Projekt i jakość z Polski." },
    { icon: "pencil", value: "3", label: "Autorskie kolekcje", text: "Terra, Aurora i Nest." },
    { icon: "factory", value: "14", label: "polskich manufaktur", text: "Sprawdzeni partnerzy." },
    { icon: "grid", value: "120+", label: "autorskich modeli", text: "Sofy, łóżka, szafy i więcej." },
    { icon: "shield", value: storePolicies.warrantyYearsText, label: "gwarancji", text: "Na konstrukcję i mechanizmy." },
    { icon: "truck", value: "24 h", label: "wysyłka", text: "Modele z magazynu." },
  ],
} as const;

export type WhyIcon = (typeof WHY_US.items)[number]["icon"];

/** Poradniki na stronie głównej - slugi artykułów z bloga; brakujące uzupełniamy najnowszymi. */
export const GUIDE_SLUGS = [
  "jak-wybrac-materac",
  "trendy-wnetrzarskie-2026",
  "naroznik-czy-sofa",
];

export const ADVISOR_BAND = {
  eyebrow: "Doradca zakupowy",
  title: "Nie wiesz, od czego zacząć?",
  text: "Odpowiedz na kilka pytań - o pomieszczeniu, stylu i budżecie. Dobierzemy meble i podpowiemy, czym je uzupełnić.",
  cta: { label: "Dobierz meble", href: "/doradca" },
};
