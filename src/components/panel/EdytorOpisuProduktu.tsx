"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, Eye, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import type {
  MattressLayer,
  ProductDetails,
  ProductDimension,
  ProductFaq,
  ProductHighlight,
  ProductSpec,
} from "@/lib/typy";
import {
  getProductTemplate,
  isToggleSpec,
  isVisibleSpecValue,
  templateFeatureList,
  type ProductTemplate,
  type TemplateField,
} from "@/lib/szablonyProduktu";
import {
  DESCRIPTION_MARKERS,
  DESCRIPTION_SNIPPETS,
  expandDescriptionMarkers,
  insertIntoText,
} from "@/lib/znacznikiOpisu";
import {
  DESCRIPTION_TEMPLATES,
  DIMENSION_PRESETS,
  FAQ_PRESETS,
  HIGHLIGHT_PRESETS,
  SPEC_PRESETS,
} from "@/lib/szablonyOpisu";
import {
  cloneTemplateDetails,
  listDescriptionTemplateOptions,
  type DescriptionTemplateDetails,
  type SavedDescriptionTemplate,
} from "@/lib/szablonyOpisuZapis";
import { withDefaultCm, withDimensionUnit, dimensionUnitForLabel } from "@/lib/wymiary";
import {
  HIGHLIGHT_ICONS,
  HighlightBullet,
  HighlightTitleRow,
  LIST_LINE_PREFIXES,
  LIST_LINE_RE,
  normalizeHighlightIcon,
  FormattedProductDescription,
  stripListPlaceholder,
  type HighlightIcon,
} from "@/lib/atutyOpisu";
import {
  panelChipLabelClass,
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";
import { BedDimensionImageField } from "@/components/panel/PolaWymiarowLozka";
import { dimensionChartForName } from "@/lib/wymiaryLozka";

function pickTemplateDetails(details: ProductDetails): DescriptionTemplateDetails {
  return cloneTemplateDetails({
    longDescription: details.longDescription,
    highlights: details.highlights,
    specs: details.specs,
    dimensions: details.dimensions,
    faq: details.faq,
  });
}

function mergeRows<T extends { label: string; value: string }>(current: T[], incoming: T[]): T[] {
  const rows = current.map((row) => ({ ...row }));
  for (const row of incoming) {
    const index = rows.findIndex(
      (item) => item.label.trim().toLowerCase() === row.label.trim().toLowerCase()
    );
    if (index === -1) rows.push({ ...row });
    else if (row.value.trim() && !rows[index].value.trim()) rows[index] = { ...rows[index], value: row.value };
  }
  return rows;
}

/** Szablon opisu nadpisuje tekst, wyróżniki i FAQ; wiersze wymiarów/spec. dopisuje. */
function applyTemplateDetails(
  details: DescriptionTemplateDetails,
  current: ProductDetails
): Partial<ProductDetails> {
  return {
    longDescription: details.longDescription,
    highlights: details.highlights.map((item) => ({ ...item })),
    specs: mergeRows(current.specs, details.specs),
    dimensions: mergeRows(current.dimensions, details.dimensions),
    faq: details.faq.map((item) => ({ ...item })),
  };
}

const LAYER_PRESETS = [
  "Pianka poliuretanowa",
  "Pianka T25",
  "Pianka T30",
  "Pianka wysokoelastyczna HR",
  "Pianka Memory / VISCO",
  "Pianka lateksowa",
  "Lateks",
  "Kokos",
  "Kokos lateksowany",
  "Filc",
  "Owata",
  "Wełna",
  "Hydrożel",
  "Sprężyny Pocket",
  "Sprężyny Multipocket",
  "Sprężyny Luxpocket",
  "Sprężyny Bonell",
];

const inputClass = panelInputClass;

function SectionCard({
  step,
  title,
  hint,
  children,
  defaultOpen = true,
}: {
  step: number;
  title: string;
  hint: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-taupe/25 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-cream-light/40"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-charcoal text-xs font-semibold text-cream">
          {step}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-charcoal">{title}</span>
          <span className={`mt-0.5 block ${panelHintClass}`}>{hint}</span>
        </span>
        <span className="text-xs font-semibold text-charcoal/70">{open ? "Zwiń" : "Rozwiń"}</span>
      </button>
      {open && <div className="space-y-4 border-t border-taupe/20 px-5 py-4">{children}</div>}
    </section>
  );
}

function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className={panelChipLabelClass}>{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-full border border-charcoal/10 bg-cream-light px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-charcoal/25 hover:bg-cream"
    >
      {children}
    </button>
  );
}

const DESCRIPTION_TEMPLATE_FOR_PRODUCT_TEMPLATE: Partial<Record<ProductTemplate["id"], string>> = {
  sofa: "builtin:sofa",
  naroznik: "builtin:naroznik",
  lozko: "builtin:lozko",
  "lozko-kontynentalne": "builtin:lozko",
  materac: "builtin:lozko",
};

export function ProductDescriptionEditor({
  details,
  onChange,
  shortDescription = "",
  productName = "",
  template: templateProp,
}: {
  details: ProductDetails;
  onChange: (patch: Partial<ProductDetails>) => void;
  shortDescription?: string;
  productName?: string;
  template?: ProductTemplate;
}) {
  const template = templateProp ?? getProductTemplate("ogolny");
  const longDescRef = useRef<HTMLTextAreaElement>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<SavedDescriptionTemplate[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState(
    DESCRIPTION_TEMPLATE_FOR_PRODUCT_TEMPLATE[template.id] ?? "builtin:pusty"
  );
  const [customFeature, setCustomFeature] = useState("");
  const features = details.features ?? [];
  const layers = details.layers ?? [];
  const templateFeatures = templateFeatureList(template);
  const extraFeatures = features.filter((item) => !templateFeatures.includes(item));
  const autoChartRef = useRef(false);

  useEffect(() => {
    if (template.category !== "lozka" || details.dimensionImage || autoChartRef.current) {
      return;
    }
    const match = dimensionChartForName(productName);
    if (!match) return;
    autoChartRef.current = true;
    onChange({ dimensionImage: match.src });
  }, [details.dimensionImage, onChange, productName, template.category]);

  function toggleFeature(name: string) {
    const next = features.includes(name)
      ? features.filter((item) => item !== name)
      : [...features, name];
    onChange({ features: next });
  }

  function addCustomFeature() {
    const name = customFeature.trim();
    if (!name) return;
    if (!features.includes(name)) onChange({ features: [...features, name] });
    setCustomFeature("");
  }

  function updateLayers(next: MattressLayer[]) {
    onChange({ layers: next });
  }

  function moveLayer(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= layers.length) return;
    const next = [...layers];
    [next[index], next[target]] = [next[target], next[index]];
    updateLayers(next);
  }
  const [templateLabel, setTemplateLabel] = useState("");
  const [templateHint, setTemplateHint] = useState("");
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [defaultHighlightIcon, setDefaultHighlightIcon] = useState<HighlightIcon>("dot");

  const templateOptions = listDescriptionTemplateOptions(customTemplates);
  const selectedTemplate = templateOptions.find((item) => item.id === selectedTemplateKey);
  const isCustomTemplate = selectedTemplate?.kind === "custom";

  useEffect(() => {
    fetch("/api/description-templates")
      .then((response) => response.json())
      .then((data: { custom?: SavedDescriptionTemplate[] }) => {
        setCustomTemplates(Array.isArray(data.custom) ? data.custom : []);
      })
      .catch(() => setCustomTemplates([]));
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;
    setTemplateLabel(selectedTemplate.label);
    setTemplateHint(selectedTemplate.hint);
  }, [selectedTemplateKey, customTemplates, selectedTemplate?.label, selectedTemplate?.hint]);

  function insertLongDescription(text: string, atLineStart = false) {
    const el = longDescRef.current;
    const current = details.longDescription;
    if (!el) {
      onChange({ longDescription: current ? `${current}\n\n${text}` : text });
      return;
    }

    let insertText = text;
    let start = el.selectionStart;
    let end = el.selectionEnd;

    if (atLineStart) {
      const lineStart = current.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
      const newlineAt = current.indexOf("\n", start);
      const lineEnd = newlineAt === -1 ? current.length : newlineAt;
      const line = current.slice(lineStart, lineEnd);
      const body = stripListPlaceholder(line.replace(LIST_LINE_RE, ""));
      insertText = `${text}${body}`;
      start = lineStart;
      end = lineEnd;
    } else if (current && !current.endsWith("\n") && start === current.length) {
      insertText = `\n\n${text}`;
    }

    const { value, cursor } = insertIntoText(current, insertText, start, end);
    onChange({ longDescription: value });
    const caret = atLineStart ? start + text.length : cursor;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(caret, caret);
    });
  }

  function applyTemplate() {
    if (!selectedTemplate) return;
    const replace = window.confirm(
      `Zastosować szablon „${selectedTemplate.label}”? Obecny opis, wyróżniki i FAQ zostaną zastąpione; wiersze wymiarów i specyfikacji zostaną dopisane.`
    );
    if (!replace) return;
    onChange(applyTemplateDetails(selectedTemplate.details, details));
  }

  async function saveTemplate(overwrite = false) {
    const label = templateLabel.trim();
    if (!label) {
      window.alert("Podaj nazwę szablonu.");
      return;
    }

    setSavingTemplate(true);
    try {
      const response = await fetch("/api/description-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: overwrite && isCustomTemplate ? selectedTemplate?.id : undefined,
          label,
          hint: templateHint.trim() || "Własny szablon opisu produktu",
          details: pickTemplateDetails(details),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Nie udało się zapisać szablonu");
      }
      const saved = (await response.json()) as SavedDescriptionTemplate;
      setCustomTemplates((prev) => {
        const rest = prev.filter((item) => item.id !== saved.id);
        return [saved, ...rest];
      });
      setSelectedTemplateKey(saved.id);
      window.alert(overwrite ? "Szablon został zaktualizowany." : "Szablon został zapisany.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Błąd zapisu szablonu");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function deleteSelectedTemplate() {
    if (!isCustomTemplate || !selectedTemplate) return;
    if (!window.confirm(`Usunąć szablon „${selectedTemplate.label}”?`)) return;

    try {
      const response = await fetch(
        `/api/description-templates?id=${encodeURIComponent(selectedTemplate.id)}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Nie udało się usunąć szablonu");
      setCustomTemplates((prev) => prev.filter((item) => item.id !== selectedTemplate.id));
      setSelectedTemplateKey("builtin:sofa");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Błąd usuwania szablonu");
    }
  }

  function loadTemplateForEditing() {
    if (!selectedTemplate) return;
    onChange(applyTemplateDetails(selectedTemplate.details, details));
  }

  function updateHighlights(next: ProductHighlight[]) {
    onChange({ highlights: next });
  }

  function toggleTemplateHighlight(preset: ProductHighlight) {
    const active = details.highlights.some((item) => item.title === preset.title);
    updateHighlights(
      active
        ? details.highlights.filter((item) => item.title !== preset.title)
        : [...details.highlights, { ...preset }]
    );
  }

  function updateSpecs(next: ProductSpec[]) {
    onChange({ specs: next });
  }

  function updateDimensions(next: ProductDimension[]) {
    onChange({ dimensions: next });
  }

  function updateFaq(next: ProductFaq[]) {
    onChange({ faq: next });
  }

  const previewDescription = expandDescriptionMarkers(
    details.longDescription.trim() || shortDescription
  );
  const previewHighlights = details.highlights.filter((h) => h.title.trim());

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-charcoal/10 bg-gradient-to-br from-cream via-white to-cream-light p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <Sparkles className="h-4 w-4 text-terracotta" />
              Szybki start
            </p>
            <p className={`max-w-xl ${panelHintClass}`}>
              Wybierz szablon, zastosuj go do produktu, edytuj treść i zapisz jako własny szablon
              do ponownego użycia. Znaczniki np. {"{{dostawa}}"} aktualizują się ze sklepem.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal hover:bg-white"
          >
            <Eye className="h-3.5 w-3.5" />
            {previewOpen ? "Ukryj podgląd" : "Pokaż podgląd"}
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className={panelLabelClass}>Szablon opisu</label>
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-stretch">
              <select
                value={selectedTemplateKey}
                onChange={(e) => setSelectedTemplateKey(e.target.value)}
                className="min-h-[42px] flex-1 rounded-lg border border-taupe/30 px-3 py-2 text-sm focus:border-charcoal focus:outline-none"
              >
                <optgroup label="Wbudowane">
                  {DESCRIPTION_TEMPLATES.map((template) => (
                    <option key={template.id} value={`builtin:${template.id}`}>
                      {template.label}
                    </option>
                  ))}
                </optgroup>
                {customTemplates.length > 0 && (
                  <optgroup label="Twoje szablony">
                    {customTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                type="button"
                onClick={applyTemplate}
                className="shrink-0 rounded-lg bg-charcoal px-4 py-2.5 text-xs font-medium tracking-wide text-cream uppercase hover:bg-charcoal/85 sm:min-h-[42px]"
              >
                Zastosuj do produktu
              </button>
            </div>
            <p className={`mt-1 ${panelMetaClass}`}>{selectedTemplate?.hint}</p>
          </div>

          <div className="grid gap-3 rounded-xl border border-taupe/20 bg-white/80 p-4 sm:grid-cols-2">
            <div>
              <label className={panelLabelClass}>Nazwa szablonu</label>
              <input
                value={templateLabel}
                onChange={(e) => setTemplateLabel(e.target.value)}
                placeholder="np. Sofa welurowa — pełny opis"
                className={inputClass}
              />
            </div>
            <div>
              <label className={panelLabelClass}>Podpowiedź</label>
              <input
                value={templateHint}
                onChange={(e) => setTemplateHint(e.target.value)}
                placeholder="Krótki opis kiedy użyć tego szablonu"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={savingTemplate}
              onClick={() => saveTemplate(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              Zapisz bieżącą treść jako szablon
            </button>
            {isCustomTemplate && (
              <>
                <button
                  type="button"
                  disabled={savingTemplate}
                  onClick={() => saveTemplate(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-terracotta/30 bg-terracotta/10 px-3 py-2 text-xs font-medium text-charcoal hover:bg-terracotta/15 disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  Nadpisz wybrany szablon
                </button>
                <button
                  type="button"
                  onClick={loadTemplateForEditing}
                  className="rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal hover:bg-cream-light"
                >
                  Załaduj szablon do edycji
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Usuń szablon
                </button>
              </>
            )}
          </div>
        </div>

        {previewOpen && (
          <div className="mt-5 rounded-xl border border-taupe/25 bg-white p-4 shadow-sm">
            <p className={panelChipLabelClass}>
              Podgląd sekcji Opis
            </p>
            <div className="mt-3">
              {previewDescription ? (
                <FormattedProductDescription text={previewDescription} />
              ) : (
                <p className="text-sm font-medium text-charcoal/55">
                  Tu pojawi się długi opis produktu…
                </p>
              )}
            </div>
            {features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {features.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-cream-light px-2.5 py-1 text-[11px] font-medium text-charcoal ring-1 ring-taupe/30"
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            {previewHighlights.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-3">
                {previewHighlights.slice(0, 3).map((item) => (
                  <li
                    key={item.title}
                    className="rounded-xl border border-taupe/20 bg-cream-light/50 p-3 text-sm text-charcoal/80"
                  >
                    <HighlightTitleRow icon={item.icon} title={item.title} />
                    <p className="mt-1 text-[13px] leading-snug">
                      {expandDescriptionMarkers(item.description)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <SectionCard
        step={1}
        title="Opis produktu"
        hint={`Maksymalnie ${template.descriptionGuide.length} krótkie akapity — oddziel je pustą linią. Użyj znaczników zamiast wpisywać daty ręcznie.`}
      >
        <ol className="grid gap-2 sm:grid-cols-2">
          {template.descriptionGuide.map((guide, index) => (
            <li
              key={guide}
              className="flex gap-2 rounded-xl border border-taupe/20 bg-cream-light/60 px-3 py-2 text-[13px] leading-snug text-charcoal/85"
            >
              <span className="font-semibold text-charcoal">Akapit {index + 1}</span>
              <span>{guide}</span>
            </li>
          ))}
        </ol>
        <ChipRow label="Wstaw znacznik (aktualizuje się ze sklepem)">
          {DESCRIPTION_MARKERS.map((marker) => (
            <Chip
              key={marker.token}
              title={marker.hint}
              onClick={() => insertLongDescription(marker.token)}
            >
              {marker.label}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Wstaw linię listy (na początku wiersza)">
          {LIST_LINE_PREFIXES.map((item) => (
            <Chip
              key={item.id}
              onClick={() => insertLongDescription(item.prefix, true)}
            >
              {item.label}
            </Chip>
          ))}
        </ChipRow>
        <ChipRow label="Gotowe akapity">
          {DESCRIPTION_SNIPPETS.map((snippet) => (
            <Chip key={snippet.id} onClick={() => insertLongDescription(snippet.text)}>
              {snippet.label}
            </Chip>
          ))}
        </ChipRow>
        <textarea
          ref={longDescRef}
          rows={8}
          value={details.longDescription}
          onChange={(e) => onChange({ longDescription: e.target.value })}
          placeholder="Napisz opis lub wstaw szablon powyżej. Znaczniki np. {{dostawa}} zamienią się na stronie automatycznie."
          className={`${inputClass} leading-relaxed`}
        />
        <p className={panelMetaClass}>
          Na stronie:{" "}
          <code className="rounded bg-cream-light px-1.5 py-0.5 text-[11px] font-medium text-charcoal">
            {expandDescriptionMarkers(details.longDescription.slice(0, 120) || "…")}
          </code>
        </p>
      </SectionCard>

      <SectionCard
        step={2}
        title="Najważniejsze cechy / atuty"
        hint="Zaznacz cechy, które produkt faktycznie ma — na stronie pokazują się jako krótkie chipy pod opisem. Niezaznaczone nie są wyświetlane (nie pokazujemy „NIE”)."
      >
        <div className="space-y-4">
          {template.featureGroups.map((group) => (
            <div key={group.label}>
              <p className={panelChipLabelClass}>{group.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const active = features.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFeature(item)}
                      aria-pressed={active}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        active
                          ? "border-charcoal bg-charcoal text-cream"
                          : "border-charcoal/10 bg-cream-light text-charcoal hover:border-charcoal/25"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {extraFeatures.length > 0 && (
            <div>
              <p className={panelChipLabelClass}>Własne</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {extraFeatures.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFeature(item)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-charcoal bg-charcoal px-3 py-1.5 text-xs text-cream"
                  >
                    ✓ {item}
                    <Trash2 className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={customFeature}
              onChange={(e) => setCustomFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomFeature();
                }
              }}
              placeholder="Własna cecha, np. Automat ułatwiający otwieranie"
              className={`${inputClass} mt-0 sm:max-w-md`}
            />
            <button
              type="button"
              onClick={addCustomFeature}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-charcoal/15 bg-white px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light"
            >
              <Plus className="h-3.5 w-3.5" />
              Dodaj cechę
            </button>
          </div>
          {features.length > 0 && (
            <p className={panelMetaClass}>
              Na stronie ({features.length}): {features.join(" · ")}
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        step={3}
        title="Trzy główne wyróżniki"
        hint="Zaznacz te, które ten model naprawdę ma. Niezaznaczone nie pojawią się na stronie — treść z szablonu możesz potem dopasować."
      >
        <ChipRow label="Wyróżniki z szablonu">
          {template.highlights.map((preset) => {
            const active = details.highlights.some((item) => item.title === preset.title);
            return (
              <button
                key={preset.title}
                type="button"
                onClick={() => toggleTemplateHighlight(preset)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  active
                    ? "border-charcoal bg-charcoal text-cream"
                    : "border-charcoal/10 bg-cream-light text-charcoal hover:border-charcoal/25"
                }`}
              >
                {active ? "✓ " : "+ "}
                {preset.title}
              </button>
            );
          })}
        </ChipRow>
        <ChipRow label="Domyślna ikona nowych wyróżników">
          {HIGHLIGHT_ICONS.map((icon) => (
            <button
              key={icon.value}
              type="button"
              onClick={() => setDefaultHighlightIcon(icon.value)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                defaultHighlightIcon === icon.value
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-charcoal/10 bg-cream-light text-charcoal hover:border-charcoal/25"
              }`}
            >
              <HighlightBullet icon={icon.value} className="!mt-0 h-3.5 w-3.5" />
              {icon.label}
            </button>
          ))}
        </ChipRow>
        <ChipRow label="Inne gotowe wyróżniki">
          {HIGHLIGHT_PRESETS.map((preset) => (
            <Chip
              key={preset.title}
              onClick={() =>
                updateHighlights([
                  ...details.highlights,
                  { ...preset, icon: preset.icon ?? defaultHighlightIcon },
                ])
              }
            >
              + {preset.title}
            </Chip>
          ))}
        </ChipRow>
        <div className="space-y-3">
          {details.highlights.map((item, i) => (
            <div key={i} className="rounded-xl bg-cream-light/70 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className={`${panelMetaClass} font-semibold`}>Wyróżnik {i + 1}</span>
                <div className="flex items-center gap-2">
                  <div className="flex flex-wrap gap-1">
                    {HIGHLIGHT_ICONS.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        title={icon.label}
                        onClick={() => {
                          const next = [...details.highlights];
                          next[i] = { ...next[i], icon: icon.value };
                          updateHighlights(next);
                        }}
                        className={`rounded-md border p-1.5 transition-colors ${
                          normalizeHighlightIcon(item.icon) === icon.value
                            ? "border-charcoal bg-charcoal text-cream"
                            : "border-taupe/30 bg-white text-charcoal hover:border-charcoal/30"
                        }`}
                      >
                        <HighlightBullet icon={icon.value} className="!mt-0 h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateHighlights(details.highlights.filter((_, idx) => idx !== i))
                    }
                    className="text-charcoal/70 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                placeholder="Nagłówek, np. Przemyślane wnętrze"
                value={item.title}
                onChange={(e) => {
                  const next = [...details.highlights];
                  next[i] = { ...next[i], title: e.target.value };
                  updateHighlights(next);
                }}
                className={inputClass}
              />
              <textarea
                rows={2}
                placeholder="Jedno–dwa zdania korzyści dla klienta"
                value={item.description}
                onChange={(e) => {
                  const next = [...details.highlights];
                  next[i] = { ...next[i], description: e.target.value };
                  updateHighlights(next);
                }}
                className={`${inputClass} mt-2`}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            updateHighlights([
              ...details.highlights,
              { title: "", description: "", icon: defaultHighlightIcon },
            ])
          }
          className="text-sm text-charcoal underline underline-offset-2"
        >
          + Pusty wyróżnik
        </button>
        {details.highlights.filter((item) => item.title.trim()).length > 3 && (
          <p className="text-xs font-medium text-terracotta">
            Wytyczne przewidują trzy wyróżniki — na stronie pokażemy wszystkie, ale rozważ skrócenie listy.
          </p>
        )}
      </SectionCard>

      <SectionCard
        step={4}
        title="Wymiary"
        hint={
          template.category === "lozka"
            ? "Wklej planszę z wymiarami albo wybierz gotową. Na stronie produktu kafelek pokaże zdjęcie."
            : "Wpisz liczbę — jednostka dopisze się sama (cm przy wymiarach, kg przy wadze). Puste wiersze nie pojawią się na stronie."
        }
      >
        {template.category === "lozka" ? (
          <BedDimensionImageField
            value={details.dimensionImage}
            onChange={(url) => onChange({ dimensionImage: url })}
          />
        ) : (
          <>
            <ChipRow label="Dodaj wiersz">
              {[...template.dimensions, ...DIMENSION_PRESETS.map((preset) => ({ label: preset.label }))]
                .filter(
                  (preset, index, all) =>
                    all.findIndex((item) => item.label === preset.label) === index &&
                    !details.dimensions.some((item) => item.label === preset.label)
                )
                .map((preset) => (
                  <Chip
                    key={preset.label}
                    onClick={() =>
                      updateDimensions([...details.dimensions, { label: preset.label, value: "" }])
                    }
                  >
                    + {preset.label}
                  </Chip>
                ))}
            </ChipRow>
            <ListRows
              items={details.dimensions}
              onChange={updateDimensions}
              labelPh="Nazwa, np. Szerokość"
              valuePh="np. 220"
              defaultUnit="auto"
              fields={template.dimensions}
            />
          </>
        )}
      </SectionCard>

      <SectionCard
        step={5}
        title="Specyfikacja techniczna"
        hint="Zaznacz to, co dotyczy modelu — na ogłoszeniu widać tylko zaznaczone. Inną wartość dopiszesz ręcznie na dole."
      >
        <ChipRow label="Dodaj pole">
          {[...template.specs, ...SPEC_PRESETS.map((preset) => ({ label: preset.label }))]
            .filter(
              (preset, index, all) =>
                all.findIndex((item) => item.label === preset.label) === index &&
                !details.specs.some((item) => item.label === preset.label)
            )
            .map((preset) => (
              <Chip
                key={preset.label}
                onClick={() => updateSpecs([...details.specs, { label: preset.label, value: "" }])}
              >
                + {preset.label}
              </Chip>
            ))}
        </ChipRow>
        <ListRows
          items={details.specs}
          onChange={updateSpecs}
          labelPh="Etykieta, np. Materiał korpusu"
          valuePh="Wartość, np. Płyta laminowana"
          fields={template.specs}
        />
      </SectionCard>

      {template.layers && (
        <SectionCard
          step={6}
          title="Budowa / warstwy materaca"
          hint="Warstwy od góry do dołu materaca: nazwa, grubość (opcjonalnie), krótki opis (opcjonalnie)."
        >
          <ChipRow label="Dodaj warstwę">
            {LAYER_PRESETS.map((preset) => (
              <Chip
                key={preset}
                onClick={() =>
                  updateLayers([
                    ...layers.filter((layer) => layer.name.trim()),
                    { name: preset, thickness: "", description: "" },
                  ])
                }
              >
                + {preset}
              </Chip>
            ))}
          </ChipRow>
          <div className="space-y-2">
            {layers.map((layer, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-xl bg-cream-light/70 p-3 sm:grid-cols-[2.5rem_1fr_7rem_1.4fr_auto] sm:items-center"
              >
                <span className="text-xs font-semibold text-charcoal/70">{i + 1}.</span>
                <input
                  value={layer.name}
                  onChange={(e) => {
                    const next = [...layers];
                    next[i] = { ...next[i], name: e.target.value };
                    updateLayers(next);
                  }}
                  placeholder="Nazwa warstwy, np. Pianka Memory"
                  className={`${inputClass} mt-0 bg-white`}
                />
                <input
                  value={layer.thickness ?? ""}
                  onChange={(e) => {
                    const next = [...layers];
                    next[i] = { ...next[i], thickness: e.target.value };
                    updateLayers(next);
                  }}
                  onBlur={() => {
                    const current = layers[i]?.thickness ?? "";
                    const nextValue = withDefaultCm(current);
                    if (nextValue === current) return;
                    const next = [...layers];
                    next[i] = { ...next[i], thickness: nextValue };
                    updateLayers(next);
                  }}
                  placeholder="np. 4"
                  className={`${inputClass} mt-0 bg-white`}
                  aria-label="Grubość warstwy w cm"
                />
                <input
                  value={layer.description ?? ""}
                  onChange={(e) => {
                    const next = [...layers];
                    next[i] = { ...next[i], description: e.target.value };
                    updateLayers(next);
                  }}
                  placeholder="Krótki opis (opcjonalnie)"
                  className={`${inputClass} mt-0 bg-white`}
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Przenieś wyżej"
                    onClick={() => moveLayer(i, -1)}
                    className="p-1.5 text-charcoal/70 hover:text-charcoal"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Przenieś niżej"
                    onClick={() => moveLayer(i, 1)}
                    className="p-1.5 text-charcoal/70 hover:text-charcoal"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Usuń warstwę"
                    onClick={() => updateLayers(layers.filter((_, idx) => idx !== i))}
                    className="p-1.5 text-charcoal/70 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => updateLayers([...layers, { name: "", thickness: "", description: "" }])}
            className="text-sm text-charcoal underline underline-offset-2"
          >
            + Pusta warstwa
          </button>
        </SectionCard>
      )}

      <SectionCard
        step={template.layers ? 7 : 6}
        title="FAQ produktu"
        hint="2–4 pytania najczęściej zadawane przy tym modelu. Możesz użyć znaczników w odpowiedzi."
        defaultOpen={false}
      >
        <ChipRow label="Dodaj gotowe pytanie">
          {FAQ_PRESETS.map((preset) => (
            <Chip
              key={preset.question}
              onClick={() => updateFaq([...details.faq, { ...preset }])}
            >
              + {preset.question.slice(0, 36)}…
            </Chip>
          ))}
        </ChipRow>
        <div className="space-y-3">
          {details.faq.map((item, i) => (
            <div key={i} className="rounded-xl bg-cream-light/70 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className={`${panelMetaClass} font-semibold`}>Pytanie {i + 1}</span>
                <button
                  type="button"
                  onClick={() => updateFaq(details.faq.filter((_, idx) => idx !== i))}
                  className="text-charcoal/70 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <input
                value={item.question}
                onChange={(e) => {
                  const next = [...details.faq];
                  next[i] = { ...next[i], question: e.target.value };
                  updateFaq(next);
                }}
                className={inputClass}
                placeholder="Pytanie klienta"
              />
              <textarea
                rows={3}
                value={item.answer}
                onChange={(e) => {
                  const next = [...details.faq];
                  next[i] = { ...next[i], answer: e.target.value };
                  updateFaq(next);
                }}
                className={`${inputClass} mt-2`}
                placeholder="Odpowiedź — możesz wstawić {{dostawa}}, {{zwrot}} itd."
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {DESCRIPTION_MARKERS.map((marker) => (
                  <button
                    key={marker.token}
                    type="button"
                    onClick={() => {
                      const next = [...details.faq];
                      next[i] = {
                        ...next[i],
                        answer: `${next[i].answer}${next[i].answer ? " " : ""}${marker.token}`,
                      };
                      updateFaq(next);
                    }}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] text-charcoal ring-1 ring-taupe/30"
                  >
                    {marker.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => updateFaq([...details.faq, { question: "", answer: "" }])}
          className="text-sm text-charcoal underline underline-offset-2"
        >
          + Puste pytanie
        </button>
      </SectionCard>
    </div>
  );
}

type ListRowItem = { label: string; value: string };

function ListRows({
  items,
  onChange,
  labelPh,
  valuePh,
  fields = [],
  defaultUnit,
}: {
  items: ListRowItem[];
  onChange: (next: ListRowItem[]) => void;
  labelPh: string;
  valuePh: string;
  fields?: TemplateField[];
  defaultUnit?: "cm" | "auto";
}) {
  const fieldByLabel = new Map(fields.map((field) => [field.label.toLowerCase(), field]));
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const field = fieldByLabel.get(item.label.trim().toLowerCase());
        const isEmpty = !item.value.trim();
        const unit = defaultUnit
          ? dimensionUnitForLabel(item.label, field?.unit)
          : undefined;
        const hint = unit
          ? (field?.hint ?? valuePh)
              .replace(/\s*cm\b/gi, "")
              .replace(/\s*kg\b/gi, "")
              .replace(/\s{2,}/g, " ")
              .trim()
          : (field?.hint ?? valuePh);
        if (isToggleSpec(field)) {
          const on = isVisibleSpecValue(item.value);
          const shown = item.value.trim() || field?.defaultValue || "Tak";
          return (
            <label
              key={i}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 ${
                on ? "bg-cream-light/70" : "bg-cream-light/40"
              }`}
            >
              <input
                type="checkbox"
                className="h-4 w-4 shrink-0 rounded border-taupe/50 text-charcoal accent-charcoal"
                checked={on}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = {
                    ...next[i],
                    value: e.target.checked ? field?.defaultValue || "Tak" : "",
                  };
                  onChange(next);
                }}
              />
              <span
                className={`min-w-0 flex-1 text-sm font-medium ${
                  on ? "text-charcoal" : "text-charcoal/55"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`shrink-0 text-sm ${
                  on ? "text-charcoal/70" : "text-charcoal/35"
                }`}
              >
                {on ? shown : "ukryte"}
              </span>
            </label>
          );
        }
        return (
        <div
          key={i}
          className={`flex flex-col gap-2 rounded-xl p-3 sm:flex-row sm:items-start ${
            isEmpty ? "bg-cream-light/40" : "bg-cream-light/70"
          }`}
        >
          <div className="w-full sm:w-2/5">
            <input
              placeholder={labelPh}
              value={item.label}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], label: e.target.value };
                onChange(next);
              }}
              className={`w-full rounded-lg border border-taupe/30 px-3 py-2 text-sm font-medium text-charcoal ${
                isEmpty ? "text-charcoal/70" : ""
              }`}
            />
            {field?.required && isEmpty && (
              <p className="mt-1 text-[11px] font-semibold text-terracotta">Pole podstawowe</p>
            )}
          </div>
          <div className="relative w-full flex-1">
            <input
              placeholder={hint}
              value={item.value}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], value: e.target.value };
                onChange(next);
              }}
              onBlur={() => {
                if (!unit) return;
                const nextValue = withDimensionUnit(item.value, item.label, field?.unit);
                if (nextValue === item.value) return;
                const next = [...items];
                next[i] = { ...next[i], value: nextValue };
                onChange(next);
              }}
              className={`w-full rounded-lg border border-taupe/30 px-3 py-2 text-sm font-medium text-charcoal ${
                unit ? "pr-12" : ""
              }`}
            />
            {unit ? (
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs font-semibold text-charcoal/45">
                {unit}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="self-end p-1.5 text-charcoal/70 hover:text-red-600 sm:self-start"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        );
      })}
      <button
        type="button"
        onClick={() => onChange([...items, { label: "", value: "" }])}
        className="inline-flex items-center gap-1 text-sm text-charcoal underline underline-offset-2"
      >
        <Copy className="h-3.5 w-3.5" />
        Dodaj wiersz
      </button>
    </div>
  );
}
