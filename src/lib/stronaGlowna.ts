import { shopNavVisibleHrefs } from "./nawigacjaSklepu";

const VISIBLE_CATEGORY_HREFS = shopNavVisibleHrefs();

export interface HomepageHero {
  image: string;
  eyebrow: string;
  title: string;
  buttonLabel: string;
  buttonHref: string;
}

export interface HomepageCard {
  label: string;
  description: string;
  image: string;
  href: string;
  comingSoon?: boolean;
}

export interface HomepageSection {
  eyebrow: string;
  title: string;
  intro: string;
  cards: HomepageCard[];
}

export interface HomepageBestsellers {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface HomepageLookHotspot {
  id: string;
  productSlug: string;
  x: number;
  y: number;
}

export interface HomepageLook {
  image: string;
  eyebrow: string;
  title: string;
  intro: string;
  intro2: string;
  listLabel: string;
  ctaLabel: string;
  ctaHref: string;
  hotspots: HomepageLookHotspot[];
}

export interface HomepageBenefitTile {
  highlight: string;
  title: string;
  body: string;
  linkLabel: string;
  linkHref: string;
}

export interface HomepageWorkshop {
  image: string;
  alt: string;
  kicker: string;
  title: string;
  body: string;
  href: string;
}

export interface HomepageBenefits {
  eyebrow: string;
  title: string;
  workshop: HomepageWorkshop;
  returns: HomepageBenefitTile;
  shipping: HomepageBenefitTile;
}

export interface HomepageReview {
  id: string;
  name: string;
  city: string;
  product: string;
  image: string;
  text: string;
}

export interface HomepageReviews {
  eyebrow: string;
  title: string;
  rating: string;
  meta: string;
  items: HomepageReview[];
}

export interface HomepageContent {
  hero: HomepageHero;
  heroSlides: HomepageHero[];
  bestsellers: HomepageBestsellers;
  look: HomepageLook;
  categories: HomepageSection;
  collections: HomepageSection;
  benefits: HomepageBenefits;
  reviews: HomepageReviews;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80";

export const DEFAULT_HOMEPAGE: HomepageContent = {
  hero: {
    image: "/hero-home.png",
    eyebrow: "Polska produkcja · Premium",
    title: "Komfort w najlepszym wydaniu.",
    buttonLabel: "Przeglądaj produkty",
    buttonHref: "#produkty",
  },
  heroSlides: [
    {
      image:
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
      eyebrow: "Kolekcja",
      title: "Skandynawski minimalizm",
      buttonLabel: "Zobacz kolekcję",
      buttonHref: "/kategoria/kolekcje",
    },
    {
      image:
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
      eyebrow: "Kolekcja",
      title: "Nowoczesna elegancja",
      buttonLabel: "Zobacz kolekcję",
      buttonHref: "/kategoria/kolekcje",
    },
  ],
  bestsellers: {
    eyebrow: "Bestsellery",
    title: "Tu są nasze bestsellery",
    intro: "Modele, po które wracacie najczęściej.",
  },
  look: {
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85",
    eyebrow: "Aranżacje",
    title: "Zainspiruj się",
    intro:
      "Salon ułożony z mebli Wrohaus — ta sama tkanina, te same wymiary, bez zgadywania z katalogu. Najedź na biały znacznik na zdjęciu albo na model na liście: zobaczysz nazwę i cenę. Kliknij, żeby przejść prosto do produktu.",
    intro2:
      "To gotowa aranżacja, nie moodboard. Każdy mebel z tej sceny jest w sklepie i możesz zamówić go w tej samej konfiguracji.",
    listLabel: "Na tym zdjęciu możesz zobaczyć:",
    ctaLabel: "Zobacz meble z aranżacji",
    ctaHref: "/produkty",
    hotspots: [
      { id: "look-fotel-nordic", productSlug: "fotel-nordic", x: 19, y: 50 },
      { id: "look-naroznik-oslo", productSlug: "naroznik-oslo", x: 62, y: 44 },
      { id: "look-fotel-boucle", productSlug: "fotel-boucle", x: 31, y: 76 },
    ],
  },
  categories: {
    eyebrow: "Kategorie",
    title: "Zacznij od kategorii",
    intro:
      "Sofy, narożniki, fotele, kolekcje i reszta oferty — wybierz kategorię i znajdź model do swojego wnętrza.",
    cards: [
      {
        label: "Sofy",
        description: "",
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85",
        href: "/kategoria/sofy",
      },
      {
        label: "Narożniki",
        description: "",
        image:
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=900&q=85",
        href: "/kategoria/narozniki",
      },
      {
        label: "Fotele",
        description: "",
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
        href: "/kategoria/fotele",
      },
      {
        label: "Kolekcje",
        description: "",
        image:
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
        href: "/kategoria/kolekcje",
      },
      {
        label: "Szafy",
        description: "",
        image:
          "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=900&q=85",
        href: "/kategoria/szafy",
      },
      {
        label: "Materace",
        description: "",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80",
        href: "/kategoria/materace",
      },
      {
        label: "Łóżka",
        description: "",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&q=85",
        href: "/kategoria/lozka",
      },
      {
        label: "Promocje",
        description: "",
        image:
          "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        href: "/promocje",
      },
      {
        label: "Meble od ręki",
        description: "",
        image:
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
        href: "/meble-od-reki",
      },
      {
        label: "Próbki tkanin",
        description: "",
        image:
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        href: "/probki-tkanin",
      },
    ],
  },
  collections: {
    eyebrow: "Kolekcje",
    title: "Odkryj nasze kolekcje",
    intro: "",
    cards: [
      {
        label: "Smart",
        description:
          "Dobry design i funkcjonalność w najlepszej cenie.",
        image: "/linie/smart.jpg",
        href: "/linia/smart",
      },
      {
        label: "Comfort",
        description:
          "Najlepszy balans wygody, jakości i ceny.",
        image: "/linie/comfort.jpg",
        href: "/linia/comfort",
      },
      {
        label: "Premium",
        description:
          "Designerskie modele i wyższy standard wykończenia.",
        image: "/linie/premium.jpg",
        href: "/linia/premium",
      },
    ],
  },
  benefits: {
    eyebrow: "Bez zgadywania",
    title: "Dlaczego Wrohaus",
    workshop: {
      image: "/brand/manufaktura.jpg",
      alt: "Manufaktura Wrohaus w Kątach Wrocławskich",
      kicker: "Polska manufaktura",
      title: "Kąty Wrocławskie. Od ramy po ostatni szew.",
      body: "Każdy mebel powstaje u nas. Kontrolujemy jakość sami — bez sezonowych kompromisów. 2 lata gwarancji.",
      href: "/o-nas",
    },
    returns: {
      highlight: "14",
      title: "dni na zwrot",
      body: "Kupujesz spokojnie. Jeśli model nie siądzie we wnętrzu, odsyłasz bez zbędnych formalności.",
      linkLabel: "Zasady zwrotu",
      linkHref: "/dostawa",
    },
    shipping: {
      highlight: "od 249 zł",
      title: "Wysyłamy z Polski",
      body: "1–10 dni roboczych. Sofy i narożniki zwykle jadą w całości. Szafy i meble skrzyniowe mogą być w paczkach do samodzielnego montażu — to jest na karcie produktu.",
      linkLabel: "Dostawa i terminy",
      linkHref: "/dostawa",
    },
  },
  reviews: {
    eyebrow: "Wasze opinie",
    title: "Ludzie, którzy już siedzą na Wrohaus",
    rating: "4,9 / 5",
    meta: "— oceny z zamówień sofy, narożników i foteli",
    items: [
      {
        id: "review-marta",
        name: "Marta W.",
        city: "Kraków",
        product: "Sofa Milano",
        image:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        text: "Siedzi się miękko, a tkanina w salonie wygląda drożej niż na zdjęciach. Dostawa w terminie, karton bez obtarć.",
      },
      {
        id: "review-piotr",
        name: "Piotr L.",
        city: "Warszawa",
        product: "Narożnik Oslo",
        image:
          "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80",
        text: "Wzięliśmy Oslo zamiast gotowca z marketu. Po jednym wieczorze wiadomo, po co się dopłaca za siedzisko i ramę.",
      },
      {
        id: "review-anna",
        name: "Anna i Tomek",
        city: "Wrocław",
        product: "Fotel Nordic",
        image:
          "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
        text: "Najpierw próbki tkanin, potem fotel. Kolor wyszedł 1:1. Wreszcie sklep, przy którym nie zgadujesz z monitora.",
      },
    ],
  },
};

function mergeCard(base: HomepageCard, patch?: Partial<HomepageCard>): HomepageCard {
  return {
    label: patch?.label?.trim() || base.label,
    description: patch?.description ?? base.description,
    image: patch?.image?.trim() || base.image,
    href: patch?.href?.trim() || base.href,
    comingSoon: patch?.comingSoon ?? base.comingSoon,
  };
}

function mergeCards(
  base: HomepageCard[],
  patch?: Partial<HomepageCard>[]
): HomepageCard[] {
  if (!patch?.length) return base;
  return base.map((card) => {
    const found =
      patch.find((item) => item.href && item.href === card.href) ??
      patch.find((item) => item.label && item.label === card.label);
    return found ? mergeCard(card, found) : card;
  });
}

function mergeHero(base: HomepageHero, patch?: Partial<HomepageHero>): HomepageHero {
  return {
    image: patch?.image?.trim() || base.image,
    eyebrow: patch?.eyebrow ?? base.eyebrow,
    title: patch?.title?.trim() || base.title,
    buttonLabel: patch?.buttonLabel?.trim() || base.buttonLabel,
    buttonHref: patch?.buttonHref?.trim() || base.buttonHref,
  };
}

function mergeSection(
  base: HomepageSection,
  patch?: Partial<HomepageSection>
): HomepageSection {
  const patchCards = patch?.cards;
  const isLegacyThree =
    patchCards?.length === 3 && patchCards[2]?.href === "/wiecej";
  const cards =
    !patchCards?.length || isLegacyThree
      ? mergeCards(base.cards, patchCards)
      : patchCards.map((card, i) =>
          mergeCard(base.cards[i] ?? emptyCard(), card)
        );

  return {
    eyebrow: patch?.eyebrow ?? base.eyebrow,
    title: patch?.title?.trim() || base.title,
    intro: patch?.intro ?? base.intro,
    cards,
  };
}

function emptyCard(): HomepageCard {
  return { label: "Kafelek", description: "", image: FALLBACK_IMAGE, href: "/produkty" };
}

function emptyHero(): HomepageHero {
  return {
    image: FALLBACK_IMAGE,
    eyebrow: "",
    title: "Nowy slajd",
    buttonLabel: "Zobacz",
    buttonHref: "/produkty",
  };
}

export const MAX_LOOK_HOTSPOTS = 12;
export const MAX_HOMEPAGE_REVIEWS = 12;

function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 50;
  return Math.round(Math.min(98, Math.max(2, n)) * 10) / 10;
}

function newCmsId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function newHomepageReview(): HomepageReview {
  return {
    id: newCmsId("review"),
    name: "",
    city: "",
    product: "",
    image: FALLBACK_IMAGE,
    text: "",
  };
}

export function sanitizeHomepageReviews(raw: unknown): HomepageReview[] {
  if (!Array.isArray(raw)) return [...DEFAULT_HOMEPAGE.reviews.items];
  const seen = new Set<string>();
  const items: HomepageReview[] = [];
  for (let i = 0; i < raw.length && items.length < MAX_HOMEPAGE_REVIEWS; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Partial<HomepageReview>;
    let id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : `review-${i}`;
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const city = typeof o.city === "string" ? o.city.trim() : "";
    const product = typeof o.product === "string" ? o.product.trim() : "";
    const text = typeof o.text === "string" ? o.text.trim() : "";
    if (!name && !text) continue;
    items.push({
      id,
      name: name || "Klient",
      city,
      product,
      image: typeof o.image === "string" && o.image.trim() ? o.image.trim() : FALLBACK_IMAGE,
      text,
    });
  }
  return items;
}

export function newLookHotspot(x = 50, y = 50): HomepageLookHotspot {
  const id = newCmsId("look");
  return { id, productSlug: "", x: clampPercent(x), y: clampPercent(y) };
}

export function sanitizeLookHotspots(
  raw: unknown[]
): HomepageLookHotspot[] {
  const seen = new Set<string>();
  const seenSlugs = new Set<string>();
  const spots: HomepageLookHotspot[] = [];
  for (let i = 0; i < raw.length && spots.length < MAX_LOOK_HOTSPOTS; i++) {
    const item = raw[i];
    if (!item || typeof item !== "object") continue;
    const o = item as Partial<HomepageLookHotspot>;
    let id = typeof o.id === "string" && o.id.trim() ? o.id.trim() : `look-${i}`;
    if (seen.has(id)) id = `${id}-${i}`;
    seen.add(id);
    const slug = typeof o.productSlug === "string" ? o.productSlug.trim() : "";
    if (slug) {
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);
    }
    spots.push({
      id,
      productSlug: slug,
      x: clampPercent(Number(o.x)),
      y: clampPercent(Number(o.y)),
    });
  }
  return spots;
}

export function mergeHomepage(
  stored?: Partial<HomepageContent> | null
): HomepageContent {
  const storedSlides = stored?.heroSlides;
  return {
    hero: mergeHero(DEFAULT_HOMEPAGE.hero, stored?.hero),
    heroSlides:
      storedSlides && storedSlides.length > 0
        ? storedSlides.map((slide, i) =>
            mergeHero(DEFAULT_HOMEPAGE.heroSlides[i] ?? emptyHero(), slide)
          )
        : DEFAULT_HOMEPAGE.heroSlides,
    bestsellers: {
      eyebrow:
        stored?.bestsellers?.eyebrow ?? DEFAULT_HOMEPAGE.bestsellers.eyebrow,
      title:
        stored?.bestsellers?.title?.trim() ||
        DEFAULT_HOMEPAGE.bestsellers.title,
      intro: stored?.bestsellers?.intro ?? DEFAULT_HOMEPAGE.bestsellers.intro,
    },
    look: {
      image: stored?.look?.image?.trim() || DEFAULT_HOMEPAGE.look.image,
      eyebrow: stored?.look?.eyebrow ?? DEFAULT_HOMEPAGE.look.eyebrow,
      title: stored?.look?.title?.trim() || DEFAULT_HOMEPAGE.look.title,
      intro: stored?.look?.intro ?? DEFAULT_HOMEPAGE.look.intro,
      intro2: stored?.look?.intro2 ?? DEFAULT_HOMEPAGE.look.intro2,
      listLabel: stored?.look?.listLabel ?? DEFAULT_HOMEPAGE.look.listLabel,
      ctaLabel: stored?.look?.ctaLabel?.trim() || DEFAULT_HOMEPAGE.look.ctaLabel,
      ctaHref: stored?.look?.ctaHref?.trim() || DEFAULT_HOMEPAGE.look.ctaHref,
      hotspots: Array.isArray(stored?.look?.hotspots)
        ? sanitizeLookHotspots(stored.look.hotspots)
        : DEFAULT_HOMEPAGE.look.hotspots,
    },
    categories: (() => {
      const section = mergeSection(
        DEFAULT_HOMEPAGE.categories,
        stored?.categories
      );
      return {
        ...section,
        cards: section.cards.filter((card) =>
          VISIBLE_CATEGORY_HREFS.has(card.href)
        ),
      };
    })(),
    collections: mergeSection(DEFAULT_HOMEPAGE.collections, stored?.collections),
    benefits: mergeBenefits(DEFAULT_HOMEPAGE.benefits, stored?.benefits),
    reviews: mergeReviews(DEFAULT_HOMEPAGE.reviews, stored?.reviews),
  };
}

function mergeReviews(
  base: HomepageReviews,
  patch?: Partial<HomepageReviews>
): HomepageReviews {
  return {
    eyebrow: patch?.eyebrow ?? base.eyebrow,
    title: patch?.title?.trim() || base.title,
    rating: patch?.rating?.trim() || base.rating,
    meta: patch?.meta ?? base.meta,
    items: Array.isArray(patch?.items)
      ? sanitizeHomepageReviews(patch.items)
      : [...base.items],
  };
}

function mergeBenefitTile(
  base: HomepageBenefitTile,
  patch?: Partial<HomepageBenefitTile>
): HomepageBenefitTile {
  return {
    highlight: patch?.highlight?.trim() || base.highlight,
    title: patch?.title?.trim() || base.title,
    body: patch?.body ?? base.body,
    linkLabel: patch?.linkLabel?.trim() || base.linkLabel,
    linkHref: patch?.linkHref?.trim() || base.linkHref,
  };
}

function mergeBenefits(
  base: HomepageBenefits,
  patch?: Partial<HomepageBenefits>
): HomepageBenefits {
  if (!patch) return base;
  return {
    eyebrow: patch.eyebrow ?? base.eyebrow,
    title: patch.title?.trim() || base.title,
    workshop: {
      image: patch.workshop?.image?.trim() || base.workshop.image,
      alt: patch.workshop?.alt?.trim() || base.workshop.alt,
      kicker: patch.workshop?.kicker ?? base.workshop.kicker,
      title: patch.workshop?.title?.trim() || base.workshop.title,
      body: patch.workshop?.body ?? base.workshop.body,
      href: patch.workshop?.href?.trim() || base.workshop.href,
    },
    returns: mergeBenefitTile(base.returns, patch.returns),
    shipping: mergeBenefitTile(base.shipping, patch.shipping),
  };
}
