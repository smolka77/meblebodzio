"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import {
  panelHintClass,
  panelInputClass,
  panelLabelClass,
} from "@/components/panel/typografiaPanelu";

export function ProductManualField({
  manualUrl,
  packageCount,
  onChange,
  onError,
}: {
  manualUrl?: string;
  packageCount?: number;
  onChange: (patch: { manualUrl?: string; packageCount?: number }) => void;
  onError?: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("document", "1");
      const res = await fetch("/api/products/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onError?.(data.error || "Nie udało się wgrać instrukcji.");
        return;
      }
      onChange({ manualUrl: data.url });
    } catch {
      onError?.("Nie udało się wgrać instrukcji.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section
      className="rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5"
      onPaste={(event) => {
        const file = Array.from(event.clipboardData?.files ?? [])[0];
        if (!file) return;
        event.preventDefault();
        void upload(file);
      }}
    >
      <p className={panelLabelClass}>Instrukcja i paczki</p>
      <p className={`mt-1 max-w-xl ${panelHintClass}`}>
        Opcjonalnie. Wklej albo wgraj PDF / zdjęcie instrukcji montażu i podaj liczbę
        paczek — pokażemy to na stronie produktu.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
        <div>
          <label className={panelLabelClass}>Instrukcja montażu</label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-taupe/35 bg-cream-light px-3 text-sm font-medium text-charcoal"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {manualUrl ? "Zmień plik" : "Wgraj / wklej plik"}
            </button>
            {manualUrl ? (
              <>
                <a
                  href={manualUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-charcoal underline underline-offset-2"
                >
                  Podgląd
                </a>
                <button
                  type="button"
                  onClick={() => onChange({ manualUrl: "" })}
                  className="text-charcoal/60 hover:text-red-600"
                  aria-label="Usuń instrukcję"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            ) : null}
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void upload(file);
              }}
            />
          </div>
        </div>
        <div>
          <label className={panelLabelClass}>Liczba paczek</label>
          <input
            type="number"
            min={1}
            max={99}
            step={1}
            value={packageCount ?? ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              onChange({
                packageCount: raw ? Math.max(1, Math.round(Number(raw) || 0)) : undefined,
              });
            }}
            placeholder="np. 3"
            className={`${panelInputClass} mt-1.5`}
          />
        </div>
      </div>
    </section>
  );
}
