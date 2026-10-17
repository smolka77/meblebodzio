"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronRight,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { company } from "@/lib/firma";
import {
  fabricColorLabel,
  fabricPreviewSrc,
  groupFabricsByStyle,
  type FabricStyleGroup,
} from "@/lib/grupyTkanin";
import { expandFabricAsSampleItems, fabricShadeCount } from "@/lib/odcienieTkanin";
import { isVideoUrl } from "@/lib/obrazy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { FabricWatermarkBadge } from "@/components/sklep/ZnakWodnyTkaniny";
import type { Fabric } from "@/lib/typy";

function sampleOrderLabel(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function SampleOrderBadge({
  index,
  size = "default",
}: {
  index: number;
  size?: "default" | "large";
}) {
  const sizeClass =
    size === "large"
      ? "top-4 left-4 text-4xl sm:top-5 sm:left-5 sm:text-5xl"
      : "top-3 left-3 text-xl sm:top-4 sm:left-4 sm:text-2xl";

  return (
    <span
      className={`absolute z-10 font-serif leading-none text-cream drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] ${sizeClass}`}
    >
      {sampleOrderLabel(index)}
    </span>
  );
}

function FabricMedia({
  fabric,
  alt,
  className = "h-full w-full object-cover",
  sizes,
}: {
  fabric: Fabric;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const src = fabricPreviewSrc(fabric);
  if (src && isVideoUrl(src)) {
    return (
      <video
        src={src}
        muted
        loop
        autoPlay
        playsInline
        className={className}
        aria-label={alt}
      />
    );
  }
  if (src) {
    return (
      <StoreImage
        src={src}
        alt={alt}
        fill
        className={className}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      />
    );
  }
  return (
    <div className="h-full w-full" style={{ backgroundColor: fabric.colorHex }} />
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.14em] uppercase sm:text-sm">
      <span
        className={`rounded-full px-4 py-2 transition-all sm:px-5 sm:py-2.5 ${
          step === 1
            ? "bg-charcoal text-cream shadow-[0_6px_18px_-8px_rgba(17,17,17,0.5)]"
            : "bg-cream-light text-sand"
        }`}
      >
        Rodzaj
      </span>
      <ChevronRight
        className={`h-5 w-5 shrink-0 sm:h-6 sm:w-6 ${
          step === 1 ? "text-charcoal" : "text-taupe"
        }`}
        strokeWidth={2.25}
      />
      <span
        className={`rounded-full px-4 py-2 transition-all sm:px-5 sm:py-2.5 ${
          step === 2
            ? "bg-charcoal text-cream shadow-[0_6px_18px_-8px_rgba(17,17,17,0.5)]"
            : "bg-white text-charcoal shadow-[0_4px_16px_-12px_rgba(17,17,17,0.2)] ring-2 ring-dashed ring-charcoal/30"
        }`}
      >
        Kolor
      </span>
    </div>
  );
}

function StyleCard({
  group,
  index,
  onSelect,
}: {
  group: FabricStyleGroup;
  index: number;
  onSelect: () => void;
}) {
  const hero = group.previewFabric;
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative overflow-hidden rounded-2xl border border-taupe/25 bg-white text-left shadow-[0_8px_28px_-18px_rgba(17,17,17,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:border-charcoal/25 hover:shadow-[0_16px_40px_-20px_rgba(17,17,17,0.28)]"
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-cream-light">
        <FabricMedia
          fabric={hero}
          alt={group.material}
          sizes="(max-width: 640px) 100vw, 33vw"
        />
        <SampleOrderBadge index={index} size="large" />
        <FabricWatermarkBadge src={hero.watermark} size="md" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="font-serif text-2xl text-cream sm:text-[1.65rem]">{group.material}</p>
          <p className="mt-1 text-xs text-cream/80">
            {(() => {
              const n = group.fabrics.reduce(
                (sum, fabric) => sum + fabricShadeCount(fabric),
                0
              );
              return `${n} ${n === 1 ? "odcień" : n < 5 ? "odcienie" : "odcieni"}`;
            })()}
          </p>
        </div>
        <span className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 text-charcoal opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </div>
      <div className="px-5 py-4 sm:px-6">
        <p className="line-clamp-2 text-sm leading-relaxed text-charcoal/70">{group.tagline}</p>
      </div>
    </button>
  );
}

function ColorStep({
  group,
  selected,
  onBack,
  onToggle,
}: {
  group: FabricStyleGroup;
  selected: string[];
  onBack: () => void;
  onToggle: (fabric: Fabric) => void;
}) {
  const shadeItems = useMemo(
    () => group.fabrics.flatMap(expandFabricAsSampleItems),
    [group.fabrics]
  );
  const [focus, setFocus] = useState<Fabric>(shadeItems[0] ?? group.previewFabric);

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-3 text-left transition-colors"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-taupe/35 bg-white text-charcoal shadow-[0_4px_14px_-8px_rgba(17,17,17,0.35)] transition-all group-hover:border-charcoal group-hover:bg-charcoal group-hover:text-cream">
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" strokeWidth={2} />
            </span>
            <span className="font-serif text-xl text-charcoal sm:text-2xl">Wszystkie rodzaje</span>
          </button>
          <StepIndicator step={2} />
        </div>

        <div className="border-b border-taupe/20 pb-6">
          <h2 className="font-serif text-4xl leading-none text-charcoal sm:text-5xl md:text-[3.25rem]">
            {group.material}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sand sm:text-[15px]">
            {group.tagline}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-cream-light shadow-[0_12px_40px_-24px_rgba(17,17,17,0.35)]">
          <div className="relative aspect-[4/5] sm:aspect-[16/10]">
            <FabricMedia
              fabric={focus}
              alt={`${group.material} — ${fabricColorLabel(focus, group.material)}`}
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <FabricWatermarkBadge src={focus.watermark} size="lg" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/35 to-transparent p-5 sm:p-6">
              <p className="text-[10px] tracking-[0.22em] text-cream/75 uppercase">
                {group.material}
              </p>
              <p className="mt-1 font-serif text-2xl text-cream">
                {fabricColorLabel(focus, group.material)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-taupe/20 bg-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-serif text-2xl text-charcoal sm:text-3xl">Wybierz kolor</p>
              <p className="mt-2 text-base leading-relaxed text-charcoal/75 sm:text-lg">
                Kliknij odcień, aby dodać próbkę do zamówienia.
              </p>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-taupe" strokeWidth={1.5} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {shadeItems.map((fabric) => {
              const orderIndex = selected.indexOf(fabric.id);
              const isSelected = orderIndex >= 0;
              const isFocus = focus.id === fabric.id;
              const colorName = fabricColorLabel(fabric, group.material);

              return (
                <button
                  key={fabric.id}
                  type="button"
                  onMouseEnter={() => setFocus(fabric)}
                  onFocus={() => setFocus(fabric)}
                  onClick={() => onToggle(fabric)}
                  className={`group/color relative overflow-hidden rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-charcoal ring-1 ring-charcoal"
                      : isFocus
                        ? "border-charcoal/40 shadow-sm"
                        : "border-taupe/25 hover:border-charcoal/30"
                  }`}
                >
                  <div className="relative aspect-square bg-cream-light">
                    <FabricMedia
                      fabric={fabric}
                      alt={colorName}
                      sizes="120px"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/color:scale-[1.03]"
                    />
                    <FabricWatermarkBadge src={fabric.watermark} size="sm" />
                    {isSelected && <SampleOrderBadge index={orderIndex} />}
                    <span
                      className="absolute bottom-2 left-2 h-4 w-4 rounded-full border border-white/90 shadow"
                      style={{ backgroundColor: fabric.colorHex }}
                    />
                  </div>
                  <div className="px-2.5 py-2">
                    <p
                      className={`truncate text-xs ${
                        isSelected ? "font-semibold text-charcoal" : "text-charcoal/75"
                      }`}
                    >
                      {colorName}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FabricSamplesClient({ fabrics }: { fabrics: Fabric[] }) {
  const groups = useMemo(() => groupFabricsByStyle(fabrics), [fabrics]);
  const fabricById = useMemo(() => {
    const map = new Map<string, Fabric>();
    for (const fabric of fabrics) {
      map.set(fabric.id, fabric);
      for (const item of expandFabricAsSampleItems(fabric)) {
        map.set(item.id, item);
      }
    }
    return map;
  }, [fabrics]);

  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [needsSelectionNotice, setNeedsSelectionNotice] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    message: "",
  });

  const activeGroup = groups.find((group) => group.id === activeStyleId) ?? null;

  function toggleFabric(fabric: Fabric) {
    setNeedsSelectionNotice(false);
    setSelected((prev) => {
      if (prev.includes(fabric.id)) return prev.filter((id) => id !== fabric.id);
      return [...prev, fabric.id];
    });
  }

  function removeSelected(id: string) {
    setSelected((prev) => prev.filter((x) => x !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (selected.length === 0) {
      setNeedsSelectionNotice(true);
      return;
    }
    setNeedsSelectionNotice(false);
    setSubmitting(true);
    const res = await fetch("/api/fabric-samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, fabricIds: selected }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Nie udało się wysłać prośby");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-10 text-center shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream-light">
          <Send className="h-6 w-6 text-charcoal" strokeWidth={1.5} />
        </div>
        <h2 className="mt-6 font-serif text-2xl text-charcoal">Prośba wysłana</h2>
        <p className="mt-3 text-sm leading-relaxed text-sand">
          Wysyłamy próbki na podany adres. Skontaktujemy się, jeśli będziemy potrzebować
          doprecyzowania. Obsługa {company.openingHoursDetail}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-12 xl:gap-16">
      <div className="min-w-0 space-y-10">
        {!activeGroup ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 sm:flex-nowrap">
              <h2 className="min-w-0 font-serif text-2xl leading-tight text-charcoal sm:text-3xl lg:text-4xl">
                Wybierz rodzaj tkaniny
              </h2>
              <div className="shrink-0 translate-y-1 sm:translate-y-1.5">
                <StepIndicator step={1} />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {groups.map((group, index) => (
                <StyleCard
                  key={group.id}
                  group={group}
                  index={index}
                  onSelect={() => setActiveStyleId(group.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <ColorStep
            group={activeGroup}
            selected={selected}
            onBack={() => setActiveStyleId(null)}
            onToggle={toggleFabric}
          />
        )}

        {selected.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] tracking-[0.22em] text-sand uppercase">Twoje próbki</p>
            <ul className="space-y-4">
              {selected.map((id, index) => {
                const fabric = fabricById.get(id);
                if (!fabric) return null;
                const material = fabric.material?.trim() || fabric.name.split(/\s+/)[0];
                const color = fabricColorLabel(fabric, material);
                return (
                  <li
                    key={id}
                    className="overflow-hidden rounded-2xl border border-taupe/20 bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.15)]"
                  >
                    <div className="relative aspect-[16/10] bg-cream-light">
                      <FabricMedia fabric={fabric} alt={color} sizes="672px" />
                      <SampleOrderBadge index={index} size="large" />
                      <FabricWatermarkBadge src={fabric.watermark} size="md" />
                    </div>
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-5">
                      <div className="min-w-0">
                        <p className="font-serif text-xl text-charcoal">{material}</p>
                        <p className="mt-0.5 text-sm text-sand">{color}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelected(id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-taupe/30 text-sand transition-colors hover:border-charcoal hover:text-charcoal"
                        aria-label={`Usuń ${color}`}
                      >
                        <X className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="lg-sticky-below-header">
        <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
          <h2 className="font-serif text-xl text-charcoal">Prośba o próbki</h2>
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              required
              placeholder="Imię i nazwisko"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="E-mail"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Telefon"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
            <input
              required
              placeholder="Ulica i numer"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                placeholder="Miasto"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
              />
              <input
                required
                placeholder="Kod pocztowy"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Wiadomość (opcjonalnie)"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full resize-none rounded-xl border border-taupe/40 px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
            />
            {needsSelectionNotice && (
              <p
                role="alert"
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950"
              >
                Najpierw wybierz rodzaj tkaniny i kolor po lewej stronie — kliknij odcień,
                aby dodać próbkę do zamówienia.
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-charcoal py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase disabled:opacity-50"
            >
              {submitting ? "Wysyłanie…" : "Wyślij prośbę"}
              <Send className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
