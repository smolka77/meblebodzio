"use client";

import { useEffect, useMemo, useState } from "react";
import { X, ArrowLeft, LayoutTemplate } from "lucide-react";
import { ProductImagesField } from "@/components/panel/PolaZdjecProduktu";
import { ProductFabricColorsField } from "@/components/panel/KoloryZTkanin";
import { ProductCoversField } from "@/components/panel/PokrowceProduktu";
import { ProductColorPhotosField } from "@/components/panel/ZdjeciaKolorowProduktu";
import { ProductTemplatePicker, TemplatePickerIntro } from "@/components/panel/WyborSzablonu";
import { ImportOgloszenia } from "@/components/panel/ImportOgloszenia";
import {
  ProductOptionsField,
  ProductSizesField,
  ProductSuggestedMattressField,
} from "@/components/panel/KonfiguracjaProduktu";
import { ProductDeliveryField } from "@/components/panel/ProdukcjaDostawa";
import { ProductManualField } from "@/components/panel/InstrukcjaProduktu";
import { ProductReviewsField } from "@/components/panel/OpinieProduktu";
import type {
  Product,
  ProductCategory,
  ProductColor,
  ProductDetails,
  ProductFaq,
  Fabric,
  ProductLine,
  FurnitureLine,
} from "@/lib/typy";
import { categoryLabels, labelForCategory, labelsFromCustom } from "@/lib/dane";
import { formatPln, hasSalePrice, quoteFromCost, saleDiscountPercent } from "@/lib/ceny";
import {
  recordPriceChange,
  resolveOmnibusLowest,
  seedPriceHistory,
} from "@/lib/cenaOmnibus";
import { getProductImageUrls, listingMedia, normalizeProductImages, colorWithPhotos } from "@/lib/zdjeciaProduktu";
import { DEFAULT_PRODUCT_ASPECT_RATIO } from "@/lib/typy";
import { isSizeCategory, sanitizeSizes } from "@/lib/rozmiary";
import { sanitizeOptions } from "@/lib/opcjeProduktu";
import {
  isVisibleSpecValue,
  optionFromPreset,
  resolveProductTemplate,
  seedDetailsFromTemplate,
  type ProductTemplate,
} from "@/lib/szablonyProduktu";
import { ProductDescriptionEditor } from "@/components/panel/EdytorOpisuProduktu";
import { inferProductLine, lineLabels, productLines } from "@/lib/linieProduktow";
import { fabricRoleForCategory } from "@/lib/rolaTkaniny";
import { productSaveError } from "@/lib/szkicProduktu";
import { sanitizeStockQty } from "@/lib/stanMagazynu";
import { withDefaultCm, withDimensionUnit } from "@/lib/wymiary";
import { lockPageScroll } from "@/lib/blokadaScrolla";
import { SeoFields } from "@/components/panel/PolaSeo";
import { CATEGORY_NAV_GROUPS } from "@/lib/nawigacjaSklepu";
import { useShop } from "@/kontekst/KontekstSklepu";
import {
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
  panelPricingInputClass,
} from "@/components/panel/typografiaPanelu";

type ProductFormData = Omit<Product, "id" | "slug"> & { slug?: string };

const emptyFaq = (): ProductFaq => ({ question: "", answer: "" });

function filledText(value: string | undefined) {
  return Boolean(value?.trim());
}

/**
 * Łączy zapisane dane z strukturą szablonu: brakujące wiersze wymiarów
 * i specyfikacji z szablonu dopisujemy jako puste, żeby admin widział
 * pełną listę pól do uzupełnienia.
 */
function hydrateDetails(template: ProductTemplate, details?: ProductDetails): ProductDetails {
  const seeded = seedDetailsFromTemplate(template, details);
  if (!details) return seeded;

  const mergeRows = <T extends { label: string; value: string }>(
    stored: T[] | undefined,
    templateRows: T[]
  ): T[] => {
    const rows = [...(stored ?? [])];
    const known = new Set(rows.map((row) => row.label.trim().toLowerCase()));
    for (const row of templateRows) {
      if (!known.has(row.label.trim().toLowerCase())) rows.push({ ...row });
    }
    return rows;
  };

  return {
    ...seeded,
    longDescription: details.longDescription ?? "",
    productCode: details.productCode ?? "",
    disclaimer: details.disclaimer?.trim() || template.disclaimer,
    showDisclaimer: details.showDisclaimer ?? Boolean(details.disclaimer?.trim()),
    storyImage: details.storyImage,
    dimensionImage: details.dimensionImage,
    highlights: details.highlights ?? [],
    features: details.features ?? [],
    layers: details.layers?.length
      ? details.layers
      : template.layers
        ? seeded.layers
        : [],
    dimensions: mergeRows(details.dimensions, seeded.dimensions),
    specs: mergeRows(details.specs, seeded.specs),
    faq: details.faq?.length ? details.faq : seeded.faq.length ? seeded.faq : [emptyFaq()],
  };
}

function cleanDetails(details: ProductDetails, template: ProductTemplate): ProductDetails {
  return {
    longDescription: details.longDescription.trim(),
    productCode: details.productCode.trim(),
    disclaimer: details.disclaimer?.trim() || template.disclaimer,
    showDisclaimer: Boolean(details.showDisclaimer),
    storyImage: details.storyImage?.trim() || undefined,
    dimensionImage: details.dimensionImage?.trim() || undefined,
    highlights: details.highlights.filter(
      (item) => filledText(item.title) || filledText(item.description)
    ),
    features: (details.features ?? []).map((item) => item.trim()).filter(Boolean),
    layers: (details.layers ?? [])
      .filter((layer) => filledText(layer.name))
      .map((layer) => ({
        ...layer,
        thickness: layer.thickness ? withDefaultCm(layer.thickness) : layer.thickness,
      })),
    specs: details.specs.filter(
      (item) => filledText(item.label) && isVisibleSpecValue(item.value)
    ),
    dimensions: details.dimensions
      .filter((item) => filledText(item.label) && isVisibleSpecValue(item.value))
      .map((item) => ({
        ...item,
        value: withDimensionUnit(item.value, item.label),
      })),
    faq: details.faq.filter((item) => filledText(item.question) || filledText(item.answer)),
  };
}

interface ProductFormModalProps {
  product?: Product;
  seed?: Partial<Product>;
  copiedFromName?: string;
  startWithImport?: boolean;
  initialError?: string;
  onClose: () => void;
  onSaved: () => void;
}

type FormTab = "basic" | "config" | "colors" | "details";

function formFromSource(source?: Partial<Product>): ProductFormData {
  const initialTemplate = source
    ? resolveProductTemplate({
        templateId: source.templateId,
        category: source.category ?? "sofy",
      })
    : undefined;
  const media = listingMedia({
    image: source?.image ?? "",
    images: source?.images,
    arrangementImage: source?.arrangementImage,
  });
  return {
    name: source?.name ?? "",
    slug: source?.slug,
    category: source?.category ?? initialTemplate?.category ?? "sofy",
    templateId: source?.templateId ?? initialTemplate?.id,
    kind: source?.kind ?? "",
    line: source?.line ?? inferProductLine(source?.price ?? 0),
    furnitureLineId: source?.furnitureLineId,
    price: source?.price ?? 0,
    originalPrice: source?.originalPrice,
    lowestPrice30Days: source?.lowestPrice30Days,
    costNet: source?.costNet,
    marginPercent: source?.marginPercent,
    image: media.image,
    images: media.images,
    aspectRatio: source?.aspectRatio ?? DEFAULT_PRODUCT_ASPECT_RATIO,
    description: source?.description ?? "",
    seoTitle: source?.seoTitle ?? "",
    seoDescription: source?.seoDescription ?? "",
    inStock: source?.inStock ?? true,
    featured: source?.featured ?? false,
    isNew: source?.isNew ?? false,
    readyToShip: source?.readyToShip ?? false,
    outlet: source?.outlet ?? false,
    manualPrice: source?.manualPrice ?? false,
    stockQty: source?.stockQty,
    shipping24h: source?.shipping24h ?? false,
    shipsIn7Days: source?.shipsIn7Days ?? false,
    productionTime: source?.productionTime ?? "",
    deliveryEstimate: source?.deliveryEstimate ?? "",
    deliveryCost: source?.deliveryCost ?? "",
    colors: source?.colors ?? [],
    sizes: source?.sizes ?? [],
    options: source?.options ?? [],
    suggestedMattressId: source?.suggestedMattressId,
    manualUrl: source?.manualUrl,
    packageCount: source?.packageCount,
    manufacturer: source?.manufacturer ?? "",
    supplier: source?.supplier,
    reviews: source?.reviews ?? [],
    draft: source?.draft ?? false,
    details: initialTemplate ? hydrateDetails(initialTemplate, source?.details) : undefined,
  };
}

export function ProductFormModal({
  product,
  seed,
  copiedFromName = "",
  startWithImport = false,
  initialError = "",
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [form, setForm] = useState<ProductFormData>(() => formFromSource(product ?? seed));
  const [choosingTemplate, setChoosingTemplate] = useState(!product && !seed);
  const [pickedOnce, setPickedOnce] = useState(Boolean(product || seed));
  const [tab, setTab] = useState<FormTab>("basic");
  const [saving, setSaving] = useState<"draft" | "publish" | false>(false);
  const [error, setError] = useState(initialError);
  const [fabrics, setFabrics] = useState<Fabric[]>([]);
  const [furnitureLines, setFurnitureLines] = useState<FurnitureLine[]>([]);
  const [mattresses, setMattresses] = useState<Product[]>([]);
  const [savedPriceHistory, setSavedPriceHistory] = useState(
    product?.priceHistory
  );
  const [kindCustomManual, setKindCustom] = useState(false);
  const [showCostCalc, setShowCostCalc] = useState(
    () =>
      product?.costNet != null ||
      product?.marginPercent != null ||
      seed?.costNet != null ||
      seed?.marginPercent != null
  );
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [showCategory, setShowCategory] = useState(false);

  const template = useMemo(
    () => resolveProductTemplate({ templateId: form.templateId, category: form.category }),
    [form.templateId, form.category]
  );
  // Rodzaj spoza listy szablonu (np. wpisany ręcznie wcześniej) → pole tekstowe.
  const kindCustom =
    kindCustomManual ||
    Boolean(form.kind && template.kinds.length && !template.kinds.includes(form.kind));

  useEffect(() => {
    fetch("/api/fabrics?active=false")
      .then((r) => r.json())
      .then((list: Fabric[]) => setFabrics(Array.isArray(list) ? list : []))
      .catch(() => {});
    fetch("/api/linie")
      .then((r) => r.json())
      .then((list: FurnitureLine[]) =>
        setFurnitureLines(Array.isArray(list) ? list : [])
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/products?all=1", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((list: Product[]) => {
        if (!Array.isArray(list)) return;
        setMattresses(
          list
            .filter((item) => item.category === "materace")
            .sort((a, b) => a.name.localeCompare(b.name, "pl"))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => lockPageScroll(), []);

  useEffect(() => {
    if (!product?.id) return;
    fetch(`/api/products/${product.id}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((full: Product) => {
        if (!full?.id) return;
        setForm((prev) => ({
          ...prev,
          costNet: full.costNet,
          marginPercent: full.marginPercent,
          price: full.price,
          originalPrice: full.originalPrice,
          lowestPrice30Days: full.lowestPrice30Days,
          aspectRatio: full.aspectRatio ?? prev.aspectRatio,
        }));
        if (full.priceHistory) setSavedPriceHistory(full.priceHistory);
      })
      .catch(() => {});
  }, [product?.id]);

  const details = form.details ?? hydrateDetails(template);
  const liveQuote = quoteFromCost(form.costNet, form.marginPercent);
  const liveOmnibusLowest = useMemo(() => {
    const base = savedPriceHistory?.length
      ? savedPriceHistory
      : seedPriceHistory({
          price: product?.price ?? form.price,
          lowestPrice30Days: product?.lowestPrice30Days ?? form.lowestPrice30Days,
        });
    const history = recordPriceChange(base, form.price);
    return resolveOmnibusLowest({
      price: form.price,
      priceHistory: history,
      lowestPrice30Days: product?.lowestPrice30Days ?? form.lowestPrice30Days,
    });
  }, [
    form.lowestPrice30Days,
    form.price,
    product?.lowestPrice30Days,
    product?.price,
    savedPriceHistory,
  ]);
  const showSizes = Boolean(template.sizes) || isSizeCategory(form.category);
  const showConfigTab =
    showSizes ||
    form.category === "lozka" ||
    template.options.length > 0 ||
    template.optionSuggestions.length > 0 ||
    (form.options?.length ?? 0) > 0;
  const showColorsTab =
    template.fabrics || template.covers || form.colors.length > 0;

  function chooseTemplate(next: ProductTemplate) {
    if (product && next.id !== template.id) {
      const ok = window.confirm(
        `Zmienić szablon na „${next.label}”? Dopiszemy brakujące wiersze wymiarów i specyfikacji oraz warianty z szablonu. Wpisane wartości zostają.`
      );
      if (!ok) return;
    }
    setForm((f) => {
      const existingOptions = f.options ?? [];
      const presetOptions = next.options
        .filter(
          (preset) =>
            !existingOptions.some(
              (option) => option.name.toLowerCase() === preset.name.toLowerCase()
            )
        )
        .map(optionFromPreset);
      // Nowy produkt → kategoria z szablonu. Edycja → zmieniamy tylko, gdy
      // produkt siedział w domyślnej kategorii poprzedniego szablonu.
      const category =
        !product || f.category === template.category ? next.category : f.category;
      const keepSizes = Boolean(next.sizes) || isSizeCategory(category);
      return {
        ...f,
        templateId: next.id,
        category,
        kind: next.kinds.includes(f.kind ?? "") ? f.kind : "",
        options: [...existingOptions, ...presetOptions],
        sizes: keepSizes ? f.sizes ?? [] : [],
        colors: Boolean(next.covers) !== Boolean(template.covers) ? [] : f.colors,
        details: hydrateDetails(next, f.details),
      };
    });
    setKindCustom(false);
    setPickedOnce(true);
    setChoosingTemplate(false);
    setTab("basic");
  }

  function applyImportedSeed(next: Partial<Product>, warnings: string[]) {
    if (product) {
      const ok = window.confirm(
        "Zastąpić dane w tym formularzu importem z AI? Wpisane pola zostaną nadpisane."
      );
      if (!ok) return;
    }
    setForm(formFromSource(next));
    setKindCustom(false);
    setShowCostCalc(next.costNet != null || next.marginPercent != null);
    setImportWarnings(warnings);
    setError("");
    setPickedOnce(true);
    setChoosingTemplate(false);
    setTab("basic");
  }

  function updateDetails(patch: Partial<ProductDetails>) {
    setForm((f) => ({
      ...f,
      details: { ...hydrateDetails(template, f.details), ...patch },
    }));
  }

  function patchPricing(patch: { costNet?: number; marginPercent?: number }) {
    setForm((f) => ({
      ...f,
      costNet: "costNet" in patch ? patch.costNet : f.costNet,
      marginPercent: "marginPercent" in patch ? patch.marginPercent : f.marginPercent,
    }));
  }

  function applySuggestedPrice() {
    if (!liveQuote) return;
    setForm((f) => ({ ...f, price: liveQuote.sellingGross }));
  }

  function patchFormColors(
    patch: ProductColor[] | ((prev: ProductColor[]) => ProductColor[])
  ) {
    setForm((f) => ({
      ...f,
      colors: typeof patch === "function" ? patch(f.colors) : patch,
    }));
  }

  async function saveProduct(asDraft: boolean) {
    const issue = productSaveError(form, asDraft);
    if (issue) {
      setTab("basic");
      setError(issue);
      return;
    }
    setSaving(asDraft ? "draft" : "publish");
    setError("");
    const media = normalizeProductImages(form.image, form.images);
    const payload = {
      ...form,
      ...media,
      draft: asDraft,
      templateId: template.id,
      kind: form.kind?.trim() || null,
      productionTime: form.productionTime?.trim() || null,
      deliveryEstimate: form.deliveryEstimate?.trim() || null,
      deliveryCost: form.deliveryCost?.trim() || null,
      shipping24h: Boolean(form.shipping24h),
      readyToShip: Boolean(form.readyToShip),
      outlet: Boolean(form.outlet),
      manualPrice: Boolean(form.manualPrice),
      shipsIn7Days: Boolean(form.shipsIn7Days),
      stockQty:
        form.readyToShip || form.outlet ? (form.stockQty ?? null) : null,
      costNet: form.costNet ?? null,
      marginPercent: form.marginPercent ?? null,
      aspectRatio: form.aspectRatio,
      price: form.price,
      originalPrice: form.originalPrice ?? null,
      details: cleanDetails(hydrateDetails(template, form.details), template),
      sizes: showSizes ? sanitizeSizes(form.sizes) : [],
      options: sanitizeOptions(form.options),
      suggestedMattressId:
        form.category === "lozka" ? form.suggestedMattressId || null : null,
      manualUrl: form.manualUrl?.trim() || null,
      packageCount: form.packageCount ?? null,
      manufacturer: form.manufacturer?.trim() || null,
      furnitureLineId: form.furnitureLineId?.trim() || null,
      arrangementImage: null,
      reviews: form.reviews ?? [],
      seoTitle: form.seoTitle?.trim() || null,
      seoDescription: form.seoDescription?.trim() || null,
    };
    const url = product ? `/api/products/${product.id}` : "/api/products";
    const method = product ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Nie udało się zapisać produktu");
        return;
      }
      onSaved();
      onClose();
    } catch {
      setError("Nie udało się zapisać produktu");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveProduct(false);
  }

  const fieldLabelClass = panelLabelClass;
  const fieldHintClass = panelHintClass;
  const inputClass = panelInputClass;
  const pricingCalcInputClass = panelPricingInputClass;

  const checkboxLabelClass = "flex items-start gap-2 text-sm font-semibold text-charcoal";
  const checkboxHintClass = `mt-0.5 block ${panelMetaClass}`;

  const tabs: { id: FormTab; label: string }[] = [
    { id: "basic", label: "Podstawowe" },
    ...(showConfigTab ? [{ id: "config" as const, label: "Warianty" }] : []),
    ...(showColorsTab
      ? [
          {
            id: "colors" as const,
            label: template.covers
              ? "Pokrowce"
              : template.fabrics
                ? "Tkaniny i zdjęcia"
                : "Kolory",
          },
        ]
      : []),
    { id: "details", label: "Opis" },
  ];

  const promoActive = hasSalePrice(form) && Boolean(form.originalPrice);
  const visibleTab =
    (tab === "config" && !showConfigTab) || (tab === "colors" && !showColorsTab)
      ? "basic"
      : tab;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-none bg-charcoal/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full min-h-0 flex-col overflow-hidden rounded-t-2xl border border-taupe/30 bg-white shadow-xl sm:max-h-[min(90dvh,920px)] sm:max-w-4xl sm:rounded-xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-taupe/30 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {choosingTemplate && pickedOnce && (
              <button
                type="button"
                onClick={() => setChoosingTemplate(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-taupe/30 text-charcoal"
                aria-label="Wróć do formularza"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-serif text-lg text-charcoal sm:text-xl">
                {product
                  ? product.draft
                    ? "Edytuj szkic"
                    : "Edytuj produkt"
                  : copiedFromName
                    ? "Kopia ogłoszenia"
                    : "Dodaj produkt"}
              </h2>
              {!choosingTemplate && (
                <button
                  type="button"
                  onClick={() => setChoosingTemplate(true)}
                  className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal/70 hover:text-charcoal"
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  Szablon: {template.label}
                  <span className="underline underline-offset-2">zmień</span>
                </button>
              )}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Zamknij">
            <X className="h-5 w-5 text-sand" />
          </button>
        </div>

        {choosingTemplate ? (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <ImportOgloszenia
              highlighted={startWithImport}
              onImported={applyImportedSeed}
            />
            <TemplatePickerIntro />
            <ProductTemplatePicker
              selected={product ? template.id : undefined}
              onSelect={chooseTemplate}
            />
          </div>
        ) : (
          <>
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-taupe/30 px-4 sm:px-6">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`shrink-0 px-3 py-3 text-sm font-semibold sm:px-4 ${
                    visibleTab === item.id
                      ? "border-b-2 border-charcoal text-charcoal"
                      : "text-charcoal/55 hover:text-charcoal"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {copiedFromName ? (
                <div className="mb-4 rounded-xl border border-taupe/30 bg-cream-light px-4 py-3 text-sm text-charcoal">
                  Kopia „{copiedFromName}”. Opis, tkaniny i warianty zostają — zmień nazwę,
                  cenę albo zdjęcia i zapisz szkic albo od razu opublikuj.
                </div>
              ) : null}
              {importWarnings.length > 0 ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  <p className="font-semibold">Import wszedł. Sprawdź przed publikacją:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {importWarnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {visibleTab === "basic" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={fieldLabelClass}>Nazwa</label>
                    <input
                      required
                      autoFocus={Boolean(copiedFromName)}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={template.namePlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <p className="sm:col-span-2 -mb-1 mt-1 text-[10px] font-semibold tracking-[0.16em] text-sand uppercase">
                    Katalog
                  </p>
                  <div>
                    <label className={fieldLabelClass}>Kategoria</label>
                    {showCategory ? (
                      <select
                        value={form.category}
                        onChange={(e) => {
                          const category = e.target.value as ProductCategory;
                          setForm({ ...form, category });
                        }}
                        className={inputClass}
                      >
                        {Object.entries(categoryLabels).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v}
                          </option>
                        ))}
                        {CATEGORY_NAV_GROUPS.map((group) => {
                          const rows = customCategories.filter(
                            (row) => row.parentGroup === group.id
                          );
                          if (rows.length === 0) return null;
                          return (
                            <optgroup key={group.id} label={group.label}>
                              {rows.map((row) => (
                                <option key={row.slug} value={row.slug}>
                                  {row.name}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                    ) : (
                      <p className="flex items-center justify-between rounded-lg border border-taupe/25 bg-cream-light/50 px-3 py-2.5 text-sm text-charcoal">
                        <span>{labelForCategory(form.category, extraLabels)}</span>
                        <button
                          type="button"
                          onClick={() => setShowCategory(true)}
                          className="text-xs font-semibold underline underline-offset-2"
                        >
                          zmień
                        </button>
                      </p>
                    )}
                    <p className={`mt-1 ${panelMetaClass}`}>
                      Meble od ręki i do 7 dni nie są kategorią — zostaje Narożniki / Sofy itd.,
                      a niżej zaznaczasz listing.
                    </p>
                  </div>
                  {template.kinds.length > 0 && (
                    <div>
                      <label className={fieldLabelClass}>Rodzaj</label>
                      {kindCustom ? (
                        <input
                          value={form.kind ?? ""}
                          onChange={(e) => setForm({ ...form, kind: e.target.value })}
                          placeholder="Wpisz własny rodzaj"
                          className={inputClass}
                          autoFocus
                        />
                      ) : (
                        <select
                          value={form.kind ?? ""}
                          onChange={(e) => {
                            if (e.target.value === "__custom") {
                              setKindCustom(true);
                              setForm({ ...form, kind: "" });
                              return;
                            }
                            setForm({ ...form, kind: e.target.value });
                          }}
                          className={inputClass}
                        >
                          <option value="">— nie pokazuj —</option>
                          {template.kinds.map((kind) => (
                            <option key={kind} value={kind}>
                              {kind}
                            </option>
                          ))}
                          <option value="__custom">Inny (wpisz)</option>
                        </select>
                      )}
                      <p className={`mt-1 ${panelMetaClass}`}>
                        Widoczny na karcie nad nazwą, np. „{template.kinds[0]}”.
                      </p>
                    </div>
                  )}
                  <div className="sm:col-span-2 rounded-xl border border-taupe/25 bg-cream-light/40 px-4 py-3">
                    <label className={checkboxLabelClass}>
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={Boolean(form.readyToShip)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm({
                            ...form,
                            readyToShip: checked,
                            stockQty: checked
                              ? (form.stockQty ?? 1)
                              : form.outlet
                                ? form.stockQty
                                : undefined,
                          });
                        }}
                      />
                      <span>
                        Meble od ręki
                        <span className={checkboxHintClass}>
                          Produkt zostaje w tej kategorii i dodatkowo wchodzi na stronę
                          „Meble od ręki”. Ilość widać na ogłoszeniu.
                        </span>
                      </span>
                    </label>
                    <label className={`${checkboxLabelClass} mt-3`}>
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={Boolean(form.outlet)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm({
                            ...form,
                            outlet: checked,
                            stockQty: checked ? (form.stockQty ?? 1) : form.stockQty,
                          });
                        }}
                      />
                      <span>
                        Outlet
                        <span className={checkboxHintClass}>
                          Zwrot albo końcówka serii. Wchodzi na stronę Outlet razem z ilością.
                        </span>
                      </span>
                    </label>
                    <label className={`${checkboxLabelClass} mt-3`}>
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={Boolean(form.shipsIn7Days)}
                        onChange={(e) =>
                          setForm({ ...form, shipsIn7Days: e.target.checked })
                        }
                      />
                      <span>
                        Meble do 7 dni
                        <span className={checkboxHintClass}>
                          Produkt zostaje w tej kategorii i dodatkowo wchodzi na stronę
                          „Meble do 7 dni”.
                        </span>
                      </span>
                    </label>
                    {form.readyToShip || form.outlet ? (
                      <div className="mt-3 max-w-xs pl-6">
                        <label className={fieldLabelClass} htmlFor="product-stock-qty-basic">
                          Ilość na magazynie
                        </label>
                        <input
                          id="product-stock-qty-basic"
                          type="number"
                          min={0}
                          max={9999}
                          step={1}
                          inputMode="numeric"
                          value={form.stockQty ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setForm({
                              ...form,
                              stockQty: raw === "" ? undefined : sanitizeStockQty(raw),
                            });
                          }}
                          placeholder="np. 3"
                          className={inputClass}
                        />
                        <p className={`mt-1 ${panelMetaClass}`}>
                          Tyle sztuk klienta zobaczy na ogłoszeniu, np. „Na magazynie: 3 szt.”
                        </p>
                      </div>
                    ) : null}
                  </div>
                  <p className="sm:col-span-2 -mb-1 mt-1 text-[10px] font-semibold tracking-[0.16em] text-sand uppercase">
                    Oferta
                  </p>
                  <div>
                    <label className={fieldLabelClass}>Kolekcja / linia</label>
                    <select
                      value={form.line ?? "comfort"}
                      onChange={(e) =>
                        setForm({ ...form, line: e.target.value as ProductLine })
                      }
                      className={inputClass}
                    >
                      {productLines.map((line) => (
                        <option key={line} value={line}>
                          {lineLabels[line]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabelClass}>Linia mebli</label>
                    <select
                      value={form.furnitureLineId ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          furnitureLineId: e.target.value || undefined,
                        })
                      }
                      className={inputClass}
                    >
                      <option value="">Bez linii</option>
                      {furnitureLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.name}
                        </option>
                      ))}
                    </select>
                    <p className={`mt-1 ${panelMetaClass}`}>
                      Folder na stronie Linie (np. Sorela). Osobno od Smart / Comfort / Premium.
                    </p>
                  </div>
                  <div>
                    <label className={fieldLabelClass}>ID produktu (kod)</label>
                    <input
                      value={details.productCode}
                      onChange={(e) => updateDetails({ productCode: e.target.value })}
                      placeholder={template.codePlaceholder}
                      className={inputClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={fieldLabelClass}>Producent</label>
                    <input
                      value={form.manufacturer ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, manufacturer: e.target.value })
                      }
                      placeholder="np. Wrohaus"
                      className={inputClass}
                    />
                    <p className={`mt-1 ${panelMetaClass}`}>
                      Widać na ogłoszeniu przy każdym meblu. Puste pole = nie pokazujemy.
                    </p>
                  </div>

                  <p className="sm:col-span-2 -mb-1 mt-1 text-[10px] font-semibold tracking-[0.16em] text-sand uppercase">
                    Cena
                  </p>
                  <div className="sm:col-span-2 space-y-4">
                    {!showCostCalc ? (
                      <button
                        type="button"
                        onClick={() => setShowCostCalc(true)}
                        className="text-xs font-semibold text-charcoal/70 underline underline-offset-2"
                      >
                        Kalkulacja z kosztu netto i marży (opcjonalnie)
                      </button>
                    ) : (
                    <div className="rounded-xl border border-charcoal/10 bg-cream/30 p-4 sm:p-5">
                      <p className="text-xs font-bold tracking-[0.14em] text-charcoal uppercase">
                        Kalkulacja kosztu
                      </p>
                      <p className={fieldHintClass}>
                        Sugestia brutto (VAT 23%). Cenę na stronie i tak wpisujesz ręcznie.
                      </p>
                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-charcoal/10 bg-white/70 p-3">
                          <label className={fieldLabelClass}>Cena netto producenta (PLN)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={form.costNet ?? ""}
                            onChange={(e) =>
                              patchPricing({
                                costNet:
                                  e.target.value === "" ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder="np. 2100"
                            className={pricingCalcInputClass}
                          />
                        </div>
                        <div className="rounded-lg border border-charcoal/10 bg-white/70 p-3">
                          <label className={fieldLabelClass}>Marża (%)</label>
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            value={form.marginPercent ?? ""}
                            onChange={(e) =>
                              patchPricing({
                                marginPercent:
                                  e.target.value === "" ? undefined : Number(e.target.value),
                              })
                            }
                            placeholder="np. 80"
                            className={pricingCalcInputClass}
                          />
                        </div>
                      </div>

                      {liveQuote ? (
                        <div className="mt-4 rounded-lg border border-dashed border-taupe/50 bg-white/90 px-4 py-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className={fieldLabelClass}>Sugerowana cena brutto</p>
                              <p className="mt-1 font-serif text-2xl font-semibold text-charcoal">
                                {formatPln(liveQuote.sellingGross)}
                              </p>
                              <dl className="mt-2 grid gap-1 text-xs font-medium text-charcoal/85 sm:grid-cols-3">
                                <div>
                                  Netto sprzedaży:{" "}
                                  <span className="font-semibold text-charcoal">
                                    {formatPln(liveQuote.sellingNet, 2)}
                                  </span>
                                </div>
                                <div>
                                  VAT 23%:{" "}
                                  <span className="font-semibold text-charcoal">
                                    {formatPln(liveQuote.vat, 2)}
                                  </span>
                                </div>
                                <div>
                                  Marża od netto:{" "}
                                  <span className="font-semibold text-charcoal">
                                    {liveQuote.marginPercent}%
                                  </span>
                                </div>
                              </dl>
                            </div>
                            <button
                              type="button"
                              onClick={applySuggestedPrice}
                              className="shrink-0 rounded-lg border border-charcoal/20 bg-cream px-4 py-2.5 text-xs font-medium tracking-wide text-charcoal uppercase transition-colors hover:bg-charcoal hover:text-cream"
                            >
                              Użyj sugestii
                            </button>
                          </div>
                        </div>
                        ) : (
                          <p className={`mt-4 ${fieldHintClass}`}>
                            Wpisz netto i marżę — pojawi się sugerowana cena brutto.
                          </p>
                        )}
                    </div>
                    )}

                    <div className="relative overflow-hidden rounded-2xl border border-charcoal/12 bg-gradient-to-br from-cream via-white to-cream-light p-5 sm:p-6">
                      <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-charcoal/[0.03]" />
                      <div className="relative">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold tracking-[0.14em] text-charcoal uppercase">
                              Cena finalna na stronie
                            </p>
                            <p className={`max-w-md ${fieldHintClass}`}>
                              Tę kwotę brutto widzi klient.
                            </p>
                          </div>
                          <span className="rounded-full border border-charcoal/15 bg-white/80 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] text-charcoal uppercase">
                            Brutto · PLN
                          </span>
                        </div>

                        <label className="mt-5 block">
                          <span className="sr-only">Cena finalna brutto</span>
                          <div className="flex items-end gap-3 border-b-2 border-charcoal/15 pb-2 transition-colors focus-within:border-charcoal">
                            <input
                              type="number"
                              required
                              min={1}
                              step={1}
                              value={form.price > 0 ? form.price : ""}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  price: e.target.value === "" ? 0 : Number(e.target.value),
                                })
                              }
                              className="min-w-0 flex-1 border-0 bg-transparent p-0 font-serif text-4xl leading-none text-charcoal [appearance:textfield] placeholder:text-taupe/35 focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            />
                            <span className="pb-1 font-serif text-2xl font-semibold text-charcoal">
                              zł
                            </span>
                          </div>
                        </label>
                        <label className="mt-4 flex items-start gap-2 text-sm text-charcoal">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={Boolean(form.manualPrice)}
                            onChange={(e) =>
                              setForm({ ...form, manualPrice: e.target.checked })
                            }
                          />
                          <span>
                            Cena ręczna
                            <span className="mt-0.5 block text-xs text-sand">
                              Promocja procentowa na wielu produktach nie zmieni tej kwoty.
                            </span>
                          </span>
                        </label>

                        {liveQuote && form.price > 0 && form.price !== liveQuote.sellingGross && (
                          <p className="mt-3 text-sm font-medium text-charcoal/85">
                            Różnica względem sugestii:{" "}
                            <span className="font-semibold text-charcoal">
                              {form.price > liveQuote.sellingGross ? "+" : ""}
                              {formatPln(form.price - liveQuote.sellingGross)}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={fieldLabelClass}>Cena promocyjna — cena przed obniżką</label>
                    <input
                      type="number"
                      min={0}
                      value={form.originalPrice ?? ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          originalPrice: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="Opcjonalnie — wpisz starą cenę; cena finalna wyżej staje się promocyjną"
                      className={inputClass}
                    />
                    {promoActive && form.originalPrice && (
                      <p className="mt-1.5 text-xs text-emerald-700">
                        Oznaczenie „Promocja”: −
                        {saleDiscountPercent(form.price, form.originalPrice)}% (cena przekreślona
                        na karcie i stronie produktu)
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-taupe/20 bg-cream-light/50 px-4 py-3">
                    <p className={fieldLabelClass}>Najniższa cena z ostatnich 30 dni</p>
                    <p className="mt-1 text-sm font-semibold text-charcoal">
                      {liveOmnibusLowest != null
                        ? formatPln(liveOmnibusLowest)
                        : "Pojawi się sama po pierwszej obniżce ceny"}
                    </p>
                    <p className={`mt-1 ${panelHintClass}`}>
                      Liczona automatycznie z historii ceny na stronie — nie wpisujesz jej ręcznie.
                      Na ogłoszeniu widać ją przy promocji albo gdy aktualna cena jest niższa niż
                      ta z 30 dni.
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <ProductImagesField
                      images={getProductImageUrls(form)}
                      aspectRatio={form.aspectRatio}
                      onAspectRatioChange={(aspectRatio) =>
                        setForm((f) => ({ ...f, aspectRatio }))
                      }
                      onChange={(urls) => {
                        const media = normalizeProductImages("", urls);
                        setForm((f) => ({ ...f, ...media }));
                      }}
                      onError={setError}
                      hint={
                        template.covers
                          ? "Pierwsze zdjęcie = główne, drugie = aranżacja (hover na karcie). Materac w konkretnym pokrowcu dodasz w zakładce „Pokrowce”."
                          : showColorsTab
                            ? "Pierwsze zdjęcie = główne, drugie = aranżacja (hover na karcie). Zdjęcia mebla w konkretnej tkaninie dodajesz przy kolorach — klient zobaczy je dopiero po kliknięciu kafelka."
                            : undefined
                      }
                      previewContext={{
                        name: form.name,
                        price: form.price,
                        productCode: form.details?.productCode,
                        colors: form.colors,
                        line: form.line,
                        isNew: form.isNew,
                        categoryLabel: labelForCategory(form.category, extraLabels),
                        description:
                          form.details?.longDescription?.trim() || form.description,
                      }}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={fieldLabelClass}>Krótki opis</label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Krótki tekst do karty produktu i wyszukiwarki. Pełny opis dodasz w zakładce Opis."
                      className={inputClass}
                    />
                  </div>

                  <div className="sm:col-span-2 rounded-xl border border-taupe/30 bg-white p-4 sm:p-5">
                    <h3 className="text-sm font-medium text-charcoal">Google / SEO</h3>
                    <div className="mt-3">
                      <SeoFields
                        title={form.seoTitle ?? ""}
                        description={form.seoDescription ?? ""}
                        onTitle={(seoTitle) => setForm({ ...form, seoTitle })}
                        onDescription={(seoDescription) =>
                          setForm({ ...form, seoDescription })
                        }
                        titlePlaceholder={form.name || "Nazwa produktu"}
                        descriptionPlaceholder={
                          form.description ||
                          "Krótki opis z karty produktu, kategoria i cena."
                        }
                        hint="Osobny tytuł i opis dla Google. Puste = nazwa produktu i krótki opis z karty."
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5">
                    <p className={fieldLabelClass}>Oznaczenia</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={form.isNew}
                          onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                        />
                        <span>Nowość</span>
                      </label>
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={form.featured}
                          onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        />
                        <span>Bestseller</span>
                      </label>
                      <label className={checkboxLabelClass}>
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={form.inStock}
                          onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                        />
                        <span>Dostępny w sprzedaży</span>
                      </label>
                      <div
                        className={`flex items-start gap-2 text-sm font-semibold ${
                          promoActive ? "text-charcoal" : "text-charcoal/45"
                        }`}
                      >
                        <input type="checkbox" className="mt-0.5" checked={promoActive} readOnly disabled />
                        <span>
                          Promocja
                          <span className={checkboxHintClass}>
                            {promoActive
                              ? "Z ceny przed obniżką."
                              : "Wpisz cenę przed obniżką powyżej."}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <ProductDeliveryField
                      value={{
                        productionTime: form.productionTime,
                        deliveryEstimate: form.deliveryEstimate,
                        deliveryCost: form.deliveryCost,
                        shipping24h: form.shipping24h,
                        readyToShip: form.readyToShip,
                        stockQty: form.stockQty,
                      }}
                      onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <ProductManualField
                      manualUrl={form.manualUrl}
                      packageCount={form.packageCount}
                      onChange={(patch) =>
                        setForm((f) => ({
                          ...f,
                          ...patch,
                          ...(patch.manualUrl === "" ? { manualUrl: undefined } : {}),
                          ...(patch.packageCount == null ? { packageCount: undefined } : {}),
                        }))
                      }
                      onError={setError}
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-3 rounded-2xl border border-taupe/25 p-4 sm:p-5">
                    <label className="flex items-start gap-2 text-sm font-semibold text-charcoal">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={Boolean(details.showDisclaimer)}
                        onChange={(e) => updateDetails({ showDisclaimer: e.target.checked })}
                      />
                      <span>Informacja techniczna pod opisem</span>
                    </label>
                    {details.showDisclaimer ? (
                      <textarea
                        rows={3}
                        value={details.disclaimer ?? ""}
                        onChange={(e) => updateDetails({ disclaimer: e.target.value })}
                        className={inputClass}
                      />
                    ) : null}
                  </div>
                </div>
              )}

              {visibleTab === "config" && showConfigTab && (
                <div className="space-y-4">
                  {showSizes && (
                    <ProductSizesField
                      template={
                        template.sizes
                          ? template
                          : {
                              ...template,
                              sizes: {
                                label: "Rozmiar",
                                hint: "Wariant rozmiaru z dopłatą do ceny bazowej.",
                                presets: [],
                              },
                            }
                      }
                      sizes={form.sizes ?? []}
                      onChange={(sizes) => setForm((f) => ({ ...f, sizes }))}
                    />
                  )}

                  {(template.options.length > 0 ||
                    template.optionSuggestions.length > 0 ||
                    (form.options?.length ?? 0) > 0) && (
                    <ProductOptionsField
                      template={template}
                      options={form.options ?? []}
                      onChange={(options) => setForm((f) => ({ ...f, options }))}
                    />
                  )}

                  {form.category === "lozka" && (
                    <ProductSuggestedMattressField
                      mattresses={mattresses}
                      value={form.suggestedMattressId}
                      onChange={(suggestedMattressId) =>
                        setForm((f) => ({ ...f, suggestedMattressId }))
                      }
                    />
                  )}
                </div>
              )}

              {visibleTab === "colors" && showColorsTab && (
                <div className="space-y-5">
                  {template.covers ? (
                    <ProductCoversField
                      covers={form.colors}
                      fabrics={fabrics}
                      onChange={patchFormColors}
                      onError={setError}
                    />
                  ) : (
                    <ProductFabricColorsField
                      fabrics={fabrics}
                      colors={form.colors}
                      category={form.category}
                      initiallyWithoutFabrics={
                        !template.fabrics &&
                        (product ? (product.colors?.length ?? 0) === 0 : true)
                      }
                      allowSkip={
                        !template.fabrics ||
                        fabricRoleForCategory(form.category) === "plyta"
                      }
                      onChange={patchFormColors}
                    />
                  )}
                  <ProductColorPhotosField
                    colors={form.colors}
                    galleryImages={getProductImageUrls(form)}
                    coverMode={Boolean(template.covers)}
                    onChangeColor={(colorId, photos) =>
                      setForm((f) => ({
                        ...f,
                        colors: f.colors.map((color) =>
                          color.id === colorId ? colorWithPhotos(color, photos) : color
                        ),
                      }))
                    }
                    onError={setError}
                  />
                </div>
              )}

              {visibleTab === "details" && (
                <div className="space-y-5">
                  <ProductDescriptionEditor
                    details={details}
                    onChange={updateDetails}
                    shortDescription={form.description}
                    productName={form.name}
                    template={template}
                  />
                  <ProductReviewsField
                    reviews={form.reviews ?? []}
                    onChange={(reviews) => setForm((f) => ({ ...f, reviews }))}
                  />
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <p className="mt-4 text-xs text-sand">
                Wersja robocza zostaje w panelu i nie jest widoczna w sklepie.
              </p>

              <div className="mt-4 flex flex-col-reverse gap-3 border-t border-taupe/30 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-taupe/30 px-4 py-2 text-sm font-semibold text-charcoal"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  disabled={Boolean(saving)}
                  onClick={() => void saveProduct(true)}
                  className="rounded-lg border border-taupe/30 px-4 py-2 text-sm font-semibold text-charcoal hover:bg-cream-light disabled:opacity-50"
                >
                  {saving === "draft" ? "Zapisywanie..." : "Zapisz wersję roboczą"}
                </button>
                <button
                  type="submit"
                  disabled={Boolean(saving)}
                  className="rounded-lg bg-charcoal px-6 py-2 text-sm font-semibold text-cream hover:bg-charcoal/85 disabled:opacity-50"
                >
                  {saving === "publish"
                    ? "Publikowanie..."
                    : product && !product.draft
                      ? "Zapisz i opublikuj"
                      : "Opublikuj"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
