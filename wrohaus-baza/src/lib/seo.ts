import type { Metadata } from "next";
import { company } from "@/lib/firma";
import { isVideoUrl, toMediaApiUrl } from "@/lib/obrazy";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import { storePolicies } from "@/lib/zasadySklepu";
import { categoryLabels, formatPrice, labelForCategory } from "@/lib/dane";
import { getProductImageUrls } from "@/lib/zdjeciaProduktu";
import { cornerSafeDocumentTitle } from "@/lib/nawigacjaSklepu";
import type { BlogPost, Product, ProductCategory, ShopSettings } from "@/lib/typy";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
  SEO_DEFAULT_TITLE,
  SEO_DESC_HINT,
  SEO_DESC_MAX,
  SEO_TITLE_MAX,
  slowaKluczoweMeta,
  wyczyscMeta,
} from "@/lib/seoPola";

export {
  SEO_DESC_HINT,
  SEO_DESC_MAX,
  SEO_KEYWORDS_MAX,
  SEO_TITLE_HINT,
  SEO_TITLE_MAX,
  slowaKluczoweMeta,
  wyczyscMeta,
} from "@/lib/seoPola";

export const siteOrigin = `https://${company.domain}`;

export const seo = {
  brand: company.brandName,
  locale: "pl_PL",
  title: SEO_DEFAULT_TITLE,
  description: SEO_DEFAULT_DESCRIPTION,
  shortTagline: "Meble, które zostają na lata",
  keywords: SEO_DEFAULT_KEYWORDS,
} as const;

export function seoZUstawien(
  settings?: Pick<ShopSettings, "seoTitle" | "seoDescription" | "seoKeywords">
) {
  return {
    title: tytulZMarkaNaKoncu(
      wyczyscMeta(settings?.seoTitle, SEO_TITLE_MAX) || "Meble i wyposażenie domu"
    ),
    description: wyczyscMeta(settings?.seoDescription, SEO_DESC_MAX) || seo.description,
    keywords: slowaKluczoweMeta(settings?.seoKeywords) ?? [...seo.keywords],
  };
}

function tytulZMarkaNaKoncu(title: string): string {
  const brand = seo.brand;
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let clean = title.trim();
  clean = clean.replace(new RegExp(`^${escaped}\\s*[|:]\\s*`, "i"), "");
  clean = clean.replace(new RegExp(`\\s*[|:]\\s*${escaped}\\s*$`, "i"), "");
  clean = clean.trim();
  if (!clean) return brand;
  const suffix = ` | ${brand}`;
  if (clean.length + suffix.length <= SEO_TITLE_MAX) return `${clean}${suffix}`;
  return `${clean.slice(0, Math.max(0, SEO_TITLE_MAX - suffix.length)).trimEnd()}${suffix}`;
}

function tytulDokumentu(custom: string | undefined, fallback: string): Metadata["title"] {
  const title = wyczyscMeta(custom, SEO_TITLE_MAX);
  return title ? { absolute: tytulZMarkaNaKoncu(title) } : fallback;
}

export function tytulMarki(czesc: string): string {
  return tytulZMarkaNaKoncu(czesc);
}

export function absUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (!path || path === "/") return siteOrigin;
  return `${siteOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function absObraz(src: string): string {
  const url = absUrl(toMediaApiUrl(src));
  if (!url.includes("images.unsplash.com")) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("w", "1200");
    parsed.searchParams.set("q", "80");
    return parsed.toString();
  } catch {
    return url;
  }
}

export function przytnij(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function stronaMeta({
  title,
  description,
  path,
  ogType = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
}): Metadata {
  const url = absUrl(path);
  const desc = przytnij(description, 160);
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, nocache: true, noarchive: true }
      : undefined,
    openGraph: {
      type: ogType,
      locale: seo.locale,
      url,
      siteName: seo.brand,
      title: tytulMarki(title),
      description: desc,
      images: [
        {
          url: absUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tytulMarki(title),
      description: desc,
      images: [absUrl("/opengraph-image")],
    },
  };
}

export function okladkaProduktu(product: Product): string | null {
  for (const src of [product.image, ...(product.images ?? [])]) {
    const clean = src?.trim();
    if (clean && !isVideoUrl(clean)) return clean;
  }
  return null;
}

export function opisProduktuSeo(product: Product): string {
  const custom = wyczyscMeta(product.seoDescription, SEO_DESC_MAX);
  if (custom) return przytnij(custom, SEO_DESC_HINT);
  const kat = labelForCategory(product.category);
  const cena = product.originalPrice
    ? `${formatPrice(product.price)} zamiast ${formatPrice(product.originalPrice)}`
    : formatPrice(product.price);
  return przytnij(
    [
      product.description,
      `${kat}, ${cena}. Polska produkcja.`,
      `${storePolicies.returnsLabel}, ${storePolicies.warrantyLabel}.`,
    ].join(" "),
    SEO_DESC_HINT
  );
}

export function metaProduktu(product: Product): Metadata {
  const customTitle = wyczyscMeta(product.seoTitle, SEO_TITLE_MAX);
  const title = cornerSafeDocumentTitle(product, customTitle || product.name);
  const description = opisProduktuSeo(product);
  const url = absUrl(`/produkt/${product.slug}`);
  const photo = okladkaProduktu(product);
  const ogImage = photo
    ? absObraz(photo)
    : absUrl(`/produkt/${product.slug}/opengraph-image`);
  return {
    title: { absolute: tytulZMarkaNaKoncu(title) },
    description,
    alternates: { canonical: url },
    openGraph: {
      // Next 16.3 rzuca E237 dla og:type spoza listy (m.in. "product") i wywala całą kartę.
      type: "website",
      locale: seo.locale,
      url,
      siteName: seo.brand,
      title: tytulMarki(title),
      description,
      images: [
        { url: ogImage, width: 1200, height: 630, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tytulMarki(title),
      description,
      images: [ogImage],
    },
    other: {
      "product:price:amount": String(product.price),
      "product:price:currency": "PLN",
      "product:availability": product.inStock ? "in stock" : "preorder",
    },
  };
}

export function metaArtykulu(post: BlogPost): Metadata {
  const customTitle = wyczyscMeta(post.seoTitle, SEO_TITLE_MAX);
  const description =
    wyczyscMeta(post.seoDescription, SEO_DESC_MAX) || post.excerpt;
  const meta = stronaMeta({
    title: customTitle || post.title,
    description,
    path: `/blog/${post.slug}`,
    ogType: "article",
  });
  const ogImage = absUrl(`/blog/${post.slug}/opengraph-image`);
  return {
    ...meta,
    title: tytulDokumentu(customTitle, post.title),
    openGraph: {
      ...meta.openGraph,
      title: customTitle || tytulMarki(post.title),
      images: [{ url: ogImage, width: 1200, height: 630, alt: customTitle || post.title }],
    },
    twitter: {
      ...meta.twitter,
      title: customTitle || tytulMarki(post.title),
      images: [ogImage],
    },
  };
}

export function metaKategorii(cat: ProductCategory, intro: string): Metadata {
  const label = categoryLabels[cat];
  const title =
    cat === "sofy"
      ? "Sofy do salonu"
      : cat === "narozniki"
        ? "Narożniki"
        : cat === "fotele"
          ? "Fotele"
          : cat === "lozka"
            ? "Łóżka do sypialni"
            : cat === "szafy"
              ? "Szafy"
              : cat === "materace"
                ? "Materace"
                : cat === "kolekcje"
                  ? "Kolekcje mebli"
                  : label;
  return stronaMeta({
    title,
    description: `${intro} ${storePolicies.returnsLabel}, ${storePolicies.warrantyLabel}, dostawa ${storePolicies.deliveryTimeLabel}. Zamów online.`,
    path: `/kategoria/${cat}`,
  });
}

export function jsonLdOrganizacja(opts?: {
  phone?: string;
  sameAs?: string[];
  description?: string;
}) {
  const phone = opts?.phone?.trim();
  const sameAs = (opts?.sameAs ?? []).map((url) => url.trim()).filter(Boolean);
  const description = wyczyscMeta(opts?.description, SEO_DESC_MAX) || seo.description;
  return {
    "@context": "https://schema.org",
    "@type": "FurnitureStore",
    "@id": `${siteOrigin}/#store`,
    name: company.brandName,
    legalName: company.legalName,
    taxID: company.nip,
    vatID: company.nip,
    identifier: {
      "@type": "PropertyValue",
      name: "REGON",
      value: company.regon,
    },
    description,
    url: siteOrigin,
    logo: absUrl("/apple-icon"),
    image: absUrl("/opengraph-image"),
    email: company.email,
    ...(phone ? { telephone: phone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    priceRange: "$$",
    currenciesAccepted: "PLN",
    paymentAccepted: "PayU, BLIK, karta, przelew",
    address: {
      "@type": "PostalAddress",
      streetAddress: company.street,
      postalCode: company.postalCode,
      addressLocality: company.city,
      addressRegion: company.voivodeship,
      addressCountry: "PL",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "19:00",
    },
    areaServed: { "@type": "Country", name: "Poland" },
    knowsLanguage: ["pl", "en", "de", "uk"],
  };
}

export function jsonLdWitryna(opts?: { description?: string }) {
  const description = wyczyscMeta(opts?.description, SEO_DESC_MAX) || seo.description;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteOrigin}/#website`,
    name: company.brandName,
    url: siteOrigin,
    description,
    inLanguage: "pl-PL",
    publisher: { "@id": `${siteOrigin}/#store` },
  };
}

export function jsonLdProdukt(product: Product) {
  const url = absUrl(`/produkt/${product.slug}`);
  const images = [
    ...getProductImageUrls(product),
  ]
    .filter((src): src is string => Boolean(src) && !isVideoUrl(src))
    .map(absObraz);
  const until = new Date();
  until.setDate(until.getDate() + 60);
  const materials = [...new Set(
    (product.colors ?? [])
      .map((color) => color.fabricMaterial?.trim() || color.fabricName?.trim())
      .filter(Boolean)
  )];
  const colors = (product.colors ?? [])
    .map((color) => color.name?.trim())
    .filter(Boolean)
    .slice(0, 16);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: collapseRepeatedProductName(product.name),
    description: opisProduktuSeo(product) || product.description,
    image: images.length ? images : [absUrl("/opengraph-image")],
    sku: product.details?.productCode ?? product.id,
    mpn: product.details?.productCode ?? product.id,
    url,
    brand: { "@type": "Brand", name: product.manufacturer?.trim() || company.brandName },
    category: labelForCategory(product.category),
    ...(materials.length ? { material: materials.join(", ") } : {}),
    ...(colors.length ? { color: colors.join(", ") } : {}),
    manufacturer: {
      "@type": "Organization",
      name: product.manufacturer?.trim() || company.brandName,
    },
    countryOfOrigin: "PL",
    itemCondition: "https://schema.org/NewCondition",
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "PLN",
      price: product.price,
      priceValidUntil: until.toISOString().slice(0, 10),
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${siteOrigin}/#store` },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PL",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: storePolicies.returnsDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnShippingFees",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: storePolicies.standardDeliveryFrom,
          currency: "PLN",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PL",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 10,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 3,
            unitCode: "DAY",
          },
        },
      },
      warranty: {
        "@type": "WarrantyPromise",
        durationOfWarranty: {
          "@type": "QuantitativeValue",
          value: storePolicies.warrantyYears,
          unitCode: "ANN",
        },
      },
    },
    ...(product.reviews?.length
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: (
              product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            ).toFixed(1),
            reviewCount: product.reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
          review: product.reviews.map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.author },
            reviewBody: review.text,
            reviewRating: {
              "@type": "Rating",
              ratingValue: review.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : {}),
  };
}

export function jsonLdFaqPage(
  items: { question: string; answer: string }[]
): object | null {
  const valid = items.filter(
    (item) => item.question?.trim() && item.answer?.trim()
  );
  if (valid.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((item) => ({
      "@type": "Question",
      name: item.question.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.trim(),
      },
    })),
  };
}

export function jsonLdKontakt(opts?: { phone?: string }) {
  const phone = opts?.phone?.trim();
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Kontakt — Wrohaus",
    url: absUrl("/kontakt"),
    mainEntity: {
      "@id": `${siteOrigin}/#store`,
      ...(phone ? { telephone: phone } : {}),
    },
  };
}

export function jsonLdArtykul(post: BlogPost) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: wyczyscMeta(post.seoTitle, SEO_TITLE_MAX) || post.title,
    description: wyczyscMeta(post.seoDescription, SEO_DESC_MAX) || post.excerpt,
    image: absObraz(post.image),
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "pl-PL",
    author: { "@type": "Organization", name: company.brandName },
    publisher: {
      "@type": "Organization",
      name: company.brandName,
      logo: { "@type": "ImageObject", url: absUrl("/apple-icon") },
    },
    mainEntityOfPage: absUrl(`/blog/${post.slug}`),
  };
}

export function jsonLdLista(
  name: string,
  path: string,
  products: { name: string; slug: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url: absUrl(path),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 40).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absUrl(`/produkt/${p.slug}`),
        name: p.name,
      })),
    },
  };
}

export function jsonLdOkuszki(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}
