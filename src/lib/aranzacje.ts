import type { Product, ProductRoom, ProductStyle } from "@/lib/typy";

/** Rabat na cały zestaw z aranżacji — liczony kuponem ZESTAW10 w koszyku. */
export const SET_DISCOUNT_PERCENT = 10;
export const SET_COUPON_CODE = "ZESTAW10";

export interface LookSpot {
  /** Slug produktu z oferty. */
  slug: string;
  /** Pozycja znacznika na zdjęciu, w procentach szerokości / wysokości. */
  x: number;
  y: number;
}

export interface Look {
  slug: string;
  title: string;
  /** Krótka etykieta zakładki. */
  tab: string;
  /** Jedna linia na kartę aranżacji. */
  short: string;
  intro: string;
  image: string;
  /** Szerokość / wysokość zdjęcia — kadr bez przycinania, żeby znaczniki trafiały w meble. */
  ratio: number;
  room: ProductRoom;
  styles: ProductStyle[];
  spots: LookSpot[];
  /** Kadr zdjęcia na kafelkach (object-position). */
  position?: string;
}

export const LOOKS: Look[] = [
  {
    slug: "salon-szary",
    tab: "Salon szary",
    title: "Salon w odcieniach szarości",
    short: "Szara sofa, stolik z drewna i dwie lampy dla spokojnego wieczoru.",
    intro:
      "Stonowany salon, w którym każdy element ma swoje miejsce: pikowana sofa jako centrum, niski stolik pod ręką i ciepłe światło z dwóch lamp.",
    image: "/wzor/sofa-room.jpg",
    ratio: 1400 / 933,
    room: "salon",
    styles: ["nowoczesny", "klasyczny"],
    spots: [
      { slug: "sofa-capri", x: 50, y: 56 },
      { slug: "stolik-kawowy-pebble", x: 47, y: 80 },
      { slug: "lampa-arc", x: 7, y: 10 },
      { slug: "lampa-halo", x: 95, y: 30 },
    ],
  },
  {
    slug: "salon-skandynawski",
    tab: "Skandynawski",
    title: "Jasny salon w stylu skandynawskim",
    short: "Len, boucle i jasne drewno — naturalna paleta, która uspokaja.",
    intro:
      "Kremowa sofa na drewnianych nóżkach, miękki fotel w tkaninie boucle i lekkie dodatki. Tak wygląda skandynawski spokój w praktyce.",
    image: "/wzor/living-cream.jpg",
    ratio: 2200 / 1611,
    room: "salon",
    styles: ["skandynawski"],
    spots: [
      { slug: "sofa-linen", x: 55, y: 68 },
      { slug: "fotel-boucle", x: 14, y: 72 },
      { slug: "stolik-boczny-nook", x: 57, y: 82 },
      { slug: "lampa-halo", x: 88, y: 52 },
    ],
  },
  {
    slug: "sypialnia-klasyczna",
    tab: "Sypialnia",
    title: "Sypialnia z miękkim zagłówkiem",
    short: "Tapicerowane łóżko, dobrany materac i szafka nocna z charakterem.",
    intro:
      "Sypialnia, w której chce się zostać na dłużej: wysoki zagłówek, materac dobrany do snu i ciepłe światło przy łóżku.",
    image: "/wzor/bedroom.jpg",
    ratio: 2200 / 1467,
    room: "sypialnia",
    styles: ["klasyczny", "glamour"],
    spots: [
      { slug: "lozko-loft", x: 50, y: 40 },
      { slug: "materac-cloud-sleep", x: 50, y: 62 },
      { slug: "szafka-oak", x: 12, y: 52 },
      { slug: "lampa-halo", x: 68, y: 14 },
    ],
  },
  {
    slug: "salon-loft",
    tab: "Loft",
    title: "Salon loft z naturalnymi materiałami",
    short: "Skórzany narożnik, drewniany stolik i dużo zieleni.",
    intro:
      "Karmelowa skóra, surowe drewno i czarny metal. Ten salon pokazuje, jak połączyć loftowy charakter z domową wygodą.",
    image: "/wzor/b3.jpg",
    ratio: 1400 / 1000,
    room: "salon",
    styles: ["loft"],
    spots: [
      { slug: "naroznik-amber", x: 82, y: 58 },
      { slug: "fotel-soft", x: 16, y: 74 },
      { slug: "stolik-kawowy-pebble", x: 47, y: 66 },
      { slug: "stolik-boczny-nook", x: 82, y: 86 },
    ],
  },
  {
    slug: "salon-cieple-barwy",
    tab: "Ciepłe barwy",
    title: "Salon w ciepłych barwach",
    short: "Pomarańczowy fotel, drewniana komoda i mosiężne akcenty.",
    intro:
      "Jeden odważny kolor wystarczy: pomarańczowy fotel na tle jasnych ścian, drewniana komoda i dodatki w kolorze mosiądzu.",
    image: "/wzor/living-orange.jpg",
    ratio: 1400 / 2489,
    room: "salon",
    styles: ["glamour", "nowoczesny"],
    position: "50% 58%",
    spots: [
      { slug: "fotel-lounge", x: 67, y: 63 },
      { slug: "komoda-grove", x: 40, y: 57 },
      { slug: "lampa-halo", x: 14, y: 58 },
    ],
  },
];

export function findLook(slug: string): Look | undefined {
  return LOOKS.find((look) => look.slug === slug);
}

export interface LookItem {
  spot: LookSpot;
  product: Product;
}

/** Produkty aranżacji, które są w ofercie (znikają te, których już nie ma albo są szkicem). */
export function lookItems(look: Look, products: Product[]): LookItem[] {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const seen = new Set<string>();
  const items: LookItem[] = [];
  for (const spot of look.spots) {
    const product = bySlug.get(spot.slug);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    items.push({ spot, product });
  }
  return items;
}

export function lookTotals(items: LookItem[]) {
  const sum = items.reduce((total, item) => total + item.product.price, 0);
  const saving = Math.round(sum * (SET_DISCOUNT_PERCENT / 100));
  return { sum, saving, discounted: sum - saving };
}
