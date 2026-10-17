"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { Product, ProductColor } from "@/lib/typy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { sizedMediaUrl } from "@/lib/obrazy";
import {
  getProductGallerySlides,
  isGallerySlideActive,
  productAspectClass,
} from "@/lib/zdjeciaProduktu";
import { lockPageScroll } from "@/lib/blokadaScrolla";
import { useLanguage } from "@/kontekst/KontekstJezyka";

interface ProductGalleryProps {
  product: Product;
  selectedColor?: ProductColor;
  showColorPhotos?: boolean;
  /** Odbicie lustrzane przy wariancie drugiej strony (Lewy/Prawy). */
  mirror?: boolean;
}

const MIRROR_IMG = "origin-center transition-transform duration-300 ease-out";

export function ProductGallery({
  product,
  selectedColor,
  showColorPhotos = false,
  mirror = false,
}: ProductGalleryProps) {
  const { t } = useLanguage();
  const slides = useMemo(
    () =>
      getProductGallerySlides(
        product,
        selectedColor?.id,
        showColorPhotos
      ),
    [product, selectedColor?.id, showColorPhotos]
  );
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const galleryMode = showColorPhotos ? `color:${selectedColor?.id ?? ""}` : "overview";

  useEffect(() => {
    if (!showColorPhotos || !selectedColor) {
      setIndex(0);
      return;
    }
    const match = slides.findIndex((slide) =>
      isGallerySlideActive(slide, selectedColor.id)
    );
    setIndex(match >= 0 ? match : 0);
    // Reset only when switching overview ↔ tkanina, not when browsing slides.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryMode]);

  useEffect(() => {
    if (slides.length < 2) return;
    const next = slides[(index + 1) % slides.length];
    if (!next) return;
    const img = new window.Image();
    img.src = sizedMediaUrl(next.src, 960);
  }, [index, slides]);

  const current = slides[index] ?? slides[0];
  if (!current) return null;

  function go(dir: number) {
    if (slides.length < 2) return;
    const next = (index + dir + slides.length) % slides.length;
    setIndex(next);
  }

  function selectSlide(i: number) {
    setIndex(i);
  }

  return (
    <div>
      <div
        className={`relative overflow-hidden rounded-2xl bg-cream-light ${productAspectClass(product.aspectRatio)}`}
      >
        <StoreImage
          src={current.src}
          alt={current.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 55vw"
          className={`${MIRROR_IMG} ${mirror ? "-scale-x-100" : "scale-x-100"}`}
        />
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={t("product.zoomPhoto")}
          className="absolute inset-0 z-[1] cursor-zoom-in"
        />
        <span className="pointer-events-none absolute top-3 right-3 z-[2] flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm">
          <ZoomIn className="h-5 w-5" strokeWidth={1.5} />
        </span>
        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label={t("product.prevPhoto")}
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label={t("product.nextPhoto")}
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-charcoal/35 to-transparent" />
            <div
              className="absolute inset-x-0 bottom-3 z-10 flex items-center justify-center gap-1.5"
              role="tablist"
              aria-label={t("product.gallery")}
            >
              {slides.map((slide, i) => (
                <button
                  key={`${slide.src}-${i}`}
                  type="button"
                  role="tab"
                  aria-label={t("product.photoOf", {
                    n: i + 1,
                    total: slides.length,
                  })}
                  aria-selected={i === index}
                  onClick={() => selectSlide(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-6 bg-cream"
                      : "w-2 bg-white/70 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <div className="mt-4 px-1 py-2">
          <div className="flex justify-center">
            <div className="inline-flex max-w-full gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible">
              {slides.map((slide, i) => (
                <button
                  key={`${slide.src}-${i}`}
                  type="button"
                  onClick={() => selectSlide(i)}
                  onDoubleClick={() => {
                    selectSlide(i);
                    setZoomed(true);
                  }}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-light sm:h-[4.5rem] sm:w-[4.5rem] ${
                    i === index
                      ? "border-2 border-charcoal"
                      : "border border-taupe/40 hover:border-charcoal/35"
                  }`}
                  aria-label={slide.alt}
                  aria-current={i === index ? "true" : undefined}
                >
                  <StoreImage
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    className={`object-cover ${MIRROR_IMG} ${mirror ? "-scale-x-100" : "scale-x-100"}`}
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {zoomed && (
        <ProductPhotoLightbox
          src={current.src}
          alt={current.alt}
          index={index}
          total={slides.length}
          mirror={mirror}
          onClose={() => setZoomed(false)}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      )}
    </div>
  );
}

function ProductPhotoLightbox({
  src,
  alt,
  index,
  total,
  mirror = false,
  onClose,
  onPrev,
  onNext,
}: {
  src: string;
  alt: string;
  index: number;
  total: number;
  mirror?: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useLanguage();
  const stageRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function commit(nextScale: number, x: number, y: number) {
    const clamped = Math.min(4, Math.max(1, nextScale));
    const next =
      clamped <= 1.02
        ? { scale: 1, x: 0, y: 0 }
        : { scale: clamped, x, y };
    scaleRef.current = next.scale;
    offsetRef.current = { x: next.x, y: next.y };
    setScale(next.scale);
    setOffset({ x: next.x, y: next.y });
  }

  useEffect(() => {
    commit(1, 0, 0);
  }, [src]);

  useEffect(() => {
    return lockPageScroll();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let mode: "none" | "pinch" | "pan" | "swipe" = "none";
    let pinchDist = 1;
    let pinchScale = 1;
    let startX = 0;
    let startY = 0;
    let startOx = 0;
    let startOy = 0;
    let moved = false;
    let lastTap = 0;
    let dragging = false;

    function hypot(a: Touch, b: Touch) {
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length >= 2) {
        mode = "pinch";
        pinchDist = hypot(e.touches[0], e.touches[1]) || 1;
        pinchScale = scaleRef.current;
        moved = true;
        return;
      }
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startOx = offsetRef.current.x;
      startOy = offsetRef.current.y;
      moved = false;
      mode = scaleRef.current > 1.02 ? "pan" : "swipe";
    }

    function onTouchMove(e: TouchEvent) {
      if (mode === "pinch" && e.touches.length >= 2) {
        e.preventDefault();
        const dist = hypot(e.touches[0], e.touches[1]) || 1;
        commit(
          pinchScale * (dist / pinchDist),
          offsetRef.current.x,
          offsetRef.current.y
        );
        return;
      }
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
      if (mode === "pan") {
        e.preventDefault();
        commit(scaleRef.current, startOx + dx, startOy + dy);
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length > 0) {
        if (mode === "pinch" && e.touches.length === 1) {
          mode = scaleRef.current > 1.02 ? "pan" : "none";
          const touch = e.touches[0];
          startX = touch.clientX;
          startY = touch.clientY;
          startOx = offsetRef.current.x;
          startOy = offsetRef.current.y;
        }
        return;
      }
      if (mode === "swipe" && moved) {
        const touch = e.changedTouches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) onNext();
          else onPrev();
        }
      } else if (!moved) {
        const now = Date.now();
        if (now - lastTap < 320) {
          if (scaleRef.current > 1.05) commit(1, 0, 0);
          else commit(2.4, 0, 0);
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
      mode = "none";
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      commit(
        scaleRef.current * (e.deltaY < 0 ? 1.1 : 0.9),
        offsetRef.current.x,
        offsetRef.current.y
      );
    }

    function onDblClick(e: MouseEvent) {
      e.preventDefault();
      if (scaleRef.current > 1.05) commit(1, 0, 0);
      else commit(2.4, 0, 0);
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0 || scaleRef.current <= 1.02) return;
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startOx = offsetRef.current.x;
      startOy = offsetRef.current.y;
    }

    function onMouseMove(e: MouseEvent) {
      if (!dragging) return;
      commit(
        scaleRef.current,
        startOx + (e.clientX - startX),
        startOy + (e.clientY - startY)
      );
    }

    function onMouseUp() {
      dragging = false;
    }

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("dblclick", onDblClick);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("dblclick", onDblClick);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onPrev, onNext, src]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/92"
      role="dialog"
      aria-modal="true"
      aria-label={t("product.zoomPhoto")}
    >
      <button
        type="button"
        aria-label={t("product.closeZoom")}
        className="absolute inset-0 cursor-zoom-out"
        onClick={onClose}
      />
      <div
        ref={stageRef}
        className="relative z-10 mx-auto h-[78dvh] w-[min(96vw,1400px)] touch-none overflow-hidden sm:h-[84dvh]"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div
          className="absolute inset-0 origin-center will-change-transform"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
        >
          <div
            className={`absolute inset-0 origin-center ${mirror ? "-scale-x-100" : ""}`}
          >
            <StoreImage
              src={src}
              alt={alt}
              fill
              fit="contain"
              sizes="100vw"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label={t("product.closeZoom")}
        onClick={onClose}
        className="absolute top-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm sm:top-6 sm:right-6"
      >
        <X className="h-5 w-5" strokeWidth={1.75} />
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label={t("product.prevPhoto")}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute top-1/2 left-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={t("product.nextPhoto")}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute top-1/2 right-3 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-charcoal shadow-sm sm:right-6"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </>
      )}
      <p className="pointer-events-none absolute inset-x-0 bottom-5 z-20 px-4 text-center text-[13px] font-medium tracking-wide text-cream/85">
        {total > 1
          ? t("product.photoOf", { n: index + 1, total })
          : t("product.zoomHint")}
        {total > 1 ? (
          <span className="mt-1 block text-[11px] font-normal text-cream/70">
            {t("product.zoomHint")}
          </span>
        ) : null}
      </p>
    </div>,
    document.body
  );
}
