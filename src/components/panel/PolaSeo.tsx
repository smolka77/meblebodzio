"use client";

import {
  SEO_DESC_HINT,
  SEO_DESC_MAX,
  SEO_KEYWORDS_MAX,
  SEO_TITLE_HINT,
  SEO_TITLE_MAX,
} from "@/lib/seoPola";

function countTone(length: number, hint: number, max: number) {
  if (length === 0) return "text-sand";
  if (length > max) return "text-red-700";
  if (length > hint) return "text-amber-700";
  return "text-sand";
}

function CharCount({
  length,
  hint,
  max,
}: {
  length: number;
  hint: number;
  max: number;
}) {
  return (
    <span className={`mt-1 block text-right text-[11px] ${countTone(length, hint, max)}`}>
      {length}/{hint}
      {length > hint ? ` (max ${max})` : ""}
    </span>
  );
}

interface SeoFieldsProps {
  title: string;
  description: string;
  onTitle: (value: string) => void;
  onDescription: (value: string) => void;
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
  keywords?: string;
  onKeywords?: (value: string) => void;
  keywordsPlaceholder?: string;
  hint?: string;
}

export function SeoFields({
  title,
  description,
  onTitle,
  onDescription,
  titlePlaceholder,
  descriptionPlaceholder,
  keywords,
  onKeywords,
  keywordsPlaceholder,
  hint = "Puste pola = sklep sam złoży tytuł i opis. Nie wklejaj kodu HTML — tylko zwykły tekst.",
}: SeoFieldsProps) {
  const inputClass =
    "mt-1.5 w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none";

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-sand">{hint}</p>
      <div>
        <label className="text-xs text-sand uppercase">Tytuł w Google</label>
        <input
          type="text"
          maxLength={SEO_TITLE_MAX}
          value={title}
          onChange={(e) => onTitle(e.target.value)}
          placeholder={titlePlaceholder}
          className={inputClass}
        />
        <CharCount length={title.trim().length} hint={SEO_TITLE_HINT} max={SEO_TITLE_MAX} />
      </div>
      <div>
        <label className="text-xs text-sand uppercase">Opis w Google</label>
        <textarea
          rows={3}
          maxLength={SEO_DESC_MAX}
          value={description}
          onChange={(e) => onDescription(e.target.value)}
          placeholder={descriptionPlaceholder}
          className={`${inputClass} resize-y`}
        />
        <CharCount
          length={description.trim().length}
          hint={SEO_DESC_HINT}
          max={SEO_DESC_MAX}
        />
      </div>
      {onKeywords ? (
        <div>
          <label className="text-xs text-sand uppercase">Słowa kluczowe</label>
          <input
            type="text"
            maxLength={SEO_KEYWORDS_MAX}
            value={keywords ?? ""}
            onChange={(e) => onKeywords(e.target.value)}
            placeholder={keywordsPlaceholder}
            className={inputClass}
          />
          <p className="mt-1 text-[11px] leading-relaxed text-sand">
            Po przecinku, np. meble, sofy, Wrohaus. Google prawie ich nie używa — ważniejsze są
            tytuł i opis.
          </p>
        </div>
      ) : null}
    </div>
  );
}
