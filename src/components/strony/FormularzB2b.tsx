"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { company } from "@/lib/firma";

const inputClass =
  "mt-2 w-full rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm text-charcoal focus:border-charcoal focus:outline-none";

const labelClass = "text-sm font-semibold leading-relaxed text-charcoal";

const collaborationTypes = [
  "Hotele i apartamenty",
  "Biura i przestrzenie publiczne",
  "Architekci i projektanci wnętrz",
  "Sklep partnerski / dystrybucja",
  "Inna współpraca",
];

export function B2bForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "",
    nip: "",
    name: "",
    email: "",
    phone: "",
    collaboration: collaborationTypes[0],
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      subject: "Współpraca B2B",
      message: [
        `Firma: ${form.companyName.trim()}`,
        form.nip.trim() ? `NIP: ${form.nip.trim()}` : null,
        `Rodzaj współpracy: ${form.collaboration}`,
        "",
        form.message.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Nie udało się wysłać zapytania. Spróbuj ponownie.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-light">
          <Send className="h-6 w-6 text-terracotta" strokeWidth={1.5} />
        </div>
        <h3 className="mt-6 font-serif text-2xl text-charcoal">
          Dziękujemy za zapytanie
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-sand">
          Odezwiemy się na adres {form.email} w sprawie współpracy B2B.
          Obsługujemy zapytania {company.openingHoursDetail}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Nazwa firmy
          </label>
          <input
            required
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            NIP
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={form.nip}
            onChange={(e) => setForm({ ...form, nip: e.target.value })}
            className={inputClass}
            placeholder="opcjonalnie"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Osoba kontaktowa
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            E-mail
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Telefon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>
            Rodzaj współpracy
          </label>
          <select
            value={form.collaboration}
            onChange={(e) => setForm({ ...form, collaboration: e.target.value })}
            className={inputClass}
          >
            {collaborationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] tracking-[0.2em] text-sand uppercase">
          Wiadomość
        </label>
        <textarea
          required
          rows={6}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={`${inputClass} resize-none`}
          placeholder="Opisz zakres współpracy, liczbę sztuk, lokalizację…"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-terracotta py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-terracotta/90 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? "Wysyłanie…" : "Wyślij zapytanie B2B"}
        <Send className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}
