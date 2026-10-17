"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, ExternalLink, X } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import type { FaqCategory, FaqItem } from "@/lib/typy";
import {
  panelInputClass,
  panelLabelClass,
} from "@/components/panel/typografiaPanelu";

type Draft = {
  itemId?: string;
  categoryTitle: string;
  newCategory: string;
  question: string;
  answer: string;
};

const emptyDraft = (categoryTitle = "__new__"): Draft => ({
  categoryTitle,
  newCategory: "",
  question: "",
  answer: "",
});

export function AdminFaq() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const load = useCallback(() => {
    fetch("/api/faq", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data: FaqCategory[]) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryOptions = useMemo(
    () => categories.map((category) => category.title),
    [categories]
  );
  const totalItems = categories.reduce((sum, category) => sum + category.items.length, 0);

  function resolvedCategory(next: Draft): string {
    return next.categoryTitle === "__new__"
      ? next.newCategory.trim()
      : next.categoryTitle.trim();
  }

  async function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setError("");
    const categoryTitle = resolvedCategory(draft);
    if (!categoryTitle || !draft.question.trim() || !draft.answer.trim()) {
      setError("Wypełnij kategorię, pytanie i odpowiedź");
      return;
    }

    setSaving(true);
    const editing = Boolean(draft.itemId);
    const res = await fetch(editing ? `/api/faq/${draft.itemId}` : "/api/faq", {
      method: editing ? "PUT" : "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        categoryTitle,
        question: draft.question.trim(),
        answer: draft.answer.trim(),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? (editing ? "Nie udało się zapisać pytania" : "Nie udało się dodać pytania"));
      return;
    }

    setDraft(null);
    load();
  }

  async function handleDelete(itemId: string, itemQuestion: string) {
    if (!confirm(`Usunąć pytanie „${itemQuestion}”?`)) return;
    await fetch(`/api/faq/${itemId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (draft?.itemId === itemId) setDraft(null);
    load();
  }

  async function saveCategoryName(categoryId: string) {
    const title = renameTitle.trim();
    if (!title) {
      setError("Podaj nazwę kategorii");
      return;
    }
    const res = await fetch(`/api/faq/categories/${categoryId}`, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się zmienić nazwy kategorii");
      return;
    }
    setRenamingId(null);
    setError("");
    load();
  }

  async function handleDeleteCategory(category: FaqCategory) {
    const ok = confirm(
      category.items.length
        ? `Usunąć kategorię „${category.title}” i ${category.items.length} pytań?`
        : `Usunąć kategorię „${category.title}”?`
    );
    if (!ok) return;
    await fetch(`/api/faq/categories/${category.id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (draft && resolvedCategory(draft) === category.title) setDraft(null);
    load();
  }

  function openCreate() {
    setError("");
    setDraft(emptyDraft(categoryOptions[0] ?? "__new__"));
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  function openEdit(category: FaqCategory, item: FaqItem) {
    setError("");
    setDraft({
      itemId: item.id,
      categoryTitle: category.title,
      newCategory: "",
      question: item.question,
      answer: item.answer,
    });
    window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  return (
    <>
      <AdminHeader title="FAQ" />
      <div className="admin-page">
        <p className="mb-5 max-w-2xl text-sm leading-relaxed text-sand">
          To FAQ ze strony /faq — nie pytania przy konkretnym meblu. Edytuj treść,
          przenieś pytanie do innej kategorii albo zmień nazwę działu.
        </p>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">Kategorie</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {categories.length}
              </p>
            </div>
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">Pytania</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {totalItems}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/faq"
              target="_blank"
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm text-charcoal active:bg-cream-light"
            >
              <ExternalLink className="h-4 w-4" />
              Podgląd strony
            </Link>
            <button
              type="button"
              onClick={openCreate}
              className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream transition-colors active:scale-[0.98] hover:bg-charcoal/85"
            >
              <Plus className="h-4 w-4" />
              Dodaj pytanie
            </button>
          </div>
        </div>

        {draft && (
          <form
            ref={formRef}
            onSubmit={saveDraft}
            className="mb-8 rounded-xl border border-taupe/30 bg-white p-5 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-lg text-charcoal">
                {draft.itemId ? "Edytuj pytanie" : "Nowe pytanie FAQ"}
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-sand hover:bg-cream-light hover:text-charcoal"
                aria-label="Zamknij"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-4 space-y-4">
              <div>
                <label className={panelLabelClass}>Kategoria</label>
                <select
                  value={draft.categoryTitle}
                  onChange={(e) =>
                    setDraft({ ...draft, categoryTitle: e.target.value })
                  }
                  className={panelInputClass}
                >
                  {categoryOptions.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                  <option value="__new__">+ Nowa kategoria</option>
                </select>
              </div>
              {draft.categoryTitle === "__new__" && (
                <div>
                  <label className={panelLabelClass}>Nazwa kategorii</label>
                  <input
                    type="text"
                    value={draft.newCategory}
                    onChange={(e) =>
                      setDraft({ ...draft, newCategory: e.target.value })
                    }
                    placeholder="np. Montaż"
                    className={panelInputClass}
                  />
                </div>
              )}
              <div>
                <label className={panelLabelClass}>Pytanie</label>
                <input
                  type="text"
                  value={draft.question}
                  onChange={(e) =>
                    setDraft({ ...draft, question: e.target.value })
                  }
                  required
                  className={panelInputClass}
                />
              </div>
              <div>
                <label className={panelLabelClass}>Odpowiedź</label>
                <textarea
                  value={draft.answer}
                  onChange={(e) =>
                    setDraft({ ...draft, answer: e.target.value })
                  }
                  required
                  rows={5}
                  className={`${panelInputClass} resize-y`}
                />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="min-h-[44px] rounded-lg border border-taupe/30 px-4 py-2 text-sm text-charcoal active:bg-cream-light"
              >
                Anuluj
              </button>
              <button
                type="submit"
                disabled={saving}
                className="min-h-[44px] rounded-lg bg-charcoal px-5 py-2 text-sm text-cream disabled:opacity-60"
              >
                {saving ? "Zapisywanie…" : draft.itemId ? "Zapisz zmiany" : "Dodaj"}
              </button>
            </div>
          </form>
        )}

        {categories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-taupe/40 bg-white p-10 text-center">
            <p className="text-sm text-sand">Brak pytań w FAQ.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 text-sm text-charcoal underline"
            >
              Dodaj pierwsze pytanie
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <section key={category.id}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {renamingId === category.id ? (
                    <>
                      <input
                        value={renameTitle}
                        onChange={(e) => setRenameTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void saveCategoryName(category.id);
                          }
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        className="min-w-[180px] flex-1 rounded-lg border border-taupe/30 px-3 py-2 font-serif text-xl text-charcoal focus:border-charcoal focus:outline-none sm:max-w-sm"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => void saveCategoryName(category.id)}
                        className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
                      >
                        Zapisz
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="rounded-lg border border-taupe/30 px-3 py-2 text-sm text-charcoal"
                      >
                        Anuluj
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="font-serif text-xl text-charcoal">
                        {category.title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(category.id);
                          setRenameTitle(category.title);
                          setError("");
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sand hover:bg-cream-light hover:text-charcoal"
                        aria-label={`Zmień nazwę kategorii ${category.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCategory(category)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sand hover:bg-red-50 hover:text-red-600"
                        aria-label={`Usuń kategorię ${category.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-taupe/30 bg-white p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-charcoal">
                            {item.question}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-sand">
                            {item.answer}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(category, item)}
                            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-taupe/30 text-charcoal active:bg-cream-light"
                            aria-label="Edytuj pytanie"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.question)}
                            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-red-200 text-red-600 active:bg-red-50"
                            aria-label="Usuń pytanie"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
