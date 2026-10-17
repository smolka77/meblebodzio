"use client";

import { TagsProvider } from "@/kontekst/KontekstTagow";
import { ShopProvider } from "@/kontekst/KontekstSklepu";
import { LanguageProvider } from "@/kontekst/KontekstJezyka";
import { SessionTracker } from "@/components/sklep/SledzenieSesji";
import { LiveChatWidget } from "@/components/sklep/CzatNaZywo";
import { CookieBanner } from "@/components/uklad/BanerCookies";
import {
  PayUInstallmentsProvider,
  type PayUInstallmentPublicConfig,
} from "@/components/sklep/WidgetRatyPayU";
import type { Locale } from "@/lib/jezyk";
import type { CustomShopCategory, ProductCategory } from "@/lib/typy";

export function Providers({
  children,
  locale,
  visibleProductCategories,
  customCategories,
  payuInstallments,
}: {
  children: React.ReactNode;
  locale: Locale;
  visibleProductCategories?: ProductCategory[];
  customCategories?: CustomShopCategory[];
  payuInstallments?: PayUInstallmentPublicConfig | null;
}) {
  return (
    <LanguageProvider initialLocale={locale}>
      <ShopProvider
        visibleProductCategories={visibleProductCategories}
        customCategories={customCategories}
      >
        <TagsProvider>
          <PayUInstallmentsProvider config={payuInstallments ?? null}>
            <SessionTracker />
            <LiveChatWidget />
            <CookieBanner />
            {children}
          </PayUInstallmentsProvider>
        </TagsProvider>
      </ShopProvider>
    </LanguageProvider>
  );
}
