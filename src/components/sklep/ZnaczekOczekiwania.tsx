"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function PaymentAwaitingBadge() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200/60 ring-inset"
    >
      {t("payu.awaiting")}
      <button
        type="button"
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-200/80 text-amber-950"
        aria-label={t("payu.awaitingAria")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Info className="h-2.5 w-2.5" strokeWidth={2.4} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full right-0 z-20 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-taupe/30 bg-white p-3 text-left text-xs font-normal leading-relaxed text-charcoal shadow-lg"
        >
          {t("payu.awaitingHint")}
        </span>
      )}
    </span>
  );
}
