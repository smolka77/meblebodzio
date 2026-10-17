"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { OverlayFileInput } from "@/components/panel/StrefaZdjec";
import type { Fabric, ProductColor } from "@/lib/typy";
import { isLocalUpload } from "@/lib/obrazy";
import { emptyCover, setColorSurcharge, toggleFabricInColors } from "@/lib/infoTkanin";
import { fabricRole } from "@/lib/rolaTkaniny";
import { filesFromClipboard } from "@/lib/wymiary";
import {
  panelChipLabelClass,
  panelHintClass,
  panelInputClass,
  panelLabelClass,
  panelMetaClass,
} from "@/components/panel/typografiaPanelu";

export function ProductCoversField({
  covers,
  fabrics = [],
  onChange,
  onError,
}: {
  covers: ProductColor[];
  fabrics?: Fabric[];
  onChange: (covers: ProductColor[] | ((prev: ProductColor[]) => ProductColor[])) => void;
  onError?: (message: string) => void;
}) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  function patchCovers(updater: (prev: ProductColor[]) => ProductColor[]) {
    onChange(updater);
  }

  function patch(id: string, next: ProductColor) {
    patchCovers((prev) => prev.map((cover) => (cover.id === id ? next : cover)));
  }

  async function uploadSwatch(cover: ProductColor, file: File) {
    setUploadingId(cover.id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/products/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        onError?.(data.error || "Nie udało się wgrać zdjęcia pokrowca.");
        return;
      }
      patch(cover.id, { ...cover, fabricImage: data.url });
    } catch {
      onError?.("Nie udało się wgrać zdjęcia pokrowca.");
    } finally {
      setUploadingId(null);
    }
  }

  const catalogCovers = fabrics.filter((fabric) => fabricRole(fabric) === "pokrowiec");

  return (
    <section className="rounded-2xl border border-taupe/25 bg-white p-4 sm:p-5">
      <p className={panelLabelClass}>Pokrowce</p>
      <p className={`mt-1 max-w-2xl ${panelHintClass}`}>
        Zamiast tkanin klient wybiera pokrowiec. Każdy może mieć inną cenę (dopłata do
        ceny bazowej). 0 zł = w cenie. Zdjęcie na kafelku to wygląd pokrowca.
        Pokrowce z katalogu (Tkaniny i próbki) nie pokazują się w próbkach tkanin.
      </p>

      {catalogCovers.length > 0 ? (
        <div className="mt-4">
          <p className={panelChipLabelClass}>Z katalogu</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {catalogCovers.map((fabric) => {
              const selected = covers.some(
                (cover) => cover.fabricId === fabric.id || cover.id === fabric.id
              );
              return (
                <button
                  key={fabric.id}
                  type="button"
                  onClick={() =>
                    onChange((prev) => toggleFabricInColors(prev, fabric))
                  }
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    selected
                      ? "border-charcoal bg-charcoal text-cream"
                      : "border-charcoal/10 bg-cream-light text-charcoal hover:border-charcoal/25"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {fabric.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {covers.length === 0 ? (
          <p className={`rounded-xl border border-dashed border-taupe/35 bg-cream-light/50 px-4 py-6 text-center ${panelMetaClass}`}>
            Dodaj przynajmniej dwa pokrowce, żeby klient miał wybór na stronie.
          </p>
        ) : null}

        {covers.map((cover, index) => {
          const busy = uploadingId === cover.id;
          return (
            <div
              key={cover.id}
              className="rounded-xl bg-cream-light/70 p-3 sm:p-4"
              onPaste={(event) => {
                const file = filesFromClipboard(event)[0];
                if (!file) return;
                event.preventDefault();
                void uploadSwatch(cover, file);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                const file = Array.from(event.dataTransfer.files).find((item) =>
                  item.type.startsWith("image/")
                );
                if (file) void uploadSwatch(cover, file);
              }}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-dashed border-taupe/50 bg-white">
                  {!busy && (
                    <OverlayFileInput
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onFiles={(files) => {
                        const file = files[0];
                        if (file) void uploadSwatch(cover, file);
                      }}
                      aria-label={`Zdjęcie pokrowca ${cover.name || index + 1}`}
                    />
                  )}
                  {cover.fabricImage ? (
                    <Image
                      src={cover.fabricImage}
                      alt={cover.name || `Pokrowiec ${index + 1}`}
                      fill
                      className="pointer-events-none object-cover"
                      sizes="96px"
                      unoptimized={isLocalUpload(cover.fabricImage)}
                    />
                  ) : busy ? (
                    <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-charcoal/50" />
                  ) : (
                    <span className="pointer-events-none flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-charcoal/55">
                      <ImagePlus className="h-4 w-4" />
                      Zdjęcie / wklej
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <label className={panelLabelClass}>Nazwa pokrowca</label>
                    <input
                      value={cover.name}
                      onChange={(e) => patch(cover.id, { ...cover, name: e.target.value })}
                      placeholder={index === 0 ? "np. Pokrowiec jersey" : "np. Pokrowiec welurowy"}
                      className={`${panelInputClass} mt-1 bg-white`}
                    />
                  </div>
                  <div className="max-w-[10rem]">
                    <label className={panelLabelClass}>Dopłata (zł)</label>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={cover.fabricSurcharge ?? 0}
                      onChange={(e) => patch(cover.id, setColorSurcharge(cover, e.target.value))}
                      className={`${panelInputClass} mt-1 bg-white`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onChange((prev) => prev.filter((item) => item.id !== cover.id))
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń
                </button>
              </div>
              {index === 0 ? (
                <p className={`mt-2 ${panelMetaClass}`}>Pierwszy = domyślny po wejściu na stronę.</p>
              ) : null}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onChange((prev) => [...prev, emptyCover()])}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal"
      >
        <Plus className="h-4 w-4" />
        Dodaj pokrowiec
      </button>
    </section>
  );
}
