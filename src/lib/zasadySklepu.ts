import { pluralPl } from "@/lib/liczebniki";

const RETURNS_DAYS = 30;
const WARRANTY_YEARS = 5;
const FREE_SHIPPING_FROM = 999;

const warrantyYearsText = `${WARRANTY_YEARS} ${pluralPl(WARRANTY_YEARS, "rok", "lata", "lat")}`;

/** Polityki sklepu — jedno źródło prawdy dla copy na stronie. */
export const storePolicies = {
  /** Termin odstąpienia od umowy. Ustawowe 14 dni wydłużamy dobrowolnie do 30. */
  returnsDays: RETURNS_DAYS,
  returnsLabel: `${RETURNS_DAYS} dni na zwrot`,
  /** Ustawowy termin odstąpienia (art. 27 u.p.k.) — do opisu wydłużenia. */
  statutoryReturnsDays: 14,
  /** Zwrot pieniędzy i odesłanie rzeczy po odstąpieniu — terminy ustawowe (art. 33–34 u.p.k.), niezależne od okresu odstąpienia. */
  refundDays: 14,
  /** Gwarancja sprzedawcy na wady konstrukcyjne (rękojmia z ustawy działa niezależnie). */
  warrantyYears: WARRANTY_YEARS,
  warrantyYearsText,
  warrantyLabel: `${warrantyYearsText} gwarancji`,
  standardDeliveryFrom: 249,
  standardDeliveryPriceLabel: "od 249 zł",
  /** Domyślny próg darmowej dostawy (zł) — w koszyku obowiązuje ustawienie z panelu. */
  freeShippingFrom: FREE_SHIPPING_FROM,
  freeShippingLabel: `Darmowa dostawa od ${FREE_SHIPPING_FROM} zł`,
  deliveryTimeLabel: "1–10 dni roboczych",
  productionTimeLabel: "do 2 tygodni",
  pickupTitle: "Odbiór z magazynu",
  pickupHoursLabel: "Pn–Pt: 6:00–14:00",
  maxFabricSamples: 5,
  /** Szacunek bezpośrednich kosztów zwrotu mebli (art. 34 u.p.k.). */
  returnCostEstimateLabel: "249–799 zł",
} as const;

/** Próg darmowej dostawy z ustawień sklepu (0 = wyłączona); bez ustawienia — domyślny. */
export function freeShippingThresholdOf(
  settings?: { freeShippingThreshold?: number } | null
): number {
  const value = settings?.freeShippingThreshold;
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : storePolicies.freeShippingFrom;
}

/** „Darmowa dostawa od 999 zł” albo null, gdy darmowa dostawa jest wyłączona. */
export function freeShippingText(threshold: number): string | null {
  return threshold > 0 ? `Darmowa dostawa od ${threshold} zł` : null;
}

export const moreNavItems = [
  { label: "Promocje", href: "/promocje", description: "Wybrane meble w niższej cenie" },
  {
    label: "Meble od ręki",
    href: "/meble-od-reki",
    description: "Gotowe do szybkiej wysyłki",
  },
  {
    label: "Meble do 7 dni",
    href: "/meble-do-7-dni",
    description: "Krótki termin — u Ciebie w ciągu tygodnia",
  },
  {
    label: "Próbki tkanin",
    href: "/probki-tkanin",
    description: "Zamów próbki materiału do domu",
  },
] as const;
