/** Polityki sklepu — jedno źródło prawdy dla copy na stronie. */
export const storePolicies = {
  returnsDays: 14,
  returnsLabel: "14 dni na zwrot",
  warrantyYears: 2,
  warrantyLabel: "2 lata gwarancji",
  standardDeliveryFrom: 249,
  standardDeliveryPriceLabel: "od 249 zł",
  deliveryTimeLabel: "1–10 dni roboczych",
  productionTimeLabel: "do 2 tygodni",
  pickupTitle: "Odbiór z magazynu",
  pickupHoursLabel: "Pn–Pt: 6:00–14:00",
  maxFabricSamples: 5,
  /** Szacunek bezpośrednich kosztów zwrotu mebli (art. 34 u.p.k.). */
  returnCostEstimateLabel: "249–799 zł",
} as const;

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
