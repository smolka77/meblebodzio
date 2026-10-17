import type { ProductDetails } from "@/lib/typy";
import { DESCRIPTION_TEMPLATES } from "@/lib/szablonyOpisu";

export type DescriptionTemplateDetails = Pick<
  ProductDetails,
  "longDescription" | "highlights" | "specs" | "dimensions" | "faq"
>;

export interface SavedDescriptionTemplate {
  id: string;
  label: string;
  hint: string;
  details: DescriptionTemplateDetails;
  updatedAt: string;
}

export interface DescriptionTemplatesStore {
  custom: SavedDescriptionTemplate[];
}

export type DescriptionTemplateOption =
  | {
      kind: "builtin";
      id: string;
      label: string;
      hint: string;
      details: DescriptionTemplateDetails;
    }
  | {
      kind: "custom";
      id: string;
      label: string;
      hint: string;
      details: DescriptionTemplateDetails;
      updatedAt: string;
    };

export function cloneTemplateDetails(
  details: DescriptionTemplateDetails
): DescriptionTemplateDetails {
  return {
    longDescription: details.longDescription,
    highlights: details.highlights.map((item) => ({ ...item })),
    specs: details.specs.map((item) => ({ ...item })),
    dimensions: details.dimensions.map((item) => ({ ...item })),
    faq: details.faq.map((item) => ({ ...item })),
  };
}

export function listDescriptionTemplateOptions(
  custom: SavedDescriptionTemplate[]
): DescriptionTemplateOption[] {
  const builtin = DESCRIPTION_TEMPLATES.map((template) => ({
    kind: "builtin" as const,
    id: `builtin:${template.id}`,
    label: template.label,
    hint: template.hint,
    details: cloneTemplateDetails(template.details),
  }));

  const saved = custom.map((template) => ({
    kind: "custom" as const,
    id: template.id,
    label: template.label,
    hint: template.hint,
    details: cloneTemplateDetails(template.details),
    updatedAt: template.updatedAt,
  }));

  return [...builtin, ...saved];
}

export function newCustomTemplateId(): string {
  return `tpl-${Date.now()}`;
}
