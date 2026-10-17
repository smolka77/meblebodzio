"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import Script from "next/script";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import type { Locale } from "@/lib/jezyk";

export type PayUInstallmentPublicConfig = {
  posId: string;
  key: string;
};

const PAYU_WIDGET_SRC = "https://static.payu.com/res/v2/widget-mini-installments.js";
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50_000;

type OpenPayUInstallments = {
  Installments: {
    miniInstallment: (
      selector: string,
      options: {
        creditAmount: number;
        posId: string;
        key: string;
        showLongDescription?: boolean;
        currencySign?: string;
        lang?: string;
      }
    ) => Promise<unknown>;
  };
};

declare global {
  interface Window {
    OpenPayU?: OpenPayUInstallments;
  }
}

const PayUInstallmentsContext = createContext<PayUInstallmentPublicConfig | null>(
  null
);

function widgetLang(locale: Locale): "pl" | "en" | "cs" {
  if (locale === "en" || locale === "de") return "en";
  return "pl";
}

function waitForOpenPayU(timeoutMs = 12_000): Promise<OpenPayUInstallments["Installments"]> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      const api = window.OpenPayU?.Installments;
      if (api?.miniInstallment) {
        resolve(api);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("PayU installment widget script did not load"));
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  });
}

export function PayUInstallmentsProvider({
  config,
  children,
}: {
  config: PayUInstallmentPublicConfig | null;
  children: ReactNode;
}) {
  return (
    <PayUInstallmentsContext.Provider value={config}>
      {config ? (
        <Script src={PAYU_WIDGET_SRC} strategy="afterInteractive" />
      ) : null}
      {children}
    </PayUInstallmentsContext.Provider>
  );
}

export function PayUInstallmentsMini({
  amount,
  id,
  className = "",
}: {
  amount: number;
  id?: string;
  className?: string;
}) {
  const config = useContext(PayUInstallmentsContext);
  const { locale } = useLanguage();
  const reactId = useId().replace(/:/g, "");
  const rounded = Math.round(Number(amount) * 100) / 100;
  const inRange = rounded >= MIN_AMOUNT && rounded <= MAX_AMOUNT;
  const safeId = (id ?? reactId).replace(/[^a-zA-Z0-9_-]/g, "-");
  const slotId = `installment-mini-${safeId}-${String(rounded).replace(".", "-")}`;
  const slotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!config || !inRange) return;
    let cancelled = false;
    const node = slotRef.current;

    void waitForOpenPayU()
      .then((api) => {
        if (cancelled || !slotRef.current) return;
        slotRef.current.replaceChildren();
        return api.miniInstallment(`#${CSS.escape(slotId)}`, {
          creditAmount: rounded,
          posId: config.posId,
          key: config.key,
          showLongDescription: true,
          currencySign: "PLN",
          lang: widgetLang(locale),
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) console.error(String(error));
      });

    return () => {
      cancelled = true;
      node?.replaceChildren();
    };
  }, [config, inRange, rounded, slotId, locale]);

  if (!config || !inRange) return null;

  return (
    <p className={`min-h-[1.25rem] text-sm leading-relaxed text-charcoal/75 ${className}`.trim()}>
      <span id={slotId} ref={slotRef} />
    </p>
  );
}
