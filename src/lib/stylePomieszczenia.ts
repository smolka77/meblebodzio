import type { Product, ProductCategory, ProductRoom, ProductStyle } from "@/lib/typy";

export interface StyleInfo {
  id: ProductStyle;
  label: string;
  blurb: string;
  image: string;
}

export interface RoomInfo {
  id: ProductRoom;
  label: string;
  blurb: string;
  image: string;
  /** Kategorie, które trafiają do pomieszczenia, gdy produkt nie ma własnej listy `rooms`. */
  categories: ProductCategory[];
}

export const PRODUCT_STYLES: StyleInfo[] = [
  {
    id: "skandynawski",
    label: "Skandynawski",
    blurb: "Jasne drewno, miękkie tkaniny i spokojne, naturalne kolory.",
    image: "/wzor/living-cream.jpg",
  },
  {
    id: "nowoczesny",
    label: "Nowoczesny",
    blurb: "Czyste linie, głębokie siedziska i wyważone, stonowane barwy.",
    image: "/wzor/sofa-room.jpg",
  },
  {
    id: "loft",
    label: "Loft",
    blurb: "Skóra, ciemny grafit i czarny metal - industrialny charakter.",
    image: "/wzor/sofa-leather.jpg",
  },
  {
    id: "klasyczny",
    label: "Klasyczny",
    blurb: "Pikowania, ponadczasowe proporcje i drewno w ciepłym odcieniu.",
    image: "/wzor/bedroom.jpg",
  },
  {
    id: "glamour",
    label: "Glamour",
    blurb: "Welur, głębokie kolory i złote akcenty dla wnętrz z klasą.",
    image: "/wzor/sofa-green.jpg",
  },
];

export const PRODUCT_ROOMS: RoomInfo[] = [
  {
    id: "salon",
    label: "Salon",
    blurb: "Sofy, narożniki, fotele, stoliki i szafki RTV.",
    image: "/wzor/living-bright.jpg",
    categories: [
      "sofy",
      "narozniki",
      "fotele",
      "kolekcje",
      "oswietlenie",
      "szafki-rtv",
      "stoliki",
      "komody",
      "akcesoria-dla-zwierzat",
    ],
  },
  {
    id: "sypialnia",
    label: "Sypialnia",
    blurb: "Łóżka, materace, szafy, komody i szafki nocne.",
    image: "/wzor/bedroom.jpg",
    categories: ["lozka", "materace", "szafy", "szafki", "komody"],
  },
  {
    id: "jadalnia",
    label: "Jadalnia",
    blurb: "Stoły, krzesła i meble do wspólnych posiłków.",
    image: "/wzor/dining.jpg",
    categories: [],
  },
  {
    id: "biuro",
    label: "Biuro",
    blurb: "Biurka, krzesła i regały do pracy w domu.",
    image: "/wzor/j2.jpg",
    categories: [],
  },
  {
    id: "pokoj-dzieciecy",
    label: "Pokój dziecięcy",
    blurb: "Łóżka i komody, które rosną razem z dzieckiem.",
    image: "/katalog/lozko-mini-nest.jpg",
    categories: ["meble-dzieciece"],
  },
];

const STYLE_IDS = new Set<string>(PRODUCT_STYLES.map((style) => style.id));
const ROOM_IDS = new Set<string>(PRODUCT_ROOMS.map((room) => room.id));

export function isProductStyle(value: unknown): value is ProductStyle {
  return typeof value === "string" && STYLE_IDS.has(value);
}

export function isProductRoom(value: unknown): value is ProductRoom {
  return typeof value === "string" && ROOM_IDS.has(value);
}

export function styleInfo(id: ProductStyle): StyleInfo {
  return PRODUCT_STYLES.find((style) => style.id === id) ?? PRODUCT_STYLES[0];
}

export function roomInfo(id: ProductRoom): RoomInfo {
  return PRODUCT_ROOMS.find((room) => room.id === id) ?? PRODUCT_ROOMS[0];
}

export function productStyles(product: Pick<Product, "styles">): ProductStyle[] {
  return (product.styles ?? []).filter(isProductStyle);
}

export function productRooms(
  product: Pick<Product, "rooms" | "category">
): ProductRoom[] {
  const explicit = (product.rooms ?? []).filter(isProductRoom);
  if (explicit.length) return explicit;
  return PRODUCT_ROOMS.filter((room) =>
    room.categories.includes(product.category as ProductCategory)
  ).map((room) => room.id);
}

/** Pomieszczenia, w których jest przynajmniej jeden produkt - puste kategorie nie trafiają do menu. */
export function roomsWithProducts(products: Product[]): RoomInfo[] {
  return PRODUCT_ROOMS.filter((room) =>
    products.some((product) => productRooms(product).includes(room.id))
  );
}

export function stylesWithProducts(products: Product[]): StyleInfo[] {
  return PRODUCT_STYLES.filter((style) =>
    products.some((product) => productStyles(product).includes(style.id))
  );
}

/** Kategorie, które uzupełniają dany mebel w aranżacji - do „Skompletuj wnętrze”. */
export const COMPLEMENTARY_CATEGORIES: Partial<
  Record<ProductCategory, ProductCategory[]>
> = {
  sofy: ["stoliki", "fotele", "oswietlenie", "szafki-rtv"],
  narozniki: ["stoliki", "oswietlenie", "szafki-rtv", "fotele"],
  fotele: ["stoliki", "oswietlenie", "sofy"],
  lozka: ["materace", "szafki", "komody", "oswietlenie"],
  materace: ["lozka", "szafki"],
  szafy: ["komody", "lozka", "oswietlenie"],
  komody: ["oswietlenie", "lozka", "szafy"],
  szafki: ["lozka", "oswietlenie", "komody"],
  "szafki-rtv": ["sofy", "narozniki", "oswietlenie"],
  stoliki: ["sofy", "fotele", "oswietlenie"],
  oswietlenie: ["sofy", "fotele", "stoliki"],
  kolekcje: ["oswietlenie", "szafki-rtv"],
  "meble-dzieciece": ["materace", "oswietlenie"],
};
