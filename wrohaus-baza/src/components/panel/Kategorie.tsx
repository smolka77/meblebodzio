"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import type {
  CategoryNavGroupId,
  CustomShopCategory,
  ExtraListingId,
  ProductCategory,
  ShopSettings,
} from "@/lib/typy";
import {
  extraListingHrefs,
  extraListingIds,
  extraListingIntros,
  extraListingLabels,
} from "@/lib/listingi";
import {
  categoryIntros,
  categoryLabels,
  productCategories,
} from "@/lib/dane";
import { CATEGORY_DESC_MAX } from "@/lib/seoPola";
import { normalizeVisibleProductCategories } from "@/lib/widocznoscKategorii";
import {
  CATEGORY_NAV_GROUPS,
  shopNavTree,
} from "@/lib/nawigacjaSklepu";
import { useShop } from "@/kontekst/KontekstSklepu";

const inputClass =
  "mt-1.5 w-full resize-y rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none";

function builtinLinksForGroup(groupId: string) {
  const item = shopNavTree.find(
    (row) => row.type === "group" && row.id === groupId
  );
  if (!item || item.type !== "group") return [];
  return item.children;
}

export function AdminCategories() {
  const { reloadCustomCategories } = useShop();
  const [descriptions, setDescriptions] = useState<
    Partial<Record<ProductCategory, string>>
  >({});
  const [listings, setListings] = useState<Partial<Record<ExtraListingId, string>>>(
    {}
  );
  const [visible, setVisible] = useState<ProductCategory[]>([]);
  const [custom, setCustom] = useState<CustomShopCategory[]>([]);
  const [newNames, setNewNames] = useState<Record<string, string>>({});
  const [newDescs, setNewDescs] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingGroup, setAddingGroup] = useState<string | null>(null);
  const [savingCustomId, setSavingCustomId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/custom-categories", { credentials: "same-origin" }).then((r) =>
        r.json()
      ),
    ])
      .then(([data, rows]: [ShopSettings, CustomShopCategory[]]) => {
        setDescriptions(data.categoryDescriptions ?? {});
        setListings(data.listingDescriptions ?? {});
        setVisible(
          normalizeVisibleProductCategories(data.visibleProductCategories)
        );
        setCustom(Array.isArray(rows) ? rows : []);
        setLoaded(true);
      })
      .catch(() => {
        setError("Nie udało się wczytać opisów.");
        setLoaded(true);
      });
  }, []);

  const ordered = useMemo(() => {
    const shown = new Set(visible);
    return [
      ...productCategories.filter((slug) => shown.has(slug)),
      ...productCategories.filter((slug) => !shown.has(slug)),
    ];
  }, [visible]);

  function setDescription(slug: ProductCategory, value: string) {
    setDescriptions((current) => ({ ...current, [slug]: value }));
  }

  function setListing(slug: ExtraListingId, value: string) {
    setListings((current) => ({ ...current, [slug]: value }));
  }

  function patchCustom(id: string, patch: Partial<CustomShopCategory>) {
    setCustom((rows) =>
      rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
  }

  async function addSubcategory(parentGroup: CategoryNavGroupId) {
    const name = (newNames[parentGroup] ?? "").trim();
    if (!name) {
      setError("Podaj nazwę podkategorii.");
      return;
    }
    setAddingGroup(parentGroup);
    setError("");
    const res = await fetch("/api/custom-categories", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: newDescs[parentGroup] ?? "",
        parentGroup,
      }),
    });
    setAddingGroup(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Nie udało się dodać podkategorii.");
      return;
    }
    const created = (await res.json()) as CustomShopCategory;
    setCustom((rows) => [...rows, created]);
    setNewNames((current) => ({ ...current, [parentGroup]: "" }));
    setNewDescs((current) => ({ ...current, [parentGroup]: "" }));
    reloadCustomCategories();
  }

  async function saveCustom(row: CustomShopCategory) {
    setSavingCustomId(row.id);
    setError("");
    const res = await fetch(`/api/custom-categories/${row.id}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: row.name,
        description: row.description,
        visible: row.visible,
        parentGroup: row.parentGroup,
      }),
    });
    setSavingCustomId(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Nie udało się zapisać podkategorii.");
      return;
    }
    const updated = (await res.json()) as CustomShopCategory;
    setCustom((rows) => rows.map((item) => (item.id === updated.id ? updated : item)));
    reloadCustomCategories();
  }

  async function removeCustom(row: CustomShopCategory) {
    if (
      !window.confirm(
        `Usunąć „${row.name}” z menu? Produkty w tej kategorii trzeba najpierw przenieść.`
      )
    ) {
      return;
    }
    setSavingCustomId(row.id);
    setError("");
    const res = await fetch(`/api/custom-categories/${row.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    setSavingCustomId(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Nie udało się usunąć podkategorii.");
      return;
    }
    setCustom((rows) => rows.filter((item) => item.id !== row.id));
    reloadCustomCategories();
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        categoryDescriptions: descriptions,
        listingDescriptions: listings,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
      return;
    }
    const updated = (await res.json()) as ShopSettings;
    setDescriptions(updated.categoryDescriptions ?? {});
    setListings(updated.listingDescriptions ?? {});
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!loaded) {
    return (
      <>
        <AdminHeader title="Kategorie" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Kategorie" />
      <div className="admin-page">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-sm leading-relaxed text-sand">
            W każdej głównej grupie menu możesz dodać własną podkategorię — ta sama
            strona listingu co Sofy czy Szafy. Wpisz nazwę i opis, a pozycja wpadnie
            do rozwijanego menu. Meble przypisujesz w{" "}
            <Link href="/admin/produkty" className="underline underline-offset-2">
              Produktach
            </Link>
            . Widoczność wbudowanych kategorii włączasz w{" "}
            <Link href="/admin/ustawienia" className="underline underline-offset-2">
              Ustawieniach
            </Link>
            .
          </p>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {CATEGORY_NAV_GROUPS.map((group) => {
            const builtins = builtinLinksForGroup(group.id);
            const children = custom.filter((row) => row.parentGroup === group.id);
            return (
              <section
                key={group.id}
                className="space-y-4 rounded-xl border border-taupe/30 bg-white p-5 sm:p-6"
              >
                <div>
                  <h2 className="text-sm font-medium text-charcoal">{group.label}</h2>
                  <p className="mt-0.5 text-xs text-sand">
                    {group.id === "bathroom"
                      ? "Na razie pusta — pojawi się w menu sklepu po pierwszej podkategorii."
                      : "Podkategorie w rozwijanym menu tej grupy."}
                  </p>
                  {builtins.length > 0 ? (
                    <p className="mt-2 text-xs text-sand">
                      Już w menu:{" "}
                      {builtins.map((item) => item.label).join(", ")}
                    </p>
                  ) : null}
                </div>

                {children.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-lg border border-taupe/25 bg-cream-light/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <label className="min-w-0 flex-1 text-xs font-medium text-charcoal">
                        Nazwa
                        <input
                          value={row.name}
                          onChange={(e) =>
                            patchCustom(row.id, { name: e.target.value })
                          }
                          className={inputClass}
                        />
                      </label>
                      {row.visible ? (
                        <Link
                          href={`/kategoria/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 inline-flex items-center gap-1 text-xs font-medium text-charcoal/70 hover:text-charcoal"
                        >
                          Zobacz stronę
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      ) : null}
                    </div>
                    <label className="mt-3 block text-xs font-medium text-charcoal">
                      Opis na stronie kategorii
                      <textarea
                        rows={3}
                        maxLength={CATEGORY_DESC_MAX}
                        value={row.description}
                        onChange={(e) =>
                          patchCustom(row.id, { description: e.target.value })
                        }
                        placeholder={`${row.name} z oferty Wrohaus — polska produkcja.`}
                        className={inputClass}
                      />
                    </label>
                    <span className="mt-1 block text-right text-[11px] text-sand">
                      {row.description.trim().length}/{CATEGORY_DESC_MAX}
                    </span>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-charcoal">
                        <input
                          type="checkbox"
                          checked={row.visible}
                          onChange={(e) =>
                            patchCustom(row.id, { visible: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-taupe/50 text-charcoal focus:ring-charcoal"
                        />
                        Pokazuj w menu
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={savingCustomId === row.id}
                          onClick={() => saveCustom(row)}
                          className="rounded-lg bg-charcoal px-4 py-2 text-xs font-medium text-cream disabled:opacity-50"
                        >
                          {savingCustomId === row.id ? "Zapisywanie..." : "Zapisz"}
                        </button>
                        <button
                          type="button"
                          disabled={savingCustomId === row.id}
                          onClick={() => removeCustom(row)}
                          className="inline-flex items-center gap-1 rounded-lg border border-taupe/40 px-3 py-2 text-xs font-medium text-charcoal hover:bg-white disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg border border-dashed border-taupe/40 p-4">
                  <p className="text-xs font-medium tracking-[0.12em] text-sand uppercase">
                    Nowa podkategoria
                  </p>
                  <label className="mt-3 block text-xs font-medium text-charcoal">
                    Nazwa
                    <input
                      value={newNames[group.id] ?? ""}
                      onChange={(e) =>
                        setNewNames((current) => ({
                          ...current,
                          [group.id]: e.target.value,
                        }))
                      }
                      placeholder="np. Szafki łazienkowe"
                      className={inputClass}
                    />
                  </label>
                  <label className="mt-3 block text-xs font-medium text-charcoal">
                    Opis
                    <textarea
                      rows={3}
                      maxLength={CATEGORY_DESC_MAX}
                      value={newDescs[group.id] ?? ""}
                      onChange={(e) =>
                        setNewDescs((current) => ({
                          ...current,
                          [group.id]: e.target.value,
                        }))
                      }
                      placeholder="Krótki tekst na górze strony kategorii i w Google."
                      className={inputClass}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={addingGroup === group.id}
                    onClick={() => addSubcategory(group.id)}
                    className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {addingGroup === group.id ? "Dodawanie..." : "Dodaj podkategorię"}
                  </button>
                </div>
              </section>
            );
          })}

          <form onSubmit={handleSave} className="space-y-6">
            <p className="text-sm leading-relaxed text-sand">
              Opisy wbudowanych stron. Puste pole = domyślny tekst. Nie wklejaj HTML —
              zwykły tekst. Promocje, meble od ręki, meble do 7 dni i próbki tkanin nie
              są kategoriami produktów — tu tylko ich opisy.
            </p>

            {extraListingIds.map((slug) => {
              const value = listings[slug] ?? "";
              return (
                <section
                  key={slug}
                  className="rounded-xl border border-taupe/30 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-charcoal">
                        {extraListingLabels[slug]}
                      </h3>
                      <p className="mt-0.5 text-xs text-sand">
                        Osobna strona w menu — nie kategoria mebli.
                      </p>
                    </div>
                    <Link
                      href={extraListingHrefs[slug]}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/70 hover:text-charcoal"
                    >
                      Zobacz stronę
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={CATEGORY_DESC_MAX}
                    value={value}
                    onChange={(e) => setListing(slug, e.target.value)}
                    placeholder={extraListingIntros[slug]}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-right text-[11px] text-sand">
                    {value.trim().length}/{CATEGORY_DESC_MAX}
                  </span>
                </section>
              );
            })}

            {ordered.map((slug) => {
              const value = descriptions[slug] ?? "";
              const hidden = !visible.includes(slug);
              return (
                <section
                  key={slug}
                  className="rounded-xl border border-taupe/30 bg-white p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium text-charcoal">
                        {categoryLabels[slug]}
                      </h3>
                      {hidden ? (
                        <p className="mt-0.5 text-xs text-sand">
                          Wyłączona w sklepie — opis zostaje na później.
                        </p>
                      ) : null}
                    </div>
                    {!hidden ? (
                      <Link
                        href={`/kategoria/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-charcoal/70 hover:text-charcoal"
                      >
                        Zobacz stronę
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                  </div>
                  <textarea
                    rows={3}
                    maxLength={CATEGORY_DESC_MAX}
                    value={value}
                    onChange={(e) => setDescription(slug, e.target.value)}
                    placeholder={categoryIntros[slug]}
                    className={inputClass}
                  />
                  <span className="mt-1 block text-right text-[11px] text-sand">
                    {value.trim().length}/{CATEGORY_DESC_MAX}
                  </span>
                </section>
              );
            })}

            <button
              type="submit"
              disabled={saving}
              className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz opisy"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
