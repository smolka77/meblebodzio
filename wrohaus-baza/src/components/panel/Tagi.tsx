"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import {
  DEFAULT_PRODUCT_TAGS,
  mergeProductTags,
  sanitizeHexColor,
  tagInlineStyle,
  type ProductTagDefinition,
  type ProductTagGroup,
  type ProductTagId,
  type ProductTagsConfig,
} from "@/lib/tagi";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-3 py-2 text-sm focus:border-charcoal focus:outline-none";

const groupMeta: Record<ProductTagGroup, { title: string; description: string }> = {
  status: {
    title: "Statusy produktu",
    description: "Nowość, od ręki, promocja i wyprzedane — na kartach i stronie produktu.",
  },
  line: {
    title: "Linie produktowe",
    description: "Smart, Comfort, Premium — obok nazwy produktu w katalogu i na stronie szczegółów.",
  },
};

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const safe = sanitizeHexColor(value, fallback);
  return (
    <div>
      <label className="text-xs text-sand uppercase">{label}</label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-lg border border-taupe/30 bg-white p-0.5"
          aria-label={label}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => onChange(sanitizeHexColor(value, fallback))}
          className={inputClass}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

function TagEditor({
  tag,
  defaultTag,
  onChange,
  onReset,
}: {
  tag: ProductTagDefinition;
  defaultTag: ProductTagDefinition;
  onChange: (patch: Partial<ProductTagDefinition>) => void;
  onReset: () => void;
}) {
  return (
    <article className="rounded-2xl border border-taupe/25 bg-white p-5 shadow-[0_10px_30px_-24px_rgba(17,17,17,0.35)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-sm font-medium text-charcoal">{tag.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-sand">{tag.hint}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Tło"
              value={tag.backgroundColor}
              fallback={defaultTag.backgroundColor}
              onChange={(backgroundColor) => onChange({ backgroundColor })}
            />
            <ColorField
              label="Tekst"
              value={tag.textColor}
              fallback={defaultTag.textColor}
              onChange={(textColor) => onChange({ textColor })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Obwódka (opcjonalnie)"
              value={tag.borderColor ?? ""}
              fallback={defaultTag.borderColor ?? defaultTag.backgroundColor}
              onChange={(borderColor) => onChange({ borderColor })}
            />
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={tag.uppercase}
                  onChange={(e) => onChange({ uppercase: e.target.checked })}
                  className="rounded border-taupe/40"
                />
                Wielkie litery (uppercase)
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs text-sand transition-colors hover:text-charcoal"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Przywróć domyślne kolory
          </button>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 rounded-xl bg-cream-light/80 px-5 py-4">
          <p className="text-[10px] tracking-[0.14em] text-sand uppercase">Podgląd</p>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-[0.07em] ${tag.uppercase ? "uppercase" : ""}`}
            style={tagInlineStyle(tag)}
          >
            {tag.name}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-bold tracking-tight ${tag.uppercase ? "uppercase" : ""}`}
            style={tagInlineStyle(tag)}
          >
            {tag.name}
          </span>
        </div>
      </div>
    </article>
  );
}

export function AdminTags() {
  const [config, setConfig] = useState<ProductTagsConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.json())
      .then((data) => setConfig(mergeProductTags(data)))
      .catch(() => setConfig(DEFAULT_PRODUCT_TAGS));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/tags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Nie udało się zapisać tagów.");
      return;
    }
    const updated = await res.json();
    setConfig(mergeProductTags(updated));
    window.dispatchEvent(new Event("sofelio:tags-updated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateTag(id: ProductTagId, patch: Partial<ProductTagDefinition>) {
    setConfig((prev) => {
      if (!prev) return prev;
      return {
        tags: prev.tags.map((tag) => (tag.id === id ? { ...tag, ...patch } : tag)),
      };
    });
  }

  function resetTag(id: ProductTagId) {
    const fallback = DEFAULT_PRODUCT_TAGS.tags.find((tag) => tag.id === id);
    if (!fallback) return;
    updateTag(id, {
      backgroundColor: fallback.backgroundColor,
      textColor: fallback.textColor,
      borderColor: fallback.borderColor,
      uppercase: fallback.uppercase,
    });
  }

  if (!config) {
    return (
      <>
        <AdminHeader title="Tagi produktów" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  const defaults = Object.fromEntries(
    DEFAULT_PRODUCT_TAGS.tags.map((tag) => [tag.id, tag])
  ) as Record<ProductTagId, ProductTagDefinition>;

  return (
    <>
      <AdminHeader title="Tagi produktów" />
      <div className="admin-page">
        <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-8">
          <section className="overflow-hidden rounded-2xl border border-charcoal/10 bg-charcoal p-6 text-cream sm:p-8">
            <p className="text-xs tracking-[0.16em] text-cream/60 uppercase">Podgląd na żywo</p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-cream/75">
              Tak wyglądają wszystkie tagi na sklepie po zapisaniu zmian.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {config.tags.map((tag) => (
                <span
                  key={tag.id}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-[12px] font-semibold tracking-[0.06em] ${tag.uppercase ? "uppercase" : ""}`}
                  style={tagInlineStyle(tag)}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </section>

          {(["status", "line"] as ProductTagGroup[]).map((group) => (
            <section key={group} className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-charcoal">{groupMeta[group].title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-sand">
                  {groupMeta[group].description}
                </p>
              </div>
              <div className="space-y-4">
                {config.tags
                  .filter((tag) => tag.group === group)
                  .map((tag) => (
                    <TagEditor
                      key={tag.id}
                      tag={tag}
                      defaultTag={defaults[tag.id]}
                      onChange={(patch) => updateTag(tag.id, patch)}
                      onReset={() => resetTag(tag.id)}
                    />
                  ))}
              </div>
            </section>
          ))}

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
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz tagi"}
          </button>
        </form>
      </div>
    </>
  );
}
