"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { OverlayFileInput } from "@/components/panel/StrefaZdjec";
import { isLocalUpload } from "@/lib/obrazy";
import {
  moveListItem,
  productAspectUploadHint,
  resolveProductAspectRatio,
} from "@/lib/zdjeciaProduktu";
import {
  DEFAULT_PRODUCT_ASPECT_RATIO,
  PRODUCT_ASPECT_RATIO_OPTIONS,
  type ProductAspectRatio,
} from "@/lib/typy";
import {
  ProductPageMockPreview,
  type ProductPagePreviewContext,
} from "@/components/panel/PodgladZdjeciaSklepu";
import { panelMetaClass } from "@/components/panel/typografiaPanelu";
import { filesFromClipboard } from "@/lib/wymiary";

const MAX_IMAGES = 40;
const GALLERY_DRAG = "application/x-sofelio-gallery-index";

interface ProductImagesFieldProps {
  images: string[];
  onChange: (urls: string[]) => void;
  onError?: (message: string) => void;
  previewContext?: ProductPagePreviewContext;
  aspectRatio?: ProductAspectRatio;
  onAspectRatioChange?: (ratio: ProductAspectRatio) => void;
  hint?: string;
}

export function ProductImagesField({
  images,
  onChange,
  onError,
  previewContext,
  aspectRatio = DEFAULT_PRODUCT_ASPECT_RATIO,
  onAspectRatioChange,
  hint,
}: ProductImagesFieldProps) {
  const [dragging, setDragging] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const skipThumbClick = useRef(false);
  const [pasteArmed, setPasteArmed] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [urlDraft, setUrlDraft] = useState("");
  const [previewIndex, setPreviewIndex] = useState(0);

  const hasImages = images.length > 0;
  const atLimit = images.length >= MAX_IMAGES;
  const busy = uploading > 0;
  const resolvedRatio = resolveProductAspectRatio(aspectRatio);
  const ratioOption =
    PRODUCT_ASPECT_RATIO_OPTIONS.find((option) => option.value === resolvedRatio) ??
    PRODUCT_ASPECT_RATIO_OPTIONS[0];
  const uploadHint = productAspectUploadHint(resolvedRatio);
  const previewWithRatio = {
    ...previewContext,
    aspectRatio: resolvedRatio,
  };

  useEffect(() => {
    if (previewIndex >= images.length) {
      setPreviewIndex(Math.max(0, images.length - 1));
    }
  }, [images.length, previewIndex]);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
      if (list.length === 0) {
        onError?.("Wrzuć pliki graficzne (JPG, PNG, WebP, GIF)");
        return;
      }
      const room = MAX_IMAGES - images.length;
      if (room <= 0) {
        onError?.(`Można dodać maksymalnie ${MAX_IMAGES} zdjęć`);
        return;
      }
      const toUpload = list.slice(0, room);
      if (list.length > room) {
        onError?.(`Dodano tylko ${room} zdjęć — limit to ${MAX_IMAGES}`);
      }

      setUploading((n) => n + toUpload.length);
      const next = [...images];
      const beforeCount = next.length;
      try {
        for (const file of toUpload) {
          const fd = new FormData();
          fd.append("file", file);
          const res = await fetch("/api/products/upload", {
            method: "POST",
            body: fd,
          });
          const data = (await res.json()) as { url?: string; error?: string };
          if (!res.ok || !data.url) {
            onError?.(data.error ?? "Nie udało się wgrać zdjęcia");
            continue;
          }
          if (!next.includes(data.url)) next.push(data.url);
        }
        onChange(next);
        if (next.length > beforeCount) {
          setPreviewIndex(next.length - 1);
        }
      } catch {
        onError?.("Błąd połączenia podczas wgrywania");
      } finally {
        setUploading((n) => Math.max(0, n - toUpload.length));
      }
    },
    [images, onChange, onError]
  );

  useEffect(() => {
    if (!pasteArmed || atLimit || busy) return;
    function onPaste(event: ClipboardEvent) {
      const files = filesFromClipboard(event);
      if (files.length === 0) return;
      event.preventDefault();
      void uploadFiles(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteArmed, atLimit, busy, uploadFiles]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (dragFrom != null) {
      setDragFrom(null);
      setDragOver(null);
      return;
    }
    if (e.dataTransfer.types.includes(GALLERY_DRAG) || e.dataTransfer.types.includes("text/plain")) {
      const raw = e.dataTransfer.getData(GALLERY_DRAG) || e.dataTransfer.getData("text/plain");
      if (raw !== "" && Number.isFinite(Number(raw)) && !e.dataTransfer.files?.length) {
        return;
      }
    }
    if (e.dataTransfer.files?.length) void uploadFiles(e.dataTransfer.files);
  }

  function reorderImages(from: number, to: number) {
    const next = moveListItem(images, from, to);
    if (next === images) return;
    onChange(next);
    setPreviewIndex(to);
  }

  function onThumbDragStart(event: React.DragEvent, index: number) {
    skipThumbClick.current = false;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(GALLERY_DRAG, String(index));
    event.dataTransfer.setData("text/plain", String(index));
    setDragFrom(index);
  }

  function onThumbDragOver(event: React.DragEvent, index: number) {
    if (dragFrom == null && !event.dataTransfer.types.includes(GALLERY_DRAG)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    if (dragOver !== index) setDragOver(index);
  }

  function onThumbDrop(event: React.DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    const raw =
      event.dataTransfer.getData(GALLERY_DRAG) || event.dataTransfer.getData("text/plain");
    const from = Number(raw);
    setDragFrom(null);
    setDragOver(null);
    skipThumbClick.current = true;
    if (!Number.isFinite(from)) return;
    reorderImages(from, index);
  }

  function move(index: number, dir: -1 | 1) {
    reorderImages(index, index + dir);
  }

  function removeAt(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    if (images.includes(url)) {
      onError?.("To zdjęcie jest już dodane");
      return;
    }
    if (atLimit) {
      onError?.(`Można dodać maksymalnie ${MAX_IMAGES} zdjęć`);
      return;
    }
    const next = [...images, url];
    onChange(next);
    setPreviewIndex(next.length - 1);
    setUrlDraft("");
  }

  return (
    <div
      onMouseEnter={() => setPasteArmed(true)}
      onMouseLeave={() => setPasteArmed(false)}
      onDrop={onDrop}
      onDragOver={(e) => {
        e.preventDefault();
        if (dragFrom != null) return;
        const types = Array.from(e.dataTransfer.types);
        if (types.includes("Files") && !atLimit && !busy) setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragging(false);
      }}
      onPaste={(e) => {
        const files = filesFromClipboard(e);
        if (!files.length || atLimit || busy) return;
        e.preventDefault();
        void uploadFiles(files);
      }}
      className={`rounded-2xl border p-4 transition-colors sm:p-5 ${
        dragging ? "border-charcoal bg-cream-light/80" : "border-taupe/25 bg-white"
      }`}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-charcoal">Zdjęcia produktu</p>
          <p className={`mt-0.5 ${panelMetaClass}`}>
            {hint
              ? hint
              : hasImages
                ? "Pierwsze zdjęcie = główne. Drugie = aranżacja (po najechaniu na kartę w sklepie). Przeciągnij miniatury, żeby zmienić kolejność. Możesz też wkleić (Ctrl+V)."
                : "Wgraj, przeciągnij albo wklej zdjęcie (Ctrl+V)"}
          </p>
        </div>
        <span className="rounded-full bg-cream-light px-2.5 py-1 text-[11px] font-medium text-charcoal">
          {images.length} / {MAX_IMAGES}
        </span>
      </div>

      {onAspectRatioChange && (
        <div className="mb-4 rounded-xl border border-taupe/20 bg-cream-light/50 p-3">
          <p className="text-xs font-semibold text-charcoal">Proporcje zdjęć w galerii</p>
          <p className={`mt-0.5 ${panelMetaClass}`}>
            Tak wyświetlą się na stronie produktu. Zalecany rozmiar pliku:{" "}
            <strong className="text-charcoal">{uploadHint}</strong>.
          </p>
          <div
            className="mt-2.5 flex flex-wrap gap-2"
            role="radiogroup"
            aria-label="Proporcje zdjęć produktu"
          >
            {PRODUCT_ASPECT_RATIO_OPTIONS.map((option) => {
              const selected = resolvedRatio === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onAspectRatioChange(option.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    selected
                      ? "border-charcoal bg-charcoal text-cream"
                      : "border-taupe/30 bg-white text-charcoal hover:border-charcoal/40"
                  }`}
                >
                  {option.label}
                  {option.value === DEFAULT_PRODUCT_ASPECT_RATIO ? " · domyślnie" : ""}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!hasImages && (
        <div className="mb-4 rounded-xl bg-terracotta/8 px-3 py-2.5 text-sm font-medium leading-relaxed text-charcoal">
          <span className="font-semibold">Krok 1.</span> Dodaj główne zdjęcie produktu.
          Najlepiej proporcje <strong>{ratioOption.label}</strong> (
          <strong>{uploadHint}</strong>) — wtedy nic nie ucina boków.
        </div>
      )}

      {hasImages && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-charcoal px-3 py-1 text-[11px] font-medium tracking-wide text-cream uppercase">
            {previewIndex === 0 ? (
              <>
                <Star className="h-3 w-3" strokeWidth={1.75} />
                Główne zdjęcie
              </>
            ) : previewIndex === 1 ? (
              <>Aranżacja</>
            ) : (
              <>Zdjęcie {previewIndex + 1}</>
            )}
          </span>
          {images.length > 1 && (
            <span className={`${panelMetaClass} font-semibold text-charcoal`}>
              {previewIndex + 1} z {images.length} w galerii
            </span>
          )}
        </div>
      )}

      <ProductPageMockPreview
        images={images}
        activeIndex={previewIndex}
        onActiveIndexChange={hasImages ? setPreviewIndex : undefined}
        context={previewWithRatio}
        loading={busy && !hasImages}
      />

      {hasImages && images.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-charcoal">
            Przeciągnij zdjęcia, żeby zamienić je miejscami — pierwsze = główne, drugie = aranżacja
          </p>
          <ul className="flex flex-wrap gap-2">
            {images.map((src, index) => (
              <li key={`${src}-${index}`}>
                <button
                  type="button"
                  draggable
                  onDragStart={(event) => onThumbDragStart(event, index)}
                  onDragOver={(event) => onThumbDragOver(event, index)}
                  onDrop={(event) => onThumbDrop(event, index)}
                  onDragEnd={() => {
                    setDragFrom(null);
                    setDragOver(null);
                  }}
                  onClick={() => {
                    if (skipThumbClick.current) {
                      skipThumbClick.current = false;
                      return;
                    }
                    setPreviewIndex(index);
                  }}
                  className={`relative h-16 w-16 cursor-grab overflow-hidden rounded-xl border-2 transition-all active:cursor-grabbing sm:h-[4.5rem] sm:w-[4.5rem] ${
                    dragFrom === index ? "opacity-50" : ""
                  } ${
                    dragOver === index
                      ? "border-terracotta ring-2 ring-terracotta/25"
                      : previewIndex === index
                        ? "border-charcoal ring-2 ring-charcoal/15"
                        : "border-taupe/30 hover:border-charcoal/40"
                  }`}
                  title={
                    index === 0
                      ? "Główne zdjęcie — przeciągnij, żeby zmienić kolejność"
                      : index === 1
                        ? "Aranżacja — pokazuje się po najechaniu na kartę w sklepie"
                        : `Zdjęcie ${index + 1} — przeciągnij, żeby zmienić kolejność`
                  }
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="pointer-events-none object-cover"
                    sizes="80px"
                    unoptimized={isLocalUpload(src)}
                    draggable={false}
                  />
                  <span className="absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded bg-charcoal/70 text-cream">
                    <GripVertical className="h-3 w-3" strokeWidth={2} />
                  </span>
                  {index === 0 && (
                    <span className="absolute right-0 bottom-0 left-0 bg-charcoal/75 py-0.5 text-[8px] font-medium tracking-wide text-cream uppercase">
                      Główne
                    </span>
                  )}
                  {index === 1 && (
                    <span className="absolute right-0 bottom-0 left-0 bg-charcoal/75 py-0.5 text-[8px] font-medium tracking-wide text-cream uppercase">
                      Aranżacja
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasImages && (
        <div className="mt-4 flex flex-wrap gap-2 rounded-xl border border-taupe/20 bg-cream-light/50 p-3">
          <p className={`w-full ${panelMetaClass}`}>
            Edycja wybranego zdjęcia
            {previewIndex === 0
              ? " (głównego)"
              : previewIndex === 1
                ? " (aranżacja)"
                : ""}
            .
            Kolejność zmienisz też przeciągając miniatury wyżej.
          </p>
          <button
            type="button"
            disabled={previewIndex === 0}
            onClick={() => move(previewIndex, -1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 bg-white px-3 py-2 text-xs text-charcoal hover:bg-cream-light disabled:opacity-40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            W lewo
          </button>
          <button
            type="button"
            disabled={previewIndex === images.length - 1}
            onClick={() => move(previewIndex, 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 bg-white px-3 py-2 text-xs text-charcoal hover:bg-cream-light disabled:opacity-40"
          >
            W prawo
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => removeAt(previewIndex)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Usuń to zdjęcie
          </button>
        </div>
      )}

      <div className="relative mt-5">
        {!hasImages ? (
          <div className="relative">
            {!busy && (
              <OverlayFileInput
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onFiles={(files) => void uploadFiles(files)}
                aria-label="Dodaj zdjęcie"
              />
            )}
            <div className="pointer-events-none flex w-full items-center justify-center gap-2.5 rounded-xl bg-charcoal px-6 py-4 text-base font-semibold text-cream">
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Wgrywanie zdjęcia…
                </>
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" strokeWidth={1.75} />
                  Dodaj zdjęcie
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {!atLimit && (
              <div className={`mb-3 rounded-xl bg-cream-light/80 px-3 py-2 ${panelMetaClass}`}>
                <span className="font-semibold text-charcoal">Krok 2 (opcjonalnie).</span>{" "}
                Drugie zdjęcie to aranżacja — na liście produktów pokazuje się po najechaniu na
                kartę.
              </div>
            )}
            <div className={`relative ${busy || atLimit ? "opacity-50" : ""}`}>
              {!busy && !atLimit && (
                <OverlayFileInput
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onFiles={(files) => void uploadFiles(files)}
                  aria-label="Dodaj następne zdjęcie"
                />
              )}
              <div className="pointer-events-none flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-charcoal/25 bg-cream-light px-6 py-4 text-base font-semibold text-charcoal">
                {busy ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Wgrywanie{uploading > 1 ? ` (${uploading})` : "…"}
                  </>
                ) : atLimit ? (
                  <>Osiągnięto limit {MAX_IMAGES} zdjęć</>
                ) : (
                  <>
                    <Plus className="h-5 w-5" strokeWidth={2} />
                    Dodaj następne zdjęcie
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {!atLimit && !busy && (
          <p className={`mt-2 text-center ${panelMetaClass}`}>
            albo przeciągnij pliki na tę sekcję · JPG, PNG, WebP · max 8 MB
          </p>
        )}
      </div>

      <details className="mt-4 rounded-xl border border-taupe/20 bg-cream-light/40 px-3 py-2">
        <summary className="cursor-pointer text-xs font-semibold text-charcoal hover:text-charcoal/80">
          Zaawansowane: wklej adres URL zdjęcia
        </summary>
        <div className="mt-3 flex gap-2 pb-1">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm font-medium text-charcoal focus:border-charcoal focus:outline-none"
          />
          <button
            type="button"
            onClick={addUrl}
            disabled={atLimit}
            className="shrink-0 rounded-lg bg-charcoal px-4 text-sm font-medium text-cream hover:bg-charcoal/90 disabled:opacity-50"
          >
            Dodaj
          </button>
        </div>
      </details>
    </div>
  );
}
