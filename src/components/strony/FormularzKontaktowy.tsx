"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, MapPin, Clock, Send, Phone } from "lucide-react";
import { company } from "@/lib/firma";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Zapytanie ogólne",
    message: "",
  });

  useEffect(() => {
    if (searchParams.get("wycena") !== "1") return;

    const produkt = searchParams.get("produkt");
    if (!produkt) return;

    const kolor = searchParams.get("kolor");
    const rozmiar = searchParams.get("rozmiar");
    const slug = searchParams.get("produktSlug");
    const otherFabric = searchParams.get("innaTkanina") === "1";
    const lines = [
      `Proszę o wycenę produktu: ${produkt}`,
      kolor ? `Wybrany kolor tapicerki: ${kolor}` : null,
      rozmiar ? `Wybrany rozmiar: ${rozmiar}` : null,
      slug ? `Strona produktu: /produkt/${slug}` : null,
      "",
      otherFabric
        ? "Interesuje mnie inna tkanina niż te w ofercie. Proszę o indywidualną wycenę i termin produkcji."
        : "Moje zapytanie:",
    ].filter(Boolean);

    setForm((prev) => ({
      ...prev,
      subject: otherFabric ? "Inna tkanina — wycena" : "Wycena mebli na wymiar",
      message: lines.join("\n"),
    }));

    window.requestAnimationFrame(() => {
      document.getElementById("formularz")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Nie udało się wysłać wiadomości. Spróbuj ponownie.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-light">
          <Send className="h-6 w-6 text-charcoal" strokeWidth={1.5} />
        </div>
        <h3 className="mt-6 font-serif text-2xl text-charcoal">
          Dziękujemy za wiadomość
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-sand">
          Odpowiemy na adres {form.email}. Obsługujemy zapytania{" "}
          {company.openingHoursDetail}.
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
          <label className="text-[10px] tracking-[0.2em] text-sand uppercase">
            Imię i nazwisko
          </label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-2 w-full rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.2em] text-sand uppercase">
            E-mail
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-2 w-full rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="text-[10px] tracking-[0.2em] text-sand uppercase">
            Telefon
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-2 w-full rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] tracking-[0.2em] text-sand uppercase">
            Temat
          </label>
          <select
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="mt-2 w-full rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm focus:border-charcoal focus:outline-none"
          >
            <option>Zapytanie ogólne</option>
            <option>Wycena mebli na wymiar</option>
            <option>Status zamówienia</option>
            <option>Reklamacja / zwrot</option>
            <option>Współpraca B2B</option>
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
          className="mt-2 w-full resize-none rounded-xl border border-taupe/40 bg-white px-4 py-3.5 text-sm focus:border-charcoal focus:outline-none"
          placeholder="Opisz swoje zapytanie..."
        />
      </div>
      <p className="text-xs leading-relaxed text-sand">
        Wysyłając formularz, przekazujesz dane potrzebne do odpowiedzi na
        zapytanie. Podstawa: art. 6 ust. 1 lit. b RODO (działania przed umową)
        albo art. 6 ust. 1 lit. f RODO (uzasadniony interes — obsługa
        korespondencji). Szczegóły w{" "}
        <a href="/polityka-prywatnosci" className="underline underline-offset-2">
          Polityce prywatności
        </a>
        .
      </p>
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85 disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {submitting ? "Wysyłanie…" : "Wyślij wiadomość"}
        <Send className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}

export function ContactInfoCards({ phone }: { phone?: string }) {
  const items = [
    {
      icon: MapPin,
      title: "Biuro",
      lines: [company.street, `${company.postalCode} ${company.city}`, company.country],
    },
    {
      icon: Mail,
      title: "E-mail",
      lines: [company.emailDisplay],
    },
    ...(phone
      ? [
          {
            icon: Phone,
            title: "Telefon",
            lines: [phone],
          },
        ]
      : []),
    {
      icon: Clock,
      title: "Godziny kontaktu",
      lines: [company.openingHoursShort, "Od poniedziałku do piątku"],
    },
    {
      icon: MapPin,
      title: "Dane firmy",
      lines: [company.legalName, `NIP ${company.nip}`, `REGON ${company.regon}`],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, lines }) => (
        <div
          key={title}
          className="rounded-2xl bg-white p-8 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] transition-shadow hover:shadow-md"
        >
          <Icon className="h-5 w-5 text-sand" strokeWidth={1.5} />
          <h3 className="mt-4 font-serif text-xl text-charcoal">{title}</h3>
          <div className="mt-3 space-y-1">
            {lines.map((line) => (
              <p key={line} className="text-sm text-sand">
                {line}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
