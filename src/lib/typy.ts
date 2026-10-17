export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  /** Główne zdjęcie mebla w tym kolorze (pierwsze z `images`) */
  image?: string;
  /** Do 10 zdjęć mebla w tym kolorze — galeria po kliknięciu tkaniny */
  images?: string[];
  /** Tkanina z katalogu admina (`/admin/tkaniny`) */
  fabricId?: string;
  /** Zdjęcie tkaniny na kafelku koloru */
  fabricImage?: string;
  /** Wideo lub zdjęcie w oknie „Więcej o tkaninie” */
  fabricMedia?: string;
  /** Logo producenta tkaniny — watermark w podglądzie */
  fabricWatermark?: string;
  /** Nazwa tkaniny, np. „Welur Soft 18” */
  fabricName?: string;
  /** Typ materiału z katalogu, np. „Welur” */
  fabricMaterial?: string;
  /** Specyfikacja tkaniny */
  fabricSpecs?: string;
  /** Krótki opis tkaniny i koloru */
  fabricAbout?: string;
  /** Pielęgnacja — opcjonalnie */
  fabricCare?: string;
  /** Dopłata (PLN) za tkaninę lub pokrowiec — z katalogu albo ustawiona przy tym produkcie */
  fabricSurcharge?: number;
}

export type ProductCategory =
  | "sofy"
  | "narozniki"
  | "fotele"
  | "kolekcje"
  | "oswietlenie"
  | "szafy"
  | "szafki"
  | "szafki-rtv"
  | "komody"
  | "stoliki"
  | "materace"
  | "lozka"
  | "meble-dzieciece"
  | "akcesoria-dla-zwierzat";

/** Główne grupy w menu (rozwijane). */
export type CategoryNavGroupId = "lounge" | "interior" | "bathroom";

/** Podkategoria dodana w panelu — strona jak zwykła /kategoria/[slug]. */
export interface CustomShopCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  parentGroup: CategoryNavGroupId;
  visible: boolean;
}

export type ExtraListingId =
  | "promocje"
  | "meble-od-reki"
  | "meble-do-7-dni"
  | "probki-tkanin";

/** Linia produktowa — Smart, Comfort, Premium. */
export type ProductLine = "smart" | "comfort" | "premium";

/** Nazwana kolekcja mebli (np. Sorela) — foldery w /linie. */
export interface FurnitureLine {
  id: string;
  slug: string;
  name: string;
  description?: string;
  /** Zdjęcie hero folderu. */
  image?: string;
  createdAt: string;
}

export type HighlightIcon = "dot" | "check" | "dash" | "star" | "arrow";

export interface ProductHighlight {
  title: string;
  description: string;
  icon?: HighlightIcon;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductDimension {
  label: string;
  value: string;
}

/** Wariant rozmiaru (materace, łóżka) — dopłata do ceny bazowej. */
export interface ProductSize {
  id: string;
  label: string;
  surcharge: number;
}

/** Opinia klienta przy ogłoszeniu — dodawana w panelu. */
export interface ProductReview {
  id: string;
  author: string;
  city?: string;
  rating: number;
  text: string;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

/** Szablon karty produktu — grupa mebli z własnym zestawem pól. */
export type ProductTemplateId =
  | "sofa"
  | "naroznik"
  | "lozko"
  | "lozko-kontynentalne"
  | "materac"
  | "szafa"
  | "komoda"
  | "szafka-rtv"
  | "szafka-nocna"
  | "ogolny";

/** Wartość wariantu zakupowego (np. „Lewy”, „Z lustrem”, „Z LED”). */
export interface ProductOptionValue {
  id: string;
  label: string;
  /** Dopłata brutto (PLN) doliczana do ceny produktu. */
  surcharge: number;
}

/**
 * Wariant zakupowy wybierany na stronie produktu: strona narożnika,
 * typ drzwi, lustro, oświetlenie LED, materac, pokrowiec…
 * Jedna wartość = wybór nie jest pokazywany klientowi.
 */
export interface ProductOption {
  id: string;
  name: string;
  values: ProductOptionValue[];
  /** Pokazuj po wyborze koloru (np. LED); domyślnie przed kolorem. */
  afterColor?: boolean;
}

/** Warstwa materaca — od góry do dołu. */
export interface MattressLayer {
  name: string;
  thickness?: string;
  description?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

/** Proporcje galerii na stronie produktu (szerokość : wysokość). */
export type ProductAspectRatio = "5/4" | "1/1" | "4/5" | "3/2";

export const DEFAULT_PRODUCT_ASPECT_RATIO: ProductAspectRatio = "5/4";

export const PRODUCT_ASPECT_RATIO_OPTIONS: {
  value: ProductAspectRatio;
  label: string;
  hint: string;
}[] = [
  { value: "5/4", label: "5:4", hint: "2000 × 1600 px" },
  { value: "1/1", label: "1:1", hint: "2000 × 2000 px" },
  { value: "4/5", label: "4:5", hint: "2000 × 2500 px" },
  { value: "3/2", label: "3:2", hint: "2400 × 1600 px" },
];

export interface ProductDetails {
  longDescription: string;
  /** Trzy główne wyróżniki (nagłówek + krótki opis + ikona). */
  highlights: ProductHighlight[];
  /** Najważniejsze cechy / atuty — krótkie nazwy (chipy). */
  features?: string[];
  /** Budowa materaca — warstwy od góry do dołu. */
  layers?: MattressLayer[];
  specs: ProductSpec[];
  dimensions: ProductDimension[];
  faq: ProductFaq[];
  productCode: string;
  disclaimer?: string;
  /** Czy pokazać notę prawną na stronie produktu. */
  showDisclaimer?: boolean;
  /** Tło sekcji „O modelu” — zdjęcie za tekstem (fallback: zdjęcie produktu) */
  storyImage?: string;
  /** Plansza wymiarów łóżka (zdjęcie zamiast tabeli centymetrów). */
  dimensionImage?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  /** Linia produktowa: Smart, Comfort lub Premium. */
  line?: ProductLine;
  /** Nazwana kolekcja mebli z panelu Linie (np. Sorela). */
  furnitureLineId?: string;
  /** Cena brutto na stronie sklepu (z VAT 23%). */
  price: number;
  originalPrice?: number;
  /** Najniższa cena z ostatnich 30 dni (Omnibus) — liczona z historii cen. */
  lowestPrice30Days?: number;
  /** Historia ceny sprzedaży — do automatycznego Omnibus. */
  priceHistory?: { at: string; price: number }[];
  /** Cena netto od producenta — do wyliczenia ceny sprzedaży w adminie. */
  costNet?: number;
  /** Marża % nakładana na netto producenta. */
  marginPercent?: number;
  /** Zdjęcie główne (okładka kart i pierwsze w galerii). */
  image: string;
  /** Dodatkowe zdjęcia galerii (bez okładki). */
  images?: string[];
  /** Drugie zdjęcie galerii = aranżacja (hover na karcie). Stare ogłoszenia mogą mieć to pole — składamy je do galerii. */
  arrangementImage?: string;
  /** Proporcje galerii na stronie produktu — domyślnie 5:4. */
  aspectRatio?: ProductAspectRatio;
  description: string;
  inStock: boolean;
  /** Bestseller — sekcja na stronie głównej i oznaczenie na karcie. */
  featured?: boolean;
  isNew?: boolean;
  /** Mebel od ręki — gotowy w magazynie. */
  readyToShip?: boolean;
  /** Sztuki na magazynie — tylko przy „od ręki”. */
  stockQty?: number;
  /** Wysyłka 24H — gotowy do wysłania, bez czasu produkcji. */
  shipping24h?: boolean;
  /** Mebel do 7 dni — krótka produkcja, strona „Meble do 7 dni”. */
  shipsIn7Days?: boolean;
  /** Szablon karty produktu użyty w panelu. */
  templateId?: ProductTemplateId;
  /** Rodzaj w obrębie kategorii, np. „Szafa przesuwna”, „Witryna”. */
  kind?: string;
  /** Termin produkcji, np. „7–10 dni roboczych”. Pusty = polityka sklepu. */
  productionTime?: string;
  /** Ręcznie wpisana przewidywana dostawa, np. „18–22 września”. Pusty = liczona automatycznie. */
  deliveryEstimate?: string;
  /** Koszt dostawy dla tego produktu, np. „od 249 zł”. Pusty = polityka sklepu. */
  deliveryCost?: string;
  /** Producent mebla — pusty = nie pokazujemy na ogłoszeniu. */
  manufacturer?: string;
  /** Hurtownia / feed, z którego wpadł szkic (np. Jarstol). */
  supplier?: "jarstol";
  colors: ProductColor[];
  /** Rozmiary / szerokości z dopłatą — materace, łóżka, szafy, komody, RTV. */
  sizes?: ProductSize[];
  /** Warianty zakupowe (strona, drzwi, lustro, LED, materac, pokrowiec). */
  options?: ProductOption[];
  /** Materac z oferty sklepu podpowiadany na karcie łóżka. */
  suggestedMattressId?: string;
  details?: ProductDetails;
  /** Instrukcja montażu (PDF albo zdjęcie). */
  manualUrl?: string;
  /** Liczba paczek w przesyłce. */
  packageCount?: number;
  /** Opinie przy ogłoszeniu. */
  reviews?: ProductReview[];
  /** Średnia ocen na karcie, gdy nie ma listy opinii. */
  rating?: number;
  /** Liczba opinii przy średniej na karcie. */
  reviewCount?: number;
  /** Szkic — niewidoczny w sklepie, aż opublikujesz z panelu. */
  draft?: boolean;
  /** Tytuł w Google — pusty = nazwa produktu. */
  seoTitle?: string;
  /** Opis w Google — pusty = krótki opis + kategoria + cena. */
  seoDescription?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  colorId: string;
  colorName: string;
  sizeId?: string;
  sizeLabel?: string;
  /** Wybrane warianty: id opcji → id wartości. */
  options?: Record<string, string>;
}

export interface SavedConfiguration {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  fabricName?: string;
  fabricMedia?: string;
  savedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface UserOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  colorName?: string;
  sizeId?: string;
  sizeName?: string;
  /** Wybrane warianty: id opcji → id wartości. */
  options?: Record<string, string>;
  /** Czytelny opis wariantów, np. „Strona: Lewy · LED: Z LED”. */
  optionsName?: string;
}

export type PaymentStatus = "awaiting" | "confirmed" | "failed";

export interface PlaceOrderResult {
  order: UserOrder;
  payuRedirectUri: string;
}

export interface UserOrder {
  id: string;
  items: UserOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  couponName?: string;
  deliveryFee?: number;
  total: number;
  transferTitle?: string;
  paymentStatus?: PaymentStatus;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

export type OrderStatus = Order["status"];

export interface StoreOrder {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  userId?: string;
  /** Hash tokenu, żeby gość zobaczył status po PayU bez konta. */
  guestAccessTokenHash?: string;
  items: UserOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  couponName?: string;
  deliveryFee?: number;
  total: number;
  transferTitle?: string;
  paymentStatus?: PaymentStatus;
  payuOrderId?: string;
  deliveryMethod?: string;
  invoiceNip?: string;
  paidAt?: string;
  /** Magazyn już zdjęty po opłaceniu — żeby PayU nie zdjęło dwa razy. */
  stockApplied?: boolean;
  /** Magazyn zwrócony po anulowaniu opłaconego zamówienia. */
  stockRestored?: boolean;
  status: OrderStatus;
  date: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountPercent: number;
  minSubtotal?: number;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
  createdAt: string;
}

/** Imienna promocja na stronie /promocje — produkty wybierasz z listy. */
export interface ShopPromotion {
  id: string;
  slug: string;
  title: string;
  description?: string;
  active: boolean;
  productIds: string[];
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "pinterest"
  | "linkedin"
  | "x"
  | "other";

export interface SocialLink {
  id: string;
  url: string;
  platform: SocialPlatform;
  /** Niestandardowa etykieta dla czytników ekranu */
  label?: string;
}

export interface ShopSettings {
  shopName: string;
  contactEmail: string;
  phone: string;
  deliveryFee: number;
  freeShippingThreshold: number;
  bankAccountName: string;
  bankAccountNumber: string;
  bankName: string;
  returnsDays: number;
  notifyNewOrders: boolean;
  notifyLowStock: boolean;
  notifyWeeklyReport: boolean;
  /** @deprecated Użyj socialLinks — synchronizowane przy zapisie */
  instagramUrl?: string;
  socialLinks?: SocialLink[];
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
  /** Wersja bootstrapu loginu admina (migracja jednorazowa). */
  adminAuthVersion?: number;
  /**
   * Kategorie widoczne w sklepie (menu, stopka, sitemap, strony /kategoria).
   * Brak w starych ustawieniach = domyślna lista z oferty.
   */
  visibleProductCategories?: ProductCategory[];
  /** Tytuł strony głównej w Google — pusty = domyślny z kodu. */
  seoTitle?: string;
  /** Opis strony głównej w Google — pusty = domyślny z kodu. */
  seoDescription?: string;
  /** Słowa kluczowe (po przecinku) — puste = domyślne z kodu. */
  seoKeywords?: string;
  /** Opisy stron kategorii — pusty wpis = domyślny tekst sklepu. */
  categoryDescriptions?: Partial<Record<ProductCategory, string>>;
  /** Opisy stron Promocje, Meble od ręki, Meble do 7 dni i Próbki tkanin — pusty wpis = domyślny tekst. */
  listingDescriptions?: Partial<Record<ExtraListingId, string>>;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  featured?: boolean;
  content: string[];
  /** Tytuł w Google — pusty = tytuł artykułu. */
  seoTitle?: string;
  /** Opis w Google — pusty = zajawka. */
  seoDescription?: string;
}

/** Odcień w gamie kolorystycznej tkaniny. */
export interface FabricShade {
  id: string;
  name: string;
  hex: string;
  /** Opcjonalne zdjęcie tego odcienia (fallback: zdjęcie tkaniny). */
  image?: string;
}

/** Przeznaczenie pozycji w katalogu tkanin. */
export type FabricRole = "tkanina" | "pokrowiec" | "plyta";

export interface Fabric {
  id: string;
  name: string;
  description: string;
  material: string;
  colorHex: string;
  /**
   * tkanina = próbki + tapicerka;
   * pokrowiec / plyta = tylko do ogłoszeń, bez katalogu próbek.
   */
  role?: FabricRole;
  /** Gama odcieni — na stronie próbek i przy przypinaniu do produktu. */
  colors?: FabricShade[];
  /** Zdjęcie tkaniny (kafelek koloru). Puste, gdy podgląd to wyłącznie wideo. */
  image: string;
  /** Wideo tkaniny (MP4 / WebM) — konfigurator tapicerki. Alternatywa dla zdjęcia. */
  video?: string;
  /** Logo / watermark producenta (PNG z przezroczystością) — prawy dolny róg podglądu */
  watermark?: string;
  /** Opcjonalna dopłata (PLN) doliczana do ceny produktu po wyborze tkaniny */
  surcharge?: number;
  specs?: string;
  care?: string;
  active: boolean;
}

export interface FabricSampleRequest {
  id: string;
  fabricIds: string[];
  fabricNames: string[];
  name: string;
  email: string;
  phone?: string;
  street: string;
  city: string;
  postalCode: string;
  message?: string;
  createdAt: string;
  read: boolean;
}

export interface SessionRecord {
  id: string;
  path: string;
  cartCount: number;
  cartTotal: number;
  lastSeen: string;
  startedAt: string;
}

export interface StoredUser extends UserProfile {
  password: string;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  joined: string;
}

export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  /** Zamówienia, z których liczony jest przychód (dostarczone i opłacone). */
  revenueOrders: number;
  orders: number;
  ordersChange: number;
  products: number;
  customers: number;
  customersChange: number;
  conversionRate: number;
}

export interface RevenueTimelinePoint {
  time: string;
  label: string;
  cumulative: number;
  delta: number;
  orderId?: string;
}

export interface RevenueTimelineSession {
  points: RevenueTimelinePoint[];
  total: number;
}

export interface RevenueTimelines {
  today: RevenueTimelineSession;
  week: RevenueTimelineSession;
  all: RevenueTimelineSession;
}

export interface CartLine extends Product {
  quantity: number;
  cartKey: string;
  selectedColor?: ProductColor;
  selectedSize?: ProductSize;
  selectedOptions?: SelectedProductOption[];
}

export interface SelectedProductOption {
  option: ProductOption;
  value: ProductOptionValue;
}

export interface ChatAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  sender: "visitor" | "admin";
  text: string;
  attachment?: ChatAttachment;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  userId?: string;
  messages: ChatMessage[];
  unreadByAdmin: number;
  unreadByVisitor: number;
  lastMessageAt: string;
  createdAt: string;
}
