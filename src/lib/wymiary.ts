/** Wymiary w ogłoszeniu — domyślna jednostka to centymetry, waga to kilogramy. */

const HAS_UNIT =
  /(?:\bcm\b|\bmm\b|\bm\b|\bkg\b|\bg\b|°\s*c|\b%|\bszt\.?)/i;

function normalizeTimes(value: string): string {
  return value
    .replace(/[xX*]/g, "×")
    .replace(/\s*×\s*/g, " × ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Czy wartość wygląda na pomiar (liczba, 160 × 200, ±1, 2,5). */
function looksLikeMeasurement(value: string): boolean {
  if (!/\d/.test(value)) return false;
  if (HAS_UNIT.test(value)) return false;
  const withoutTimes = value.replace(/[×xX*]/g, "");
  if (!/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(withoutTimes)) return true;
  return /[\d][\d.,]*$/.test(value);
}

function withDefaultUnit(raw: string, unit: "cm" | "kg"): string {
  const value = unit === "kg" ? raw.replace(/\s+/g, " ").trim() : normalizeTimes(raw);
  if (!value) return "";
  if (HAS_UNIT.test(value)) {
    return value.replace(/\bcm\b/gi, "cm").replace(/\bkg\b/gi, "kg");
  }
  if (looksLikeMeasurement(value)) return `${value} ${unit}`;
  return value;
}

/** Dopisuje „cm”, jeśli admin wpisał samą liczbę albo wymiary bez jednostki. */
export function withDefaultCm(raw: string): string {
  return withDefaultUnit(raw, "cm");
}

/** Dopisuje „kg” przy wadze. */
export function withDefaultKg(raw: string): string {
  return withDefaultUnit(raw, "kg");
}

export function isWeightLabel(label: string): boolean {
  return /waga|\bobciążen|\bobciazen/i.test(label.trim());
}

export function dimensionUnitForLabel(
  label: string,
  fieldUnit?: "cm" | "kg"
): "cm" | "kg" {
  if (fieldUnit) return fieldUnit;
  return isWeightLabel(label) ? "kg" : "cm";
}

export function withDimensionUnit(
  raw: string,
  label: string,
  fieldUnit?: "cm" | "kg"
): string {
  return withDefaultUnit(raw, dimensionUnitForLabel(label, fieldUnit));
}

export function filesFromClipboard(event: {
  clipboardData?: DataTransfer | null;
}): File[] {
  const data = event.clipboardData;
  if (!data) return [];
  const seen = new Set<File>();
  const out: File[] = [];

  const push = (file: File | null) => {
    if (!file || !file.type.startsWith("image/") || seen.has(file)) return;
    seen.add(file);
    out.push(file);
  };

  for (const item of Array.from(data.items ?? [])) {
    if (item.kind === "file") push(item.getAsFile());
  }
  for (const file of Array.from(data.files ?? [])) {
    push(file);
  }
  return out;
}
