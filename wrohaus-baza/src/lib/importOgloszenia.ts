import type {
  HighlightIcon,
  Product,
  ProductCategory,
  ProductColor,
  ProductDimension,
  ProductFaq,
  ProductHighlight,
  ProductLine,
  ProductOption,
  ProductSpec,
  ProductTemplateId,
} from "@/lib/typy";
import { productCategories } from "@/lib/dane";
import { isProductLine, inferProductLine } from "@/lib/linieProduktow";
import { newOption, newOptionValue, sanitizeOptions } from "@/lib/opcjeProduktu";
import { sanitizeSizes } from "@/lib/rozmiary";
import {
  getProductTemplate,
  isProductTemplateId,
  optionFromPreset,
  seedDetailsFromTemplate,
  templateFeatureList,
  type ProductTemplate,
} from "@/lib/szablonyProduktu";
import { dimensionChartForName, sanitizeDimensionImage } from "@/lib/wymiaryLozka";

export const IMPORT_SCHEMA_VERSION = 1;

const HIGHLIGHT_ICONS: HighlightIcon[] = ["dot", "check", "dash", "star", "arrow"];

const TEMPLATE_ALIASES: { test: RegExp; id: ProductTemplateId }[] = [
  { test: /kontynental/i, id: "lozko-kontynentalne" },
  { test: /materac/i, id: "materac" },
  { test: /naro[zż]nik/i, id: "naroznik" },
  { test: /sofa|kanapa/i, id: "sofa" },
  { test: /[łl][oó][zż]ko/i, id: "lozko" },
  { test: /szafa/i, id: "szafa" },
  { test: /rtv|\btv\b|telewizor/i, id: "szafka-rtv" },
  { test: /szafka\s*noc|stolik\s*noc/i, id: "szafka-nocna" },
  { test: /komod|witryn/i, id: "komoda" },
];

const CATEGORY_ALIASES: { test: RegExp; id: ProductCategory }[] = [
  { test: /naro[zż]nik/i, id: "narozniki" },
  { test: /sofa|kanapa/i, id: "sofy" },
  { test: /fotel/i, id: "fotele" },
  { test: /materac/i, id: "materace" },
  { test: /[łl][oó][zż]ko/i, id: "lozka" },
  { test: /szafa/i, id: "szafy" },
  { test: /rtv/i, id: "szafki-rtv" },
  { test: /szafka/i, id: "szafki" },
  { test: /komod|witryn/i, id: "komody" },
  { test: /stolik/i, id: "stoliki" },
  { test: /o[sś]wietl|lamp/i, id: "oswietlenie" },
];

export type ImportResult = {
  seed: Partial<Product>;
  warnings: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stripHelpKeys(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (key.startsWith("_")) continue;
    out[key] = value;
  }
  return out;
}

function pick(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] != null && record[key] !== "") return record[key];
  }
  return undefined;
}

function asString(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" ? value.trim() : "";
}

function pickString(record: Record<string, unknown>, keys: string[]): string {
  return asString(pick(record, keys));
}

function parsePln(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.round(value * 100) / 100;
  }
  if (typeof value !== "string") return undefined;
  const compact = value.replace(/[^\d,.\s]/g, "").trim();
  if (!compact) return undefined;
  let next: number;
  if (compact.includes(",") && compact.includes(".")) {
    const lastComma = compact.lastIndexOf(",");
    const lastDot = compact.lastIndexOf(".");
    next =
      lastComma > lastDot
        ? Number(compact.replace(/\./g, "").replace(",", "."))
        : Number(compact.replace(/,/g, ""));
  } else if (compact.includes(",")) {
    next = Number(compact.replace(/\s/g, "").replace(",", "."));
  } else {
    next = Number(compact.replace(/\s/g, ""));
  }
  if (!Number.isFinite(next) || next < 0) return undefined;
  return Math.round(next * 100) / 100;
}

function parseBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (["tak", "true", "yes", "1"].includes(normalized)) return true;
  if (["nie", "false", "no", "0"].includes(normalized)) return false;
  return undefined;
}

function parseIntSafe(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  const text = asString(value).replace(/[^\d]/g, "");
  if (!text) return undefined;
  const next = Number(text);
  return Number.isFinite(next) ? Math.max(0, Math.round(next)) : undefined;
}

function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function unwrapListing(raw: unknown): Record<string, unknown> | null {
  if (Array.isArray(raw)) {
    const first = raw.find((item) => isRecord(item));
    return first ? stripHelpKeys(first) : null;
  }
  if (!isRecord(raw)) return null;
  const cleaned = stripHelpKeys(raw);
  for (const key of ["ogloszenie", "produkt", "product", "listing", "dane"]) {
    const nested = cleaned[key];
    if (isRecord(nested)) return stripHelpKeys(nested);
    if (Array.isArray(nested)) {
      const first = nested.find((item) => isRecord(item));
      if (first) return stripHelpKeys(first);
    }
  }
  return cleaned;
}

export function extractJsonPayload(text: string): unknown {
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) throw new Error("Wklej JSON z AI albo wgraj plik wzorca.");

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fence ? fence[1] : trimmed).trim();
  const startCandidates = ["{", "["]
    .map((char) => body.indexOf(char))
    .filter((index) => index >= 0);
  if (startCandidates.length === 0) {
    throw new Error("Nie znalazłem JSON-a. Wgraj wypełniony wzorzec, nie samo ogłoszenie dostawcy.");
  }
  const start = Math.min(...startCandidates);
  const jsonText = body.slice(start);
  try {
    return JSON.parse(jsonText);
  } catch {
    const lastBrace = Math.max(jsonText.lastIndexOf("}"), jsonText.lastIndexOf("]"));
    if (lastBrace > 0) {
      try {
        return JSON.parse(jsonText.slice(0, lastBrace + 1));
      } catch {
        /* fall through */
      }
    }
    throw new Error("JSON jest uszkodzony. Poproś AI o sam obiekt bez dodatkowego tekstu.");
  }
}

function normLabel(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function guessTemplateId(record: Record<string, unknown>): ProductTemplateId {
  const explicit = pickString(record, ["szablon", "templateId", "template"]);
  if (isProductTemplateId(explicit)) return explicit;
  const blob = [
    pickString(record, ["kategoria", "category"]),
    pickString(record, ["rodzaj", "kind", "typ"]),
    pickString(record, ["nazwa", "name", "tytul", "title"]),
  ].join(" ");
  for (const alias of TEMPLATE_ALIASES) {
    if (alias.test.test(blob)) return alias.id;
  }
  return "ogolny";
}

function guessCategory(
  record: Record<string, unknown>,
  template: ProductTemplate
): ProductCategory {
  const explicit = pickString(record, ["kategoria", "category"]);
  if (productCategories.includes(explicit as ProductCategory)) {
    return explicit as ProductCategory;
  }
  const blob = [
    explicit,
    pickString(record, ["rodzaj", "kind", "typ"]),
    pickString(record, ["nazwa", "name"]),
  ].join(" ");
  for (const alias of CATEGORY_ALIASES) {
    if (alias.test.test(blob)) return alias.id;
  }
  return template.category;
}

function guessLine(record: Record<string, unknown>, price: number): ProductLine {
  const explicit = pickString(record, ["linia", "line"]).toLowerCase();
  if (isProductLine(explicit)) return explicit;
  if (/premium|lux/i.test(explicit)) return "premium";
  if (/comfort|komfort/i.test(explicit)) return "comfort";
  if (/smart/i.test(explicit)) return "smart";
  return inferProductLine(price);
}

function parseLabelValue(
  raw: unknown,
  labelKeys: string[],
  valueKeys: string[]
): { label: string; value: string } | null {
  if (typeof raw === "string") {
    const parts = raw.split(/[:–—-]/);
    if (parts.length >= 2) {
      const label = parts[0].trim();
      const value = parts.slice(1).join(":").trim();
      if (label && value) return { label, value };
    }
    return null;
  }
  if (!isRecord(raw)) return null;
  const label = pickString(raw, labelKeys);
  const value = pickString(raw, valueKeys);
  if (!label && !value) return null;
  return { label, value };
}

function mergeRows<T extends { label: string; value: string }>(
  templateRows: T[],
  imported: { label: string; value: string }[]
): T[] {
  const rows = templateRows.map((row) => ({ ...row }));
  const unused: { label: string; value: string }[] = [];
  for (const item of imported) {
    if (!item.label || !item.value) continue;
    const needle = normLabel(item.label);
    const match = rows.find((row) => normLabel(row.label) === needle);
    if (match) {
      match.value = item.value;
      continue;
    }
    unused.push(item);
  }
  return [...rows, ...(unused as T[])];
}

function parseHighlights(raw: unknown): ProductHighlight[] {
  const out: ProductHighlight[] = [];
  for (const item of asList(raw)) {
    if (!isRecord(item)) continue;
    const title = pickString(item, ["tytul", "title", "nazwa"]);
    const description = pickString(item, ["opis", "description", "tekst"]);
    if (!title && !description) continue;
    const iconRaw = pickString(item, ["ikona", "icon"]) as HighlightIcon;
    out.push({
      title,
      description,
      icon: HIGHLIGHT_ICONS.includes(iconRaw) ? iconRaw : "check",
    });
    if (out.length >= 3) break;
  }
  return out;
}

function parseFaq(raw: unknown): ProductFaq[] {
  const out: ProductFaq[] = [];
  for (const item of asList(raw)) {
    if (!isRecord(item)) continue;
    const question = pickString(item, ["pytanie", "question"]);
    const answer = pickString(item, ["odpowiedz", "answer"]);
    if (!question && !answer) continue;
    out.push({ question, answer });
  }
  return out;
}

function parseOptions(raw: unknown): ProductOption[] {
  const out: ProductOption[] = [];
  for (const item of asList(raw)) {
    if (!isRecord(item)) continue;
    const name = pickString(item, ["nazwa", "name"]);
    if (!name) continue;
    const valuesRaw = asList(item.wartosci ?? item.values ?? item.opcje);
    const values = valuesRaw
      .map((value) => {
        if (typeof value === "string" && value.trim()) {
          return newOptionValue(value.trim(), 0);
        }
        if (!isRecord(value)) return null;
        const label = pickString(value, ["nazwa", "label", "wartosc"]);
        if (!label) return null;
        return newOptionValue(label, parsePln(pick(value, ["doplata", "surcharge"])) ?? 0);
      })
      .filter((value): value is NonNullable<typeof value> => Boolean(value));
    if (values.length === 0) continue;
    const option = newOption(name, []);
    option.values = values;
    if (parseBool(item.afterColor ?? item.poKolorze)) option.afterColor = true;
    out.push(option);
  }
  return sanitizeOptions(out);
}

function parseColors(raw: unknown): ProductColor[] {
  const out: ProductColor[] = [];
  for (const item of asList(raw)) {
    if (typeof item === "string" && item.trim()) {
      out.push({
        id: newOptionValue().id,
        name: item.trim(),
        hex: "#C8C0B4",
      });
      continue;
    }
    if (!isRecord(item)) continue;
    const name = pickString(item, ["nazwa", "name", "kolor", "tkanina"]);
    if (!name) continue;
    const photos = asList(item.zdjecia ?? item.images ?? item.photos)
      .map((photo) => asString(photo))
      .filter((photo) => /^https?:\/\//i.test(photo) || photo.startsWith("/"));
    const hex = pickString(item, ["hex", "kolorHex"]) || "#C8C0B4";
    out.push({
      id: newOptionValue().id,
      name,
      hex: /^#?[0-9a-f]{3,8}$/i.test(hex) ? (hex.startsWith("#") ? hex : `#${hex}`) : "#C8C0B4",
      image: photos[0],
      images: photos.slice(1),
      fabricName: pickString(item, ["tkanina", "fabricName"]) || undefined,
    });
  }
  return out;
}

function parseImageList(record: Record<string, unknown>): string[] {
  const main = pickString(record, ["zdjecieGlowne", "image", "okladka"]);
  const extra = asList(record.zdjecia ?? record.images ?? record.photos)
    .map((item) => asString(item))
    .filter(Boolean);
  const all = [main, ...extra].filter(
    (url, index, list) => Boolean(url) && list.indexOf(url) === index
  );
  return all.filter((url) => /^https?:\/\//i.test(url) || url.startsWith("/"));
}

function matchFeatures(imported: string[], template: ProductTemplate): string[] {
  const allowed = templateFeatureList(template);
  const out: string[] = [];
  for (const item of imported) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const needle = normLabel(trimmed);
    const exact = allowed.find((label) => normLabel(label) === needle);
    const fuzzy = allowed.find(
      (label) =>
        normLabel(label).includes(needle) || needle.includes(normLabel(label))
    );
    const next = exact ?? fuzzy ?? trimmed;
    if (!out.some((label) => normLabel(label) === normLabel(next))) out.push(next);
  }
  return out;
}

function isMostlyEmpty(record: Record<string, unknown>): boolean {
  const name = pickString(record, ["nazwa", "name", "tytul", "title"]);
  const price = parsePln(pick(record, ["cenaBrutto", "cena", "price", "cenaSprzedazy"]));
  const description = pickString(record, ["krotkiOpis", "description", "dlugiOpis", "opis"]);
  return !name && price == null && !description;
}

export function listingToProductSeed(raw: unknown): ImportResult {
  const record = unwrapListing(raw);
  if (!record) {
    throw new Error("W pliku nie ma ogłoszenia. Potrzebny jest obiekt JSON albo tablica obiektów.");
  }
  if (isMostlyEmpty(record)) {
    throw new Error("Wzorzec jest pusty. Wypełnij go w AI ogłoszeniem dostawcy i wgraj ponownie.");
  }

  const warnings: string[] = [];
  if (Array.isArray(raw) && raw.length > 1) {
    warnings.push(`W pliku jest ${raw.length} ogłoszeń — wgrano pierwsze. Resztę zaimportuj osobno.`);
  }

  const templateId = guessTemplateId(record);
  const template = getProductTemplate(templateId);
  const category = guessCategory(record, template);
  const price =
    parsePln(pick(record, ["cenaBrutto", "cena", "price", "cenaSprzedazy"])) ?? 0;
  const originalPrice = parsePln(
    pick(record, ["cenaPrzedPromocja", "originalPrice", "cenaRegularna", "staraCena"])
  );
  const images = parseImageList(record);
  if (images.some((url) => /^https?:\/\//i.test(url))) {
    warnings.push(
      "Zdjęcia są z linków dostawcy. Przed publikacją wgraj je do sklepu, żeby nie znikły z oferty."
    );
  }

  const importedDimensions = asList(record.wymiary ?? record.dimensions)
    .map((item) => parseLabelValue(item, ["etykieta", "label", "nazwa"], ["wartosc", "value"]))
    .filter((item): item is ProductDimension => Boolean(item?.label && item.value));
  const importedSpecs = asList(record.specyfikacja ?? record.specs ?? record.specyfikacje)
    .map((item) => parseLabelValue(item, ["etykieta", "label", "nazwa"], ["wartosc", "value"]))
    .filter((item): item is ProductSpec => Boolean(item?.label && item.value));
  const importedFeatures = asList(record.atuty ?? record.features ?? record.cechy)
    .map((item) => (typeof item === "string" ? item : isRecord(item) ? pickString(item, ["nazwa", "label"]) : ""))
    .filter(Boolean);
  const highlights = parseHighlights(record.wyrozniki ?? record.highlights);
  const faq = parseFaq(record.faq);
  const layers = asList(record.warstwy ?? record.layers)
    .map((item) => {
      if (!isRecord(item)) return null;
      const name = pickString(item, ["nazwa", "name"]);
      if (!name) return null;
      return {
        name,
        thickness: pickString(item, ["grubosc", "thickness"]),
        description: pickString(item, ["opis", "description"]),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const seeded = seedDetailsFromTemplate(template);
  const details = {
    ...seeded,
    longDescription: pickString(record, ["dlugiOpis", "longDescription", "opis", "opisDlugi"]),
    productCode: pickString(record, ["kod", "code", "sku", "productCode", "idProduktu"]),
    highlights: highlights.length ? highlights : [],
    features: matchFeatures(importedFeatures, template),
    layers: layers.length ? layers : seeded.layers,
    dimensions: mergeRows(seeded.dimensions, importedDimensions),
    specs: mergeRows(seeded.specs, importedSpecs),
    faq: faq.length ? faq : seeded.faq,
    dimensionImage:
      sanitizeDimensionImage(
        pickString(record, ["zdjecieWymiarow", "dimensionImage"])
      ) ?? dimensionChartForName(pickString(record, ["nazwa", "name", "tytul", "title"]))?.src,
  };

  const sizes = sanitizeSizes(
    asList(record.rozmiary ?? record.sizes).map((item) => {
      if (typeof item === "string") return { label: item, surcharge: 0 };
      if (!isRecord(item)) return null;
      return {
        label: pickString(item, ["nazwa", "label", "rozmiar"]),
        surcharge: parsePln(pick(item, ["doplata", "surcharge"])) ?? 0,
      };
    })
  );

  const importedOptions = parseOptions(record.opcje ?? record.options ?? record.warianty);
  const presetOptions = template.options
    .filter(
      (preset) =>
        !importedOptions.some(
          (option) => option.name.toLowerCase() === preset.name.toLowerCase()
        )
    )
    .map(optionFromPreset);

  const seed: Partial<Product> = {
    name: pickString(record, ["nazwa", "name", "tytul", "title"]),
    category,
    templateId,
    kind: pickString(record, ["rodzaj", "kind", "typ"]),
    line: guessLine(record, price),
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    costNet: parsePln(pick(record, ["kosztNetto", "costNet", "cenaZakupuNetto"])),
    marginPercent: parsePln(pick(record, ["marzaProcent", "marginPercent", "marza"])),
    image: images[0] ?? "",
    images: images.slice(1),
    description: pickString(record, ["krotkiOpis", "description", "opisKrotki", "lead"]),
    seoTitle: pickString(record, ["seoTytul", "seoTitle"]),
    seoDescription: pickString(record, ["seoOpis", "seoDescription"]),
    inStock: parseBool(pick(record, ["dostepny", "inStock"])) ?? true,
    readyToShip: parseBool(pick(record, ["mebelOdReki", "readyToShip"])) ?? false,
    stockQty: parseIntSafe(pick(record, ["iloscMagazyn", "stockQty", "stan"])),
    shipping24h: parseBool(pick(record, ["wysylka24h", "shipping24h"])) ?? false,
    shipsIn7Days: parseBool(pick(record, ["mebelDo7Dni", "shipsIn7Days"])) ?? false,
    productionTime: pickString(record, ["czasProdukcji", "productionTime"]),
    deliveryEstimate: pickString(record, ["przewidywanaDostawa", "deliveryEstimate"]),
    deliveryCost: pickString(record, ["kosztDostawy", "deliveryCost"]),
    manufacturer: pickString(record, ["producent", "manufacturer", "marka", "brand"]),
    packageCount: parseIntSafe(pick(record, ["liczbaPaczek", "packageCount"])),
    colors: parseColors(record.tkaniny ?? record.colors ?? record.kolory ?? record.pokrowce),
    sizes,
    options: [...importedOptions, ...presetOptions],
    details,
    draft: true,
  };

  if (!seed.name) warnings.push("Brak nazwy — dopisz ją w formularzu.");
  if (!seed.price) warnings.push("Brak ceny — wpisz cenę brutto przed publikacją.");

  return { seed, warnings };
}

export function parseImportedListing(text: string): ImportResult {
  return listingToProductSeed(extractJsonPayload(text));
}

export function buildEmptyImportTemplate(templateId?: ProductTemplateId) {
  const template = templateId ? getProductTemplate(templateId) : null;
  return {
    wersja: IMPORT_SCHEMA_VERSION,
    szablon: template?.id ?? "",
    nazwa: "",
    kod: "",
    producent: "",
    kategoria: template?.category ?? "",
    rodzaj: template?.kinds[0] ?? "",
    linia: "",
    cenaBrutto: null,
    cenaPrzedPromocja: null,
    kosztNetto: null,
    marzaProcent: null,
    krotkiOpis: "",
    dlugiOpis: "",
    seoTytul: "",
    seoOpis: "",
    czasProdukcji: "",
    kosztDostawy: "",
    mebelOdReki: false,
    mebelDo7Dni: false,
    iloscMagazyn: null,
    wysylka24h: false,
    liczbaPaczek: null,
    zdjecieGlowne: "",
    zdjecia: [] as string[],
    wymiary: (template?.dimensions ?? []).map((field) => ({
      etykieta: field.label,
      wartosc: "",
    })),
    specyfikacja: (template?.specs ?? []).map((field) => ({
      etykieta: field.label,
      wartosc: "",
    })),
    atuty: [] as string[],
    wyrozniki: [
      { tytul: "", opis: "", ikona: "check" },
    ],
    faq: [] as { pytanie: string; odpowiedz: string }[],
    rozmiary: (template?.sizes?.presets ?? []).map((label) => ({
      nazwa: label,
      doplata: 0,
    })),
    opcje: (template?.options ?? []).map((option) => ({
      nazwa: option.name,
      wartosci: option.values.map((label) => ({ nazwa: label, doplata: 0 })),
    })),
    warstwy: template?.layers
      ? [{ nazwa: "", grubosc: "", opis: "" }]
      : [],
    tkaniny: [] as { nazwa: string; hex: string }[],
    _pomoc: {
      szablon:
        "sofa | naroznik | lozko | lozko-kontynentalne | materac | szafa | komoda | szafka-rtv | szafka-nocna | ogolny",
      linia: "smart | comfort | premium",
      atutySzablonu: template ? templateFeatureList(template) : [],
      rodzaje: template?.kinds ?? [],
      ikonyWyroznikow: HIGHLIGHT_ICONS,
      zasady: [
        "Wypełnij tylko to, co jest w ofercie dostawcy. Puste zostaw puste.",
        "Ceny w PLN, liczby bez waluty albo z „zł”.",
        "Etykiety wymiarów i specyfikacji zostaw dokładnie jak w wzorcu.",
        "Opis przepisz własnymi słowami, nie kopiuj 1:1 cudzego sklepu.",
        "Zwróć sam JSON, bez markdownu i bez komentarza.",
      ],
    },
  };
}

export function buildAiImportPrompt(templateId?: ProductTemplateId): string {
  const template = templateId ? getProductTemplate(templateId) : null;
  const templateLine = template
    ? `Szablon karty: ${template.id} (${template.label}).`
    : `Najpierw dobierz szablon: sofa, naroznik, lozko, lozko-kontynentalne, materac, szafa, komoda, szafka-rtv, szafka-nocna albo ogolny.`;
  const fields = template
    ? [
        `Wymiary (etykiety zostaw 1:1): ${template.dimensions.map((item) => item.label).join(", ")}.`,
        `Specyfikacja (etykiety zostaw 1:1): ${template.specs.map((item) => item.label).join(", ")}.`,
        `Atuty — wybierz tylko z tej listy, jeśli dotyczą modelu: ${templateFeatureList(template).join(", ")}.`,
        template.kinds.length ? `Rodzaj: jeden z: ${template.kinds.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "Użyj etykiet wymiarów i specyfikacji z wzorca JSON, który Ci wkleję.";

  return `Jesteś asystentem sklepu meblowego Wrohaus. Na podstawie ogłoszenia / karty produktu dostawcy wypełniasz nasz wzorzec JSON.

${templateLine}
${fields}

Zasady:
- Zwróć WYŁĄCZNIE poprawny JSON (obiekt), bez markdownu, bez komentarza, bez tekstu przed i po.
- Wypełnij tylko fakty z oferty. Nieznane pola zostaw puste stringi, null albo [].
- Ceny: liczby w PLN (brutto na stronie). Nie zgaduj ceny, jeśli jej nie ma.
- Opis krótki: 1–2 zdania do karty. Długi opis: 2–4 akapity, własnymi słowami, język sklepu (ciepły, konkretny, bez lania wody).
- Nie kopiuj 1:1 cudzego regulaminu, SEO ani bloków marketingowych.
- Producent = fabryka / marka mebla, nie marketplace.
- Zdjęcia: wstaw pełne URL-e jeśli są w ogłoszeniu.
- Warianty (strona L/P, rozmiary, LED, lustro) wpisz w opcje / rozmiary z dopłatą 0 jeśli nie znasz dopłaty.
- Atuty: tylko to, co model naprawdę ma. Nie stawiaj „Nie”.
- FAQ: 0–3 pytania, jeśli wynikają z oferty; inaczej zostaw [].

Klucze JSON (trzymaj te nazwy):
wersja, szablon, nazwa, kod, producent, kategoria, rodzaj, linia, cenaBrutto, cenaPrzedPromocja, kosztNetto, marzaProcent, krotkiOpis, dlugiOpis, seoTytul, seoOpis, czasProdukcji, kosztDostawy, mebelOdReki, mebelDo7Dni, iloscMagazyn, wysylka24h, liczbaPaczek, zdjecieGlowne, zdjecia, wymiary[{etykieta,wartosc}], specyfikacja[{etykieta,wartosc}], atuty[], wyrozniki[{tytul,opis,ikona}], faq[{pytanie,odpowiedz}], rozmiary[{nazwa,doplata}], opcje[{nazwa,wartosci:[{nazwa,doplata}]}], warstwy[{nazwa,grubosc,opis}], tkaniny[{nazwa,hex}].

Teraz wklejam ogłoszenie dostawcy. Wypełnij wzorzec.`;
}

export function downloadJsonFile(filename: string, data: unknown) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
