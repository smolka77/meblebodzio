/** Dane firmy — jedno źródło prawdy dla sklepu i dokumentów prawnych. */
export const company = {
  brandName: "Wrohaus",
  legalName: "Wrohaus Anna Mikołowska",
  ownerFirstName: "Anna",
  ownerLastName: "Mikołowska",
  nip: "8961671917",
  regon: "545516960",
  street: "ul. Bazyliowa 16/10",
  postalCode: "55-080",
  city: "Kąty Wrocławskie",
  country: "Polska",
  voivodeship: "dolnośląskie",
  fullAddress: "ul. Bazyliowa 16/10, 55-080 Kąty Wrocławskie",
  email: "kontakt@wrohaus.pl",
  emailDisplay: "kontakt@wrohaus.pl",
  /** Uzupełnij w panelu admina (Ustawienia) — wyświetlane w stopce i regulaminie. */
  phone: "",
  phoneDisplay: "",
  domain: "wrohaus.pl",
  openingHoursDays: "Pn–Pt",
  openingHoursShort: "Pn–Pt: 9:00–19:00",
  openingHoursDetail: "od poniedziałku do piątku, w godzinach 9:00–19:00",
  /** Magazyn — odbiór osobisty (inne godziny niż biuro). */
  pickupHoursShort: "Pn–Pt: 6:00–14:00",
  pickupHoursDetail: "od poniedziałku do piątku, w godzinach 6:00–14:00",
  /** Adres do zwrotów (PayU wymaga go w polityce zwrotów). */
  returnsAddress:
    "Wrohaus Anna Mikołowska, Sokołowice 108B, 56-400 Oleśnica",
  /** Nazwa widoczna na wyciągu karty / w PayU */
  statementName: "Wrohaus",
  startedAt: "2026-08-20",
  pkdPrimary: "47.55.Z",
  pkd: ["47.55.Z", "47.52.Z", "31.00.Z"] as const,
  /** Pełny opis sprzedawcy do regulaminu / polityki prywatności */
  sellerLine:
    "Anna Mikołowska, prowadząca działalność gospodarczą pod firmą Wrohaus Anna Mikołowska, NIP: 8961671917, REGON: 545516960, z siedzibą przy ul. Bazyliowa 16/10, 55-080 Kąty Wrocławskie, Polska",
} as const;

export const legalUpdated = "9 września 2026";
