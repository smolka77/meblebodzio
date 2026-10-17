"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Product, ProductOption, ProductSize } from "@/lib/typy";
import { formatPrice } from "@/lib/dane";
import { newOption, newOptionValue } from "@/lib/opcjeProduktu";
import { slugifySize, sortSizes, typicalSizes } from "@/lib/rozmiary";
import { withDefaultCm } from "@/lib/wymiary";
import {
  optionFromPreset,
  type ProductTemplate,
  type TemplateOptionPreset,
} from "@/lib/szablonyProduktu";
import {
  panelChipLabelClass,
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

const inputClass = panelInputClass;

function emptySize(): ProductSize {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `size-${Date.now()}`,
    label: "",
    surcharge: 0,
  };
}

function SectionShell({
  title,
  hint,
  children,
  aside,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={panelLabelClass}>{title}</p>
          <p className={`mt-1 max-w-xl ${panelHintClass}`}>{hint}</p>
        </div>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Rozmiar / szerokość / powierzchnia spania — wariant z dopłatą. */
export function ProductSizesField({
  template,
  sizes,
  onChange,
}: {
  template: ProductTemplate;
  sizes: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
}) {
  const config = template.sizes;
  if (!config) return null;

  return (
    <SectionShell
      title={config.label}
      hint={`${config.hint} 0 zł = w cenie bazowej. Jedna pozycja = wybór nie jest pokazywany klientowi.`}
      aside={
        config.presets.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange(sortSizes(typicalSizes(config.presets)))}
            className="text-xs font-semibold text-charcoal underline underline-offset-2"
          >
            Wstaw typowe warianty
          </button>
        ) : undefined
      }
    >
      {config.presets.length > 0 && (
        <div className="mb-3">
          <p className={panelChipLabelClass}>Dodaj pojedynczo</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {config.presets
              .filter(
                (preset) =>
                  !sizes.some(
                    (size) =>
                      size.label === preset ||
                      withDefaultCm(size.label) === withDefaultCm(preset)
                  )
              )
              .map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    onChange(
                      sortSizes([
                        ...sizes,
                        {
                          id: slugifySize(preset),
                          label: withDefaultCm(preset),
                          surcharge: 0,
                        },
                      ])
                    )
                  }
                  className="rounded-full border border-charcoal/10 bg-cream-light px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-charcoal/25 hover:bg-cream"
                >
                  + {preset}
                </button>
              ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-[1fr_9rem_2.5rem] gap-2 text-[10px] font-semibold tracking-wide text-charcoal uppercase">
        <span>Wariant</span>
        <span>Dopłata (zł)</span>
        <span className="sr-only">Usuń</span>
      </div>
      <div className="mt-1 space-y-2">
        {sizes.map((size, index) => (
          <div key={size.id || index} className="grid grid-cols-[1fr_9rem_2.5rem] items-center gap-2">
            <input
              value={size.label}
              onChange={(e) => {
                const next = [...sizes];
                next[index] = { ...next[index], label: e.target.value };
                onChange(next);
              }}
              onBlur={() => {
                const nextLabel = withDefaultCm(size.label);
                const next = sizes.map((item, i) =>
                  i === index ? { ...item, label: nextLabel } : item
                );
                onChange(sortSizes(next));
              }}
              placeholder={config.presets[0] ? `np. ${withDefaultCm(config.presets[0])}` : "np. 160 × 200 cm"}
              className={`${inputClass} mt-0`}
            />
            <input
              type="number"
              min={0}
              step={1}
              value={size.surcharge || 0}
              onChange={(e) => {
                const next = [...sizes];
                next[index] = { ...next[index], surcharge: Number(e.target.value) || 0 };
                onChange(next);
              }}
              className={`${inputClass} mt-0`}
              aria-label="Dopłata w zł"
            />
            <button
              type="button"
              aria-label="Usuń wariant"
              onClick={() => onChange(sizes.filter((_, i) => i !== index))}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-charcoal/70 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...sizes, emptySize()])}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal"
      >
        <Plus className="h-4 w-4" />
        Dodaj wariant
      </button>
    </SectionShell>
  );
}

/** Warianty zakupowe: strona narożnika, typ drzwi, lustro, LED, materac, pokrowiec, kolor płyty… */
export function ProductOptionsField({
  template,
  options,
  onChange,
}: {
  template: ProductTemplate;
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
}) {
  const suggestions: TemplateOptionPreset[] = [...template.options, ...template.optionSuggestions].filter(
    (preset) => !options.some((option) => option.name.toLowerCase() === preset.name.toLowerCase())
  );

  function updateOption(index: number, patch: Partial<ProductOption>) {
    const next = [...options];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  return (
    <SectionShell
      title="Warianty zakupowe"
      hint="Wybory klienta u góry karty produktu — każdy z opcjonalną dopłatą. Opcja z jedną wartością nie jest pokazywana. Pokazuj tylko to, co model faktycznie ma."
    >
      {suggestions.length > 0 && (
        <div className="mb-4">
          <p className={panelChipLabelClass}>Dodaj wariant z szablonu</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((preset) => (
              <button
                key={preset.name}
                type="button"
                title={preset.hint}
                onClick={() => onChange([...options, optionFromPreset(preset)])}
                className="rounded-full border border-charcoal/10 bg-cream-light px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-charcoal/25 hover:bg-cream"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {options.map((option, index) => {
          const preset = [...template.options, ...template.optionSuggestions].find(
            (item) => item.name.toLowerCase() === option.name.toLowerCase()
          );
          return (
            <div key={option.id} className="rounded-xl bg-cream-light/70 p-3 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className={panelLabelClass}>Nazwa wariantu</label>
                  <input
                    value={option.name}
                    onChange={(e) => updateOption(index, { name: e.target.value })}
                    placeholder="np. Strona narożnika, Typ drzwi, Lustro, Oświetlenie LED"
                    className={inputClass}
                  />
                </div>
                <label className="flex items-center gap-2 pb-2 text-xs font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={Boolean(option.afterColor)}
                    onChange={(e) => updateOption(index, { afterColor: e.target.checked })}
                  />
                  Pokaż po wyborze koloru
                </label>
                <button
                  type="button"
                  onClick={() => onChange(options.filter((_, i) => i !== index))}
                  className="inline-flex items-center gap-1.5 self-start pb-2 text-xs font-semibold text-red-700 hover:text-red-800 sm:self-end"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń wariant
                </button>
              </div>
              {preset?.hint && <p className={`mt-1.5 ${panelMetaClass}`}>{preset.hint}</p>}

              <div className="mt-3 grid grid-cols-[1fr_8rem_2.25rem] gap-2 text-[10px] font-semibold tracking-wide text-charcoal uppercase">
                <span>Wartość</span>
                <span>Dopłata (zł)</span>
                <span className="sr-only">Usuń</span>
              </div>
              <div className="mt-1 space-y-2">
                {option.values.map((value, valueIndex) => (
                  <div key={value.id} className="grid grid-cols-[1fr_8rem_2.25rem] items-center gap-2">
                    <input
                      value={value.label}
                      onChange={(e) => {
                        const values = [...option.values];
                        values[valueIndex] = { ...values[valueIndex], label: e.target.value };
                        updateOption(index, { values });
                      }}
                      placeholder="np. Lewy / Z lustrem / Z LED"
                      className={`${inputClass} mt-0 bg-white`}
                    />
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={value.surcharge || 0}
                      onChange={(e) => {
                        const values = [...option.values];
                        values[valueIndex] = {
                          ...values[valueIndex],
                          surcharge: Number(e.target.value) || 0,
                        };
                        updateOption(index, { values });
                      }}
                      className={`${inputClass} mt-0 bg-white`}
                      aria-label="Dopłata w zł"
                    />
                    <button
                      type="button"
                      aria-label="Usuń wartość"
                      onClick={() =>
                        updateOption(index, {
                          values: option.values.filter((_, i) => i !== valueIndex),
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center text-charcoal/70 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => updateOption(index, { values: [...option.values, newOptionValue()] })}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-charcoal"
              >
                <Plus className="h-4 w-4" />
                Dodaj wartość
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange([...options, newOption()])}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal underline underline-offset-2"
      >
        <Plus className="h-4 w-4" />
        Własny wariant
      </button>
    </SectionShell>
  );
}

/** Materac z katalogu sklepu — kafelek pod opisem łóżka. */
export function ProductSuggestedMattressField({
  mattresses,
  value,
  onChange,
}: {
  mattresses: Product[];
  value?: string;
  onChange: (id: string | undefined) => void;
}) {
  const selected = mattresses.find((item) => item.id === value);

  return (
    <SectionShell
      title="Materac do dobrania"
      hint="Kafelek z tą ofertą pojawi się pod opisem łóżka. Klient może dodać materac do koszyka albo otworzyć jego kartę. Pole puste = bez kafelka."
    >
      {mattresses.length === 0 ? (
        <p className={panelHintClass}>
          Nie ma jeszcze materacy w ofercie. Dodaj produkt w kategorii Materace, a potem wróć tutaj.
        </p>
      ) : (
        <label className="block">
          <span className={panelChipLabelClass}>Oferta materaca</span>
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            className={inputClass}
          >
            <option value="">— bez materaca —</option>
            {mattresses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.draft ? " (szkic)" : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-taupe/25 bg-cream-light/50 p-3">
          {selected.image ? (
            // Native img: admin preview of catalog thumbnail.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={selected.image}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg object-cover"
            />
          ) : null}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-charcoal">{selected.name}</p>
            <p className={panelMetaClass}>{formatPrice(selected.price)}</p>
          </div>
        </div>
      ) : null}
    </SectionShell>
  );
}
