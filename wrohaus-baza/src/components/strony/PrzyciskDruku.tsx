"use client";

export function PrintButton({ label = "Drukuj" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-[44px] items-center rounded-full border border-charcoal px-6 text-[11px] tracking-[0.12em] text-charcoal uppercase"
    >
      {label}
    </button>
  );
}
