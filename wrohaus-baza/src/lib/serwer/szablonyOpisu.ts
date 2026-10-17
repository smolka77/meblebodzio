import { revalidatePath } from "next/cache";
import { readStore, writeStore, fileExists } from "./baza";
import {
  cloneTemplateDetails,
  newCustomTemplateId,
  type DescriptionTemplatesStore,
  type SavedDescriptionTemplate,
  type DescriptionTemplateDetails,
} from "@/lib/szablonyOpisuZapis";
import { ensureStoreSeeded } from "./startDanych";

const FILE = "description-templates.json";
const MAX_CUSTOM_TEMPLATES = 24;

const EMPTY_STORE: DescriptionTemplatesStore = { custom: [] };

function sanitizeTemplate(
  raw: Partial<SavedDescriptionTemplate>,
  fallback?: SavedDescriptionTemplate
): SavedDescriptionTemplate | null {
  const label = raw.label?.trim() || fallback?.label;
  if (!label) return null;

  const details = raw.details
    ? cloneTemplateDetails(raw.details)
    : fallback?.details;
  if (!details) return null;

  return {
    id: raw.id?.trim() || fallback?.id || newCustomTemplateId(),
    label: label.slice(0, 80),
    hint: (raw.hint?.trim() || fallback?.hint || "Własny szablon opisu produktu").slice(
      0,
      160
    ),
    details,
    updatedAt: new Date().toISOString(),
  };
}

export async function getDescriptionTemplatesStore(): Promise<DescriptionTemplatesStore> {
  await ensureStoreSeeded();
  if (!(await fileExists(FILE))) {
    await writeStore(FILE, EMPTY_STORE);
  }
  const stored = await readStore<DescriptionTemplatesStore>(FILE, EMPTY_STORE);
  return {
    custom: Array.isArray(stored.custom) ? stored.custom : [],
  };
}

export async function saveCustomDescriptionTemplate(input: {
  id?: string;
  label: string;
  hint?: string;
  details: DescriptionTemplateDetails;
}): Promise<SavedDescriptionTemplate> {
  const store = await getDescriptionTemplatesStore();
  const existing = input.id
    ? store.custom.find((template) => template.id === input.id)
    : undefined;

  const next = sanitizeTemplate(
    {
      id: input.id,
      label: input.label,
      hint: input.hint,
      details: input.details,
    },
    existing
  );
  if (!next) throw new Error("Nieprawidłowy szablon");

  const custom = existing
    ? store.custom.map((template) => (template.id === existing.id ? next : template))
    : [next, ...store.custom].slice(0, MAX_CUSTOM_TEMPLATES);

  await writeStore(FILE, { custom });
  revalidatePath("/admin/produkty");
  return next;
}

export async function deleteCustomDescriptionTemplate(id: string): Promise<void> {
  const store = await getDescriptionTemplatesStore();
  await writeStore(FILE, {
    custom: store.custom.filter((template) => template.id !== id),
  });
  revalidatePath("/admin/produkty");
}
