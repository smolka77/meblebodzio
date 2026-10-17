import { company } from "@/lib/firma";
import { getDefaultFaqCategories } from "@/lib/faqDomyslne";
import { DEFAULT_DELIVERY, mergeDelivery, type DeliveryContent } from "@/lib/dostawa";
import { DEFAULT_HOMEPAGE, mergeHomepage, type HomepageContent } from "@/lib/stronaGlowna";
import { collapseRepeatedProductName } from "@/lib/etykietaProduktu";
import type {
  FaqCategory,
  Product,
  ProductDetails,
  ShopSettings,
  SocialLink,
} from "@/lib/typy";
import { fileExists, readStore, writeStore } from "./baza";

export const CONTENT_PATCH_VERSION = 4;

type PatchState = { version: number };

const PATCH_FILE = "content-patch.json";

function replaceBrandCopy(value: string): string {
  return value
    .replace(/Kontakt@sofelio\.pl/gi, company.emailDisplay)
    .replace(/kontakt@sofelio\.pl/gi, company.email)
    .replace(/admin@sofelio\.pl/gi, company.email)
    .replace(/\bSOFELIO\b/g, company.brandName)
    .replace(/\bSofelio\b/g, company.brandName)
    .replace(/sofelio\.pl/gi, company.domain);
}

function walkStrings<T>(value: T): T {
  if (typeof value === "string") return replaceBrandCopy(value) as T;
  if (Array.isArray(value)) return value.map((item) => walkStrings(item)) as T;
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      next[key] = walkStrings(nested);
    }
    return next as T;
  }
  return value;
}

function overlayFaq(stored: FaqCategory[]): FaqCategory[] {
  const defaults = getDefaultFaqCategories();
  const byId = new Map<string, { question: string; answer: string }>();
  const byQuestion = new Map<string, { question: string; answer: string }>();
  for (const category of defaults) {
    for (const item of category.items) {
      const overlay = { question: item.question, answer: item.answer };
      byId.set(item.id, overlay);
      byQuestion.set(item.question.trim().toLowerCase(), overlay);
    }
  }

  const keywordOverlays: { test: (q: string) => boolean; id: string }[] = [
    { id: "zwr-3", test: (q) => /kiedy otrzymam zwrot/i.test(q) },
    { id: "zwr-1", test: (q) => /ile mam czasu na zwrot/i.test(q) },
    { id: "zam-2", test: (q) => /anulowa/i.test(q) },
    { id: "zam-1", test: (q) => /jak złożyć zamówienie/i.test(q) },
    { id: "dos-3", test: (q) => /w jakim czasie.*dostaw/i.test(q) },
    { id: "dos-2", test: (q) => /wnosi/i.test(q) },
  ];

  const used = new Set<string>();
  const next = stored.map((category) => ({
    ...category,
    title: replaceBrandCopy(category.title),
    items: category.items.map((item) => {
      const q = item.question.trim();
      const overlay =
        byId.get(item.id) ??
        byQuestion.get(q.toLowerCase()) ??
        byId.get(keywordOverlays.find((row) => row.test(q))?.id ?? "");
      if (overlay) {
        const matchedId =
          [...byId.entries()].find(([, value]) => value === overlay)?.[0] ?? item.id;
        used.add(matchedId);
        return { ...item, question: overlay.question, answer: overlay.answer };
      }
      return {
        ...item,
        question: replaceBrandCopy(item.question),
        answer: replaceBrandCopy(item.answer),
      };
    }),
  }));
  for (const category of defaults) {
    const missing = category.items.filter((item) => !used.has(item.id));
    if (missing.length === 0) continue;
    const existing = next.find((row) => row.id === category.id);
    if (existing) {
      existing.items.push(...missing);
    } else {
      next.push({ ...category, items: missing });
    }
  }
  return next;
}

function isJunkSocialUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("sofelio") ||
    lower.includes("sdsdsdsdsd") ||
    lower.includes("instagram.com/sofelio")
  );
}

function patchSettings(stored: ShopSettings): ShopSettings {
  const socialLinks = (stored.socialLinks ?? []).filter(
    (link: SocialLink) => !isJunkSocialUrl(link.url)
  );
    const contactEmail = /sofelio\.pl/i.test(stored.contactEmail)
    ? company.email
    : stored.contactEmail;
  const adminEmail = /sofelio\.pl/i.test(stored.adminEmail ?? "")
    ? `admin@${company.domain}`
    : stored.adminEmail;
  return {
    ...stored,
    contactEmail,
    adminEmail,
    shopName: stored.shopName?.includes("SOFELIO") ? company.brandName : stored.shopName,
    instagramUrl: isJunkSocialUrl(stored.instagramUrl ?? "") ? "" : stored.instagramUrl,
    socialLinks,
  };
}

function patchDelivery(stored: DeliveryContent): DeliveryContent {
  const merged = mergeDelivery(walkStrings(stored));
  return {
    ...merged,
    methods: merged.methods.map((method) => {
      const fallback = DEFAULT_DELIVERY.methods.find((item) => item.id === method.id);
      if (!fallback) return method;
      if (method.id === "standard" || method.id === "pickup") {
        return {
          ...method,
          title: fallback.title,
          description: fallback.description,
          features: fallback.features,
        };
      }
      return method;
    }),
    steps: merged.steps.map((step) => {
      const fallback = DEFAULT_DELIVERY.steps.find((item) => item.id === step.id);
      if (step.id === "step-2" || step.id === "step-4") {
        return fallback ? { ...step, text: fallback.text, title: fallback.title } : step;
      }
      return step;
    }),
  };
}

function dedupeHighlights(details: ProductDetails): ProductDetails {
  const highlights = details.highlights ?? [];
  const seen = new Set<string>();
  const next = highlights.filter((item) => {
    const key = `${item.title}|${item.description}`.trim().toLowerCase();
    const titleKey = item.title.trim().toLowerCase();
    if (seen.has(key) || seen.has(titleKey)) return false;
    seen.add(key);
    seen.add(titleKey);
    return true;
  });
  return { ...details, highlights: next };
}

function unifyPortoSleeping(details: ProductDetails): ProductDetails {
  const blob = [
    details.longDescription,
    ...(details.highlights ?? []).map((item) => `${item.title} ${item.description}`),
    ...(details.specs ?? []).map((item) => `${item.label} ${item.value}`),
  ].join(" ");
  const mentionsDelfin = /delfin/i.test(blob);
  if (!mentionsDelfin) return details;
  return {
    ...details,
    specs: (details.specs ?? []).map((spec) => {
      if (!/rozkład|mechanizm|spania|system/i.test(spec.label)) return spec;
      if (/delfin/i.test(spec.value)) return spec;
      if (/\bDL\b/.test(spec.value)) {
        return { ...spec, value: spec.value.replace(/\bDL\b/g, "Delfin") };
      }
      return spec;
    }),
    highlights: (details.highlights ?? []).map((item) => {
      if (!/spania|rozkład/i.test(`${item.title} ${item.description}`)) return item;
      return {
        ...item,
        description: item.description.replace(/\bDL\b/g, "Delfin"),
      };
    }),
  };
}

function patchProduct(product: Product): Product {
  let next: Product = {
    ...walkStrings(product),
    name: collapseRepeatedProductName(replaceBrandCopy(product.name)),
  };
  if (!next.details) return next;
  let details = walkStrings(next.details);
  if (/porto/i.test(`${next.name} ${next.slug}`)) {
    details = unifyPortoSleeping(details);
  }
  if (/belano/i.test(`${next.name} ${next.slug}`)) {
    details = dedupeHighlights(details);
  }
  return { ...next, details };
}

function patchHomepage(stored: HomepageContent): HomepageContent {
  const merged = mergeHomepage(walkStrings(stored));
  const seenSlugs = new Set<string>();
  const hotspots = merged.look.hotspots.filter((spot) => {
    const slug = spot.productSlug.trim();
    if (!slug) return true;
    if (seenSlugs.has(slug)) return false;
    seenSlugs.add(slug);
    return true;
  });
  return {
    ...merged,
    look: { ...merged.look, hotspots },
    benefits: {
      ...merged.benefits,
      shipping: {
        ...merged.benefits.shipping,
        body: DEFAULT_HOMEPAGE.benefits.shipping.body,
      },
      workshop: {
        ...merged.benefits.workshop,
        body: replaceBrandCopy(merged.benefits.workshop.body),
        alt: replaceBrandCopy(merged.benefits.workshop.alt),
      },
    },
  };
}

async function patchFile<T>(file: string, fallback: T, patch: (value: T) => T) {
  if (!(await fileExists(file))) return;
  const stored = await readStore<T>(file, fallback);
  await writeStore(file, patch(stored));
}

export async function applyContentPatches() {
  const state = await readStore<PatchState>(PATCH_FILE, { version: 0 });
  if (state.version >= CONTENT_PATCH_VERSION) return;

  await patchFile("faq.json", getDefaultFaqCategories(), overlayFaq);
  await patchFile("settings.json", {} as ShopSettings, patchSettings);
  await patchFile("delivery.json", DEFAULT_DELIVERY, patchDelivery);
  await patchFile("products.json", [] as Product[], (products) => products.map(patchProduct));
  await patchFile("homepage.json", {} as HomepageContent, patchHomepage);
  await patchFile("blog.json", [], walkStrings);
  await patchFile("about.json", {}, walkStrings);

  await writeStore(PATCH_FILE, { version: CONTENT_PATCH_VERSION });
}
