"use client";

import { useRef, useState } from "react";
import { Copy, Download, FileJson, Sparkles, Upload } from "lucide-react";
import type { Product, ProductTemplateId } from "@/lib/typy";
import { PRODUCT_TEMPLATES } from "@/lib/szablonyProduktu";
import {
  buildAiImportPrompt,
  buildEmptyImportTemplate,
  downloadJsonFile,
  parseImportedListing,
} from "@/lib/importOgloszenia";
import {
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

export function ImportOgloszenia({
  highlighted = false,
  onImported,
}: {
  highlighted?: boolean;
  onImported: (seed: Partial<Product>, warnings: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [templateId, setTemplateId] = useState<ProductTemplateId | "">("");
  const [paste, setPaste] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"prompt" | "none">("none");

  function selectedTemplate(): ProductTemplateId | undefined {
    return templateId || undefined;
  }

  function applyText(text: string) {
    setError("");
    try {
      const result = parseImportedListing(text);
      onImported(result.seed, result.warnings);
      setPaste("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się wczytać wzorca.");
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(buildAiImportPrompt(selectedTemplate()));
      setCopied("prompt");
      window.setTimeout(() => setCopied("none"), 2000);
    } catch {
      setError("Nie udało się skopiować promptu. Zaznacz go ręcznie po pobraniu wzorca.");
    }
  }

  return (
    <section
      className={`rounded-2xl border p-4 sm:p-5 ${
        highlighted
          ? "border-charcoal bg-cream-light/60 shadow-[0_12px_28px_-18px_rgba(17,17,17,0.45)]"
          : "border-taupe/30 bg-cream-light/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal text-cream">
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-lg text-charcoal">Import z AI</h3>
          <p className={`mt-1 ${panelHintClass}`}>
            Skopiuj ogłoszenie dostawcy do ChatGPT / Claude z naszym promptem. Wgraj
            JSON, który wróci — formularz wypełni się sam. Zdjęcia i cenę i tak
            sprawdź przed publikacją.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <label>
          <span className={panelLabelClass}>Wzorzec karty</span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value as ProductTemplateId | "")}
            className={panelInputClass}
          >
            <option value="">Dobierz automatycznie</option>
            {PRODUCT_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={copyPrompt}
          className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-3 text-sm font-semibold text-charcoal hover:bg-cream-light"
        >
          <Copy className="h-4 w-4" />
          {copied === "prompt" ? "Skopiowane" : "Kopiuj prompt"}
        </button>
        <button
          type="button"
          onClick={() =>
            downloadJsonFile(
              templateId
                ? `wrohaus-wzorzec-${templateId}.json`
                : "wrohaus-wzorzec-ogloszenia.json",
              buildEmptyImportTemplate(selectedTemplate())
            )
          }
          className="mt-5 inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-3 text-sm font-semibold text-charcoal hover:bg-cream-light"
        >
          <Download className="h-4 w-4" />
          Pobierz JSON
        </button>
      </div>

      <ol className={`mt-3 list-decimal space-y-1 pl-5 ${panelMetaClass}`}>
        <li>Skopiuj prompt i wklej go do AI razem z tekstem / zrzutem ogłoszenia dostawcy.</li>
        <li>Opcjonalnie dołącz pobrany JSON, żeby AI trzymało nasze etykiety pól.</li>
        <li>Wgraj wynik albo wklej JSON poniżej.</li>
      </ol>

      <label className="mt-4 block">
        <span className={panelLabelClass}>Wypełniony wzorzec</span>
        <textarea
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          rows={7}
          placeholder='Wklej JSON, np. { "szablon": "naroznik", "nazwa": "…", "cenaBrutto": 2499 }'
          className={`${panelInputClass} font-mono text-[13px] leading-relaxed`}
        />
      </label>

      {error ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 text-sm font-semibold text-charcoal hover:bg-cream-light"
        >
          <Upload className="h-4 w-4" />
          Wgraj plik JSON
        </button>
        <button
          type="button"
          disabled={!paste.trim()}
          onClick={() => applyText(paste)}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-charcoal px-4 text-sm font-semibold text-cream disabled:opacity-40 hover:bg-charcoal/85"
        >
          <FileJson className="h-4 w-4" />
          Wypełnij formularz
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json,.txt"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            file
              .text()
              .then((text) => applyText(text))
              .catch(() => setError("Nie udało się odczytać pliku."));
          }}
        />
      </div>
    </section>
  );
}
