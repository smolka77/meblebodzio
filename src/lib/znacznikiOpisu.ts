import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";

export interface DescriptionMarker {
  token: string;
  label: string;
  hint: string;
  preview: string;
}

export const DESCRIPTION_MARKERS: DescriptionMarker[] = [
  {
    token: "{{marka}}",
    label: "Marka",
    hint: "Nazwa marki sklepu",
    preview: company.brandName,
  },
  {
    token: "{{dostawa}}",
    label: "Dostawa",
    hint: "Standardowy czas dostawy ze sklepu",
    preview: storePolicies.deliveryTimeLabel,
  },
  {
    token: "{{produkcja}}",
    label: "Produkcja",
    hint: "Czas produkcji na zamówienie",
    preview: storePolicies.productionTimeLabel,
  },
  {
    token: "{{gwarancja}}",
    label: "Gwarancja",
    hint: "Okres gwarancji",
    preview: storePolicies.warrantyLabel,
  },
  {
    token: "{{zwrot}}",
    label: "Zwrot",
    hint: "Polityka zwrotów",
    preview: storePolicies.returnsLabel,
  },
];

export const DESCRIPTION_SNIPPETS = [
  {
    id: "intro",
    label: "Akapit wprowadzający",
    text: "{{marka}} to propozycja dla osób, które szukają komfortu na co dzień i spójnej estetyki w salonie. Model łączy staranne wykończenie z praktycznymi rozwiązaniami dopasowanymi do nowoczesnych wnętrz.",
  },
  {
    id: "fabric",
    label: "O tkaninie",
    text: "Tapicerka została dobrana pod kątem codziennego użytkowania — miękka w dotyku, odporna na mechacenie i łatwa w pielęgnacji. Kolor na ekranie może nieznacznie różnić się od rzeczywistego.",
  },
  {
    id: "comfort",
    label: "O komforcie",
    text: "Siedzisko zaprojektowano z myślą o wielogodzinnym wypoczynku: sprężyste podparcie, stabilna konstrukcja i wyważona głębokość pozwalają utrzymać wygodną pozycję bez ucisku.",
  },
] as const;

const MARKER_VALUES: Record<string, string> = {
  "{{marka}}": company.brandName,
  "{{dostawa}}": storePolicies.deliveryTimeLabel,
  "{{produkcja}}": storePolicies.productionTimeLabel,
  "{{gwarancja}}": storePolicies.warrantyLabel,
  "{{zwrot}}": storePolicies.returnsLabel,
};

export function expandDescriptionMarkers(
  text: string,
  vars?: { produkcja?: string }
): string {
  const values = {
    ...MARKER_VALUES,
    ...(vars?.produkcja?.trim()
      ? { "{{produkcja}}": vars.produkcja.trim() }
      : {}),
  };
  let result = text;
  for (const [token, value] of Object.entries(values)) {
    result = result.split(token).join(value);
  }
  return result;
}

/** FAQ i opis produktu: {{produkcja}} oraz już rozwinięte „do 2 tygodni” → czas z karty. */
export function expandProductCopy(
  text: string | null | undefined,
  product?: { productionTime?: string } | null
): string {
  const custom = product?.productionTime?.trim();
  let result = expandDescriptionMarkers(
    text ?? "",
    custom ? { produkcja: custom } : undefined
  );
  if (custom && custom !== storePolicies.productionTimeLabel) {
    result = result.split(storePolicies.productionTimeLabel).join(custom);
  }
  return result;
}

export function insertIntoText(
  current: string,
  insertion: string,
  selectionStart: number,
  selectionEnd: number
): { value: string; cursor: number } {
  const next = current.slice(0, selectionStart) + insertion + current.slice(selectionEnd);
  const cursor = selectionStart + insertion.length;
  return { value: next, cursor };
}
