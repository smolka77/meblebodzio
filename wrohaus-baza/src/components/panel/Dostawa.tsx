"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { DeliveryMethodIcon } from "@/components/dostawa/IkonaMetodyDostawy";
import {
  DELIVERY_ICONS,
  DEFAULT_DELIVERY,
  emptyDeliveryMethod,
  emptyDeliveryStep,
  mergeDelivery,
  type DeliveryContent,
  type DeliveryMethod,
  type DeliveryStep,
} from "@/lib/dostawa";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

function reorder<T extends { sortOrder: number }>(items: T[]): T[] {
  return items.map((item, index) => ({ ...item, sortOrder: index }));
}

export function AdminDelivery() {
  const [content, setContent] = useState<DeliveryContent | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/delivery")
      .then((r) => r.json())
      .then((data) => setContent(mergeDelivery(data)))
      .catch(() => setContent(DEFAULT_DELIVERY));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/delivery", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
      return;
    }
    const updated = await res.json();
    setContent(mergeDelivery(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateMethod(id: string, patch: Partial<DeliveryMethod>) {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        methods: prev.methods.map((method) =>
          method.id === id ? { ...method, ...patch } : method
        ),
      };
    });
  }

  function removeMethod(id: string) {
    if (!confirm("Usunąć tę metodę dostawy?")) return;
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        methods: reorder(prev.methods.filter((method) => method.id !== id)),
      };
    });
  }

  function moveMethod(id: string, direction: -1 | 1) {
    setContent((prev) => {
      if (!prev) return prev;
      const index = prev.methods.findIndex((method) => method.id === id);
      if (index < 0) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.methods.length) return prev;
      const methods = [...prev.methods];
      [methods[index], methods[nextIndex]] = [methods[nextIndex], methods[index]];
      return { ...prev, methods: reorder(methods) };
    });
  }

  function updateStep(id: string, patch: Partial<DeliveryStep>) {
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map((step) =>
          step.id === id ? { ...step, ...patch } : step
        ),
      };
    });
  }

  function removeStep(id: string) {
    if (!confirm("Usunąć ten krok procesu?")) return;
    setContent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: reorder(prev.steps.filter((step) => step.id !== id)),
      };
    });
  }

  function moveStep(id: string, direction: -1 | 1) {
    setContent((prev) => {
      if (!prev) return prev;
      const index = prev.steps.findIndex((step) => step.id === id);
      if (index < 0) return prev;
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.steps.length) return prev;
      const steps = [...prev.steps];
      [steps[index], steps[nextIndex]] = [steps[nextIndex], steps[index]];
      return { ...prev, steps: reorder(steps) };
    });
  }

  if (!content) {
    return (
      <>
        <AdminHeader title="Dostawa" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  const activeMethods = content.methods.filter((method) => !method.archived).length;

  return (
    <>
      <AdminHeader title="Dostawa" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">Metody aktywne</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {activeMethods}
              </p>
            </div>
            <div className="rounded-xl border border-taupe/30 bg-white p-4">
              <p className="text-xs text-sand uppercase">W archiwum</p>
              <p className="mt-1 text-xl font-semibold text-charcoal sm:text-2xl">
                {content.methods.length - activeMethods}
              </p>
            </div>
          </div>
          <Link
            href="/dostawa"
            target="_blank"
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm text-charcoal active:bg-cream-light"
          >
            <ExternalLink className="h-4 w-4" />
            Podgląd strony
          </Link>
        </div>

        <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Sekcja metod</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-sand uppercase">Nadtytuł</label>
                <input
                  type="text"
                  value={content.methodsSection.kicker}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      methodsSection: {
                        ...content.methodsSection,
                        kicker: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Tytuł</label>
                <input
                  type="text"
                  value={content.methodsSection.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      methodsSection: {
                        ...content.methodsSection,
                        title: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <h4 className="text-sm font-medium text-charcoal">Metody dostawy</h4>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    methods: [
                      ...content.methods,
                      emptyDeliveryMethod(content.methods.length),
                    ],
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal transition-colors hover:bg-cream"
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj metodę
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {content.methods.length === 0 ? (
                <p className="rounded-lg border border-dashed border-taupe/30 px-4 py-8 text-center text-sm text-sand">
                  Brak metod dostawy.
                </p>
              ) : (
                content.methods.map((method, index) => (
                  <div
                    key={method.id}
                    className={`rounded-lg border p-4 ${
                      method.archived
                        ? "border-taupe/20 bg-cream/20 opacity-80"
                        : "border-taupe/20 bg-cream/30"
                    }`}
                  >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 bg-white text-charcoal">
                          <DeliveryMethodIcon icon={method.icon} className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-charcoal">
                            {method.title || `Metoda ${index + 1}`}
                          </p>
                          <p className="text-xs text-sand">
                            {method.archived ? "Zarchiwizowana" : "Aktywna"}
                            {method.highlight ? " · Polecana" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moveMethod(method.id, -1)}
                          disabled={index === 0}
                          className="rounded-lg border border-taupe/30 p-2 text-sand disabled:opacity-30"
                          aria-label="Przenieś wyżej"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveMethod(method.id, 1)}
                          disabled={index === content.methods.length - 1}
                          className="rounded-lg border border-taupe/30 p-2 text-sand disabled:opacity-30"
                          aria-label="Przenieś niżej"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateMethod(method.id, { archived: !method.archived })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal hover:bg-white"
                        >
                          {method.archived ? (
                            <>
                              <ArchiveRestore className="h-3.5 w-3.5" />
                              Przywróć
                            </>
                          ) : (
                            <>
                              <Archive className="h-3.5 w-3.5" />
                              Archiwizuj
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeMethod(method.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Usuń
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-sand uppercase">Nazwa</label>
                        <input
                          type="text"
                          value={method.title}
                          onChange={(e) =>
                            updateMethod(method.id, { title: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-sand uppercase">Cena / etykieta</label>
                        <input
                          type="text"
                          value={method.priceLabel}
                          onChange={(e) =>
                            updateMethod(method.id, { priceLabel: e.target.value })
                          }
                          placeholder="np. od 249 zł"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-xs text-sand uppercase">Ikona</label>
                        <select
                          value={method.icon}
                          onChange={(e) =>
                            updateMethod(method.id, {
                              icon: e.target.value as DeliveryMethod["icon"],
                            })
                          }
                          className={inputClass}
                        >
                          {DELIVERY_ICONS.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm text-charcoal">
                          <input
                            type="checkbox"
                            checked={Boolean(method.highlight)}
                            onChange={(e) =>
                              updateMethod(method.id, { highlight: e.target.checked })
                            }
                            className="rounded border-taupe/40"
                          />
                          Oznacz jako polecane
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-sand uppercase">Opis</label>
                      <textarea
                        value={method.description}
                        onChange={(e) =>
                          updateMethod(method.id, { description: e.target.value })
                        }
                        rows={3}
                        className={inputClass}
                      />
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-xs text-sand uppercase">Cechy / punkty</label>
                        <button
                          type="button"
                          onClick={() =>
                            updateMethod(method.id, {
                              features: [...method.features, ""],
                            })
                          }
                          className="text-xs text-charcoal underline underline-offset-2"
                        >
                          Dodaj punkt
                        </button>
                      </div>
                      <div className="mt-2 space-y-2">
                        {method.features.map((feature, featureIndex) => (
                          <div key={`${method.id}-feature-${featureIndex}`} className="flex gap-2">
                            <input
                              type="text"
                              value={feature}
                              onChange={(e) => {
                                const features = [...method.features];
                                features[featureIndex] = e.target.value;
                                updateMethod(method.id, { features });
                              }}
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                updateMethod(method.id, {
                                  features: method.features.filter(
                                    (_, i) => i !== featureIndex
                                  ),
                                })
                              }
                              className="mt-1 rounded-lg border border-taupe/30 px-3 text-sand hover:text-red-600"
                              aria-label="Usuń punkt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Proces dostawy</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs text-sand uppercase">Nadtytuł</label>
                <input
                  type="text"
                  value={content.stepsSection.kicker}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      stepsSection: {
                        ...content.stepsSection,
                        kicker: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Tytuł</label>
                <input
                  type="text"
                  value={content.stepsSection.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      stepsSection: {
                        ...content.stepsSection,
                        title: e.target.value,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <h4 className="text-sm font-medium text-charcoal">Kroki</h4>
              <button
                type="button"
                onClick={() =>
                  setContent({
                    ...content,
                    steps: [...content.steps, emptyDeliveryStep(content.steps.length)],
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal transition-colors hover:bg-cream"
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj krok
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {content.steps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-lg border border-taupe/20 bg-cream/30 p-4"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-medium text-charcoal">
                      Krok {index + 1}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, -1)}
                        disabled={index === 0}
                        className="rounded-lg border border-taupe/30 p-2 text-sand disabled:opacity-30"
                        aria-label="Przenieś wyżej"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, 1)}
                        disabled={index === content.steps.length - 1}
                        className="rounded-lg border border-taupe/30 p-2 text-sand disabled:opacity-30"
                        aria-label="Przenieś niżej"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Usuń
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="text-xs text-sand uppercase">Numer</label>
                      <input
                        type="text"
                        value={step.step}
                        onChange={(e) => updateStep(step.id, { step: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs text-sand uppercase">Tytuł</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateStep(step.id, { title: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-sand uppercase">Opis</label>
                    <textarea
                      value={step.text}
                      onChange={(e) => updateStep(step.id, { text: e.target.value })}
                      rows={2}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz dostawę"}
          </button>
        </form>
      </div>
    </>
  );
}
