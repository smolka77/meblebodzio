import type { Product } from "@/lib/typy";
import type { Locale } from "./locale";
import { translateListingLabel } from "./etykietyOgloszenia";
import { translateListingMany } from "@/lib/serwer/tlumaczenia";
import { expandProductCopy } from "@/lib/znacznikiOpisu";

function field(text: string | undefined | null, product?: { productionTime?: string }): string {
  return expandProductCopy((text ?? "").trim(), product);
}

function collect(product: Product): string[] {
  const texts: string[] = [
    field(product.name, product),
    field(product.description, product),
    field(product.seoTitle, product),
    field(product.seoDescription, product),
    field(product.kind, product),
    field(product.manufacturer, product),
    field(product.productionTime, product),
    field(product.deliveryEstimate, product),
    field(product.deliveryCost, product),
  ];
  const details = product.details;
  if (details) {
    texts.push(field(details.longDescription, product), field(details.disclaimer, product));
    for (const item of details.highlights ?? []) {
      texts.push(field(item.title, product), field(item.description, product));
    }
    for (const item of details.features ?? []) texts.push(field(item, product));
    for (const spec of details.specs ?? []) texts.push(field(spec.label, product), field(spec.value, product));
    for (const dim of details.dimensions ?? []) texts.push(field(dim.label, product), field(dim.value, product));
    for (const faq of details.faq ?? []) texts.push(field(faq.question, product), field(faq.answer, product));
    for (const layer of details.layers ?? []) {
      texts.push(field(layer.name, product), field(layer.description, product), field(layer.thickness, product));
    }
  }
  for (const color of product.colors ?? []) {
    texts.push(
      field(color.name, product),
      field(color.fabricName, product),
      field(color.fabricAbout, product),
      field(color.fabricMaterial, product),
      field(color.fabricSpecs, product),
      field(color.fabricCare, product)
    );
  }
  for (const option of product.options ?? []) {
    texts.push(field(option.name, product));
    texts.push(...option.values.map((value) => field(value.label, product)));
  }
  for (const size of product.sizes ?? []) texts.push(field(size.label, product));
  for (const review of product.reviews ?? []) texts.push(field(review.text, product));
  return texts.filter((text) => text.length > 0);
}

function apply(text: string, map: Map<string, string>, locale: Locale, product: Product): string {
  if (!text) return text;
  const expanded = field(text, product);
  if (!expanded) return text;
  const labeled = translateListingLabel(expanded, locale);
  if (labeled !== expanded) return labeled;
  return map.get(expanded) ?? expanded;
}

function localizeWithMap(product: Product, map: Map<string, string>, locale: Locale): Product {
  const t = (value: string) => apply(value, map, locale, product);

  return {
    ...product,
    name: t(product.name),
    description: t(product.description),
    seoTitle: product.seoTitle ? t(product.seoTitle) : product.seoTitle,
    seoDescription: product.seoDescription
      ? t(product.seoDescription)
      : product.seoDescription,
    kind: product.kind ? t(product.kind) : product.kind,
    manufacturer: product.manufacturer ? t(product.manufacturer) : product.manufacturer,
    productionTime: product.productionTime
      ? t(product.productionTime)
      : product.productionTime,
    deliveryEstimate: product.deliveryEstimate
      ? t(product.deliveryEstimate)
      : product.deliveryEstimate,
    deliveryCost: product.deliveryCost ? t(product.deliveryCost) : product.deliveryCost,
    sizes: product.sizes?.map((size) => ({
      ...size,
      label: t(size.label),
    })),
    colors: (product.colors ?? []).map((color) => ({
      ...color,
      name: t(color.name),
      fabricName: color.fabricName ? t(color.fabricName) : color.fabricName,
      fabricAbout: color.fabricAbout ? t(color.fabricAbout) : color.fabricAbout,
      fabricMaterial: color.fabricMaterial ? t(color.fabricMaterial) : color.fabricMaterial,
      fabricSpecs: color.fabricSpecs ? t(color.fabricSpecs) : color.fabricSpecs,
      fabricCare: color.fabricCare ? t(color.fabricCare) : color.fabricCare,
    })),
    options: (product.options ?? []).map((option) => ({
      ...option,
      name: t(option.name),
      values: option.values.map((value) => ({ ...value, label: t(value.label) })),
    })),
    reviews: (product.reviews ?? []).map((review) => ({
      ...review,
      text: t(review.text),
    })),
    details: product.details
      ? {
          ...product.details,
          longDescription: t(product.details.longDescription),
          disclaimer: product.details.disclaimer
            ? t(product.details.disclaimer)
            : product.details.disclaimer,
          highlights: (product.details.highlights ?? []).map((item) => ({
            ...item,
            title: t(item.title),
            description: t(item.description),
          })),
          features: product.details.features?.map((item) => t(item)),
          specs: (product.details.specs ?? []).map((item) => ({
            label: t(item.label),
            value: t(item.value),
          })),
          dimensions: (product.details.dimensions ?? []).map((item) => ({
            ...item,
            label: t(item.label),
            value: t(item.value),
          })),
          faq: (product.details.faq ?? []).map((item) => ({
            question: t(item.question),
            answer: t(item.answer),
          })),
          layers: product.details.layers?.map((layer) => ({
            ...layer,
            name: t(layer.name),
            thickness: layer.thickness ? t(layer.thickness) : layer.thickness,
            description: layer.description ? t(layer.description) : layer.description,
          })),
        }
      : product.details,
  };
}

function textsForApi(texts: string[], locale: Locale): string[] {
  return texts.filter((text) => translateListingLabel(text, locale) === text);
}

export async function localizeProduct(
  product: Product,
  locale: Locale
): Promise<Product> {
  if (locale === "pl") return product;
  const map = await translateListingMany(textsForApi(collect(product), locale), locale);
  return localizeWithMap(product, map, locale);
}

export async function localizeProducts(
  products: Product[],
  locale: Locale
): Promise<Product[]> {
  if (locale === "pl" || products.length === 0) return products;
  const map = await translateListingMany(
    textsForApi(products.flatMap(collect), locale),
    locale
  );
  return products.map((product) => {
    try {
      return localizeWithMap(product, map, locale);
    } catch {
      return product;
    }
  });
}
