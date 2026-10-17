export const EMAIL_SUBJECT_MAX = 180;
export const EMAIL_BODY_MAX = 8000;

export type ShopEmailTemplates = {
  createdSubject: string;
  createdBody: string;
  paidSubject: string;
  paidBody: string;
};

export type EmailVar = { text: string; html: string };

export const EMAIL_TEMPLATE_TOKENS = [
  { key: "sklep", label: "Nazwa sklepu" },
  { key: "klient", label: "Imię i nazwisko" },
  { key: "numer", label: "Numer zamówienia" },
  { key: "produkty", label: "Lista mebli" },
  { key: "dostawa", label: "Koszt dostawy" },
  { key: "kwota", label: "Suma do zapłaty" },
  { key: "adres", label: "Adres dostawy" },
  { key: "telefon", label: "Telefon klienta" },
  { key: "link", label: "Link do zamówień" },
  { key: "kontakt", label: "E-mail sklepu" },
  { key: "firma", label: "Pełna nazwa firmy" },
] as const;

export const DEFAULT_EMAIL_TEMPLATES: ShopEmailTemplates = {
  createdSubject: "{{sklep}} — zamówienie {{numer}} przyjęte",
  createdBody: `Cześć {{klient}},

Dziękujemy za zamówienie w {{sklep}}.
Numer zamówienia: {{numer}}

{{produkty}}

Dostawa: {{dostawa}}
Razem: {{kwota}}

Dokończ płatność w PayU (BLIK, karta lub szybki przelew). Potwierdzenie i SMS wyślemy po zaksięgowaniu wpłaty.

Pytania: {{kontakt}}

{{firma}}`,
  paidSubject: "{{sklep}} — potwierdzenie zamówienia {{numer}}",
  paidBody: `Cześć {{klient}},

Potwierdzamy płatność i przyjęcie zamówienia {{numer}}.

{{produkty}}

Dostawa: {{dostawa}}
Razem: {{kwota}}

Adres: {{adres}}
Telefon: {{telefon}}

Rozpoczynamy realizację. O kolejnych etapach poinformujemy e-mailem.

Twoje zamówienia: {{link}}
Pytania: {{kontakt}}

{{firma}}`,
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function tokenMarkup(key: string): string {
  return `{{${key}}}`;
}

export function mergeEmailTemplates(
  stored?: Partial<ShopEmailTemplates> | null
): ShopEmailTemplates {
  const source = stored ?? {};
  return {
    createdSubject:
      source.createdSubject?.trim() || DEFAULT_EMAIL_TEMPLATES.createdSubject,
    createdBody: source.createdBody?.trim() || DEFAULT_EMAIL_TEMPLATES.createdBody,
    paidSubject: source.paidSubject?.trim() || DEFAULT_EMAIL_TEMPLATES.paidSubject,
    paidBody: source.paidBody?.trim() || DEFAULT_EMAIL_TEMPLATES.paidBody,
  };
}

export function renderEmailTemplate(
  template: string,
  vars: Record<string, EmailVar>
): { text: string; html: string } {
  let text = template;
  let html = escapeHtml(template);
  for (const [key, value] of Object.entries(vars)) {
    const token = tokenMarkup(key);
    text = text.split(token).join(value.text);
    html = html.split(escapeHtml(token)).join(value.html);
  }
  html = html.replace(/\r\n/g, "\n").replace(/\n/g, "<br>\n");
  return { text, html };
}
