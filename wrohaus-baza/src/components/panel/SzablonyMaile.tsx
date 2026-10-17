"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  DEFAULT_EMAIL_TEMPLATES,
  EMAIL_BODY_MAX,
  EMAIL_SUBJECT_MAX,
  EMAIL_TEMPLATE_TOKENS,
  tokenMarkup,
  type ShopEmailTemplates,
} from "@/lib/szablonyMaile";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

const textareaClass = `${inputClass} min-h-[220px] resize-y font-mono text-[13px] leading-relaxed`;

type FieldKey = keyof ShopEmailTemplates;

export function EmailTemplatesPanel() {
  const [templates, setTemplates] = useState<ShopEmailTemplates>(DEFAULT_EMAIL_TEMPLATES);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeField = useRef<FieldKey>("paidBody");
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLInputElement | HTMLTextAreaElement | null>>>({});

  useEffect(() => {
    fetch("/api/mail-templates")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { templates?: ShopEmailTemplates } | null) => {
        if (data?.templates) setTemplates(data.templates);
      })
      .catch(() => {});
  }, []);

  function insertToken(key: string) {
    const field = activeField.current;
    const token = tokenMarkup(key);
    const el = fieldRefs.current[field];
    const current = templates[field] ?? "";
    if (!el || typeof el.selectionStart !== "number") {
      setTemplates({ ...templates, [field]: `${current}${token}` });
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? start;
    const next = `${current.slice(0, start)}${token}${current.slice(end)}`;
    setTemplates({ ...templates, [field]: next });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/mail-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templates),
    });
    const data = (await res.json().catch(() => null)) as {
      templates?: ShopEmailTemplates;
      error?: string;
    } | null;
    setSaving(false);
    if (!res.ok) {
      setError(data?.error || "Nie udało się zapisać treści maili.");
      return;
    }
    if (data?.templates) setTemplates(data.templates);
    setMessage("Treść maili zapisana. Kolejne zamówienia pójdą z nowym tekstem.");
  }

  async function resetDefaults() {
    if (!window.confirm("Przywrócić domyślną treść obu maili?")) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/mail-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    });
    const data = (await res.json().catch(() => null)) as {
      templates?: ShopEmailTemplates;
      error?: string;
    } | null;
    setSaving(false);
    if (!res.ok) {
      setError(data?.error || "Nie udało się przywrócić treści.");
      return;
    }
    if (data?.templates) setTemplates(data.templates);
    setMessage("Przywrócono domyślną treść.");
  }

  return (
    <section
      id="mail-tresc"
      className="scroll-mt-24 rounded-xl border border-taupe/30 bg-white p-6"
    >
      <h3 className="text-sm font-medium text-charcoal">
        Temat i treść potwierdzeń
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-sand">
        Tu zmieniasz temat i treść. Kliknij znacznik, żeby wstawić go w polu,
        w którym stoi kursor. Numer zamówienia, meble i kwota podstawiają się
        same przy wysyłce. Potwierdzenie dla klienta wychodzi dopiero po
        opłaceniu, nie przy przejściu do PayU.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {EMAIL_TEMPLATE_TOKENS.map((token) => (
          <button
            key={token.key}
            type="button"
            onClick={() => insertToken(token.key)}
            className="rounded-full border border-taupe/40 px-2.5 py-1 text-[11px] text-charcoal hover:bg-cream-light"
            title={token.label}
          >
            {tokenMarkup(token.key)}
          </button>
        ))}
      </div>

      <TemplateFields
        title="Przed wpłatą — ten mail nie wychodzi"
        subject={templates.createdSubject}
        body={templates.createdBody}
        subjectKey="createdSubject"
        bodyKey="createdBody"
        onSubject={(createdSubject) => setTemplates({ ...templates, createdSubject })}
        onBody={(createdBody) => setTemplates({ ...templates, createdBody })}
        onFocusField={(key) => {
          activeField.current = key;
        }}
        fieldRefs={fieldRefs}
      />

      <TemplateFields
        title="Po opłaceniu (potwierdzenie)"
        subject={templates.paidSubject}
        body={templates.paidBody}
        subjectKey="paidSubject"
        bodyKey="paidBody"
        onSubject={(paidSubject) => setTemplates({ ...templates, paidSubject })}
        onBody={(paidBody) => setTemplates({ ...templates, paidBody })}
        onFocusField={(key) => {
          activeField.current = key;
        }}
        fieldRefs={fieldRefs}
      />

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="min-h-[44px] rounded-lg bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/85 disabled:opacity-50"
        >
          {saving ? "Zapisywanie..." : "Zapisz treść maili"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void resetDefaults()}
          className="min-h-[44px] rounded-lg border border-taupe/40 px-4 py-2 text-sm text-charcoal hover:bg-cream-light disabled:opacity-50"
        >
          Przywróć domyślne
        </button>
      </div>
      {message ? <p className="mt-3 text-xs text-charcoal">{message}</p> : null}
      {error ? <p className="mt-3 text-xs text-terracotta">{error}</p> : null}
    </section>
  );
}

function TemplateFields({
  title,
  subject,
  body,
  subjectKey,
  bodyKey,
  onSubject,
  onBody,
  onFocusField,
  fieldRefs,
}: {
  title: string;
  subject: string;
  body: string;
  subjectKey: FieldKey;
  bodyKey: FieldKey;
  onSubject: (value: string) => void;
  onBody: (value: string) => void;
  onFocusField: (key: FieldKey) => void;
  fieldRefs: MutableRefObject<
    Partial<Record<FieldKey, HTMLInputElement | HTMLTextAreaElement | null>>
  >;
}) {
  return (
    <div className="mt-6 space-y-3 border-t border-taupe/20 pt-5">
      <h4 className="text-sm font-medium text-charcoal">{title}</h4>
      <div>
        <label className="text-xs text-sand uppercase">Temat</label>
        <input
          ref={(el) => {
            fieldRefs.current[subjectKey] = el;
          }}
          type="text"
          value={subject}
          maxLength={EMAIL_SUBJECT_MAX}
          onFocus={() => onFocusField(subjectKey)}
          onChange={(e) => onSubject(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className={inputClass}
        />
      </div>
      <div>
        <label className="text-xs text-sand uppercase">Treść</label>
        <textarea
          ref={(el) => {
            fieldRefs.current[bodyKey] = el;
          }}
          value={body}
          maxLength={EMAIL_BODY_MAX}
          onFocus={() => onFocusField(bodyKey)}
          onChange={(e) => onBody(e.target.value)}
          className={textareaClass}
        />
        <p className="mt-1 text-right text-[11px] text-sand">
          {body.length}/{EMAIL_BODY_MAX}
        </p>
      </div>
    </div>
  );
}
