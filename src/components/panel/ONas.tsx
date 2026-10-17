"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { ImageDropzone } from "@/components/panel/StrefaZdjec";
import { SeoFields } from "@/components/panel/PolaSeo";
import {
  DEFAULT_ABOUT,
  emptyAboutMilestone,
  emptyAboutStat,
  emptyAboutValue,
  mergeAbout,
  type AboutContent,
  type AboutMilestone,
  type AboutStat,
  type AboutValue,
} from "@/lib/oNas";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

export function AdminAbout() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((data) => setContent(mergeAbout(data)))
      .catch(() => setContent(DEFAULT_ABOUT));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/about", {
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
    setContent(mergeAbout(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!content) {
    return (
      <>
        <AdminHeader title="O nas" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="O nas" />
      <div className="admin-page">
        <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <p className="text-sm text-sand">
            Cała treść zakładki „O nas”. Zapis po polsku — angielski, niemiecki i
            ukraiński tłumaczą się automatycznie z aktualnego tekstu. Dane
            sprzedawcy (NIP, siedziba, e-mail) zostają z ustawień firmy — tu ich
            nie zmieniasz.
          </p>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Widoczność</h3>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={content.archived}
                onChange={(e) =>
                  setContent({ ...content, archived: e.target.checked })
                }
              />
              <span>
                Zarchiwizuj stronę „O nas”
                <span className="mt-0.5 block text-xs text-sand">
                  Strona znika ze sklepu (stopka i link z manufaktury). Treść
                  zostaje — możesz ją później odarchiwizować.
                </span>
              </span>
            </label>
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Google / SEO</h3>
            <SeoFields
              title={content.metaTitle}
              description={content.metaDescription}
              onTitle={(metaTitle) => setContent({ ...content, metaTitle })}
              onDescription={(metaDescription) =>
                setContent({ ...content, metaDescription })
              }
              hint="Tytuł i opis strony „O nas” w Google. Puste pola nie są tu dozwolone — te teksty zawsze idą do wyszukiwarki."
            />
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Nagłówek</h3>
              <p className="mt-1 text-xs text-sand">
                Duże zdjęcie i teksty na górze strony.
              </p>
            </div>
            <ImageDropzone
              label="Zdjęcie tła"
              folderHint="Zdjęcie w nagłówku strony O nas."
              value={content.hero.image}
              onChange={(image) =>
                setContent({ ...content, hero: { ...content.hero, image } })
              }
              uploadEndpoint="/api/products/upload"
              onError={setError}
            />
            <Field
              label="Nadtytuł"
              value={content.hero.eyebrow}
              onChange={(eyebrow) =>
                setContent({ ...content, hero: { ...content.hero, eyebrow } })
              }
            />
            <Field
              label="Nagłówek"
              value={content.hero.title}
              textarea
              onChange={(title) =>
                setContent({ ...content, hero: { ...content.hero, title } })
              }
            />
            <Field
              label="Opis"
              value={content.hero.description}
              textarea
              onChange={(description) =>
                setContent({
                  ...content,
                  hero: { ...content.hero, description },
                })
              }
            />
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Historia</h3>
              <p className="mt-1 text-xs text-sand">
                Zdjęcie z lewej i dwa akapity o marce.
              </p>
            </div>
            <ImageDropzone
              label="Zdjęcie sekcji"
              folderHint="Zdjęcie obok tekstu „Kim jesteśmy”."
              value={content.story.image}
              onChange={(image) =>
                setContent({ ...content, story: { ...content.story, image } })
              }
              uploadEndpoint="/api/products/upload"
              onError={setError}
            />
            <Field
              label="Opis zdjęcia (alt)"
              value={content.story.imageAlt}
              onChange={(imageAlt) =>
                setContent({
                  ...content,
                  story: { ...content.story, imageAlt },
                })
              }
            />
            <Field
              label="Nadtytuł"
              value={content.story.kicker}
              onChange={(kicker) =>
                setContent({ ...content, story: { ...content.story, kicker } })
              }
            />
            <Field
              label="Nagłówek"
              value={content.story.title}
              onChange={(title) =>
                setContent({ ...content, story: { ...content.story, title } })
              }
            />
            <Field
              label="Akapit 1"
              value={content.story.paragraph1}
              textarea
              onChange={(paragraph1) =>
                setContent({
                  ...content,
                  story: { ...content.story, paragraph1 },
                })
              }
            />
            <Field
              label="Akapit 2"
              value={content.story.paragraph2}
              textarea
              onChange={(paragraph2) =>
                setContent({
                  ...content,
                  story: { ...content.story, paragraph2 },
                })
              }
            />
          </section>

          <ListSection
            title="Liczby"
            hint="Trzy (lub więcej) statystyki pod historią."
            items={content.stats}
            onChange={(stats) => setContent({ ...content, stats })}
            onAdd={() => emptyAboutStat()}
            addLabel="Dodaj liczbę"
            renderItem={(item, update) => (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Wartość"
                  value={item.value}
                  onChange={(value) => update({ value })}
                />
                <Field
                  label="Podpis"
                  value={item.label}
                  onChange={(label) => update({ label })}
                />
              </div>
            )}
          />

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Wartości</h3>
              <p className="mt-1 text-xs text-sand">
                Kafelki „Co nas wyróżnia”.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nadtytuł"
                value={content.values.kicker}
                onChange={(kicker) =>
                  setContent({
                    ...content,
                    values: { ...content.values, kicker },
                  })
                }
              />
              <Field
                label="Tytuł sekcji"
                value={content.values.title}
                onChange={(title) =>
                  setContent({
                    ...content,
                    values: { ...content.values, title },
                  })
                }
              />
            </div>
            <ListEditor
              items={content.values.items}
              onChange={(items) =>
                setContent({
                  ...content,
                  values: { ...content.values, items },
                })
              }
              onAdd={() => {
                const n = String(content.values.items.length + 1).padStart(
                  2,
                  "0"
                );
                return { ...emptyAboutValue(), number: n };
              }}
              addLabel="Dodaj wartość"
              renderItem={(item, update) => (
                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Numer"
                      value={item.number}
                      onChange={(number) => update({ number })}
                    />
                    <Field
                      label="Tytuł"
                      value={item.title}
                      onChange={(title) => update({ title })}
                    />
                  </div>
                  <Field
                    label="Opis"
                    value={item.text}
                    textarea
                    onChange={(text) => update({ text })}
                  />
                </div>
              )}
            />
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Oś czasu</h3>
              <p className="mt-1 text-xs text-sand">Kolejne lata marki.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nadtytuł"
                value={content.timeline.kicker}
                onChange={(kicker) =>
                  setContent({
                    ...content,
                    timeline: { ...content.timeline, kicker },
                  })
                }
              />
              <Field
                label="Tytuł sekcji"
                value={content.timeline.title}
                onChange={(title) =>
                  setContent({
                    ...content,
                    timeline: { ...content.timeline, title },
                  })
                }
              />
            </div>
            <ListEditor
              items={content.timeline.items}
              onChange={(items) =>
                setContent({
                  ...content,
                  timeline: { ...content.timeline, items },
                })
              }
              onAdd={() => emptyAboutMilestone()}
              addLabel="Dodaj rok"
              renderItem={(item, update) => (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Rok"
                    value={item.year}
                    onChange={(year) => update({ year })}
                  />
                  <Field
                    label="Wydarzenie"
                    value={item.event}
                    textarea
                    onChange={(event) => update({ event })}
                  />
                </div>
              )}
            />
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Wezwanie na dole</h3>
            <Field
              label="Nagłówek"
              value={content.cta.title}
              onChange={(title) =>
                setContent({ ...content, cta: { ...content.cta, title } })
              }
            />
            <Field
              label="Opis"
              value={content.cta.text}
              textarea
              onChange={(text) =>
                setContent({ ...content, cta: { ...content.cta, text } })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Przycisk"
                value={content.cta.buttonLabel}
                onChange={(buttonLabel) =>
                  setContent({
                    ...content,
                    cta: { ...content.cta, buttonLabel },
                  })
                }
              />
              <Field
                label="Link przycisku"
                value={content.cta.buttonHref}
                onChange={(buttonHref) =>
                  setContent({
                    ...content,
                    cta: { ...content.cta, buttonHref },
                  })
                }
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz stronę O nas"}
          </button>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-sand uppercase">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}

function ListSection<T extends AboutStat>({
  title,
  hint,
  items,
  onChange,
  onAdd,
  addLabel,
  renderItem,
}: {
  title: string;
  hint: string;
  items: T[];
  onChange: (items: T[]) => void;
  onAdd: () => T;
  addLabel: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
      <div>
        <h3 className="text-sm font-medium text-charcoal">{title}</h3>
        <p className="mt-1 text-xs text-sand">{hint}</p>
      </div>
      <ListEditor
        items={items}
        onChange={onChange}
        onAdd={onAdd}
        addLabel={addLabel}
        renderItem={renderItem}
      />
    </section>
  );
}

function ListEditor<T extends AboutStat | AboutValue | AboutMilestone>({
  items,
  onChange,
  onAdd,
  addLabel,
  renderItem,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  onAdd: () => T;
  addLabel: string;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="space-y-3 rounded-lg border border-taupe/30 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
              {index + 1}
            </p>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="p-1.5 text-sand hover:text-red-600"
              aria-label="Usuń"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {renderItem(item, (patch) =>
            onChange(
              items.map((current, i) =>
                i === index ? { ...current, ...patch } : current
              )
            )
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, onAdd()])}
        className="inline-flex items-center gap-2 text-sm text-charcoal"
      >
        <Plus className="h-4 w-4" /> {addLabel}
      </button>
    </div>
  );
}
