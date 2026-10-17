"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { storage } from "@/lib/schowek";

const CONFIRM_PHRASE = "USUŃ DANE";

const RESET_ITEMS = [
  "Zamówienia i przychody (statystyki dashboardu)",
  "Klienci wyliczeni z zamówień",
  "Newsletter i subskrybenci",
  "Sesje i analityka na żywo",
  "Czaty i załączniki z czatu",
  "Wiadomości z formularza kontaktowego",
  "Prośby o próbki tkanin",
  "Konta użytkowników sklepu (users.json)",
  "Zamówienia w localStorage tej przeglądarki (widok /konto)",
];

const KEPT_ITEMS = [
  "Produkty i zdjęcia produktów",
  "Ustawienia sklepu i hasło admina",
  "FAQ, blog, katalog tkanin",
];

interface ResetStorePanelProps {
  onSuccess?: () => void;
}

export function ResetStorePanel({ onSuccess }: ResetStorePanelProps) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function closeModal() {
    if (loading) return;
    setOpen(false);
    setPhrase("");
    setError("");
  }

  async function handleReset() {
    if (phrase.trim() !== CONFIRM_PHRASE) {
      setError(`Wpisz dokładnie: ${CONFIRM_PHRASE}`);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/reset-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPhrase: phrase.trim() }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Reset nie powiódł się");
      return;
    }

    setSuccess("Dane zostały zresetowane.");
    storage.clearOperationalClientData();
    window.dispatchEvent(new CustomEvent("sofelio:operational-reset"));
    setPhrase("");
    onSuccess?.();
    window.setTimeout(() => {
      setOpen(false);
      setSuccess("");
    }, 1500);
  }

  return (
    <>
      <div className="mt-8 rounded-xl border border-red-200/80 bg-red-50/40 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-red-800/80 uppercase">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
              Strefa niebezpieczna
            </p>
            <h3 className="mt-2 font-serif text-xl text-charcoal">Reset danych operacyjnych</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-sand">
              Usuwa zamówienia, statystyki, klientów, newsletter, czaty i formularze.
              Tej operacji nie można cofnąć.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setError("");
              setSuccess("");
              setPhrase("");
            }}
            className="shrink-0 border border-red-300 bg-white px-5 py-2.5 text-[10px] tracking-[0.2em] text-red-800 uppercase transition-colors hover:bg-red-50"
          >
            Resetuj dane
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-charcoal/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-store-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-taupe/30 px-6 py-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-red-700 uppercase">
                  Potwierdzenie wymagane
                </p>
                <h2 id="reset-store-title" className="mt-1 font-serif text-2xl text-charcoal">
                  Na pewno resetujesz dane?
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="text-sand transition-colors hover:text-charcoal disabled:opacity-50"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
                  Zostanie usunięte
                </p>
                <ul className="mt-3 space-y-2 text-sm text-sand">
                  {RESET_ITEMS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-red-600">×</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
                  Zostanie zachowane
                </p>
                <ul className="mt-3 space-y-2 text-sm text-sand">
                  {KEPT_ITEMS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-charcoal">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <label
                  htmlFor="reset-confirm-phrase"
                  className="text-xs tracking-wide text-sand uppercase"
                >
                  Wpisz <span className="font-medium text-charcoal">{CONFIRM_PHRASE}</span>, aby
                  potwierdzić
                </label>
                <input
                  id="reset-confirm-phrase"
                  type="text"
                  value={phrase}
                  onChange={(e) => {
                    setPhrase(e.target.value);
                    setError("");
                  }}
                  disabled={loading}
                  autoComplete="off"
                  spellCheck={false}
                  className="mt-2 w-full border border-taupe/30 px-4 py-3 text-sm uppercase focus:border-red-400 focus:outline-none disabled:opacity-60"
                  placeholder={CONFIRM_PHRASE}
                />
              </div>

              {error && (
                <p className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {success}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-5 py-3 text-sm text-sand transition-colors hover:text-charcoal disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading || phrase.trim() !== CONFIRM_PHRASE}
                  className="inline-flex items-center justify-center gap-2 bg-red-700 px-6 py-3 text-[10px] tracking-[0.2em] text-white uppercase transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? "Resetowanie…" : "Tak, usuń dane"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
