import type { ReactNode } from "react";
import type { ProductHighlight } from "@/lib/typy";
import { Check, Minus, MoveRight, Star } from "lucide-react";

export type HighlightIcon = "dot" | "check" | "dash" | "star" | "arrow";

export const HIGHLIGHT_ICONS: {
  value: HighlightIcon;
  label: string;
}[] = [
  { value: "dot", label: "Kropka" },
  { value: "check", label: "Ptaszek" },
  { value: "dash", label: "Kreska" },
  { value: "star", label: "Gwiazdka" },
  { value: "arrow", label: "Strzałka" },
];

export const LIST_LINE_PREFIXES = [
  { id: "bullet", label: "• Kropka", prefix: "• " },
  { id: "check", label: "✓ Ptaszek", prefix: "✓ " },
  { id: "dash", label: "— Kreska", prefix: "— " },
  { id: "star", label: "★ Gwiazdka", prefix: "★ " },
] as const;

export const LIST_LINE_RE = /^[•✓—★☆]\s+/;
const LIST_PLACEHOLDER_RE = /^(Tekst punktu)+/i;

export function stripListPlaceholder(text: string): string {
  return text.replace(LIST_PLACEHOLDER_RE, "").replace(/^\s+/, "");
}

export function normalizeHighlightIcon(value: unknown): HighlightIcon {
  if (value === "check" || value === "dash" || value === "star" || value === "arrow") {
    return value;
  }
  return "dot";
}

export function withHighlightIcon(
  highlight: Omit<ProductHighlight, "icon"> & { icon?: HighlightIcon }
): ProductHighlight {
  return {
    ...highlight,
    icon: normalizeHighlightIcon(highlight.icon),
  };
}

function iconClass(className: string): string {
  const sized = /(?:^|\s)(?:h-|w-|size-|!h-|!w-)/.test(className);
  return `${sized ? "" : "h-[1em] w-[1em] "}shrink-0 ${className}`.trim();
}

export function HighlightBullet({
  icon,
  className = "",
}: {
  icon?: HighlightIcon;
  className?: string;
}) {
  const kind = normalizeHighlightIcon(icon);
  const base = iconClass(className);

  switch (kind) {
    case "check":
      return <Check className={base} strokeWidth={2.25} />;
    case "dash":
      return <Minus className={base} strokeWidth={2.25} />;
    case "star":
      return <Star className={`${base} translate-y-[0.08em]`} strokeWidth={2} />;
    case "arrow":
      return <MoveRight className={base} strokeWidth={2} />;
    default:
      return (
        <span
          className={`h-[0.35em] w-[0.35em] shrink-0 rounded-full bg-charcoal ${className}`.trim()}
        />
      );
  }
}

/** Ikona w osi pierwszej linii tytułu — nie „lata” nad tekstem. */
export function HighlightTitleRow({
  icon,
  title,
  className = "",
}: {
  icon?: HighlightIcon;
  title: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-2.5 ${className}`.trim()}>
      <span
        className="flex h-[1.375em] w-[1.125em] shrink-0 items-center justify-center text-[15px] leading-none"
        aria-hidden
      >
        <HighlightBullet icon={icon} className="text-terracotta" />
      </span>
      <p className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-charcoal">
        {title}
      </p>
    </div>
  );
}

function ListLineBullet({ symbol }: { symbol: string }) {
  if (symbol === "✓") {
    return <Check className="h-[1em] w-[1em] shrink-0" strokeWidth={2.25} />;
  }
  if (symbol === "★") {
    return (
      <Star className="h-[1em] w-[1em] shrink-0 translate-y-[0.08em]" strokeWidth={2} />
    );
  }
  if (symbol === "—") {
    return <Minus className="h-[1em] w-[1em] shrink-0" strokeWidth={2.25} />;
  }
  return <span className="h-[0.35em] w-[0.35em] shrink-0 rounded-full bg-charcoal" />;
}

function normalizeDescriptionText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u2028/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<div[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

export function FormattedProductDescription({ text }: { text: string }) {
  const normalized = normalizeDescriptionText(text);
  const blocks = normalized.split(/\n\s*\n/).filter(Boolean);

  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, blockIndex) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
        const listLines = lines.filter((line) => LIST_LINE_RE.test(line));

        if (listLines.length > 0 && listLines.length === lines.length) {
          return (
            <ul key={blockIndex} className="space-y-2">
              {lines.map((line, lineIndex) => {
                const symbol = line.charAt(0);
                const content = stripListPlaceholder(line.replace(LIST_LINE_RE, ""));
                if (!content) return null;
                return (
                  <li
                    key={lineIndex}
                    className="flex items-start gap-2 text-[15px] leading-relaxed text-charcoal/80"
                  >
                    <span className="flex h-[1.5em] w-[1.125em] shrink-0 items-center justify-center">
                      <ListLineBullet symbol={symbol} />
                    </span>
                    <span className="min-w-0 flex-1">{content}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <div key={blockIndex} className="space-y-3">
            {lines.map((line, lineIndex) => {
              if (LIST_LINE_RE.test(line)) {
                const symbol = line.charAt(0);
                const content = stripListPlaceholder(line.replace(LIST_LINE_RE, ""));
                if (!content) return null;
                return (
                  <p
                    key={lineIndex}
                    className="flex items-start gap-2 text-[15px] leading-relaxed text-charcoal/80"
                  >
                    <span className="flex h-[1.5em] w-[1.125em] shrink-0 items-center justify-center">
                      <ListLineBullet symbol={symbol} />
                    </span>
                    <span className="min-w-0 flex-1">{content}</span>
                  </p>
                );
              }
              return (
                <p key={lineIndex} className="text-[15px] leading-[1.8] text-charcoal/80">
                  {stripListPlaceholder(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
