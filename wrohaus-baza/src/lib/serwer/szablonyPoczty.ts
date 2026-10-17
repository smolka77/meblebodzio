import { clampString } from "@/lib/serwer/walidacjaWejscia";
import { readStore, writeStore } from "@/lib/serwer/baza";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_BODY_MAX,
  EMAIL_SUBJECT_MAX,
  mergeEmailTemplates,
  type ShopEmailTemplates,
} from "@/lib/szablonyMaile";

const FILE = "email-templates.json";

function sanitizeField(
  value: unknown,
  max: number,
  fallback: string
): string {
  const text = clampString(value, max);
  return text || fallback;
}

export function sanitizeEmailTemplates(
  input: Partial<ShopEmailTemplates>
): ShopEmailTemplates {
  return {
    createdSubject: sanitizeField(
      input.createdSubject,
      EMAIL_SUBJECT_MAX,
      DEFAULT_EMAIL_TEMPLATES.createdSubject
    ),
    createdBody: sanitizeField(
      input.createdBody,
      EMAIL_BODY_MAX,
      DEFAULT_EMAIL_TEMPLATES.createdBody
    ),
    paidSubject: sanitizeField(
      input.paidSubject,
      EMAIL_SUBJECT_MAX,
      DEFAULT_EMAIL_TEMPLATES.paidSubject
    ),
    paidBody: sanitizeField(
      input.paidBody,
      EMAIL_BODY_MAX,
      DEFAULT_EMAIL_TEMPLATES.paidBody
    ),
  };
}

export async function getEmailTemplates(): Promise<ShopEmailTemplates> {
  const stored = await readStore<Partial<ShopEmailTemplates>>(
    FILE,
    DEFAULT_EMAIL_TEMPLATES
  );
  return mergeEmailTemplates(stored);
}

export async function saveEmailTemplates(
  input: Partial<ShopEmailTemplates>
): Promise<ShopEmailTemplates> {
  const next = sanitizeEmailTemplates(input);
  await writeStore(FILE, next);
  return next;
}

export async function resetEmailTemplates(): Promise<ShopEmailTemplates> {
  await writeStore(FILE, DEFAULT_EMAIL_TEMPLATES);
  return DEFAULT_EMAIL_TEMPLATES;
}
