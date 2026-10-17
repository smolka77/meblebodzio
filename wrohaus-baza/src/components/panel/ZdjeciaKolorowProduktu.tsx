"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { OverlayFileInput } from "@/components/panel/StrefaZdjec";
import type { ProductColor } from "@/lib/typy";
import { isLocalUpload } from "@/lib/obrazy";
import {
  COLOR_PHOTO_LIMIT,
  moveListItem,
  productPhotosForColor,
} from "@/lib/zdjeciaProduktu";
import { filesFromClipboard } from "@/lib/wymiary";
import {
  panelHintClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

const COLOR_PHOTO_DRAG = "application/x-sofelio-color-photo";

export function ProductColorPhotosField({
  colors,
  galleryImages,
  onChangeColor,
  onError,
  coverMode = false,
}: {
  colors: ProductColor[];
  galleryImages: string[];
  onChangeColor: (colorId: string, photos: string[]) => void;
  onError?: (message: string) => void;
  coverMode?: boolean;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [pasteTargetId, setPasteTargetId] = useState<string | null>(null);
  const [dragFrom, setDragFrom] = useState<{ colorId: string; index: number } | null>(
    null
  );
  const colorsRef = useRef(colors);
  colorsRef.current = colors;
  const uploadRef = useRef<(color: ProductColor, files: FileList | File[]) => Promise<void>>(
    async () => {}
  );

  function applyPhotos(color: ProductColor, photos: string[]) {
    onChangeColor(color.id, photos);
  }

  async function uploadForColor(color: ProductColor, files: FileList | File[]) {
    const photos = productPhotosForColor(color);
    const room = COLOR_PHOTO_LIMIT - photos.length;
    const list = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, Math.max(0, room));
    if (list.length === 0) {
      onError?.(
        room <= 0
          ? `Ten kolor ma już ${COLOR_PHOTO_LIMIT} zdjęć`
          : "Wrzuć lub wklej plik graficzny (JPG, PNG, WebP)"
      );
      return;
    }
    setUploadingId(color.id);
    const next = [...photos];
    try {
      for (const file of list) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/products/upload", { method: "POST", body: fd });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          onError?.(data.error ?? "Nie udało się wgrać zdjęcia");
          continue;
        }
        if (!next.includes(data.url) && next.length < COLOR_PHOTO_LIMIT) {
          next.push(data.url);
        }
      }
      applyPhotos(color, next);
    } catch {
      onError?.("Błąd połączenia podczas wgrywania");
    } finally {
      setUploadingId(null);
    }
  }
  uploadRef.current = uploadForColor;

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const files = filesFromClipboard(event);
      if (files.length === 0) return;
      const list = colorsRef.current;
      if (!pasteTargetId) return;
      const color = list.find((item) => item.id === pasteTargetId);
      if (!color) return;
      event.preventDefault();
      void uploadRef.current(color, files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteTargetId]);

  if (colors.length === 0) return null;

  return (
    <section className="rounded-2xl border border-charcoal/12 bg-white p-4 sm:p-5">
      <p className={panelLabelClass}>
        {coverMode ? "Zdjęcia materaca w pokrowcu" : "Zdjęcia mebla w kolorze"}
      </p>
      <p className={`mt-1 max-w-2xl ${panelHintClass}`}>
        {coverMode
          ? `Do ${COLOR_PHOTO_LIMIT} zdjęć na każdy pokrowiec. Kliknij kafelek, wgraj plik albo wklej (Ctrl+V). Klient po kliknięciu kafelka widzi materac w tym pokrowcu.`
          : `Do ${COLOR_PHOTO_LIMIT} zdjęć na każdy kolor / odcień tkaniny. Kliknij kafelek, wgraj plik albo wklej (Ctrl+V). Na ogłoszeniu najpierw widać zdjęcia poglądowe — te kadry wchodzą dopiero po kliknięciu tkaniny.`}
      </p>

      <ul className="mt-4 space-y-4">
        {colors.map((color) => {
          const photos = productPhotosForColor(color);
          const busy = uploadingId === color.id;
          const swatch = color.fabricImage;
          const room = COLOR_PHOTO_LIMIT - photos.length;
          return (
            <li
              key={color.id}
              className={`rounded-xl border p-3 sm:p-4 ${
                pasteTargetId === color.id
                  ? "border-charcoal/40 bg-cream-light/40"
                  : "border-taupe/25"
              }`}
              onMouseEnter={() => setPasteTargetId(color.id)}
              onMouseLeave={() =>
                setPasteTargetId((current) => (current === color.id ? null : current))
              }
              onDragOver={(event) => {
                event.preventDefault();
                setPasteTargetId(color.id);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setPasteTargetId(color.id);
                const fromRaw =
                  event.dataTransfer.getData(COLOR_PHOTO_DRAG) ||
                  event.dataTransfer.getData("text/plain");
                if (fromRaw.startsWith(`${color.id}:`)) {
                  return;
                }
                if (event.dataTransfer.files?.length) {
                  void uploadForColor(color, event.dataTransfer.files);
                }
              }}
              onPaste={(event) => {
                const files = filesFromClipboard(event);
                if (files.length === 0) return;
                event.preventDefault();
                void uploadForColor(color, files);
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 overflow-hidden rounded-full ring-1 ring-charcoal/10"
                  style={{ backgroundColor: color.hex }}
                >
                  {swatch ? (
                    <Image
                      src={swatch}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 object-cover"
                      unoptimized={isLocalUpload(swatch)}
                    />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-charcoal">
                    {color.name}
                  </p>
                  {color.fabricName && color.fabricName !== color.name && (
                    <p className={`truncate ${panelMetaClass}`}>{color.fabricName}</p>
                  )}
                </div>
                <span className={panelMetaClass}>
                  {photos.length}/{COLOR_PHOTO_LIMIT}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from({ length: COLOR_PHOTO_LIMIT }, (_, slot) => {
                  const src = photos[slot];
                  return (
                    <div key={slot} className="relative">
                      {src ? (
                        <div
                          draggable
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData(
                              COLOR_PHOTO_DRAG,
                              `${color.id}:${slot}`
                            );
                            event.dataTransfer.setData(
                              "text/plain",
                              `${color.id}:${slot}`
                            );
                            setDragFrom({ colorId: color.id, index: slot });
                          }}
                          onDragOver={(event) => {
                            if (!dragFrom || dragFrom.colorId !== color.id) return;
                            event.preventDefault();
                            event.stopPropagation();
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            const raw =
                              event.dataTransfer.getData(COLOR_PHOTO_DRAG) ||
                              event.dataTransfer.getData("text/plain");
                            const prefix = `${color.id}:`;
                            setDragFrom(null);
                            if (!raw.startsWith(prefix)) return;
                            const from = Number(raw.slice(prefix.length));
                            if (!Number.isFinite(from)) return;
                            applyPhotos(color, moveListItem(photos, from, slot));
                          }}
                          onDragEnd={() => setDragFrom(null)}
                          className={`relative h-20 w-24 cursor-grab overflow-hidden rounded-lg border bg-cream-light active:cursor-grabbing ${
                            dragFrom?.colorId === color.id && dragFrom.index === slot
                              ? "border-terracotta opacity-50"
                              : "border-taupe/30"
                          }`}
                          title="Przeciągnij, żeby zmienić kolejność"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="pointer-events-none object-cover"
                            sizes="96px"
                            unoptimized={isLocalUpload(src)}
                            draggable={false}
                          />
                          <span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded bg-charcoal/70 text-cream">
                            <GripVertical className="h-3 w-3" />
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              applyPhotos(
                                color,
                                photos.filter((_, i) => i !== slot)
                              )
                            }
                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md bg-white/95 text-red-700 shadow-sm"
                            aria-label="Usuń zdjęcie"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                          {slot === 0 && (
                            <span className="absolute bottom-1 left-1 rounded bg-charcoal/85 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-cream uppercase">
                              Główne
                            </span>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`relative flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-[10px] font-semibold ${
                            room > 0 && !busy
                              ? "border-taupe/50 bg-cream-light/70 text-charcoal/55 hover:border-charcoal/40"
                              : "border-taupe/20 bg-cream-light/30 text-charcoal/25"
                          }`}
                        >
                          {slot === photos.length && room > 0 && !busy && (
                            <OverlayFileInput
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              multiple
                              onFiles={(files) => void uploadForColor(color, files)}
                              aria-label={`Dodaj zdjęcie: ${color.name}`}
                            />
                          )}
                          {busy && slot === photos.length ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ImagePlus className="h-4 w-4" />
                              {slot === photos.length ? "Wklej / wgraj" : `${slot + 1}`}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {galleryImages.length > 0 && room > 0 && (
                <div className="mt-3">
                  <p className={panelMetaClass}>albo z galerii produktu</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {galleryImages
                      .filter((src) => !photos.includes(src))
                      .slice(0, 8)
                      .map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => applyPhotos(color, [...photos, src])}
                          className="relative h-10 w-10 overflow-hidden rounded-md border border-taupe/30 hover:border-charcoal/50"
                          aria-label="Przypisz zdjęcie z galerii"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized={isLocalUpload(src)}
                          />
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
