/** Polska odmiana rzeczownika po liczbie: 1 produkt, 2 produkty, 5 produktów. */
export function pluralPl(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return few;
  return many;
}

export function produktyLabel(n: number): string {
  return `${n} ${pluralPl(n, "produkt", "produkty", "produktów")}`;
}
