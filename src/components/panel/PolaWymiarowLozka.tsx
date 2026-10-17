"use client";

import { useCallback, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { OverlayFileInput } from "@/components/panel/StrefaZdjec";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import {
  panelHintClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";
import { filesFromClipboard } from "@/lib/wymiary";
import { BED_DIMENSION_CHARTS } from "@/lib/wymiaryLozka";

export function BedDimensionImageField({
  value,
  onChange,
  onError,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  onError?: (message: string) => void;
}) {
  const pasteRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        onError?.("Wklej albo wgraj zdjęcie planszy z wymiarami (JPG, PNG, WebP).");
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/products/upload", {
          method: "POST",
          credentials: "same-origin",
          body: fd,
        });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!res.ok || !data.url) {
          onError?.(data.error || "Nie udało się wgrać planszy wymiarów.");
          return;
        }
        onChange(data.url);
      } catch {
        onError?.("Nie udało się wgrać planszy wymiarów.");
      } finally {
        setUploading(false);
      }
    },
    [onChange, onError]
  );

  return (
    <div
      ref={pasteRef}
      tabIndex={0}
      onPaste={(event) => {
        const files = filesFromClipboard(event);
        if (!files.length) return;
        event.preventDefault();
        void uploadFile(files[0]);
      }}
      className="outline-none"
    >
      <p className={`max-w-2xl ${panelHintClass}`}>
        Zamiast wpisywać centymetry — wklej (Ctrl+V) albo wgraj gotową planszę
        „Wymiary łóżka”. Na stronie produktu kafelek pokaże to zdjęcie.
      </p>

      {value ? (
        <div className="relative mt-4 overflow-hidden rounded-xl border border-taupe/30 bg-cream-light">
          <div className="relative aspect-square w-full bg-white">
            <StoreImage
              src={value}
              alt="Plansza wymiarów łóżka"
              fill
              className="object-contain p-2"
              sizes="(max-width: 768px) 100vw, 520px"
            />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-taupe/20 bg-white p-3">
            <span className="relative inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-taupe/30 px-3 text-xs text-charcoal hover:bg-cream-light">
              <OverlayFileInput
                disabled={uploading}
                accept="image/jpeg,image/png,image/webp"
                onFiles={(files) => {
                  if (files[0]) void uploadFile(files[0]);
                }}
                aria-label="Zmień planszę wymiarów"
              />
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              Zmień zdjęcie
            </span>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Usuń
            </button>
          </div>
        </div>
      ) : (
        <div className="relative mt-4 flex min-h-[180px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-taupe/40 bg-cream-light/50 px-6 py-8 text-center hover:border-charcoal/40">
          <OverlayFileInput
            disabled={uploading}
            accept="image/jpeg,image/png,image/webp"
            onFiles={(files) => {
              if (files[0]) void uploadFile(files[0]);
            }}
            aria-label="Wgraj planszę wymiarów"
          />
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-charcoal/50" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-charcoal/60" strokeWidth={1.25} />
              <p className="text-sm font-semibold text-charcoal">
                Wklej zdjęcie (Ctrl+V) albo przeciągnij / kliknij
              </p>
              <p className={panelMetaClass}>JPG, PNG albo WebP · max 8 MB</p>
            </>
          )}
        </div>
      )}

      <p className={`mt-5 ${panelLabelClass}`}>Albo wybierz gotową planszę</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {BED_DIMENSION_CHARTS.map((chart) => {
          const active = value === chart.src;
          return (
            <button
              key={chart.id}
              type="button"
              onClick={() => onChange(chart.src)}
              aria-pressed={active}
              className={`overflow-hidden rounded-xl border text-left transition-colors ${
                active
                  ? "border-charcoal ring-2 ring-charcoal/20"
                  : "border-taupe/30 hover:border-charcoal/40"
              }`}
            >
              <span className="relative block aspect-square bg-white">
                <StoreImage
                  src={chart.src}
                  alt={`Wymiary ${chart.label}`}
                  fill
                  className="object-contain p-1"
                  sizes="180px"
                />
              </span>
              <span className="block bg-white px-2 py-1.5 text-xs font-semibold text-charcoal">
                {chart.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
