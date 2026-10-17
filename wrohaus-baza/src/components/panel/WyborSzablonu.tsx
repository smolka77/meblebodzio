"use client";

import {
  Armchair,
  BedDouble,
  Boxes,
  DoorClosed,
  Layers,
  LampDesk,
  Sofa,
  Tv,
  type LucideIcon,
} from "lucide-react";
import type { ProductTemplateId } from "@/lib/typy";
import { PRODUCT_TEMPLATES, type ProductTemplate } from "@/lib/szablonyProduktu";
import { categoryLabels } from "@/lib/dane";
import { panelHintClass } from "@/components/panel/typografiaPanelu";

const TEMPLATE_ICONS: Record<ProductTemplateId, LucideIcon> = {
  sofa: Sofa,
  naroznik: Sofa,
  lozko: BedDouble,
  "lozko-kontynentalne": BedDouble,
  materac: Layers,
  szafa: DoorClosed,
  komoda: Boxes,
  "szafka-rtv": Tv,
  "szafka-nocna": LampDesk,
  ogolny: Armchair,
};

function templateSummary(template: ProductTemplate): string[] {
  const parts: string[] = [];
  if (template.sizes) parts.push(template.sizes.label);
  for (const option of template.options) parts.push(option.name);
  if (template.fabrics) parts.push("Tkanina");
  if (template.layers) parts.push("Warstwy");
  return parts;
}

export function ProductTemplatePicker({
  selected,
  onSelect,
  compact = false,
}: {
  selected?: ProductTemplateId;
  onSelect: (template: ProductTemplate) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {PRODUCT_TEMPLATES.map((template) => {
        const Icon = TEMPLATE_ICONS[template.id];
        const active = template.id === selected;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            aria-pressed={active}
            className={`group flex h-full flex-col rounded-2xl border p-4 text-left transition-all ${
              active
                ? "border-charcoal bg-charcoal text-cream shadow-[0_12px_28px_-18px_rgba(17,17,17,0.6)]"
                : "border-taupe/30 bg-white text-charcoal hover:border-charcoal/40 hover:shadow-[0_10px_24px_-18px_rgba(17,17,17,0.35)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  active ? "bg-cream/15 text-cream" : "bg-cream text-charcoal"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight">{template.label}</span>
                <span
                  className={`mt-0.5 block text-[11px] font-semibold tracking-wide uppercase ${
                    active ? "text-cream/70" : "text-charcoal/55"
                  }`}
                >
                  {categoryLabels[template.category]}
                </span>
              </span>
            </div>
            {!compact && (
              <>
                <p
                  className={`mt-3 text-[13px] leading-relaxed ${
                    active ? "text-cream/85" : "text-charcoal/75"
                  }`}
                >
                  {template.hint}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {templateSummary(template).map((part) => (
                    <span
                      key={part}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${
                        active
                          ? "bg-cream/15 text-cream"
                          : "bg-cream-light text-charcoal/80 ring-1 ring-taupe/25"
                      }`}
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TemplatePickerIntro() {
  return (
    <div>
      <h3 className="font-serif text-xl text-charcoal">Albo wybierz szablon ręcznie</h3>
      <p className={`mt-1 max-w-2xl ${panelHintClass}`}>
        Szablon ustawia tylko pola tej grupy mebli. Puste nie trafiają na stronę.
      </p>
    </div>
  );
}
