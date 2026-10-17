import type { ExtraListingId } from "@/lib/typy";

export const extraListingIds = [
  "promocje",
  "meble-od-reki",
  "meble-do-7-dni",
  "probki-tkanin",
] as const satisfies readonly ExtraListingId[];

export const extraListingLabels: Record<ExtraListingId, string> = {
  promocje: "Promocje",
  "meble-od-reki": "Meble od ręki",
  "meble-do-7-dni": "Meble do 7 dni",
  "probki-tkanin": "Próbki tkanin",
};

export const extraListingHrefs: Record<ExtraListingId, string> = {
  promocje: "/promocje",
  "meble-od-reki": "/meble-od-reki",
  "meble-do-7-dni": "/meble-do-7-dni",
  "probki-tkanin": "/probki-tkanin",
};

export const extraListingIntros: Record<ExtraListingId, string> = {
  promocje:
    "Wybrane modele w obniżonych cenach. Produkty objęte promocją powstają na zamówienie — produkcja trwa do 2 tygodni.",
  "meble-od-reki":
    "Modele gotowe w magazynie — bez oczekiwania na produkcję. Wysyłka od razu.",
  "meble-do-7-dni":
    "Meble z krótkim terminem — produkcja i wysyłka tak, aby trafiły do Ciebie w ciągu 7 dni.",
  "probki-tkanin":
    "Najpierw wybierz rodzaj tkaniny, potem odcień — wyślemy próbki na Twój adres.",
};

export function isSevenDayListing(product: { shipsIn7Days?: boolean }): boolean {
  return Boolean(product.shipsIn7Days);
}
