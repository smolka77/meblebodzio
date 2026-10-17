import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";

export type DeliveryIcon = "package" | "home" | "map-pin" | "truck";

export interface DeliveryMethod {
  id: string;
  title: string;
  priceLabel: string;
  description: string;
  features: string[];
  icon: DeliveryIcon;
  highlight?: boolean;
  sortOrder: number;
  archived: boolean;
}

export interface DeliveryStep {
  id: string;
  step: string;
  title: string;
  text: string;
  sortOrder: number;
}

export interface DeliverySectionHeading {
  kicker: string;
  title: string;
}

export interface DeliveryContent {
  methodsSection: DeliverySectionHeading;
  methods: DeliveryMethod[];
  stepsSection: DeliverySectionHeading;
  steps: DeliveryStep[];
}

export const DELIVERY_ICONS: { value: DeliveryIcon; label: string }[] = [
  { value: "package", label: "Paczka" },
  { value: "home", label: "Dom" },
  { value: "map-pin", label: "Lokalizacja" },
  { value: "truck", label: "Ciężarówka" },
];

export const DEFAULT_DELIVERY: DeliveryContent = {
  methodsSection: {
    kicker: "Opcje dostawy",
    title: "Wybierz formę dostawy",
  },
  methods: [
    {
      id: "standard",
      title: "Dostawa standardowa",
      priceLabel: storePolicies.standardDeliveryPriceLabel,
      description:
        "Dostawa pod wskazany adres. Cena obejmuje transport do miejsca uzgodnionego z kurierem — zwykle wejście do budynku (pierwsze drzwi). Wniesienie na piętro i ustawienie w mieszkaniu nie są wliczone. Kurier kontaktuje się telefonicznie w celu ustalenia terminu.",
      features: [
        storePolicies.deliveryTimeLabel,
        "Bez wniesienia do mieszkania",
        "Tracking przesyłki online",
        "Powiadomienie SMS",
      ],
      icon: "package",
      sortOrder: 0,
      archived: false,
    },
    {
      id: "premium",
      title: "Premium z wniesieniem",
      priceLabel: "od 399 zł",
      description:
        "Pełna obsługa — wniesienie, rozpakowanie i ustawienie mebli we wskazanym pomieszczeniu.",
      features: [
        "Wniesienie do wybranego pokoju",
        "Rozpakowanie i ustawienie",
        "Odbiór opakowań",
      ],
      icon: "home",
      highlight: true,
      sortOrder: 1,
      archived: true,
    },
    {
      id: "pickup",
      title: storePolicies.pickupTitle,
      priceLabel: "Bezpłatnie",
      description: `Odbierz zamówienie z magazynu Wrohaus po wcześniejszym umówieniu. Magazyn: ${company.pickupHoursShort}. Biuro i e-mail: ${company.openingHoursShort}.`,
      features: ["Bez kosztów dostawy", "Inspekcja przed odbiorem", "Pomoc przy załadunku"],
      icon: "map-pin",
      sortOrder: 2,
      archived: false,
    },
  ],
  stepsSection: {
    kicker: "Proces",
    title: "Od zamówienia do Twojego domu",
  },
  steps: [
    {
      id: "step-1",
      step: "01",
      title: "Potwierdzenie zamówienia",
      text: "Otrzymujesz e-mail z numerem zamówienia i szacowanym terminem produkcji.",
      sortOrder: 0,
    },
    {
      id: "step-2",
      step: "02",
      title: "Produkcja",
      text: `Twój mebel powstaje w manufakturze Wrohaus — ${storePolicies.productionTimeLabel}.`,
      sortOrder: 1,
    },
    {
      id: "step-3",
      step: "03",
      title: "Przygotowanie do wysyłki",
      text: "Produkt pakujemy z dbałością o każdy detal i przekazujemy kurierowi.",
      sortOrder: 2,
    },
    {
      id: "step-4",
      step: "04",
      title: "Dostawa",
      text: "Kurier kontaktuje się 24–48 h przed dostawą, aby ustalić dogodny termin. Zostawia mebel przy wejściu — bez wniesienia do mieszkania.",
      sortOrder: 3,
    },
  ],
};

function textOr(value: string | undefined, fallback: string): string {
  return value?.trim() ? value.trim() : fallback;
}

function newId(prefix: string, index: number): string {
  return `${prefix}-${index + 1}`;
}

function mergeMethods(
  defaults: DeliveryMethod[],
  stored: DeliveryMethod[] | undefined
): DeliveryMethod[] {
  if (!stored?.length) return defaults;
  const icons = new Set<DeliveryIcon>(["package", "home", "map-pin", "truck"]);
  return stored
    .map((method, index) => ({
      id: method.id?.trim() || newId("method", index),
      title: textOr(method.title, `Metoda ${index + 1}`),
      priceLabel: textOr(method.priceLabel, ""),
      description: textOr(method.description, ""),
      features: (method.features ?? [])
        .map((f) => f.trim())
        .filter(Boolean),
      icon: icons.has(method.icon) ? method.icon : "package",
      highlight: Boolean(method.highlight),
      sortOrder:
        typeof method.sortOrder === "number" ? method.sortOrder : index,
      archived: method.id === "premium" ? true : Boolean(method.archived),
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function mergeSteps(
  defaults: DeliveryStep[],
  stored: DeliveryStep[] | undefined
): DeliveryStep[] {
  if (!stored?.length) return defaults;
  return stored
    .map((step, index) => ({
      id: step.id?.trim() || newId("step", index),
      step: textOr(step.step, String(index + 1).padStart(2, "0")),
      title: textOr(step.title, `Krok ${index + 1}`),
      text: textOr(step.text, ""),
      sortOrder: typeof step.sortOrder === "number" ? step.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function mergeDelivery(stored?: Partial<DeliveryContent>): DeliveryContent {
  return {
    methodsSection: {
      kicker: textOr(
        stored?.methodsSection?.kicker,
        DEFAULT_DELIVERY.methodsSection.kicker
      ),
      title: textOr(
        stored?.methodsSection?.title,
        DEFAULT_DELIVERY.methodsSection.title
      ),
    },
    methods: mergeMethods(DEFAULT_DELIVERY.methods, stored?.methods),
    stepsSection: {
      kicker: textOr(
        stored?.stepsSection?.kicker,
        DEFAULT_DELIVERY.stepsSection.kicker
      ),
      title: textOr(
        stored?.stepsSection?.title,
        DEFAULT_DELIVERY.stepsSection.title
      ),
    },
    steps: mergeSteps(DEFAULT_DELIVERY.steps, stored?.steps),
  };
}

export function emptyDeliveryMethod(sortOrder: number): DeliveryMethod {
  return {
    id: `method-${Date.now()}`,
    title: "",
    priceLabel: "",
    description: "",
    features: [""],
    icon: "package",
    highlight: false,
    sortOrder,
    archived: false,
  };
}

export function emptyDeliveryStep(sortOrder: number): DeliveryStep {
  return {
    id: `step-${Date.now()}`,
    step: String(sortOrder + 1).padStart(2, "0"),
    title: "",
    text: "",
    sortOrder,
  };
}

export function activeDeliveryMethods(methods: DeliveryMethod[]): DeliveryMethod[] {
  return methods.filter((method) => !method.archived);
}

const HIDDEN_CHECKOUT_DELIVERY_IDS = new Set(["premium"]);

/** Metody dostawy w koszyku — bez „Premium z wniesieniem”. */
export function checkoutDeliveryMethods(methods: DeliveryMethod[]): DeliveryMethod[] {
  return activeDeliveryMethods(methods).filter(
    (method) => !HIDDEN_CHECKOUT_DELIVERY_IDS.has(method.id)
  );
}
