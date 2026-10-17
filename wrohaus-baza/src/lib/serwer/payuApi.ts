import crypto from "crypto";
import type { StoreOrder } from "@/lib/typy";
import { company } from "@/lib/firma";

function readPayUEnv(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^['"]|['"]$/g, "");
}

export function isPayUConfigured(): boolean {
  return Boolean(
    readPayUEnv("PAYU_POS_ID") &&
      readPayUEnv("PAYU_CLIENT_ID") &&
      readPayUEnv("PAYU_CLIENT_SECRET") &&
      readPayUEnv("PAYU_SECOND_KEY")
  );
}

/** Publiczne dane widgetu rat — tylko posId i 2 pierwsze znaki klucza (wymóg PayU). */
export function getPayUInstallmentPublicConfig(): {
  posId: string;
  key: string;
} | null {
  const posId = readPayUEnv("PAYU_POS_ID");
  if (!/^\d+$/.test(posId)) return null;
  const secret = readPayUEnv("PAYU_CLIENT_SECRET") || readPayUEnv("PAYU_SECOND_KEY");
  const key = secret.slice(0, 2).toLowerCase();
  if (!/^[0-9a-f]{2}$/.test(key)) return null;
  return { posId, key };
}

export function getPayUBaseUrl(): string {
  return readPayUEnv("PAYU_ENV") === "production"
    ? "https://secure.payu.com"
    : "https://secure.snd.payu.com";
}

export function getSiteUrl(): string {
  const url =
    readPayUEnv("NEXT_PUBLIC_SITE_URL") ||
    readPayUEnv("SITE_URL") ||
    "https://wrohaus.pl";
  return url.replace(/\/$/, "");
}

function toGrosze(amountPln: number): string {
  return String(Math.round(amountPln * 100));
}

/** PayU przyjmuje IPv4. Nie wysyłaj 127.0.0.1, gdy klient ma IPv6 w X-Forwarded-For. */
export function payuCustomerIp(request: Request): string {
  const raw = [
    request.headers.get("x-real-ip"),
    request.headers.get("cf-connecting-ip"),
    request.headers.get("x-forwarded-for")?.split(",")[0],
  ];
  for (const value of raw) {
    const ip = value?.trim() ?? "";
    const mapped = ip.match(/::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
    const v4 = mapped?.[1] ?? ip;
    if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(v4) && v4 !== "127.0.0.1" && v4 !== "0.0.0.0") {
      return v4;
    }
  }
  return "127.0.0.1";
}

/**
 * PayU Europe: POST /api/v2_1/applepay/session
 * body = { domain, displayName } — OpenPayU_ApplePay::createSession
 * (nie validationUrl; to pole jest z PayU India / starej integracji).
 */
export async function createApplePaySession(): Promise<unknown> {
  let domain = "";
  try {
    domain = new URL(getSiteUrl()).hostname;
  } catch {
    domain = "wrohaus.pl";
  }
  if (domain.startsWith("www.")) domain = domain.slice(4);
  const displayName = company.brandName.slice(0, 64);
  const token = await getPayUAccessToken();
  const res = await fetch(`${getPayUBaseUrl()}/api/v2_1/applepay/session`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ domain, displayName }),
  });
  const data = (await res.json().catch(() => ({}))) as unknown;
  if (!res.ok) {
    const status =
      data && typeof data === "object" && "status" in data
        ? JSON.stringify((data as { status: unknown }).status)
        : "";
    console.error("PayU Apple Pay session", res.status, status);
    throw new Error("Nie udało się otworzyć sesji Apple Pay");
  }
  return data;
}

function applePayAuthorizationCode(token: unknown): string | undefined {
  if (token == null) return undefined;
  const raw = typeof token === "string" ? token.trim() : JSON.stringify(token);
  if (!raw) return undefined;
  if (/^[A-Za-z0-9+/]+=*$/.test(raw) && raw.length > 80) return raw;
  return Buffer.from(raw, "utf8").toString("base64");
}

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getPayUAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) {
    return tokenCache.token;
  }

  const clientId = readPayUEnv("PAYU_CLIENT_ID");
  const clientSecret = readPayUEnv("PAYU_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("Brak konfiguracji PayU (CLIENT_ID / CLIENT_SECRET)");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(`${getPayUBaseUrl()}/pl/standard/user/oauth/authorize`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PayU OAuth nieudane (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in?: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

export interface PayUCreateResult {
  payuOrderId: string;
  redirectUri: string;
}

type PayUCreateResponse = {
  status?: { statusCode?: string; statusDesc?: string; codeLiteral?: string };
  redirectUri?: string;
  orderId?: string;
};

const PAYU_PAYMENT_ERROR =
  "Nie udało się rozpocząć płatności. Spróbuj ponownie.";

function buildPayUContinueUrl(siteUrl: string, orderId: string, guestAccessToken?: string) {
  const continueUrl = new URL(`${siteUrl}/koszyk/platnosc`);
  continueUrl.searchParams.set("orderId", orderId);
  if (guestAccessToken) continueUrl.searchParams.set("g", guestAccessToken);
  return continueUrl.toString();
}

/** PayU wymaga unikalnego extOrderId na zawsze — ORD-1 po resecie sklepu już tam istnieje. */
function uniquePayUExtOrderId(orderId: string): string {
  return `${orderId}-${crypto.randomBytes(4).toString("hex")}`;
}

/** ORD-15-a1b2c3d4 i stare ORD-15 → ORD-15, żeby notify znalazł zamówienie. */
export function shopOrderIdFromPayUExt(extOrderId: string): string {
  const match = extOrderId.trim().match(/^(ORD-\d+)/i);
  return match ? match[1] : extOrderId.trim();
}

function payUOrderAlreadyExists(data: PayUCreateResponse, raw: string): boolean {
  const code = (data.status?.statusCode ?? "").toUpperCase();
  const literal = (data.status?.codeLiteral ?? "").toUpperCase();
  const desc = `${data.status?.statusDesc ?? ""} ${raw}`.toLowerCase();
  return (
    code === "ERROR_ORDER_NOT_UNIQUE" ||
    literal.includes("NOT_UNIQUE") ||
    literal.includes("ALREADY_EXISTS") ||
    desc.includes("already exists") ||
    desc.includes("not unique")
  );
}

export async function createPayUPayment(
  order: StoreOrder,
  customerIp: string,
  options?: { guestAccessToken?: string; applePayToken?: unknown }
): Promise<PayUCreateResult> {
  const posId = readPayUEnv("PAYU_POS_ID");
  if (!posId) throw new Error("Brak PAYU_POS_ID");

  const token = await getPayUAccessToken();
  const siteUrl = getSiteUrl();
  const [firstName, ...restName] = order.customer.trim().split(/\s+/);
  const lastName = restName.join(" ") || firstName;

  const products = order.items.map((item) => ({
    name: item.name.slice(0, 127),
    unitPrice: toGrosze(item.price),
    quantity: String(item.quantity),
  }));

  if (order.deliveryFee && order.deliveryFee > 0) {
    products.push({
      name: "Dostawa",
      unitPrice: toGrosze(order.deliveryFee),
      quantity: "1",
    });
  }

  if (order.discountAmount && order.discountAmount > 0) {
    products.push({
      name: "Rabat",
      unitPrice: `-${toGrosze(order.discountAmount)}`,
      quantity: "1",
    });
  }

  const ipv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(customerIp.trim())
    ? customerIp.trim()
    : "127.0.0.1";
  const appleAuth = applePayAuthorizationCode(options?.applePayToken);

  const buyer = {
    email: order.email,
    phone: order.phone ?? "",
    firstName: firstName.slice(0, 50),
    lastName: lastName.slice(0, 50),
    language: "pl",
    ...(order.address && order.city && order.postalCode
      ? {
          delivery: {
            street: order.address.slice(0, 100),
            postalCode: order.postalCode,
            city: order.city.slice(0, 50),
            countryCode: "PL",
          },
        }
      : {}),
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const payload = {
      notifyUrl: `${siteUrl}/api/payu/notify`,
      continueUrl: buildPayUContinueUrl(siteUrl, order.id, options?.guestAccessToken),
      customerIp: ipv4,
      merchantPosId: posId,
      description: `${order.transferTitle ?? order.id}`.slice(0, 255),
      currencyCode: "PLN",
      totalAmount: toGrosze(order.total),
      extOrderId: uniquePayUExtOrderId(order.id),
      buyer,
      products,
      payMethods: appleAuth
        ? {
            payMethod: {
              type: "PBL",
              value: "jp",
              authorizationCode: appleAuth,
            },
          }
        : order.paymentMethod === "raty"
          ? {
              payMethod: {
                type: "PBL",
                value: "ai",
              },
            }
          : {
              payMethod: {
                type: "PAYMENT_WALL",
              },
            },
    };

    const res = await fetch(`${getPayUBaseUrl()}/api/v2_1/orders`, {
      method: "POST",
      redirect: "manual",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.text();
    const data = (() => {
      try {
        return JSON.parse(raw) as PayUCreateResponse;
      } catch {
        return {};
      }
    })();

    const statusCode = data.status?.statusCode ?? "";
    const redirectUri =
      data.redirectUri?.trim() || res.headers.get("location")?.trim() || "";
    const payuOrderId = data.orderId?.trim() || "";
    const acceptedHttp = res.status === 302 || res.status === 201 || res.status === 200;
    const acceptedStatus =
      statusCode === "SUCCESS" ||
      statusCode === "WARNING_CONTINUE_REDIRECT" ||
      statusCode === "WARNING_CONTINUE_3DS";

    if (acceptedHttp && acceptedStatus && payuOrderId && (redirectUri || appleAuth)) {
      return {
        payuOrderId,
        redirectUri: redirectUri || buildPayUContinueUrl(siteUrl, order.id, options?.guestAccessToken),
      };
    }

    if (payUOrderAlreadyExists(data, raw) && attempt < 2) {
      continue;
    }

    throw new Error(PAYU_PAYMENT_ERROR);
  }

  throw new Error(PAYU_PAYMENT_ERROR);
}

export function verifyPayUNotifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secondKey = readPayUEnv("PAYU_SECOND_KEY");
  if (!signatureHeader || !secondKey) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((part) => {
      const eq = part.indexOf("=");
      if (eq === -1) return [part.trim(), ""];
      return [part.slice(0, eq).trim(), part.slice(eq + 1)];
    })
  );

  if (!parts.signature) return false;

  const algorithm = (parts.algorithm || "MD5").toUpperCase().replace("-", "");
  const hash =
    algorithm === "SHA256"
      ? crypto.createHash("sha256")
      : algorithm === "MD5"
        ? crypto.createHash("md5")
        : null;
  if (!hash) return false;

  const expected = hash.update(rawBody + secondKey).digest("hex");
  return expected === parts.signature;
}

export type PayUNotifyStatus =
  | "PENDING"
  | "WAITING_FOR_CONFIRMATION"
  | "COMPLETED"
  | "CANCELED"
  | "REJECTED";

export interface PayUNotifyPayload {
  order?: {
    orderId?: string;
    extOrderId?: string;
    status?: PayUNotifyStatus;
  };
}

export function isPayUPaymentCompleted(status?: string): boolean {
  return status === "COMPLETED";
}

export function isPayUPaymentCanceled(status?: string): boolean {
  return status === "CANCELED" || status === "REJECTED";
}
