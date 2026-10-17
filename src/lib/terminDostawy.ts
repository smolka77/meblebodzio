import type { Product } from "@/lib/typy";
import { storePolicies } from "@/lib/zasadySklepu";
import type { Locale } from "@/lib/jezyk";

/**
 * Termin produkcji i przewidywana data dostawy — osobno, per produkt.
 *
 * Zasady z wytycznych:
 * - „Wysyłka 24H” → nie pokazujemy czasu produkcji, tylko „Wysyłka: do 24H”
 *   i przewidywaną dostawę liczoną od jutra + transport.
 * - Produkt standardowy → „Czas produkcji: X” + „Przewidywana dostawa: data”.
 * - Data dostawy = dziś + produkcja + transport (dni robocze), jeżeli da się
 *   wyliczyć; w innym razie tekst z panelu lub polityka sklepu.
 */

export interface DayRange {
  min: number;
  max: number;
}

const MONTHS: Record<Locale, string[]> = {
  pl: [
    "stycznia",
    "lutego",
    "marca",
    "kwietnia",
    "maja",
    "czerwca",
    "lipca",
    "sierpnia",
    "września",
    "października",
    "listopada",
    "grudnia",
  ],
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  de: [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  uk: [
    "січня",
    "лютого",
    "березня",
    "квітня",
    "травня",
    "червня",
    "липня",
    "серпня",
    "вересня",
    "жовтня",
    "листопада",
    "грудня",
  ],
};

/** „7-10 dni roboczych” → {7,10}; „do 14 dni” → {1,14}; „2-3 tygodnie” → {10,15}. */
export function parseDayRange(text: string | undefined | null): DayRange | null {
  if (!text) return null;
  const normalized = text
    .toLowerCase()
    .replace(/–|—/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return null;
  if (/od r[eę]ki|24 ?h|natychmiast/.test(normalized)) return { min: 1, max: 2 };

  const match = normalized.match(/(\d+)\s*(?:-\s*(\d+))?\s*(dni|dzie[nń]|tyg|tygodni|tygodnie|tydzie[nń])/);
  if (!match) return null;
  let min = Number(match[1]);
  let max = match[2] ? Number(match[2]) : min;
  if (/^do\b/.test(normalized) && !match[2]) min = 1;
  if (/tyg|tydzie/.test(match[3])) {
    min *= 5;
    max *= 5;
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (min > max) [min, max] = [max, min];
  return { min, max };
}

export function addBusinessDays(start: Date, days: number): Date {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let remaining = Math.max(0, Math.round(days));
  while (remaining > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) remaining -= 1;
  }
  return date;
}

export function formatDateRangePl(from: Date, to: Date, locale: Locale = "pl"): string {
  const months = MONTHS[locale] ?? MONTHS.pl;
  const sameMonth = from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear();
  if (from.getTime() === to.getTime()) {
    return `${from.getDate()} ${months[from.getMonth()]}`;
  }
  if (sameMonth) {
    return `${from.getDate()}–${to.getDate()} ${months[to.getMonth()]}`;
  }
  return `${from.getDate()} ${months[from.getMonth()]} – ${to.getDate()} ${months[to.getMonth()]}`;
}

export interface DeliverySchedule {
  /** Produkt gotowy — wysyłka do 24H. */
  express: boolean;
  /** Etykieta czasu produkcji (null przy Wysyłce 24H / od ręki). */
  productionLabel: string | null;
  /** Przewidywana dostawa — tekst do wyświetlenia. */
  deliveryLabel: string;
  /** Czy data została wyliczona automatycznie. */
  computed: boolean;
  /** Koszt dostawy — z produktu lub polityki sklepu. */
  deliveryCostLabel: string;
}

const transportRange = (): DayRange =>
  parseDayRange(storePolicies.deliveryTimeLabel) ?? { min: 1, max: 10 };

export function computeDeliverySchedule(
  product: Pick<
    Product,
    "shipping24h" | "readyToShip" | "productionTime" | "deliveryEstimate" | "deliveryCost"
  >,
  now: Date = new Date(),
  locale: Locale = "pl"
): DeliverySchedule {
  const manual = product.deliveryEstimate?.trim();
  const transport = transportRange();
  const deliveryCostLabel =
    product.deliveryCost?.trim() || storePolicies.standardDeliveryPriceLabel;

  if (product.shipping24h) {
    const from = addBusinessDays(now, 1 + transport.min);
    const to = addBusinessDays(now, 1 + transport.max);
    return {
      express: true,
      productionLabel: null,
      deliveryLabel: manual || formatDateRangePl(from, to, locale),
      computed: !manual,
      deliveryCostLabel,
    };
  }

  if (product.readyToShip) {
    const from = addBusinessDays(now, transport.min);
    const to = addBusinessDays(now, transport.max);
    return {
      express: false,
      productionLabel: null,
      deliveryLabel: manual || formatDateRangePl(from, to, locale),
      computed: !manual,
      deliveryCostLabel,
    };
  }

  const productionText = product.productionTime?.trim() || storePolicies.productionTimeLabel;
  const production = parseDayRange(productionText);
  if (!production) {
    return {
      express: false,
      productionLabel: productionText,
      deliveryLabel: manual || `${productionText} + ${storePolicies.deliveryTimeLabel}`,
      computed: false,
      deliveryCostLabel,
    };
  }
  const from = addBusinessDays(now, production.min + transport.min);
  const to = addBusinessDays(now, production.max + transport.max);
  return {
    express: false,
    productionLabel: productionText,
    deliveryLabel: manual || formatDateRangePl(from, to, locale),
    computed: !manual,
    deliveryCostLabel,
  };
}

export const PRODUCTION_TIME_SUGGESTIONS = [
  "3–5 dni roboczych",
  "5–7 dni roboczych",
  "7–10 dni roboczych",
  "10–14 dni roboczych",
  "do 14 dni",
  "2–3 tygodnie",
  "dostępny od ręki",
] as const;
