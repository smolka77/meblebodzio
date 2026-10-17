import type { Locale } from "@/lib/jezyk";

export function FlagMark({
  locale,
  className = "",
  shape = "circle",
}: {
  locale: Locale;
  className?: string;
  shape?: "circle" | "rect";
}) {
  return (
    <span
      className={`relative block overflow-hidden shadow-[inset_0_0_0_1px_rgba(17,17,17,0.12)] ${
        shape === "rect" ? "rounded-[3px]" : "rounded-full"
      } ${className}`}
      aria-hidden
    >
      {locale === "pl" && <PolandFlag />}
      {locale === "en" && <UnitedKingdomFlag />}
      {locale === "de" && <GermanyFlag />}
      {locale === "uk" && <UkraineFlag />}
    </span>
  );
}

function PolandFlag() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" preserveAspectRatio="none">
      <rect width="32" height="16" fill="#f8f7f4" />
      <rect y="16" width="32" height="16" fill="#dc143c" />
    </svg>
  );
}

function GermanyFlag() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" preserveAspectRatio="none">
      <rect width="32" height="10.7" fill="#111111" />
      <rect y="10.7" width="32" height="10.6" fill="#dd0000" />
      <rect y="21.3" width="32" height="10.7" fill="#ffce00" />
    </svg>
  );
}

function UkraineFlag() {
  return (
    <svg viewBox="0 0 32 32" className="h-full w-full" preserveAspectRatio="none">
      <rect width="32" height="16" fill="#0057b7" />
      <rect y="16" width="32" height="16" fill="#ffd700" />
    </svg>
  );
}

function UnitedKingdomFlag() {
  return (
    <svg viewBox="0 0 60 30" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 L60 30" stroke="#c8102e" strokeWidth="2" />
      <path d="M60 0 L0 30" stroke="#c8102e" strokeWidth="2" />
      <path d="M30 0 V30 M0 15 H60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0 V30 M0 15 H60" stroke="#c8102e" strokeWidth="6" />
    </svg>
  );
}
