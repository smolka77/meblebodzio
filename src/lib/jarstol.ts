import type { Product, ProductCategory, ProductColor, ProductDetails } from "@/lib/typy";
import {
  getProductTemplate,
  seedDetailsFromTemplate,
  templateIdForCategory,
} from "@/lib/szablonyProduktu";
import { slugify } from "@/lib/slug";

export const JARSTOL_FEED_URL =
  "https://app.jarstol.eu/storage/exports/packages-availability.xml";

const SKIP_TYPES = /^(led|nogi|led\s*-?\s*blat)$/i;

export type JarstolStockLevel = "high" | "medium" | "low" | "out";

export type JarstolPackage = {
  key: string;
  ean: string;
  packageId: string;
  systemId: string;
  systemName: string;
  blockId: string;
  blockName: string;
  name: string;
  description: string;
  unitType: string;
  colorName: string;
  widthMm: number;
  lengthMm: number;
  heightMm: number;
  price: number;
  photos: string[];
  instruction: string;
  stock: JarstolStockLevel;
};

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(value: string): string {
  return decodeXml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function inner(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? stripTags(match[1]) : "";
}

function inners(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) {
    const value = stripTags(match[1]);
    if (value) out.push(value);
  }
  return out;
}

function blocks(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml))) out.push(match[1]);
  return out;
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function num(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

function mmToCm(mm: number): string {
  if (!mm) return "";
  const cm = Math.round(mm / 10);
  return cm > 0 ? `${cm} cm` : "";
}

function stockLevel(name: string, id: string): JarstolStockLevel {
  const text = `${name} ${id}`.toLowerCase();
  if (/brak|out|empty/.test(text) || id === "0") return "out";
  if (/nisk|low/.test(text)) return "low";
  if (/wysok|high/.test(text)) return "high";
  return "medium";
}

function httpsUrl(value: string): string {
  const raw = value.trim();
  if (!raw) return "";
  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("http://")) return `https://${raw.slice(7)}`;
  return raw;
}

export function parseJarstolXml(xml: string): JarstolPackage[] {
  const packages: JarstolPackage[] = [];
  for (const systemXml of blocks(xml, "System")) {
    const systemId = inner(systemXml, "SystemID");
    const systemName = inner(systemXml, "SystemName");
    for (const blockXml of blocks(systemXml, "Block")) {
      const blockId = inner(blockXml, "BlockID");
      const blockName = inner(blockXml, "BlockName");
      for (const packageXml of blocks(blockXml, "Package")) {
        const packageId = inner(packageXml, "PackageID");
        const name = inner(packageXml, "ProductName");
        const unitType = inner(packageXml, "UnitTypeName");
        if (!name || SKIP_TYPES.test(unitType)) continue;
        const ean = digits(inner(packageXml, "EAN"));
        const key = ean || `jarstol-${systemId}-${blockId}-${packageId}`;
        if (!key || key === "jarstol--") continue;
        packages.push({
          key,
          ean,
          packageId,
          systemId,
          systemName,
          blockId,
          blockName,
          name,
          description: inner(packageXml, "CommercialDescriptionRaw"),
          unitType,
          colorName: inner(packageXml, "UnitColorName"),
          widthMm: num(inner(packageXml, "Width")),
          lengthMm: num(inner(packageXml, "Length")),
          heightMm: num(inner(packageXml, "Height")),
          price: num(inner(packageXml, "Value")),
          photos: inners(packageXml, "Photo").map(httpsUrl).filter(Boolean),
          instruction: httpsUrl(inner(packageXml, "Instruction")),
          stock: stockLevel(inner(packageXml, "StateName"), inner(packageXml, "StateID")),
        });
      }
    }
  }
  const seen = new Set<string>();
  return packages.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}

function mapCategory(unitType: string): ProductCategory {
  const t = unitType.toLowerCase();
  if (/szaf/.test(t) && /rtv/.test(t)) return "szafki-rtv";
  if (/garderob|szaf/.test(t)) return "szafy";
  if (/komod|witryn/.test(t)) return "komody";
  if (/rtv|\btv\b/.test(t)) return "szafki-rtv";
  if (/nocn|wisząc|wiszac/.test(t)) return "szafki";
  if (/[łl]aw|[śs]cian|[sś]to[łl]|stolik/.test(t)) return "stoliki";
  if (/[łl][oó][zż]k/.test(t)) return "lozka";
  if (/biurk|toalet|lustr|rega/.test(t)) return "kolekcje";
  return "kolekcje";
}

function colorHex(name: string): string {
  const t = name.toLowerCase();
  if (/bia[łl]|white/.test(t)) return "#f4f1ea";
  if (/czarn|black/.test(t)) return "#2b2b2b";
  if (/ciem|grafit|wenge|orzech/.test(t)) return "#5c4636";
  if (/d[ąa]b|jesion|sonoma|buk/.test(t)) return "#d7c4a3";
  if (/szar|grey|gray/.test(t)) return "#9a958c";
  return "#cbb79a";
}

export function stockFields(level: JarstolStockLevel): Pick<
  Product,
  "inStock" | "readyToShip" | "stockQty"
> {
  if (level === "out") return { inStock: false };
  if (level === "low") return { inStock: true, readyToShip: true, stockQty: 3 };
  if (level === "high") return { inStock: true, readyToShip: true, stockQty: 20 };
  return { inStock: true, readyToShip: true, stockQty: 8 };
}

function fillDimension(
  details: ProductDetails,
  label: string,
  value: string
): ProductDetails {
  if (!value) return details;
  const dimensions = details.dimensions.map((row) =>
    row.label.toLowerCase() === label.toLowerCase() ? { ...row, value } : row
  );
  if (!dimensions.some((row) => row.label.toLowerCase() === label.toLowerCase() && row.value)) {
    dimensions.push({ label, value });
  }
  return { ...details, dimensions };
}

export function jarstolPackageToDraft(
  item: JarstolPackage,
  usedSlugs: Set<string>
): Product {
  const category = mapCategory(item.unitType);
  const templateId = templateIdForCategory(category);
  const template = getProductTemplate(templateId);
  const photos = item.photos.slice(0, 8);
  const description =
    item.description.slice(0, 320) ||
    `${item.name}. Kolekcja ${item.systemName}.`;
  let details = seedDetailsFromTemplate(template, {
    longDescription: item.description,
    productCode: item.ean || item.key,
  });
  details = fillDimension(details, "Szerokość", mmToCm(item.lengthMm));
  details = fillDimension(details, "Głębokość", mmToCm(item.widthMm));
  details = fillDimension(details, "Wysokość", mmToCm(item.heightMm));
  details = {
    ...details,
    specs: details.specs.map((spec) => {
      if (/kolor/i.test(spec.label) && item.colorName) {
        return { ...spec, value: item.colorName };
      }
      if (/kolekc|linia|system/i.test(spec.label) && item.systemName) {
        return { ...spec, value: item.systemName };
      }
      return spec;
    }),
  };

  const colors: ProductColor[] = item.colorName
    ? [
        {
          id: `jarstol-color-${item.key}`,
          name: item.colorName,
          hex: colorHex(item.colorName),
          image: photos[0],
          images: photos.slice(1),
        },
      ]
    : [];

  let slug = slugify(item.name) || `jarstol-${item.key}`.slice(0, 80);
  if (usedSlugs.has(slug)) slug = `${slug}-${item.key.slice(-6)}`.slice(0, 80);
  usedSlugs.add(slug);

  const stock = stockFields(item.stock);
  return {
    id: `jarstol-${item.key}`,
    name: item.name.slice(0, 160),
    slug,
    category,
    templateId,
    kind: item.unitType || item.blockName || undefined,
    manufacturer: "Jarstol",
    supplier: "jarstol",
    price: 0,
    costNet: item.price > 0 ? item.price : undefined,
    image: photos[0] ?? "",
    images: photos.slice(1),
    description,
    colors,
    details,
    manualUrl: item.instruction || undefined,
    packageCount: 1,
    draft: true,
    ...stock,
  };
}

export function jarstolProductKey(product: Pick<Product, "id" | "supplier" | "details">): string | undefined {
  if (product.supplier === "jarstol" && product.id.startsWith("jarstol-")) {
    return product.id.slice("jarstol-".length);
  }
  const code = product.details?.productCode?.replace(/\D/g, "");
  if (code && code.length >= 8) return code;
  if (product.supplier === "jarstol" && product.details?.productCode) {
    return product.details.productCode.trim();
  }
  return undefined;
}
