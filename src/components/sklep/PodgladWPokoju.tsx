"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { lockPageScroll } from "@/lib/blokadaScrolla";
import { wytnijTlo, type WycinekMebla } from "@/lib/wycinanieTla";
import * as I from "@/components/wzor/ikony";

type Background =
  | { kind: "camera" }
  | { kind: "photo"; url: string; width: number; height: number };

interface Placement {
  /** Środek mebla — % szerokości sceny. */
  x: number;
  /** Dolna krawędź mebla — % wysokości sceny. */
  y: number;
  /** Szerokość mebla — % szerokości sceny. */
  w: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

/**
 * Podgląd mebla w pokoju klienta: zdjęcie z aparatu albo wgrane z urządzenia + wycięty mebel,
 * który można przesuwać i skalować. Nic nie jest wysyłane na serwer.
 */
export function PodgladWPokoju({
  name,
  slug,
  sources,
  widthCm,
  onClose,
}: {
  name: string;
  slug: string;
  /** Adresy zdjęć mebla do wycięcia — pierwszy, który da się wyciąć, wygrywa. */
  sources: string[];
  widthCm?: number;
  onClose: () => void;
}) {
  const [cut, setCut] = useState<WycinekMebla | null>(null);
  const [cutFailed, setCutFailed] = useState(false);
  const [bg, setBg] = useState<Background | null>(null);
  const [camRatio, setCamRatio] = useState(4 / 3);
  const [place, setPlace] = useState<Placement>({ x: 50, y: 90, w: 46 });
  const [showDim, setShowDim] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const photoUrlRef = useRef<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const pinch = useRef<{ dist: number; w: number } | null>(null);

  useEffect(() => {
    const unlock = lockPageScroll();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlock();
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let fallback: WycinekMebla | null = null;
      for (const src of sources) {
        try {
          const result = await wytnijTlo(src);
          if (cancelled) return;
          if (result.cutout) {
            setCut(result);
            return;
          }
          fallback ??= result;
        } catch {
          /* następne zdjęcie */
        }
      }
      if (cancelled) return;
      if (fallback) setCut(fallback);
      else setCutFailed(true);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(
    () => () => {
      stopCamera();
      if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    },
    []
  );

  useEffect(() => {
    if (bg?.kind === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [bg]);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      setBg({ kind: "camera" });
    } catch {
      setError("Nie udało się uruchomić aparatu. Sprawdź zgodę w przeglądarce albo wgraj zdjęcie pokoju.");
    }
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Wybierz plik ze zdjęciem (JPG, PNG, WebP).");
      return;
    }
    setError(null);
    stopCamera();
    if (photoUrlRef.current) URL.revokeObjectURL(photoUrlRef.current);
    const url = URL.createObjectURL(file);
    photoUrlRef.current = url;
    const probe = new Image();
    probe.onload = () => setBg({ kind: "photo", url, width: probe.naturalWidth, height: probe.naturalHeight });
    probe.onerror = () => setError("Nie udało się odczytać zdjęcia.");
    probe.src = url;
  }

  function resetBackground() {
    stopCamera();
    setBg(null);
    setError(null);
  }

  const ratio = clamp(bg?.kind === "photo" ? bg.width / bg.height : camRatio, 0.6, 1.8);

  function rect() {
    return stageRef.current?.getBoundingClientRect() ?? null;
  }

  function beginDrag(pointer: { x: number; y: number }) {
    const box = rect();
    if (!box) return;
    drag.current = {
      dx: pointer.x - (box.left + (place.x / 100) * box.width),
      dy: pointer.y - (box.top + (place.y / 100) * box.height),
    };
  }

  function onPointerDown(event: React.PointerEvent<HTMLImageElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 1) {
      beginDrag({ x: event.clientX, y: event.clientY });
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), w: place.w };
      drag.current = null;
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLImageElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const box = rect();
    if (!box) return;
    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const start = pinch.current;
      setPlace((p) => ({ ...p, w: clamp((start.w * dist) / start.dist, 8, 100) }));
    } else if (drag.current) {
      const x = ((event.clientX - drag.current.dx - box.left) / box.width) * 100;
      const y = ((event.clientY - drag.current.dy - box.top) / box.height) * 100;
      setPlace((p) => ({ ...p, x: clamp(x, 0, 100), y: clamp(y, 15, 118) }));
    }
  }

  function onPointerUp(event: React.PointerEvent<HTMLImageElement>) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
    if (pointers.current.size === 1) {
      beginDrag([...pointers.current.values()][0]);
    } else {
      drag.current = null;
    }
  }

  async function save() {
    if (!bg || !cut) return;
    const maxSide = 1600;
    const outW = bg.kind === "photo" ? Math.min(bg.width, maxSide) : Math.min(videoRef.current?.videoWidth ?? 1280, maxSide);
    const outH = Math.round(outW / ratio);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let source: CanvasImageSource | null = null;
    let sw = 0;
    let sh = 0;
    if (bg.kind === "photo") {
      source = await loadImage(bg.url);
      sw = bg.width;
      sh = bg.height;
    } else if (videoRef.current) {
      source = videoRef.current;
      sw = videoRef.current.videoWidth;
      sh = videoRef.current.videoHeight;
    }
    if (!source || !sw || !sh) return;
    const cover = Math.max(outW / sw, outH / sh);
    ctx.drawImage(source, (outW - sw * cover) / 2, (outH - sh * cover) / 2, sw * cover, sh * cover);

    const product = await loadImage(cut.url);
    const pw = (place.w / 100) * outW;
    const ph = (pw * cut.height) / cut.width;
    ctx.globalCompositeOperation = cut.cutout ? "source-over" : "multiply";
    ctx.drawImage(product, (place.x / 100) * outW - pw / 2, (place.y / 100) * outH - ph, pw, ph);
    ctx.globalCompositeOperation = "source-over";

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slug}-w-pokoju.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  }

  const ready = Boolean(cut);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Zobacz ${name} w swoim pokoju`}
      className="fixed inset-0 z-[80] flex flex-col bg-[#14110f] text-white"
    >
      <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[12px] text-white/60">Zobacz w swoim pokoju</p>
          <h2 className="truncate text-[17px] font-semibold">{name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij podgląd"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
        >
          <I.Close className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6">
        {!bg ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-8 text-center sm:py-14">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10">
              <I.Camera className="h-7 w-7" />
            </span>
            <h3 className="font-display mt-6 text-[26px] leading-tight sm:text-[32px]">
              Ustaw mebel we własnym wnętrzu
            </h3>
            <ol className="mt-5 space-y-2 text-left text-[15px] text-white/80">
              <li>1. Zrób zdjęcie miejsca, w którym ma stanąć mebel (albo wgraj gotowe).</li>
              <li>2. Przeciągnij mebel i dopasuj rozmiar — palcami lub suwakiem.</li>
              <li>3. Zapisz zdjęcie i pokaż domownikom.</li>
            </ol>
            <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startCamera}
                disabled={!ready && !cutFailed}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 text-[15px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
              >
                <I.Camera className="h-5 w-5" />
                Użyj aparatu
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={!ready && !cutFailed}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white hover:text-ink disabled:opacity-50"
              >
                <I.Upload className="h-5 w-5" />
                Wgraj zdjęcie pokoju
              </button>
            </div>
            {!ready && !cutFailed ? (
              <p className="mt-4 text-[13px] text-white/60">Przygotowuję model mebla…</p>
            ) : null}
            {cutFailed ? (
              <p className="mt-4 text-[13px] text-amber-300">
                Nie udało się przygotować zdjęcia tego mebla do podglądu.
              </p>
            ) : null}
            {error ? <p className="mt-4 text-[13.5px] text-amber-300">{error}</p> : null}
            <p className="mt-6 text-[12.5px] leading-relaxed text-white/50">
              Zdjęcie zostaje na Twoim urządzeniu — nie wysyłamy go na serwer. Podgląd jest
              orientacyjny: proporcje zależą od perspektywy zdjęcia.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[960px] flex-col items-center gap-4">
            <div
              ref={stageRef}
              onWheel={(event) =>
                setPlace((p) => ({ ...p, w: clamp(p.w * (event.deltaY < 0 ? 1.05 : 0.95), 8, 100) }))
              }
              className="relative mx-auto touch-none overflow-hidden rounded-md bg-black"
              style={{ aspectRatio: ratio, width: `min(100%, calc(${(66 * ratio).toFixed(2)}vh / var(--ui-zoom, 1)))` }}
            >
              {bg.kind === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={bg.url} alt="Twoje zdjęcie pokoju" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(event) => {
                    const video = event.currentTarget;
                    if (video.videoWidth && video.videoHeight) setCamRatio(video.videoWidth / video.videoHeight);
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              {cut ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cut.url}
                    alt={name}
                    draggable={false}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    className={`absolute max-w-none cursor-grab touch-none select-none active:cursor-grabbing ${cut.cutout ? "drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]" : "mix-blend-multiply"}`}
                    style={{
                      left: `${place.x}%`,
                      top: `${place.y}%`,
                      width: `${place.w}%`,
                      transform: "translate(-50%, -100%)",
                    }}
                  />
                  {showDim && widthCm ? (
                    <div
                      className="pointer-events-none absolute text-center"
                      style={{ left: `${place.x}%`, top: `${place.y}%`, width: `${place.w}%`, transform: "translateX(-50%)" }}
                    >
                      <div className="mx-auto mt-1.5 flex items-center">
                        <span className="h-2 w-px bg-white" />
                        <span className="h-px flex-1 bg-white" />
                        <span className="h-2 w-px bg-white" />
                      </div>
                      <span className="mt-0.5 inline-block rounded bg-black/65 px-1.5 py-0.5 text-[11px] font-semibold">
                        {widthCm} cm
                      </span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="grid w-full max-w-[720px] gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <label className="flex items-center gap-3 text-[14px]">
                <span className="w-16 shrink-0 text-white/70">Rozmiar</span>
                <input
                  type="range"
                  min={8}
                  max={100}
                  step={1}
                  value={Math.round(place.w)}
                  onChange={(event) => setPlace((p) => ({ ...p, w: +event.target.value }))}
                  className="w-full accent-[#c9825f]"
                  aria-label="Rozmiar mebla"
                />
              </label>
              {widthCm ? (
                <label className="flex cursor-pointer items-center gap-2 text-[14px] text-white/80">
                  <input
                    type="checkbox"
                    checked={showDim}
                    onChange={(event) => setShowDim(event.target.checked)}
                    className="h-4 w-4 accent-[#c9825f]"
                  />
                  Pokaż szerokość ({widthCm} cm)
                </label>
              ) : null}
            </div>
            <p className="max-w-[720px] text-center text-[12.5px] text-white/50">
              Przeciągnij mebel w miejsce docelowe. Aby dopasować skalę, porównaj podaną szerokość
              z czymś, co znasz — np. drzwiami (ok. 90 cm).
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={!ready}
                className="flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-[15px] font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50"
              >
                Zapisz zdjęcie
              </button>
              <button
                type="button"
                onClick={resetBackground}
                className="flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-[15px] font-semibold transition hover:bg-white hover:text-ink"
              >
                <I.Rotate className="h-4 w-4" />
                Zmień tło
              </button>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          onFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </div>,
    document.body
  );
}
