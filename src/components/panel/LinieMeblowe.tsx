"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, FolderKanban } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { ImageDropzone } from "@/components/panel/StrefaZdjec";
import { formatPrice, labelForCategory, labelsFromCustom } from "@/lib/dane";
import type { FurnitureLine, Product, ProductCategory } from "@/lib/typy";
import { useShop } from "@/kontekst/KontekstSklepu";

const emptyForm = {
  name: "",
  description: "",
  image: "",
  productIds: [] as string[],
};

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

export function AdminFurnitureLines() {
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [lines, setLines] = useState<FurnitureLine[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    fetch("/api/linie")
      .then((r) => r.json())
      .then((data: FurnitureLine[]) => setLines(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch("/api/products?all=1")
      .then((r) => r.json())
      .then((data: Product[]) =>
        setProducts(Array.isArray(data) ? data.filter((item) => !item.draft) : [])
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const hay = `${product.name} ${labelForCategory(product.category, extraLabels)}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, extraLabels]);

  const grouped = useMemo(() => {
    const map = new Map<ProductCategory, Product[]>();
    for (const product of filtered) {
      const list = map.get(product.category) ?? [];
      list.push(product);
      map.set(product.category, list);
    }
    return [...map.entries()];
  }, [filtered]);

  const selected = useMemo(() => new Set(form.productIds), [form.productIds]);

  function countsFor(lineId: string) {
    return products.filter((product) => product.furnitureLineId === lineId).length;
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setQuery("");
    setError("");
    setShowForm(true);
  }

  function openEdit(line: FurnitureLine) {
    setEditingId(line.id);
    setForm({
      name: line.name,
      description: line.description ?? "",
      image: line.image ?? "",
      productIds: products
        .filter((product) => product.furnitureLineId === line.id)
        .map((product) => product.id),
    });
    setQuery("");
    setError("");
    setShowForm(true);
  }

  function toggleProduct(id: string, on: boolean) {
    setForm((current) => {
      const next = new Set(current.productIds);
      if (on) next.add(id);
      else next.delete(id);
      return { ...current, productIds: [...next] };
    });
  }

  function toggleVisible(on: boolean) {
    const ids = filtered.map((product) => product.id);
    setForm((current) => {
      const next = new Set(current.productIds);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return { ...current, productIds: [...next] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      description: form.description,
      image: form.image || null,
      productIds: form.productIds,
    };
    const res = await fetch(editingId ? `/api/linie/${editingId}` : "/api/linie", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać linii");
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć tę linię? Meble zostaną odpięte od folderu.")) return;
    await fetch(`/api/linie/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <AdminHeader title="Linie" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-sand">
            Linie to foldery kolekcji (np. Sorela) — ze zdjęciem hero na /linie.
            Po wejściu w folder widać meble z tej serii. Smart / Comfort / Premium
            zostają osobno w menu.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream hover:bg-charcoal/85"
          >
            <Plus className="h-4 w-4" />
            Nowa linia
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 space-y-5 rounded-xl border border-taupe/30 bg-white p-6"
          >
            <h3 className="text-sm font-medium text-charcoal">
              {editingId ? "Edytuj linię" : "Nowa linia"}
            </h3>
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <div>
              <label className="text-xs text-sand uppercase">Nazwa</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="np. Sorela"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-sand uppercase">Opis</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Krótki tekst pod nazwą folderu i na stronie linii"
                className={inputClass}
              />
            </div>
            <ImageDropzone
              value={form.image}
              onChange={(image) => setForm({ ...form, image })}
              uploadEndpoint="/api/products/upload"
              label="Zdjęcie hero folderu"
              folderHint="To zdjęcie widać na kafelku linii i na górze po wejściu do kolekcji."
              onError={setError}
            />

            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs text-sand uppercase">Produkty w linii</p>
                  <p className="mt-1 text-sm text-sand">
                    Zaznaczone: {form.productIds.length}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleVisible(true)}
                    className="rounded-lg border border-taupe/40 px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light"
                  >
                    Zaznacz widoczne
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisible(false)}
                    className="rounded-lg border border-taupe/40 px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light"
                  >
                    Odznacz widoczne
                  </button>
                </div>
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Szukaj po nazwie lub kategorii"
                className={`${inputClass} mt-3`}
              />
              <div className="mt-3 max-h-[28rem] space-y-4 overflow-y-auto rounded-lg border border-taupe/20 p-3">
                {grouped.length === 0 ? (
                  <p className="text-sm text-sand">Brak produktów do pokazania.</p>
                ) : (
                  grouped.map(([category, items]) => (
                    <div key={category}>
                      <p className="mb-2 text-xs font-semibold tracking-wide text-charcoal uppercase">
                        {labelForCategory(category, extraLabels)}
                      </p>
                      <ul className="space-y-1">
                        {items.map((product) => (
                          <li key={product.id}>
                            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-cream-light/80">
                              <input
                                type="checkbox"
                                checked={selected.has(product.id)}
                                onChange={(e) =>
                                  toggleProduct(product.id, e.target.checked)
                                }
                                className="rounded"
                              />
                              <span className="min-w-0 flex-1 text-sm text-charcoal">
                                {product.name}
                              </span>
                              <span className="shrink-0 text-xs text-sand">
                                {formatPrice(product.price)}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] rounded-lg bg-charcoal px-5 text-sm text-cream disabled:opacity-50"
              >
                {saving ? "Zapisywanie..." : "Zapisz linię"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-[44px] rounded-lg border border-taupe/40 px-5 text-sm text-charcoal"
              >
                Anuluj
              </button>
            </div>
          </form>
        )}

        {lines.length === 0 ? (
          <p className="text-sm text-sand">Nie ma jeszcze żadnej linii.</p>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-col gap-3 rounded-xl border border-taupe/30 bg-white p-4 sm:flex-row sm:items-center"
              >
                <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-cream-light">
                  {line.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={line.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sand">
                      <FolderKanban className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-charcoal">{line.name}</p>
                  <p className="text-sm text-sand">
                    /linie/{line.slug} · {countsFor(line.id)} produktów
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(line)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-taupe/40 px-3 text-sm text-charcoal hover:bg-cream-light"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edytuj
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(line.id)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-taupe/40 px-3 text-sm text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Usuń
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
