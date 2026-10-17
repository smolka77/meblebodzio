"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { isLocalUpload } from "@/lib/obrazy";
import { Plus, Search, Pencil, Trash2, Check, Sparkles, CopyPlus, RefreshCw } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { ProductFormModal } from "@/components/panel/FormularzProduktu";
import {
  formatPrice,
  categoryLabels,
  productCategories,
  labelForCategory,
  labelsFromCustom,
} from "@/lib/dane";
import { hasSalePrice } from "@/lib/ceny";
import type { Product, ProductLine } from "@/lib/typy";
import { lineLabels, productLines, resolveProductLine } from "@/lib/linieProduktow";
import { isProductReadyToPublish } from "@/lib/szkicProduktu";
import { cloneProductListing } from "@/lib/kopiaOgloszenia";
import { CATEGORY_NAV_GROUPS } from "@/lib/nawigacjaSklepu";
import { useShop } from "@/kontekst/KontekstSklepu";

type StatusFilter = "all" | "live" | "draft" | "own" | "jarstol";

function isJarstolListing(product: Product) {
  return product.supplier === "jarstol";
}

function ProductThumb({ src, alt, size }: { src?: string; alt: string; size: number }) {
  if (!src?.trim()) {
    return (
      <div
        className="shrink-0 rounded-lg bg-cream-light"
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }
  return (
    <div className="relative shrink-0 overflow-hidden rounded-lg" style={{ width: size, height: size }}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized={isLocalUpload(src)}
      />
    </div>
  );
}

export function AdminProducts() {
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [line, setLine] = useState<ProductLine | "">("");
  const [status, setStatus] = useState<StatusFilter>("own");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [creatingImport, setCreatingImport] = useState(false);
  const [copySeed, setCopySeed] = useState<ReturnType<typeof cloneProductListing> | null>(
    null
  );
  const [copiedFromName, setCopiedFromName] = useState("");
  const [formError, setFormError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncNote, setSyncNote] = useState("");
  const selectAllRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/products?all=1", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (!Array.isArray(data)) return;
        setProducts(data);
        setSelected((ids) => ids.filter((id) => data.some((p) => p.id === id)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const draftCount = products.filter((p) => p.draft).length;
  const liveCount = products.length - draftCount;
  const jarstolCount = products.filter(isJarstolListing).length;
  const ownCount = products.length - jarstolCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (status === "draft" && !p.draft) return false;
      if (status === "live" && p.draft) return false;
      if (status === "own" && isJarstolListing(p)) return false;
      if (status === "jarstol" && !isJarstolListing(p)) return false;
      if (category && p.category !== category) return false;
      if (line && resolveProductLine(p) !== line) return false;
      if (!q) return true;
      const label = labelForCategory(p.category, extraLabels);
      const code = p.details?.productCode?.toLowerCase() ?? "";
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        label.toLowerCase().includes(q) ||
        code.includes(q) ||
        (p.manufacturer ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, query, category, line, status, extraLabels]);

  const visibleIds = filtered.map((p) => p.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const someVisibleSelected = visibleIds.some((id) => selected.includes(id));

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  function toggleOne(id: string) {
    setSelected((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );
  }

  function toggleAllVisible() {
    if (allVisibleSelected) {
      setSelected((ids) => ids.filter((id) => !visibleIds.includes(id)));
      return;
    }
    setSelected((ids) => [...new Set([...ids, ...visibleIds])]);
  }

  async function removeIds(ids: string[]) {
    const unique = [...new Set(ids)];
    if (unique.length === 0) return;
    const many = unique.length > 1;
    const ok = confirm(
      many
        ? `Usunąć ${unique.length} zaznaczonych produktów? Znikną ze sklepu na stałe.`
        : "Usunąć ten produkt? Zniknie ze sklepu na stałe."
    );
    if (!ok) return;

    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/products/bulk", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ids: unique }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        removed?: number;
      };
      if (!res.ok) {
        setError(data.error || "Nie udało się usunąć produktów.");
        return;
      }
      setProducts((list) => list.filter((p) => !unique.includes(p.id)));
      setSelected((ids) => ids.filter((id) => !unique.includes(id)));
    } catch {
      setError("Nie udało się usunąć produktów.");
    } finally {
      setBusy(false);
      load();
    }
  }

  function continueEdit(product: Product, message = "") {
    setFormError(message);
    setCreating(false);
    setCreatingImport(false);
    setCopySeed(null);
    setCopiedFromName("");
    setEditing(product);
  }

  function copyListing(product: Product) {
    setFormError("");
    setEditing(null);
    setCreatingImport(false);
    setCopiedFromName(product.name);
    setCopySeed(cloneProductListing(product));
    setCreating(true);
  }

  async function syncJarstol() {
    setSyncing(true);
    setError("");
    setSyncNote("Pobieram katalog Jarstol…");
    try {
      const res = await fetch("/api/jarstol/sync", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({}),
      });
      const data = (await res.json().catch(() => ({}))) as {
        created?: number;
        updated?: number;
        skipped?: number;
        fetched?: number;
        error?: string;
        skippedBecauseFresh?: boolean;
      };
      if (!res.ok) {
        setError(data.error || "Nie udało się pobrać katalogu Jarstol.");
        setSyncNote("");
        return;
      }
      if (data.error) {
        setError(data.error);
      }
      setSyncNote(
        data.skippedBecauseFresh
          ? "Katalog Jarstol jest aktualny."
          : `Jarstol: ${data.created ?? 0} nowych szkiców, ${data.updated ?? 0} aktualizacji stanów (${data.fetched ?? 0} pozycji w feedzie).`
      );
      load();
    } catch {
      setError("Nie udało się pobrać katalogu Jarstol.");
      setSyncNote("");
    } finally {
      setSyncing(false);
    }
  }

  async function publishProduct(product: Product) {
    if (!isProductReadyToPublish(product)) {
      continueEdit(
        product,
        "Żeby opublikować, uzupełnij krótki opis, zdjęcie i cenę."
      );
      return;
    }
    setPublishingId(product.id);
    setError("");
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ draft: false }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        continueEdit(product, data.error || "Nie udało się opublikować produktu.");
        return;
      }
      setProducts((list) =>
        list.map((item) => (item.id === product.id ? { ...item, draft: false } : item))
      );
    } catch {
      setError("Nie udało się opublikować produktu.");
    } finally {
      setPublishingId(null);
      load();
    }
  }

  return (
    <>
      <AdminHeader title="Produkty" />
      <div className="admin-page">
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-sand">
          Katalog Jarstol wpada sam jako szkice (co ok. 12 godzin, gdy jesteś w
          panelu, albo przyciskiem poniżej). Uzupełniasz cenę brutto i publikujesz —
          dopiero wtedy widać mebel w sklepie. Usunięty szkic Jarstol nie wraca przy
          kolejnym pobraniu. Opisy kategorii:{" "}
          <Link href="/admin/kategorie" className="underline underline-offset-2">
            Kategorie
          </Link>
          .
        </p>
        {syncNote ? (
          <p className="mb-4 text-sm text-charcoal">{syncNote}</p>
        ) : null}
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sand" />
              <input
                type="text"
                placeholder="Szukaj produktów..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-taupe/30 bg-white py-3 pr-4 pl-10 text-base focus:border-charcoal focus:outline-none sm:py-2.5 sm:text-sm"
              />
            </div>
            <label className="sm:w-56">
              <span className="sr-only">Kategoria</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-taupe/30 bg-white px-3 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none sm:py-2.5 sm:text-sm"
              >
                <option value="">Wszystkie kategorie</option>
                {productCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
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
            </label>
            <label className="sm:w-44">
              <span className="sr-only">Linia</span>
              <select
                value={line}
                onChange={(e) =>
                  setLine(e.target.value as ProductLine | "")
                }
                className="w-full rounded-lg border border-taupe/30 bg-white px-3 py-3 text-base text-charcoal focus:border-charcoal focus:outline-none sm:py-2.5 sm:text-sm"
              >
                <option value="">Wszystkie linie</option>
                {productLines.map((item) => (
                  <option key={item} value={item}>
                    {lineLabels[item]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => void syncJarstol()}
              disabled={syncing}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm text-charcoal transition-colors active:scale-[0.98] hover:bg-cream-light disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Pobieram Jarstol…" : "Pobierz Jarstol"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCopySeed(null);
                setCopiedFromName("");
                setCreatingImport(true);
                setCreating(true);
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm text-charcoal transition-colors active:scale-[0.98] hover:bg-cream-light"
            >
              <Sparkles className="h-4 w-4" />
              Import z AI
            </button>
            <button
              type="button"
              onClick={() => {
                setCopySeed(null);
                setCopiedFromName("");
                setCreatingImport(false);
                setCreating(true);
              }}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream transition-colors active:scale-[0.98] hover:bg-charcoal/85"
            >
              <Plus className="h-4 w-4" />
              Dodaj produkt
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "Wszystkie", count: products.length },
              { id: "own", label: "Autorskie", count: ownCount },
              { id: "live", label: "Opublikowane", count: liveCount },
              { id: "draft", label: "Szkice", count: draftCount },
              { id: "jarstol", label: "Jarstol", count: jarstolCount },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatus(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                status === item.id
                  ? "bg-charcoal text-cream"
                  : "border border-taupe/30 bg-white text-charcoal hover:bg-cream-light"
              }`}
            >
              {item.label}
              <span className={status === item.id ? "ml-1.5 text-cream/70" : "ml-1.5 text-sand"}>
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-charcoal">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleAllVisible}
              disabled={filtered.length === 0 || busy}
              className="h-4 w-4 accent-charcoal"
            />
            Zaznacz wszystkie
            {filtered.length > 0 ? (
              <span className="text-sand">({filtered.length})</span>
            ) : null}
          </label>
          <button
            type="button"
            disabled={selected.length === 0 || busy}
            onClick={() => removeIds(selected)}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm text-red-600 disabled:opacity-40 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            Usuń zaznaczone
            {selected.length > 0 ? ` (${selected.length})` : ""}
          </button>
        </div>

        {error ? (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-taupe/30 bg-white px-4 py-8 text-center text-sm text-sand">
            Brak produktów w tym widoku.
          </p>
        ) : null}

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-taupe/30 bg-white p-4"
            >
              <div className="flex gap-3">
                <label className="flex items-start pt-1">
                  <span className="sr-only">Zaznacz {product.name}</span>
                  <input
                    type="checkbox"
                    checked={selected.includes(product.id)}
                    onChange={() => toggleOne(product.id)}
                    className="h-4 w-4 accent-charcoal"
                    disabled={busy}
                  />
                </label>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <ProductThumb src={product.image} alt={product.name} size={64} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal">{product.name}</p>
                  <p className="text-xs text-sand">
                    {labelForCategory(product.category, extraLabels)} · {lineLabels[resolveProductLine(product)]}
                  </p>
                  <p className="mt-1 font-medium text-charcoal">
                    {formatPrice(product.price)}
                    {hasSalePrice(product) && product.originalPrice && (
                      <span className="ml-2 text-xs font-normal text-sand line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {product.draft ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                        Szkic
                      </span>
                    ) : (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "Dostępny" : "Wyprzedany"}
                      </span>
                    )}
                    {isJarstolListing(product) && (
                      <span className="rounded-full bg-cream-light px-2 py-0.5 text-[10px] font-medium text-charcoal">
                        Jarstol
                      </span>
                    )}
                    {product.featured && (
                      <span className="rounded bg-cream-light px-2 py-0.5 text-[10px] text-charcoal">
                        Bestseller
                      </span>
                    )}
                    {product.isNew && (
                      <span className="rounded bg-charcoal px-2 py-0.5 text-[10px] text-cream">
                        Nowość
                      </span>
                    )}
                    {product.readyToShip && (
                      <span className="rounded bg-cream-light px-2 py-0.5 text-[10px] text-charcoal">
                        Od ręki
                        {product.stockQty != null ? ` · ${product.stockQty} szt.` : ""}
                      </span>
                    )}
                    {product.shipsIn7Days && (
                      <span className="rounded bg-cream-light px-2 py-0.5 text-[10px] text-charcoal">
                        Do 7 dni
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 border-t border-taupe/15 pt-3">
                {product.draft ? (
                  <button
                    type="button"
                    disabled={busy || publishingId === product.id}
                    onClick={() => void publishProduct(product)}
                    className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-charcoal text-sm text-cream active:bg-charcoal/85 disabled:opacity-40"
                  >
                    <Check className="h-4 w-4" />
                    {publishingId === product.id ? "Publikowanie..." : "Opublikuj"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => continueEdit(product)}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-taupe/30 text-sm text-charcoal active:bg-cream-light"
                >
                  <Pencil className="h-4 w-4" />
                  {product.draft ? "Kontynuuj" : "Edytuj"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => copyListing(product)}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-taupe/30 text-sm text-charcoal active:bg-cream-light disabled:opacity-40"
                >
                  <CopyPlus className="h-4 w-4" />
                  Kopiuj
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeIds([product.id])}
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 text-sm text-red-600 active:bg-red-50 disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-taupe/30 bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taupe/20 text-left text-xs tracking-wide text-sand uppercase">
                <th className="w-12 px-4 py-3">
                  <span className="sr-only">Zaznacz</span>
                </th>
                <th className="px-6 py-3 font-medium">Produkt</th>
                <th className="px-6 py-3 font-medium">Kategoria</th>
                <th className="px-6 py-3 font-medium">Linia</th>
                <th className="px-6 py-3 font-medium">Cena</th>
                <th className="px-6 py-3 font-medium">Stan</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-taupe/10 transition-colors hover:bg-cream-light/50"
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.includes(product.id)}
                      onChange={() => toggleOne(product.id)}
                      aria-label={`Zaznacz ${product.name}`}
                      className="h-4 w-4 accent-charcoal"
                      disabled={busy}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                        <ProductThumb src={product.image} alt={product.name} size={48} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-charcoal">{product.name}</span>
                        {product.draft ? (
                          <span className="ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            Szkic
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sand">
                    {labelForCategory(product.category, extraLabels)}
                  </td>
                  <td className="px-6 py-4 text-sand">
                    {lineLabels[resolveProductLine(product)]}
                  </td>
                  <td className="px-6 py-4 font-medium text-charcoal">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    {product.draft ? (
                      <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        Szkic
                      </span>
                    ) : (
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.inStock
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.inStock ? "Dostępny" : "Wyprzedany"}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {isJarstolListing(product) && (
                        <span className="rounded bg-cream-light px-2 py-0.5 text-xs text-charcoal">
                          Jarstol
                        </span>
                      )}
                      {product.featured && (
                        <span className="rounded bg-cream-light px-2 py-0.5 text-xs text-charcoal">
                          Bestseller
                        </span>
                      )}
                      {product.isNew && (
                        <span className="rounded bg-charcoal px-2 py-0.5 text-xs text-cream">
                          Nowość
                        </span>
                      )}
                      {product.readyToShip && (
                        <span className="rounded bg-cream-light px-2 py-0.5 text-xs text-charcoal">
                          Od ręki
                          {product.stockQty != null ? ` · ${product.stockQty} szt.` : ""}
                        </span>
                      )}
                      {product.shipsIn7Days && (
                        <span className="rounded bg-cream-light px-2 py-0.5 text-xs text-charcoal">
                          Do 7 dni
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {product.draft ? (
                        <button
                          type="button"
                          disabled={busy || publishingId === product.id}
                          onClick={() => void publishProduct(product)}
                          className="rounded p-1.5 text-sand hover:bg-cream-light hover:text-charcoal disabled:opacity-40"
                          aria-label="Opublikuj"
                          title="Opublikuj"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => continueEdit(product)}
                        className="rounded p-1.5 text-sand hover:bg-cream-light hover:text-charcoal"
                        aria-label={product.draft ? "Kontynuuj edycję" : "Edytuj"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => copyListing(product)}
                        className="rounded p-1.5 text-sand hover:bg-cream-light hover:text-charcoal disabled:opacity-40"
                        aria-label="Kopiuj ogłoszenie"
                        title="Kopiuj ogłoszenie"
                      >
                        <CopyPlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeIds([product.id])}
                        className="rounded p-1.5 text-sand hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        aria-label="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editing) && (
        <ProductFormModal
          key={
            editing?.id ??
            (copySeed ? `copy-${copiedFromName}` : creatingImport ? "import" : "new")
          }
          product={editing ?? undefined}
          seed={copySeed ?? undefined}
          copiedFromName={copiedFromName}
          startWithImport={creating && creatingImport}
          initialError={formError}
          onClose={() => {
            setCreating(false);
            setCreatingImport(false);
            setCopySeed(null);
            setCopiedFromName("");
            setEditing(null);
            setFormError("");
          }}
          onSaved={load}
        />
      )}
    </>
  );
}
