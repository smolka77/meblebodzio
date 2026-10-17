"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LOCALES, LOCALE_CODES, LOCALE_NAMES, type Locale } from "@/lib/jezyk";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { FlagMark } from "./Flaga";

export function LanguageSwitch({
  variant = "dark",
  size = "md",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md";
}) {
  const { locale, setLocale, t } = useLanguage();
  const compact = size === "sm";
  const onDark = variant === "dark";

  return (
    <div
      role="radiogroup"
      aria-label={t("lang.label")}
      className={`flex items-center rounded-full p-[3px] ${
        onDark
          ? "bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(248,247,244,0.12)]"
          : "bg-charcoal/[0.05] shadow-[inset_0_0_0_1px_rgba(17,17,17,0.08)]"
      }`}
    >
      {LOCALES.map((code) => (
        <LanguageFlagButton
          key={code}
          locale={code}
          selected={locale === code}
          compact={compact}
          onDark={onDark}
          label={LOCALE_NAMES[code]}
          onSelect={setLocale}
        />
      ))}
    </div>
  );
}

function LanguageFlagButton({
  locale,
  selected,
  compact,
  onDark,
  label,
  onSelect,
}: {
  locale: Locale;
  selected: boolean;
  compact: boolean;
  onDark: boolean;
  label: string;
  onSelect: (locale: Locale) => void;
}) {
  const dim = compact ? "h-7 w-7" : "h-8 w-8";
  const flag = compact ? "h-[18px] w-[18px]" : "h-[20px] w-[20px]";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      title={label}
      onClick={() => onSelect(locale)}
      className={`relative flex ${dim} items-center justify-center rounded-full transition-all duration-300 ease-out ${
        selected
          ? onDark
            ? "bg-cream shadow-[0_6px_16px_-8px_rgba(0,0,0,0.55)]"
            : "bg-white shadow-[0_6px_16px_-8px_rgba(17,17,17,0.35)]"
          : "opacity-55 hover:opacity-100"
      }`}
    >
      <FlagMark locale={locale} className={`${flag} transition-transform duration-300 ${selected ? "scale-100" : "scale-95"}`} />
      {selected && (
        <span
          className={`pointer-events-none absolute inset-[2px] rounded-full ring-2 ring-offset-1 ${
            onDark
              ? "ring-terracotta ring-offset-cream"
              : "ring-terracotta ring-offset-white"
          }`}
        />
      )}
    </button>
  );
}

export function LanguageExpand() {
  const { locale, setLocale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`relative hidden lg:block ${open ? "z-30" : "z-20"}`}
    >
      <button
        type="button"
        aria-label={t("lang.label")}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={LOCALE_NAMES[locale]}
        onClick={() => setOpen((value) => !value)}
        className={`relative flex min-w-[52px] flex-col items-center justify-center gap-1 px-2 py-1 text-charcoal transition-colors hover:text-sand ${
          open
            ? "rounded-t-lg border border-b-0 border-taupe/30 bg-cream"
            : ""
        }`}
      >
        <span className="flex h-6 items-center gap-0.5 leading-none">
          <span className="text-[16px] font-semibold tracking-wide">
            {LOCALE_CODES[locale]}
          </span>
          <ChevronDown
            className={`h-5 w-5 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            strokeWidth={1.5}
          />
        </span>
        <span className="text-[12px] font-medium">{t("lang.label")}</span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("lang.label")}
          className="absolute inset-x-0 top-full z-30 -mt-px flex flex-col rounded-b-lg border border-t-0 border-taupe/30 bg-cream pb-1 shadow-[0_16px_28px_-18px_rgba(17,17,17,0.4)]"
        >
          {LOCALES.filter((code) => code !== locale).map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={false}
              aria-label={LOCALE_NAMES[code]}
              title={LOCALE_NAMES[code]}
              onClick={() => {
                setLocale(code);
                setOpen(false);
              }}
              className="flex items-center justify-center gap-0.5 py-2 text-[16px] font-semibold tracking-wide text-charcoal hover:bg-cream-light hover:text-terracotta"
            >
              <span>{LOCALE_CODES[code]}</span>
              <span className="h-5 w-5" aria-hidden />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function LanguageDrawerRow() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      role="radiogroup"
      aria-label={t("lang.label")}
      className="grid grid-cols-4 border-b border-taupe/30"
    >
      {LOCALES.map((code) => {
        const selected = code === locale;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={LOCALE_NAMES[code]}
            title={LOCALE_NAMES[code]}
            onClick={() => setLocale(code)}
            className={`min-h-[48px] border-b-2 text-[13px] font-semibold tracking-wide transition-colors ${
              selected
                ? "border-terracotta text-terracotta"
                : "border-transparent text-sand"
            }`}
          >
            {LOCALE_CODES[code]}
          </button>
        );
      })}
    </div>
  );
}
