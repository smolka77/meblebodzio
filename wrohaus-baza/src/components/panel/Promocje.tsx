"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Percent } from "lucide-react";
import Link from "next/link";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { formatPrice, labelForCategory, labelsFromCustom } from "@/lib/dane";
import { isPromotionLive } from "@/lib/promocje";
import type { Product, ProductCategory, ShopPromotion } from "@/lib/typy";
import { useShop } from "@/kontekst/KontekstSklepu";

const emptyForm = {
  title: "",
  description: "",
  active: true,
  startsAt: "",
  endsAt: "",
  discountPercent: "",
  productIds: [] as string[],
};

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

export function AdminPromotions() {
  const { customCategories } = useShop();
  const extraLabels = useMemo(
    () => labelsFromCustom(customCategories),
    [customCategories]
  );
  const [promotions, setPromotions] = useState<ShopPromotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data: ShopPromotion[]) =>
        setPromotions(Array.isArray(data) ? data : [])
      )
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

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setQuery("");
    setError("");
    setShowForm(true);
  }

  function openEdit(promo: ShopPromotion) {
    setEditingId(promo.id);
    setForm({
      title: promo.title,
      description: promo.description ?? "",
      active: promo.active,
      startsAt: promo.startsAt ?? "",
      endsAt: promo.endsAt ?? "",
      discountPercent: promo.discountPercent ? String(promo.discountPercent) : "",
      productIds: [...promo.productIds],
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
      title: form.title,
      description: form.description,
      active: form.active,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      discountPercent: form.discountPercent === "" ? null : Number(form.discountPercent),
      productIds: form.productIds,
    };
    const res = await fetch(
      editingId ? `/api/promotions/${editingId}` : "/api/promotions",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać promocji");
      return;
    }
    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć tę promocję?")) return;
    await fetch(`/api/promotions/${id}`, { method: "DELETE" });
    load();
  }

  function statusLabel(promo: ShopPromotion) {
    if (!promo.active) return "Wyłączona";
    if (isPromotionLive(promo)) return "Na stronie";
    if (promo.startsAt && new Date(promo.startsAt) > new Date()) return "Zaplanowana";
    return "Po terminie";
  }

  return (
    <>
      <AdminHeader title="Promocje" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-sand">
            Dodajesz akcję (np. wyprzedaż wiosenna) i odhaczasz meble ze sklepu, które
            pod nią wchodzą. Widać je na stronie Promocje. Kody z koszyka są osobno — w{" "}
            <Link href="/admin/kupony" className="underline underline-offset-2">
              Kodach rabatowych
            </Link>
            .
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream hover:bg-charcoal/85"
          >
            <Plus className="h-4 w-4" />
            Nowa promocja
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 space-y-5 rounded-xl border border-taupe/30 bg-white p-6"
          >
            <h3 className="text-sm font-medium text-charcoal">
              {editingId ? "Edytuj promocję" : "Nowa promocja"}
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
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="np. Wyprzedaż wiosenna"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-sand uppercase">Opis na stronie</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Krótki tekst pod nagłówkiem promocji"
                className={`${inputClass} resize-y`}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-sand uppercase">Od dnia</label>
                <input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Do dnia</label>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-sand uppercase" htmlFor="promo-percent">
                Obniżka procentowa
              </label>
              <input
                id="promo-percent"
                type="number"
                min={1}
                max={90}
                value={form.discountPercent}
                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                placeholder="np. 15 — puste = tylko lista, bez zmiany cen"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-sand">
                Przy zapisie cena spada na zaznaczonych produktach. Produkt z ceną ręczną zostaje.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-charcoal">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="rounded"
              />
              Pokazuj na stronie Promocje
            </label>

            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs text-sand uppercase">Produkty w promocji</p>
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
                {saving ? "Zapisywanie..." : "Zapisz promocję"}
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

        {promotions.length === 0 && !showForm ? (
          <p className="text-sm text-sand">Nie ma jeszcze żadnej promocji.</p>
        ) : (
          <ul className="space-y-3">
            {promotions.map((promo) => (
              <li
                key={promo.id}
                className="flex flex-col gap-3 rounded-xl border border-taupe/30 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Percent className="h-4 w-4 text-terracotta" />
                    <p className="font-medium text-charcoal">{promo.title}</p>
                    <span className="rounded-full bg-cream-light px-2 py-0.5 text-[10px] font-semibold tracking-wide text-charcoal uppercase">
                      {statusLabel(promo)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-sand">
                    {promo.productIds.length}{" "}
                    {promo.productIds.length === 1
                      ? "produkt"
                      : promo.productIds.length < 5
                        ? "produkty"
                        : "produktów"}
                    {promo.startsAt || promo.endsAt
                      ? ` · ${promo.startsAt || "…"} – ${promo.endsAt || "…"}`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(promo)}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-taupe/40 px-3 text-sm text-charcoal"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edytuj
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(promo.id)}
                    className="inline-flex min-h-[40px] items-center gap-1 rounded-lg border border-taupe/40 px-3 text-sm text-red-700"
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
