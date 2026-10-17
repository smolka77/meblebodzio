"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { ImageDropzone, OverlayFileInput } from "@/components/panel/StrefaZdjec";
import { FabricWatermarkBadge } from "@/components/sklep/ZnakWodnyTkaniny";
import { panelHintClass, panelInputClass, panelMetaClass } from "@/components/panel/typografiaPanelu";
import { isLocalUpload, isVideoUrl } from "@/lib/obrazy";
import type { Fabric, FabricShade } from "@/lib/typy";
import { fabricShades } from "@/lib/odcienieTkanin";
import { FABRIC_ROLES, fabricRole } from "@/lib/rolaTkaniny";
import { lockPageScroll } from "@/lib/blokadaScrolla";
import Image from "next/image";

function emptyShade(hex = "#D4C9B8"): FabricShade {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `shade-${Date.now()}`,
    name: "",
    hex,
  };
}

function initialShades(fabric?: Fabric): FabricShade[] {
  if (fabric?.colors?.length) {
    return fabric.colors.map((shade) => ({ ...shade }));
  }
  if (fabric) {
    return fabricShades(fabric).map((shade) => ({
      ...shade,
      id: shade.id === "default" ? emptyShade().id : shade.id,
    }));
  }
  return [emptyShade()];
}

type FabricFormData = Omit<Fabric, "id">;

const fabricLabelClass = "block font-serif text-base text-charcoal";
const fabricInputClass = `${panelInputClass} mt-1.5 text-[15px]`;

interface FabricFormModalProps {
  fabric?: Fabric;
  onClose: () => void;
  onSaved: () => void;
}

function fabricPreviewUrl(form: Pick<FabricFormData, "image" | "video">): string {
  return form.video?.trim() || form.image?.trim() || "";
}

export function FabricFormModal({ fabric, onClose, onSaved }: FabricFormModalProps) {
  const [form, setForm] = useState<Omit<FabricFormData, "colorHex">>({
    name: fabric?.name ?? "",
    description: fabric?.description ?? "",
    material: fabric?.material ?? "",
    image: fabric?.image ?? "",
    video: fabric?.video ?? "",
    watermark: fabric?.watermark ?? "",
    specs: fabric?.specs ?? "",
    care: fabric?.care ?? "",
    surcharge: fabric?.surcharge,
    role: fabricRole(fabric ?? { role: "tkanina" }),
    active: fabric?.active ?? true,
  });
  const [shades, setShades] = useState<FabricShade[]>(() => initialShades(fabric));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingShadeId, setUploadingShadeId] = useState<string | null>(null);

  useEffect(() => lockPageScroll(), []);

  function patchShade(index: number, patch: Partial<FabricShade>) {
    setShades((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  async function uploadShadeImage(index: number, file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Wrzuć zdjęcie odcienia (JPG, PNG, WebP)");
      return;
    }
    const shade = shades[index];
    if (!shade) return;
    setUploadingShadeId(shade.id);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/fabrics/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Nie udało się wgrać zdjęcia koloru");
        return;
      }
      patchShade(index, { image: data.url });
    } catch {
      setError("Błąd połączenia podczas wgrywania");
    } finally {
      setUploadingShadeId(null);
    }
  }

  function setFabricMedia(url: string) {
    if (!url.trim()) {
      setForm((prev) => ({ ...prev, image: "", video: "" }));
      return;
    }
    if (isVideoUrl(url)) {
      setForm((prev) => ({ ...prev, video: url, image: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, image: url, video: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.image.trim() && !form.video?.trim()) {
      setError("Dodaj zdjęcie lub wideo tkaniny");
      return;
    }
    const cleanShades = shades
      .map((shade) => ({
        ...shade,
        name: shade.name.trim(),
        hex: shade.hex?.trim() || "#D4C9B8",
        image: shade.image?.trim() || undefined,
      }))
      .filter((shade) => shade.name || shade.image);
    if (cleanShades.length === 0) {
      setError("Dodaj przynajmniej jeden odcień — nazwę i zdjęcie");
      return;
    }
    if (cleanShades.some((shade) => !shade.name.trim())) {
      setError("Każdy odcień musi mieć nazwę");
      return;
    }
    setSaving(true);
    setError("");
    const payload: FabricFormData = {
      ...form,
      colorHex: cleanShades[0]?.hex ?? "#D4C9B8",
      colors: cleanShades,
      surcharge: form.surcharge && form.surcharge > 0 ? form.surcharge : undefined,
    };
    const res = await fetch(fabric ? `/api/fabrics/${fabric.id}` : "/api/fabrics", {
      method: fabric ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać");
      return;
    }
    onSaved();
    onClose();
  }

  const previewUrl = fabricPreviewUrl(form);
  const previewIsVideo = isVideoUrl(previewUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden overscroll-none bg-charcoal/40 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full min-h-0 flex-col overflow-hidden rounded-t-2xl border border-taupe/30 bg-white shadow-xl sm:max-w-xl sm:rounded-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-taupe/30 px-5 py-4">
          <h2 className="font-serif text-lg">{fabric ? "Edytuj tkaninę" : "Nowa tkanina"}</h2>
          <button type="button" onClick={onClose} aria-label="Zamknij">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-5">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div>
            <label className={fabricLabelClass}>Nazwa</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fabricInputClass}
            />
          </div>
          <div>
            <label className={fabricLabelClass}>Materiał</label>
            <input
              value={form.material}
              onChange={(e) => setForm({ ...form, material: e.target.value })}
              className={fabricInputClass}
            />
          </div>
          <div>
            <label className={fabricLabelClass}>Przeznaczenie</label>
            <select
              value={form.role ?? "tkanina"}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as Fabric["role"],
                })
              }
              className={fabricInputClass}
            >
              {FABRIC_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className={`mt-1.5 ${panelHintClass}`}>
              {FABRIC_ROLES.find((role) => role.id === (form.role ?? "tkanina"))?.hint}
            </p>
          </div>
          <div>
            <label className={fabricLabelClass}>Gama kolorystyczna</label>
            <p className={`mt-1 ${panelHintClass}`}>
              Każdy odcień to osobny kafelek u klienta: zdjęcie próbki i nazwa.
              Wideo tkaniny nie zastępuje tych zdjęć — trafia tylko do podglądu
              „więcej o tkaninie”, gdy odcień nie ma własnego zdjęcia.
            </p>
            <div className="mt-3 space-y-3">
              {shades.map((shade, index) => {
                const busy = uploadingShadeId === shade.id;
                return (
                <div
                  key={shade.id}
                  className="rounded-xl border border-taupe/30 bg-cream-light/50 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        value={shade.name}
                        onChange={(e) => patchShade(index, { name: e.target.value })}
                        placeholder={index === 0 ? "np. Piaskowy" : "Nazwa odcienia"}
                        className={fabricInputClass + " mt-0"}
                        required
                      />
                    </div>
                    {shades.length > 1 && (
                      <button
                        type="button"
                        aria-label="Usuń odcień"
                        onClick={() => setShades(shades.filter((_, i) => i !== index))}
                        className="mt-1 text-charcoal/60 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-dashed border-taupe/50 bg-white">
                      {!busy && (
                        <OverlayFileInput
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onFiles={(files) => {
                            const file = files[0];
                            if (file) void uploadShadeImage(index, file);
                          }}
                          aria-label={`Zdjęcie odcienia ${shade.name || index + 1}`}
                        />
                      )}
                      {shade.image ? (
                        <Image
                          src={shade.image}
                          alt={shade.name || `Odcień ${index + 1}`}
                          fill
                          className="pointer-events-none object-cover"
                          sizes="96px"
                          unoptimized={isLocalUpload(shade.image)}
                        />
                      ) : busy ? (
                        <Loader2 className="absolute inset-0 m-auto h-5 w-5 animate-spin text-charcoal/50" />
                      ) : (
                        <span className="pointer-events-none flex h-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold text-charcoal/55">
                          <ImagePlus className="h-4 w-4" />
                          Zdjęcie koloru
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-charcoal">
                        Zdjęcie tego odcienia
                      </p>
                      <p className={panelMetaClass}>
                        {shade.image
                          ? "To zdjęcie zobaczy klient na kafelku koloru."
                          : "Opcjonalnie — bez niego użyjemy ogólnego zdjęcia tkaniny."}
                      </p>
                      {shade.image && (
                        <button
                          type="button"
                          onClick={() => patchShade(index, { image: undefined })}
                          className="mt-1 text-xs font-semibold text-red-700 hover:underline"
                        >
                          Usuń zdjęcie
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShades([...shades, emptyShade(shades[0]?.hex)])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-charcoal"
            >
              <Plus className="h-4 w-4" />
              Dodaj odcień do gamy
            </button>
          </div>
          <div>
            <label className={fabricLabelClass}>Opis</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={fabricInputClass}
            />
          </div>
          <div>
            <label className={fabricLabelClass}>Specyfikacja</label>
            <textarea
              rows={2}
              value={form.specs ?? ""}
              onChange={(e) => setForm({ ...form, specs: e.target.value })}
              placeholder={"np. Typ tkaniny: welur\nSkład: 100% PES\nTest Martindale: >50 000 cykli"}
              className={fabricInputClass}
            />
          </div>
          <div>
            <label className={fabricLabelClass}>Pielęgnacja</label>
            <textarea
              rows={2}
              value={form.care ?? ""}
              onChange={(e) => setForm({ ...form, care: e.target.value })}
              placeholder="np. Odkurzać miękką końcówką, plamy blotować wodą"
              className={fabricInputClass}
            />
          </div>
          <div>
            <label className={fabricLabelClass}>Dopłata za tkaninę (zł)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.surcharge ?? ""}
              onChange={(e) => {
                const raw = e.target.value.trim();
                setForm({
                  ...form,
                  surcharge: raw ? Math.max(0, Math.round(Number(raw) || 0)) : undefined,
                });
              }}
              placeholder="0 — bez dopłaty"
              className={fabricInputClass}
            />
            <p className={`mt-1.5 ${panelHintClass}`}>
              Opcjonalnie. Kwota doliczana do ceny produktu, gdy klient wybierze tę tkaninę.
            </p>
          </div>
          <ImageDropzone
            label="Ogólne zdjęcie lub wideo tkaniny"
            folderHint="Fallback, gdy odcień nie ma własnego zdjęcia — plus podgląd w konfiguratorze"
            value={previewUrl}
            onChange={setFabricMedia}
            uploadEndpoint="/api/fabrics/upload"
            allowVideo
            required
            onError={setError}
          />
          {previewUrl && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-light ring-1 ring-taupe/25">
              {previewIsVideo ? (
                <video
                  src={previewUrl}
                  muted
                  loop
                  autoPlay
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              <FabricWatermarkBadge src={form.watermark} size="lg" />
            </div>
          )}
          {previewUrl && (
            <p className="text-xs text-charcoal/65">
              {previewIsVideo
                ? "Wideo jest podglądem tkaniny w konfiguratorze. Na kafelkach kolorów klient zobaczy zdjęcia odcieni, nie tę animację."
                : "Wgrano zdjęcie — będzie widoczne w konfiguratorze i jako fallback, gdy odcień nie ma własnego zdjęcia."}
            </p>
          )}
          <ImageDropzone
            label="Logo / watermark producenta"
            folderHint="Opcjonalnie — PNG z przezroczystością; pojawi się w prawym dolnym rogu podglądu tkaniny"
            value={form.watermark ?? ""}
            onChange={(url) => setForm({ ...form, watermark: url })}
            uploadEndpoint="/api/fabrics/upload"
            onError={setError}
          />
          <label className="flex items-center gap-2 font-serif text-base text-charcoal">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Aktywna — można wybrać do ogłoszenia
          </label>
          <div className="flex justify-end gap-2 border-t border-taupe/20 pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm">
              Anuluj
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-charcoal px-5 py-2 text-sm text-cream disabled:opacity-60"
            >
              {saving ? "Zapisywanie…" : "Zapisz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
