export function XTMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" fill="#1A1A1A" />
      <path d="M8 8 L20 20 L8 32" fill="none" stroke="#ffffff" strokeWidth="2.4" />
      <path d="M32 8 L20 20 L32 32" fill="none" stroke="#39FF14" strokeWidth="2.4" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <a href="#top" className="flex items-center gap-3">
      <XTMark />
      <span className="text-sm font-medium tracking-tight text-ink">xtechart</span>
    </a>
  );
}
