import fs from "fs/promises";
import path from "path";
import { formatPrice } from "@/lib/dane";
import { company } from "@/lib/firma";
import type { StoreOrder } from "@/lib/typy";

const SMSAPI_URL = "https://api.smsapi.pl/sms.do";
const DEFAULT_TO = "48660591361";
const MESSAGE_MAX = 320;
const SMS_ENV_FILE = path.join(process.cwd(), "data", "private", "sms.env");

export type OrderSmsKind = "created" | "paid";

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function toPolishMobile(raw: string): string | null {
  const digits = digitsOnly(raw);
  if (digits.startsWith("48") && digits.length === 11) return digits;
  if (digits.length === 9) return `48${digits}`;
  return null;
}

function parseEnvFile(raw: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of raw.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i < 0) continue;
    const key = trimmed.slice(0, i).trim();
    let value = trimmed.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function loadSmsFile(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(SMS_ENV_FILE, "utf8");
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

async function resolveToken(): Promise<string> {
  const file = await loadSmsFile();
  return (
    file.SMSAPI_TOKEN?.trim() ||
    process.env.SMSAPI_TOKEN?.trim() ||
    ""
  );
}

function formatNotifyDisplay(e164: string): string {
  const local = e164.startsWith("48") ? e164.slice(2) : e164;
  if (local.length === 9) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return local;
}

export async function notifyNumber(): Promise<string | null> {
  const file = await loadSmsFile();
  return toPolishMobile(
    file.SMS_NOTIFY_TO?.trim() ||
      process.env.SMS_NOTIFY_TO?.trim() ||
      DEFAULT_TO
  );
}

export async function smsStatus(): Promise<{
  configured: boolean;
  to: string;
}> {
  const token = await resolveToken();
  const to = (await notifyNumber()) || DEFAULT_TO;
  return {
    configured: Boolean(token),
    to: formatNotifyDisplay(to),
  };
}

export async function saveSmsToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (trimmed.length < 16) {
    throw new Error("Token SMSAPI jest za krótki.");
  }
  await fs.mkdir(path.dirname(SMS_ENV_FILE), { recursive: true, mode: 0o700 });
  const lines = [
    "# Token OAuth SMSAPI.pl — nie commituj.",
    `SMSAPI_TOKEN=${trimmed}`,
    `SMS_NOTIFY_TO=${DEFAULT_TO}`,
  ];
  const tmp = `${SMS_ENV_FILE}.tmp`;
  await fs.writeFile(tmp, `${lines.join("\n")}\n`, { mode: 0o600 });
  await fs.rename(tmp, SMS_ENV_FILE);
}

function formatOrderWhen(order: StoreOrder): string {
  const raw = order.createdAt || order.date;
  const date = raw ? new Date(raw) : new Date();
  if (Number.isNaN(date.getTime())) return order.date;
  return new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function orderItemsShort(order: StoreOrder): string {
  return order.items
    .map((item) => {
      const extra = [item.colorName, item.sizeName, item.optionsName]
        .filter(Boolean)
        .join(", ");
      const label = extra ? `${item.name} (${extra})` : item.name;
      return `${label} x${item.quantity}`;
    })
    .join(", ");
}

function clipMessage(text: string): string {
  if (text.length <= MESSAGE_MAX) return text;
  return `${text.slice(0, MESSAGE_MAX - 1).trimEnd()}…`;
}

export function orderSmsText(
  order: StoreOrder,
  kind: OrderSmsKind = "created"
): string {
  if (kind === "paid") {
    return clipMessage(
      [
        `Wrohaus OPŁACONE ${order.id}`,
        orderItemsShort(order),
        `Kwota: ${formatPrice(order.total)}`,
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
  return clipMessage(
    [
      `Wrohaus nowe zam. ${order.id}`,
      formatOrderWhen(order),
      orderItemsShort(order),
      `Kwota: ${formatPrice(order.total)}`,
    ]
      .filter(Boolean)
      .join("\n")
  );
}

export function logSmsFailure(
  context: string,
  orderId: string,
  err: unknown
): void {
  console.error(
    `[sms] ${context}`,
    orderId,
    err instanceof Error ? err.message : err
  );
}

export function customerPaidSmsText(order: StoreOrder): string {
  return clipMessage(
    [
      `Wrohaus: zamówienie ${order.id} opłacone`,
      `Kwota: ${formatPrice(order.total)}`,
      "Dziękujemy! Realizacja w toku.",
      company.email,
    ].join("\n")
  );
}

async function sendSmsMessage(
  message: string,
  logId: string,
  destination?: string | null
): Promise<boolean> {
  const token = await resolveToken();
  const to = destination
    ? toPolishMobile(destination)
    : await notifyNumber();

  if (!to) {
    console.warn("[sms] niepoprawny numer — powiadomienie nie wyszło", logId);
    return false;
  }

  if (!token) {
    console.warn("[sms] Brak SMSAPI_TOKEN — powiadomienie nie wyszło", logId);
    if (process.env.NODE_ENV === "development") {
      console.info(`Do: ${to}`);
      console.info(message);
    }
    return false;
  }

  const body = new URLSearchParams({
    to,
    message,
    format: "json",
    encoding: "utf-8",
    from: process.env.SMS_FROM?.trim() || "Eco",
  });

  const res = await fetch(SMSAPI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const data = (await res.json().catch(() => null)) as {
    error?: number;
    message?: string;
    count?: number;
  } | null;

  if (!res.ok || data?.error) {
    const reason = data?.message || `SMSAPI ${res.status}`;
    console.error("[sms] SMSAPI odrzuciło wiadomość", logId, reason);
    throw new Error(reason);
  }
  return true;
}

export async function sendOrderSms(
  order: StoreOrder,
  kind: OrderSmsKind = "created"
): Promise<boolean> {
  return sendSmsMessage(orderSmsText(order, kind), `${kind}:${order.id}`);
}

export async function sendNewOrderSms(order: StoreOrder): Promise<boolean> {
  return sendOrderSms(order, "created");
}

export async function sendPaidOrderSms(order: StoreOrder): Promise<boolean> {
  return sendOrderSms(order, "paid");
}

export async function sendCustomerPaidSms(order: StoreOrder): Promise<boolean> {
  if (!order.phone?.trim()) {
    console.warn("[sms] brak telefonu klienta — SMS nie wyszedł", order.id);
    return false;
  }
  return sendSmsMessage(
    customerPaidSmsText(order),
    `customer-paid:${order.id}`,
    order.phone
  );
}

export async function sendTestSms(): Promise<boolean> {
  return sendSmsMessage(
    "Wrohaus: test SMS. Powiadomienia o zamówieniach działają.",
    "test"
  );
}
