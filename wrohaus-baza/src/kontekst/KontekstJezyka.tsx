"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_HTML,
  type Locale,
  type MessageKey,
  type TranslateVars,
  tPlural,
  translate,
  translateCategory,
  translateCategoryIntro,
  translateHrefLabel,
  writeLocaleCookie,
} from "@/lib/jezyk";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: TranslateVars) => string;
  tp: (
    base: "listing.count" | "search.results" | "home.moreSale",
    n: number,
    extra?: TranslateVars
  ) => string;
  category: (slug: string) => string;
  hrefLabel: (href: string, fallback?: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    setLocaleState(initialLocale);
  }, [initialLocale]);

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      setLocaleState(next);
      writeLocaleCookie(next);
      document.documentElement.lang = LOCALE_HTML[next];
      document.documentElement.dataset.locale = next;
      router.refresh();
    },
    [locale, router]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      tp: (base, n, extra) => tPlural(locale, base, n, extra),
      category: (slug) => translateCategory(locale, slug),
      hrefLabel: (href, fallback) =>
        translateHrefLabel(locale, href, fallback),
    }),
    [locale, setLocale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function useT() {
  return useLanguage().t;
}

export { translateCategoryIntro };
