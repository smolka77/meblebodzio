import type { Product, ProductRoom, ProductStyle } from "@/lib/typy";
import { productAvailability, productDimsCm } from "@/lib/atrybutyProduktu";
import { startingPrice } from "@/lib/rozmiary";
import { productRooms, productStyles, styleInfo } from "@/lib/stylePomieszczenia";
import { productScore } from "@/lib/opinie";

export type BudgetId = "do-2000" | "2000-5000" | "5000-9000" | "od-9000" | "bez-limitu";
export type PrefId = "szybko" | "spanie" | "kompakt";

export const BUDGETS: { id: BudgetId; label: string; min: number; max: number }[] = [
  { id: "do-2000", label: "do 2 000 zł", min: 0, max: 2000 },
  { id: "2000-5000", label: "2 000 – 5 000 zł", min: 2000, max: 5000 },
  { id: "5000-9000", label: "5 000 – 9 000 zł", min: 5000, max: 9000 },
  { id: "od-9000", label: "powyżej 9 000 zł", min: 9000, max: Number.POSITIVE_INFINITY },
  { id: "bez-limitu", label: "Bez limitu", min: 0, max: Number.POSITIVE_INFINITY },
];

export const PREFS: { id: PrefId; label: string; hint: string }[] = [
  { id: "szybko", label: "Szybka dostawa", hint: "Modele wysyłane w 24 h" },
  { id: "spanie", label: "Rozkładane, do spania", hint: "Funkcja spania lub rozkładania" },
  { id: "kompakt", label: "Kompaktowe", hint: "Do 200 cm szerokości — na mały metraż" },
];

export interface AdvisorAnswers {
  room?: ProductRoom;
  /** Kategorie (slug) — puste = dowolne z pomieszczenia. */
  types: string[];
  style?: ProductStyle;
  budget: BudgetId;
  prefs: PrefId[];
}

export interface AdvisorMatch {
  product: Product;
  score: number;
  reasons: string[];
}

export interface AdvisorResult {
  matches: AdvisorMatch[];
  /** Budżet trzeba było poszerzyć, żeby coś pokazać. */
  relaxedBudget: boolean;
}

const SLEEP = /rozk[łl]ad|spania|sypialn|wielofunkcyjn/i;

function sleeps(product: Product): boolean {
  const text = [
    product.name,
    product.description,
    product.kind,
    product.details?.longDescription,
    ...(product.details?.specs ?? []).map((spec) => `${spec.label} ${spec.value}`),
    ...(product.details?.dimensions ?? []).map((row) => row.label),
  ]
    .filter(Boolean)
    .join(" ");
  return SLEEP.test(text);
}

export function rankProducts(products: Product[], answers: AdvisorAnswers): AdvisorResult {
  const budget = BUDGETS.find((item) => item.id === answers.budget) ?? BUDGETS[BUDGETS.length - 1];

  const inScope = products.filter((product) => {
    if (product.draft) return false;
    if (answers.room && !productRooms(product).includes(answers.room)) return false;
    if (answers.types.length && !answers.types.includes(product.category)) return false;
    return true;
  });

  const score = (product: Product, useBudget: boolean): AdvisorMatch | null => {
    const price = startingPrice(product);
    const reasons: string[] = [];
    let points = 10;

    if (useBudget && (price < budget.min || price > budget.max)) return null;
    if (answers.budget !== "bez-limitu") reasons.push("W Twoim budżecie");

    if (answers.style) {
      if (productStyles(product).includes(answers.style)) {
        points += 6;
        reasons.push(`Styl ${styleInfo(answers.style).label.toLowerCase()}`);
      } else {
        points -= 2;
      }
    }

    for (const pref of answers.prefs) {
      if (pref === "szybko") {
        if (product.shipping24h || product.readyToShip) {
          points += 3;
          reasons.push(productAvailability(product).label);
        }
      } else if (pref === "spanie") {
        if (sleeps(product)) {
          points += 3;
          reasons.push("Funkcja spania");
        }
      } else if (pref === "kompakt") {
        const width = productDimsCm(product).width;
        if (width != null && width <= 200) {
          points += 3;
          reasons.push(`Szerokość ${width} cm`);
        }
      }
    }

    points += ((productScore(product)?.rating ?? 4) / 5) * 2;
    if (product.featured) {
      points += 1;
      reasons.push("Bestseller");
    }
    return { product, score: points, reasons: [...new Set(reasons)].slice(0, 4) };
  };

  let matches = inScope.map((product) => score(product, true)).filter((m): m is AdvisorMatch => m !== null);
  let relaxedBudget = false;
  if (matches.length < 3 && answers.budget !== "bez-limitu") {
    matches = inScope.map((product) => score(product, false)).filter((m): m is AdvisorMatch => m !== null);
    relaxedBudget = matches.length > 0;
  }
  matches.sort((a, b) => b.score - a.score);
  return { matches: matches.slice(0, 6), relaxedBudget };
}
