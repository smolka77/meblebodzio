import { revalidatePath } from "next/cache";
import { isStoreMediaUrl } from "@/lib/obrazy";
import { mergeLiveFabric } from "@/lib/infoTkanin";
import { storeFilenameFromUrl } from "./wgrywanie";
import { listingMedia, resolveProductAspectRatio, colorWithPhotos, productPhotosForColor } from "@/lib/zdjeciaProduktu";
import { isSizeCategory, sanitizeSizes } from "@/lib/rozmiary";
import { sanitizeSuggestedMattressId } from "@/lib/sugerowanyMaterac";
import { sanitizeOptions } from "@/lib/opcjeProduktu";
import { isProductTemplateId } from "@/lib/szablonyProduktu";
import { sanitizeDimensionImage } from "@/lib/wymiaryLozka";
import { deleteProductImage } from "./wgrywanieBloga";
import { readStore, writeStore, fileExists } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { getFabrics } from "./tkaniny";
import { isBuiltinProductCategory, productCategories } from "@/lib/dane";
import type { Product, ProductReview } from "@/lib/typy";
import { MAX_STOCK, sanitizeStockQty, warehouseQty } from "@/lib/stanMagazynu";
import { syncProductOmnibus, withOmnibusLowest } from "@/lib/cenaOmnibus";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeProduct, localizeProducts } from "@/lib/jezyk/tlumaczOgloszenie";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";
import { SEO_DESC_MAX, SEO_TITLE_MAX, wyczyscMeta } from "@/lib/seoPola";
import { intendedProductSlug, slugify } from "@/lib/slug";

const FILE = "products.json";
const REDIRECTS = "przekierowania-slug.json";

let slugRepair: Promise<void> | null = null;

function uniqueSlug(base: string, used: Set<string>, current: string): string {
  if (!used.has(base) || base === current) return base;
  let n = 2;
  let candidate = `${base}-${n}`;
  while (used.has(candidate) && candidate !== current) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  return candidate;
}

function rewriteSlugFields(value: unknown, map: Map<string, string>): boolean {
  if (!value || typeof value !== "object") return false;
  if (Array.isArray(value)) return value.some((item) => rewriteSlugFields(item, map));
  const record = value as Record<string, unknown>;
  let changed = false;
  if (typeof record.productSlug === "string" && map.has(record.productSlug)) {
    record.productSlug = map.get(record.productSlug);
    changed = true;
  }
  for (const key of ["buttonHref", "href"] as const) {
    const href = record[key];
    if (typeof href !== "string") continue;
    for (const [from, to] of map) {
      const oldPath = `/produkt/${from}`;
      if (href === oldPath || href.startsWith(`${oldPath}?`) || href.startsWith(`${oldPath}#`)) {
        record[key] = `/produkt/${to}${href.slice(oldPath.length)}`;
        changed = true;
      }
    }
  }
  for (const nested of Object.values(record)) {
    if (rewriteSlugFields(nested, map)) changed = true;
  }
  return changed;
}

/** Stare adresy bez „ł” (Łóżko → ozko) dostają poprawny slug i przekierowanie. */
async function repairProductSlugsOnce(): Promise<void> {
  const products = await readStore<Product[]>(FILE, []);
  if (!Array.isArray(products) || products.length === 0) return;

  const used = new Set(products.map((product) => product.slug));
  const redirects: Record<string, string> = {};
  const next = products.map((product) => {
    if (!product.slug) return product;
    const intended = intendedProductSlug(product.slug, product.name);
    if (!intended || intended === product.slug) return product;
    const target = uniqueSlug(intended, used, product.slug);
    if (target === product.slug) return product;
    used.delete(product.slug);
    used.add(target);
    redirects[product.slug] = target;
    return { ...product, slug: target };
  });

  if (Object.keys(redirects).length === 0) return;

  const existing = await readStore<Record<string, string>>(REDIRECTS, {});
  await writeStore(FILE, next);
  await writeStore(REDIRECTS, { ...existing, ...redirects });

  if (await fileExists("homepage.json")) {
    const home = await readStore<Record<string, unknown>>("homepage.json", {});
    if (rewriteSlugFields(home, new Map(Object.entries(redirects)))) {
      await writeStore("homepage.json", home);
    }
  }
}

export async function ensureProductSlugsRepaired(): Promise<void> {
  if (!slugRepair) {
    slugRepair = repairProductSlugsOnce().catch((error) => {
      slugRepair = null;
      throw error;
    });
  }
  await slugRepair;
}

export async function getProductSlugRedirect(slug: string): Promise<string | undefined> {
  await ensureProductSlugsRepaired();
  const map = await readStore<Record<string, string>>(REDIRECTS, {});
  const mapped = map[slug]?.trim();
  if (mapped && mapped !== slug) return mapped;
  const guessed = intendedProductSlug(slug, slug.replace(/-/g, " "));
  if (guessed === slug) return undefined;
  const products = await readStore<Product[]>(FILE, []);
  return products.some((product) => product.slug === guessed) ? guessed : undefined;
}

async function readProductsRaw(): Promise<Product[]> {
  await ensureStoreSeeded();
  await ensureProductSlugsRepaired();
  return readStore<Product[]>(FILE, []);
}

function hydrateProductFabrics(
  products: Product[],
  fabrics: Awaited<ReturnType<typeof getFabrics>>
): Product[] {
  const byId = new Map(fabrics.map((fabric) => [fabric.id, fabric]));
  return products.map((product) => ({
    ...product,
    colors: (product.colors ?? []).map((color) =>
      mergeLiveFabric(
        color,
        color.fabricId ? byId.get(color.fabricId) : undefined
      )
    ),
  }));
}

export async function getProducts(): Promise<Product[]> {
  const [products, fabrics] = await Promise.all([
    readProductsRaw(),
    getFabrics(),
  ]);
  return hydrateProductFabrics(products, fabrics).map((product) =>
    withOmnibusLowest(product)
  );
}

export function isLiveProduct(product: Product): boolean {
  return !product.draft;
}

export function toPublicProduct(product: Product): Product {
  const {
    costNet: _cost,
    marginPercent: _margin,
    draft: _draft,
    priceHistory: _history,
    promoBasePrice: _promoBase,
    ...rest
  } = withOmnibusLowest(product);
  return {
    ...rest,
    reviews: rest.reviews?.map(({ userId: _user, orderId: _order, ...review }) => review),
  };
}

export async function getPublicProducts(options?: {
  translate?: boolean;
}): Promise<Product[]> {
  const products = await getProducts();
  const live = products.filter(isLiveProduct).map(toPublicProduct);
  if (options?.translate === false) return live;
  try {
    const locale = await getRequestLocale();
    if (locale === "pl") return live;
    return localizeProducts(live, locale);
  } catch {
    return live;
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.id === id);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const products = await getProducts();
  return products.find((p) => p.slug === slug);
}

export async function getPublicProductBySlug(slug: string): Promise<Product | undefined> {
  const product = await getProductBySlug(slug);
  if (!product || product.draft) return undefined;
  const publicProduct = toPublicProduct(product);
  try {
    const locale = await getRequestLocale();
    if (locale === "pl") return publicProduct;
    return localizeProduct(publicProduct, locale);
  } catch {
    return publicProduct;
  }
}

function applySizes<T extends Partial<Product>>(data: T): T {
  const category = data.category;
  if (
    category &&
    isBuiltinProductCategory(category) &&
    !isSizeCategory(category)
  ) {
    const next = { ...data };
    delete next.sizes;
    return next;
  }
  if (data.sizes == null) return data;
  const sizes = sanitizeSizes(data.sizes);
  if (sizes.length === 0) {
    const next = { ...data };
    delete next.sizes;
    return next;
  }
  return { ...data, sizes };
}

function cleanText(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

function cleanStringList(value: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const text = raw.trim().slice(0, maxLen);
    if (!text || seen.has(text.toLowerCase())) continue;
    seen.add(text.toLowerCase());
    out.push(text);
    if (out.length >= maxItems) break;
  }
  return out;
}

/** Pola szablonu karty: rodzaj, oznaczenia, produkcja/dostawa, warianty, cechy, warstwy. */
function applyTemplateFields<T extends Partial<Product>>(data: T): T {
  const next = { ...data };

  if ("templateId" in data) {
    if (isProductTemplateId(data.templateId)) next.templateId = data.templateId;
    else delete next.templateId;
  }

  for (const key of ["kind", "productionTime", "deliveryEstimate", "deliveryCost", "manufacturer"] as const) {
    if (!(key in data)) continue;
    const text = cleanText(data[key], 120);
    if (text) next[key] = text;
    else delete next[key];
  }

  if ("supplier" in data) {
    if (data.supplier === "jarstol") next.supplier = "jarstol";
    else delete next.supplier;
  }

  if ("furnitureLineId" in data) {
    const text = cleanText(data.furnitureLineId, 80);
    if (text) next.furnitureLineId = text;
    else delete next.furnitureLineId;
  }

  if ("seoTitle" in data) {
    const text = wyczyscMeta(data.seoTitle, SEO_TITLE_MAX);
    if (text) next.seoTitle = text;
    else delete next.seoTitle;
  }

  if ("seoDescription" in data) {
    const text = wyczyscMeta(data.seoDescription, SEO_DESC_MAX);
    if (text) next.seoDescription = text;
    else delete next.seoDescription;
  }

  if ("shipping24h" in data) {
    if (data.shipping24h) next.shipping24h = true;
    else delete next.shipping24h;
  }

  if ("readyToShip" in data) {
    if (data.readyToShip) next.readyToShip = true;
    else delete next.readyToShip;
  }

  if ("shipsIn7Days" in data) {
    if (data.shipsIn7Days) next.shipsIn7Days = true;
    else delete next.shipsIn7Days;
  }

  if ("outlet" in data) {
    if (data.outlet) next.outlet = true;
    else delete next.outlet;
  }

  if ("manualPrice" in data) {
    if (data.manualPrice) next.manualPrice = true;
    else delete next.manualPrice;
  }

  if (next.readyToShip || next.outlet) {
    const qty = sanitizeStockQty(data.stockQty ?? next.stockQty);
    if (qty != null) next.stockQty = qty;
    else delete next.stockQty;
  } else {
    delete next.stockQty;
  }

  if ("draft" in data) {
    if (data.draft) next.draft = true;
    else delete next.draft;
  }

  if ("options" in data) {
    const options = sanitizeOptions(data.options);
    if (options.length) next.options = options;
    else delete next.options;
  }

  if ("suggestedMattressId" in data || "category" in data) {
    if (next.category === "lozka") {
      const id = sanitizeSuggestedMattressId(next.suggestedMattressId);
      if (id) next.suggestedMattressId = id;
      else delete next.suggestedMattressId;
    } else {
      delete next.suggestedMattressId;
    }
  }

  if (next.details && typeof next.details === "object") {
    const details = { ...next.details };
    const features = cleanStringList(details.features, 40, 80);
    if (features.length) details.features = features;
    else delete details.features;

    const layers = Array.isArray(details.layers)
      ? details.layers
          .slice(0, 16)
          .map((layer) => ({
            name: cleanText(layer?.name, 80) ?? "",
            thickness: cleanText(layer?.thickness, 40),
            description: cleanText(layer?.description, 240),
          }))
          .filter((layer) => layer.name)
          .map((layer) => ({
            name: layer.name,
            ...(layer.thickness ? { thickness: layer.thickness } : {}),
            ...(layer.description ? { description: layer.description } : {}),
          }))
      : [];
    if (layers.length) details.layers = layers;
    else delete details.layers;

    const dimensionImage = sanitizeDimensionImage(details.dimensionImage);
    if (dimensionImage) details.dimensionImage = dimensionImage;
    else delete details.dimensionImage;

    next.details = details;
  }

  return next;
}

function applyPricing<T extends Partial<Product>>(data: T): T {
  const next = { ...data };
  const costNet =
    data.costNet == null || !Number.isFinite(Number(data.costNet))
      ? undefined
      : Number(data.costNet);
  const marginPercent =
    data.marginPercent == null || !Number.isFinite(Number(data.marginPercent))
      ? undefined
      : Number(data.marginPercent);

  if (costNet != null && costNet > 0) {
    next.costNet = costNet;
  } else {
    delete next.costNet;
  }

  if (marginPercent != null) {
    next.marginPercent = marginPercent;
  } else {
    delete next.marginPercent;
  }

  if (data.price != null && Number.isFinite(Number(data.price))) {
    next.price = Number(data.price);
  }

  return next;
}

function sanitizeReviews(input: unknown): ProductReview[] {
  if (!Array.isArray(input)) return [];
  const out: ProductReview[] = [];
  for (const raw of input.slice(0, 24)) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Partial<ProductReview>;
    const author = String(row.author ?? "").trim().slice(0, 80);
    const text = String(row.text ?? "").trim().slice(0, 1200);
    if (!author && !text) continue;
    let rating = Math.round(Number(row.rating));
    if (!Number.isFinite(rating)) rating = 5;
    rating = Math.min(5, Math.max(1, rating));
    const userId = String(row.userId ?? "").trim().slice(0, 80);
    const orderId = String(row.orderId ?? "").trim().slice(0, 40);
    const createdAt = String(row.createdAt ?? "").trim().slice(0, 40);
    out.push({
      id: String(row.id ?? "").trim().slice(0, 64) || crypto.randomUUID(),
      author: author || "Klient",
      text,
      rating,
      city: String(row.city ?? "").trim().slice(0, 80) || undefined,
      ...(userId ? { userId } : {}),
      ...(orderId ? { orderId } : {}),
      ...(createdAt ? { createdAt } : {}),
    });
  }
  return out;
}

function applyManualAndReviews<T extends Partial<Product>>(data: T): T {
  const next = { ...data };
  if ("manualUrl" in data) {
    const url = cleanText(data.manualUrl, 400);
    if (url) next.manualUrl = url;
    else delete next.manualUrl;
  }
  if ("packageCount" in data) {
    const count = Math.round(Number(data.packageCount));
    if (Number.isFinite(count) && count >= 1 && count <= 99) next.packageCount = count;
    else delete next.packageCount;
  }
  if ("reviews" in data) {
    const reviews = sanitizeReviews(data.reviews);
    if (reviews.length) next.reviews = reviews;
    else delete next.reviews;
  }
  return next;
}

function applyAspectRatio<T extends Partial<Product>>(data: T): T {
  return {
    ...data,
    aspectRatio: resolveProductAspectRatio(data.aspectRatio),
  };
}

function applyImages<T extends Partial<Product>>(data: T): T {
  if (
    data.image == null &&
    data.images == null &&
    data.arrangementImage == null &&
    data.colors == null
  ) {
    return data;
  }
  const next = { ...data };
  if (data.image != null || data.images != null || data.arrangementImage != null) {
    const media = listingMedia({
      image: data.image ?? "",
      images: data.images,
      arrangementImage: data.arrangementImage || undefined,
    });
    next.image = media.image;
    next.images = media.images;
  }
  delete next.arrangementImage;
  if (data.colors) {
    next.colors = data.colors.map((color) =>
      colorWithPhotos(color, productPhotosForColor(color))
    );
  }
  return next;
}

export function assembleStoredProduct(
  data: Omit<Product, "id" | "slug"> & { id: string; slug: string }
): Product {
  const { priceHistory: _history, lowestPrice30Days: _lowest, ...safeData } = data;
  return syncProductOmnibus(
    applyManualAndReviews(
      applyTemplateFields(
        applySizes(applyPricing(applyAspectRatio(applyImages(safeData))))
      )
    ) as Product
  );
}

export async function loadProductCatalog(): Promise<Product[]> {
  return readProductsRaw();
}

export async function saveProductCatalog(products: Product[]): Promise<void> {
  await writeStore(FILE, products);
  revalidateStorefront();
}

export async function createProduct(
  data: Omit<Product, "id" | "slug"> & { slug?: string }
): Promise<Product> {
  const products = await readProductsRaw();
  const id = String(Date.now());
  let slug = data.slug || slugify(data.name);
  if (products.some((p) => p.slug === slug)) {
    slug = `${slug}-${id.slice(-4)}`;
  }
  const product = assembleStoredProduct({ ...data, id, slug });
  await writeStore(FILE, [...products, product]);
  revalidateStorefront();
  prefetchListingTranslationsFrom(product);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Product> & {
    originalPrice?: number | null;
    lowestPrice30Days?: number | null;
    stockQty?: number | null;
    suggestedMattressId?: string | null;
  }
): Promise<Product | null> {
  const products = await readProductsRaw();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  const previous = products[index];
  const {
    priceHistory: _clientHistory,
    lowestPrice30Days: _clientLowest,
    ...safeData
  } = data;
  const merged: Product = syncProductOmnibus(
    applyManualAndReviews(
      applyTemplateFields(
        applySizes(
          applyPricing(applyAspectRatio(applyImages({ ...previous, ...safeData, id })))
        )
      )
    ) as Product,
    previous
  );
  if ("originalPrice" in data && data.originalPrice == null) {
    delete merged.originalPrice;
  }
  if ("costNet" in data && data.costNet == null) {
    delete merged.costNet;
  }
  if ("marginPercent" in data && data.marginPercent == null) {
    delete merged.marginPercent;
  }
  if ("stockQty" in data && data.stockQty == null) {
    delete merged.stockQty;
  }
  products[index] = merged;
  await writeStore(FILE, products);
  revalidateStorefront(previous, merged);
  prefetchListingTranslationsFrom(merged);
  return merged;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const removed = await deleteProducts([id]);
  return removed > 0;
}

/** Zdjęcia i pliki ogłoszenia (nie próbki tkanin z katalogu). */
function productOwnedMediaUrls(product: Product): string[] {
  const urls: string[] = [];
  const push = (value?: string) => {
    const src = value?.trim();
    if (src) urls.push(src);
  };
  push(product.image);
  for (const src of product.images ?? []) push(src);
  push(product.arrangementImage);
  for (const color of product.colors ?? []) {
    push(color.image);
    for (const src of color.images ?? []) push(src);
  }
  push(product.details?.storyImage);
  push(product.details?.dimensionImage);
  push(product.manualUrl);
  return urls;
}

function mediaIdentity(url: string): string {
  const parsed = storeFilenameFromUrl(url);
  if (parsed) return `${parsed.kind}/${parsed.filename}`;
  return url.trim();
}

export async function deleteProducts(ids: string[]): Promise<number> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return 0;

  const products = await readProductsRaw();
  const removing = products.filter((p) => unique.includes(p.id));
  if (removing.length === 0) return 0;

  const removeIds = new Set(removing.map((p) => p.id));
  const remaining = products.filter((p) => !removeIds.has(p.id));
  await writeStore(FILE, remaining);

  const { rememberDeletedJarstolKeys } = await import("./jarstol");
  await rememberDeletedJarstolKeys(removing);

  const stillUsed = new Set(remaining.flatMap(productOwnedMediaUrls).map(mediaIdentity));
  const seen = new Set<string>();
  for (const url of removing.flatMap(productOwnedMediaUrls)) {
    const key = mediaIdentity(url);
    if (!key || seen.has(key) || stillUsed.has(key)) continue;
    seen.add(key);
    if (isStoreMediaUrl(url)) await deleteProductImage(url);
  }

  revalidateStorefront();
  return removing.length;
}

let warehouseLock: Promise<unknown> = Promise.resolve();

function withWarehouseLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = warehouseLock.then(fn, fn);
  warehouseLock = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

/** Zdejmuje albo zwraca sztuki na magazynie po zakupie / anulowaniu. */
export async function applyWarehouseSale(
  items: { productId?: string; quantity?: number }[],
  direction: "subtract" | "restore"
): Promise<void> {
  await withWarehouseLock(async () => {
    const qtyByProduct = new Map<string, number>();
    for (const item of items) {
      const id = String(item.productId ?? "").trim();
      const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
      if (!id || qty < 1) continue;
      qtyByProduct.set(id, (qtyByProduct.get(id) ?? 0) + qty);
    }
    if (qtyByProduct.size === 0) return;

    const products = await readProductsRaw();
    const changed: Product[] = [];
    const nextProducts = products.map((product) => {
      const sold = qtyByProduct.get(product.id);
      if (!sold) return product;
      const current = warehouseQty(product);
      if (current == null) return product;
      const delta = direction === "subtract" ? -sold : sold;
      const nextQty = Math.min(MAX_STOCK, Math.max(0, current + delta));
      if (nextQty === current) return product;
      const updated: Product = { ...product, stockQty: nextQty };
      if (nextQty === 0) updated.inStock = false;
      else if (direction === "restore") updated.inStock = true;
      changed.push(updated);
      return updated;
    });

    if (changed.length === 0) return;
    await writeStore(FILE, nextProducts);
    revalidateStorefront();
    for (const product of changed) {
      if (product.slug) revalidatePath(`/produkt/${product.slug}`);
      if (product.category) revalidatePath(`/kategoria/${product.category}`);
    }
  });
}

function revalidateStorefront(previous?: Product, next?: Product) {
  revalidatePath("/");
  revalidatePath("/produkty");
  revalidatePath("/promocje");
  revalidatePath("/meble-od-reki");
  revalidatePath("/meble-do-7-dni");
  revalidatePath("/outlet");
  revalidatePath("/kategoria/[category]", "page");
  revalidatePath("/produkt/[slug]", "page");
  revalidatePath("/admin/produkty");
  revalidatePath("/sitemap.xml");
  revalidatePath("/linie");
  revalidatePath("/linie/[slug]", "page");
  if (previous?.slug) revalidatePath(`/produkt/${previous.slug}`);
  if (next?.slug && next.slug !== previous?.slug) {
    revalidatePath(`/produkt/${next.slug}`);
  }
  if (previous?.category) revalidatePath(`/kategoria/${previous.category}`);
  if (next?.category && next.category !== previous?.category) {
    revalidatePath(`/kategoria/${next.category}`);
  }
}

export { productCategories };
