"use client";

import { useCallback, useState, type InputHTMLAttributes } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { isLocalUpload, isVideoUrl, takeInputFiles } from "@/lib/obrazy";
import { StorefrontImagePreviewPanel } from "@/components/panel/PodgladZdjeciaSklepu";
import type { ProductPagePreviewContext } from "@/components/panel/PodgladZdjeciaSklepu";
import {
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

/** Input pliku na kafelku — bez display:none, więc wgrywanie działa i nie scrolluje panelu. */
export function OverlayFileInput({
  onFiles,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  onFiles: (files: File[]) => void;
}) {
  return (
    <input
      {...props}
      type="file"
      className={
        className ??
        "absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      }
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const files = takeInputFiles(e.currentTarget);
        if (files.length) onFiles(files);
      }}
    />
  );
}

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  uploadEndpoint: "/api/products/upload" | "/api/blog/upload" | "/api/fabrics/upload";
  label?: string;
  folderHint?: string;
  required?: boolean;
  allowVideo?: boolean;
  videoOnly?: boolean;
  hidePreview?: boolean;
  /** Podgląd strony produktu (zamiast szerokiego 16:10). */
  productStorefrontPreview?: boolean;
  productPreviewContext?: ProductPagePreviewContext;
  onError?: (message: string) => void;
}

export function ImageDropzone({
  value,
  onChange,
  uploadEndpoint,
  label = "Zdjęcie",
  folderHint,
  required: _required,
  allowVideo = false,
  videoOnly = false,
  hidePreview = false,
  productStorefrontPreview = false,
  productPreviewContext,
  onError,
}: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const accept = videoOnly
    ? "video/mp4,video/webm"
    : allowVideo
      ? "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
      : "image/jpeg,image/png,image/webp,image/gif";

  const uploadFile = useCallback(
    async (file: File) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const allowAnyVideo = allowVideo || videoOnly;
      if (videoOnly && !isVideo) {
        onError?.("Wrzuć wideo (MP4 lub WebM)");
        return;
      }
      if (!isImage && !(allowAnyVideo && isVideo)) {
        onError?.(
          allowAnyVideo
            ? "Wrzuć zdjęcie, GIF lub wideo (MP4, WebM)"
            : "Wrzuć plik graficzny (JPG, PNG, WebP, GIF)"
        );
        return;
      }

      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await fetch(uploadEndpoint, { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok) {
          onError?.(data.error ?? "Nie udało się wgrać zdjęcia");
          return;
        }
        if (data.url) onChange(data.url);
      } catch {
        onError?.("Błąd połączenia podczas wgrywania");
      } finally {
        setUploading(false);
      }
    },
    [allowVideo, videoOnly, onChange, onError, uploadEndpoint]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  function pickFile(files: File[]) {
    const file = files[0];
    if (file) void uploadFile(file);
  }

  return (
    <div className="relative">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className={panelLabelClass}>{label}</label>
        {folderHint && (
          <span className={panelMetaClass}>{folderHint}</span>
        )}
      </div>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-taupe/30 bg-cream-light">
          {!hidePreview && productStorefrontPreview && !isVideoUrl(value) && (
            <div className="p-3 pb-0">
              <StorefrontImagePreviewPanel
                src={value}
                context={productPreviewContext}
              />
            </div>
          )}
          {!hidePreview && !productStorefrontPreview && (
            <div className="relative aspect-[16/10] max-h-56 w-full sm:max-h-64">
              {isVideoUrl(value) ? (
                <video
                  src={value}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <Image
                  src={value}
                  alt="Podgląd"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 480px"
                  unoptimized={isLocalUpload(value)}
                />
              )}
            </div>
          )}
          {!hidePreview && productStorefrontPreview && isVideoUrl(value) && (
            <div className="relative aspect-[16/10] max-h-56 w-full sm:max-h-64">
              <video
                src={value}
                muted
                loop
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className={`flex flex-wrap gap-2 bg-white p-3 ${hidePreview ? "" : "border-t border-taupe/20"}`}>
            <span className="relative inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-taupe/30 px-3 text-xs text-charcoal hover:bg-cream-light">
              <OverlayFileInput
                disabled={uploading}
                accept={accept}
                onFiles={pickFile}
                aria-label={allowVideo || videoOnly ? "Zmień plik" : "Zmień zdjęcie"}
              />
              <Upload className="h-3.5 w-3.5" />
              {allowVideo || videoOnly ? "Zmień plik" : "Zmień zdjęcie"}
            </span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-200 px-3 text-xs text-red-600 hover:bg-red-50"
            >
              <X className="h-3.5 w-3.5" />
              Usuń
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={`relative flex min-h-[160px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
            uploading ? "opacity-60" : ""
          } ${
            dragging
              ? "border-charcoal bg-cream-light"
              : "border-taupe/40 bg-cream-light/50 hover:border-charcoal/40 hover:bg-cream-light"
          }`}
        >
          <OverlayFileInput
            disabled={uploading}
            accept={accept}
            onFiles={pickFile}
            aria-label={label}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-charcoal/50" />
              <span className="text-sm font-medium text-charcoal">Wgrywanie…</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-charcoal/60" strokeWidth={1.25} />
              <div>
                <p className="text-sm font-semibold text-charcoal">
                  {videoOnly
                    ? "Przeciągnij wideo tkaniny"
                    : allowVideo
                      ? "Przeciągnij zdjęcie, GIF lub wideo"
                      : "Przeciągnij zdjęcie tutaj"}
                </p>
                <p className={`mt-1 ${panelMetaClass}`}>
                  {videoOnly
                    ? "lub kliknij, aby wybrać plik · MP4 / WebM · max 20 MB"
                    : allowVideo
                      ? "lub kliknij, aby wybrać plik · zdjęcie max 8 MB, wideo max 20 MB"
                      : "lub kliknij, aby wybrać plik · max 8 MB"}
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {!value && (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-semibold text-charcoal hover:text-charcoal/80">
            {videoOnly ? "Lub wklej URL wideo" : allowVideo ? "Lub wklej URL pliku" : "Lub wklej URL zdjęcia"}
          </summary>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            className={`mt-2 ${panelInputClass}`}
          />
        </details>
      )}
    </div>
  );
}
