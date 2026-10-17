import { company } from "@/lib/firma";

type ApplePaySessionCtor = {
  canMakePayments: () => boolean;
  supportsVersion: (version: number) => boolean;
  STATUS_SUCCESS: number;
  STATUS_FAILURE: number;
  new (
    version: number,
    request: {
      countryCode: string;
      currencyCode: string;
      supportedNetworks: string[];
      merchantCapabilities: string[];
      total: { type: string; label: string; amount: string };
    }
  ): {
    onvalidatemerchant: ((event: { validationURL: string }) => void) | null;
    onpaymentauthorized:
      | ((event: { payment: { token: { paymentData: unknown } } }) => void)
      | null;
    oncancel: (() => void) | null;
    begin: () => void;
    abort: () => void;
    completeMerchantValidation: (session: unknown) => void;
    completePayment: (status: number) => void;
  };
};

function applePaySessionCtor(): ApplePaySessionCtor | undefined {
  return (window as unknown as { ApplePaySession?: ApplePaySessionCtor }).ApplePaySession;
}

/** Jak oficjalna wtyczka PayU WooCommerce 2.11 — najwyższa obsługiwana wersja API. */
function applePayApiVersion(ApplePaySession: ApplePaySessionCtor): number {
  for (let version = 14; version >= 1; version--) {
    try {
      if (ApplePaySession.supportsVersion(version)) return version;
    } catch {
      /* starszy Safari bez supportsVersion */
    }
  }
  return 1;
}

/**
 * Safari/iPhone: natywny ApplePaySession.
 * Chrome/Edge/Firefox na Windowsie: apple-pay-sdk.js podkłada ApplePaySession
 * i po begin() pokazuje kod QR do skanu iPhone’em (iOS 18+).
 * canMakePayments() na Windowsie bywa false — samo istnienie konstruktora wystarczy.
 */
export function canUseApplePay(): boolean {
  try {
    const ApplePaySession = applePaySessionCtor();
    if (!ApplePaySession) return false;
    try {
      if (ApplePaySession.canMakePayments()) return true;
    } catch {
      /* SDK na Windowsie */
    }
    return typeof ApplePaySession === "function";
  } catch {
    return false;
  }
}

export type ApplePayAuthorization = {
  paymentData: unknown;
  complete: (ok: boolean) => void;
};

/**
 * Oficjalny przepływ PayU Europe: ApplePaySession na stronie sklepu,
 * walidacja przez POST /api/v2_1/applepay/session (domain + displayName).
 * begin() jest synchroniczne — wywołuj w handlerze kliknięcia, przed await.
 */
export function beginApplePayPayment(amountPln: number): Promise<ApplePayAuthorization | "cancelled" | "failed"> {
  const ApplePaySession = applePaySessionCtor();
  if (!ApplePaySession) return Promise.resolve("failed");

  const amount = (Math.round(amountPln * 100) / 100).toFixed(2);
  const label = company.brandName.slice(0, 64);
  let session: InstanceType<ApplePaySessionCtor>;
  try {
    session = new ApplePaySession(applePayApiVersion(ApplePaySession), {
      countryCode: "PL",
      currencyCode: "PLN",
      supportedNetworks: ["visa", "masterCard"],
      merchantCapabilities: ["supports3DS", "supportsCredit", "supportsDebit"],
      total: { type: "final", label, amount },
    });
  } catch {
    return Promise.resolve("failed");
  }

  const result = new Promise<ApplePayAuthorization | "cancelled" | "failed">((resolve) => {
    let settled = false;
    const finish = (value: ApplePayAuthorization | "cancelled" | "failed") => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    session.onvalidatemerchant = () => {
      void (async () => {
        try {
          const res = await fetch("/api/payu/apple-session", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: "{}",
          });
          const data: unknown = await res.json().catch(() => null);
          if (!res.ok) {
            session.abort();
            finish("failed");
            return;
          }
          session.completeMerchantValidation(unwrapAppleMerchantSession(data));
        } catch {
          session.abort();
          finish("failed");
        }
      })();
    };

    session.onpaymentauthorized = (event) => {
      finish({
        paymentData: event.payment.token.paymentData,
        complete: (ok) => {
          session.completePayment(ok ? ApplePaySession.STATUS_SUCCESS : ApplePaySession.STATUS_FAILURE);
        },
      });
    };

    session.oncancel = () => finish("cancelled");
  });

  try {
    session.begin();
  } catch {
    return Promise.resolve("failed");
  }
  return result;
}

function unwrapAppleMerchantSession(data: unknown): unknown {
  let payload: unknown = data;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload) as unknown;
    } catch {
      throw new Error("Brak sesji Apple Pay");
    }
  }
  if (!payload || typeof payload !== "object") {
    throw new Error("Brak sesji Apple Pay");
  }
  const obj = payload as Record<string, unknown>;
  const nested =
    (isSessionShape(obj.merchantSession) ? obj.merchantSession : null) ||
    (isSessionShape(obj.response) ? obj.response : null) ||
    (isSessionShape(obj.data) ? obj.data : null);
  const session = (nested ?? obj) as Record<string, unknown>;
  if (!isSessionShape(session)) {
    throw new Error("Nieprawidłowa sesja Apple Pay");
  }
  const { status: _status, error: _error, ...rest } = session;
  return rest.merchantSessionIdentifier || rest.epochTimestamp ? rest : session;
}

function isSessionShape(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.merchantSessionIdentifier === "string" ||
    typeof obj.epochTimestamp === "number" ||
    typeof obj.signature === "string"
  );
}
