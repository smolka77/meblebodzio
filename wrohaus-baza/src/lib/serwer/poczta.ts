import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import { company } from "@/lib/firma";
import { formatPrice } from "@/lib/dane";
import type { StoreOrder } from "@/lib/typy";
import { getEmailTemplates } from "@/lib/serwer/szablonyPoczty";
import {
  escapeHtml,
  renderEmailTemplate,
  type EmailVar,
} from "@/lib/szablonyMaile";

const SMTP_ENV_FILE = path.join(process.cwd(), "data", "private", "smtp.env");

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

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

async function loadSmtpFile(): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(SMTP_ENV_FILE, "utf8");
    return parseEnvFile(raw);
  } catch {
    return {};
  }
}

function pick(file: Record<string, string>, key: string): string {
  return file[key]?.trim() || process.env[key]?.trim() || "";
}

async function resolveSmtp(): Promise<SmtpConfig | null> {
  const file = await loadSmtpFile();
  const host = pick(file, "SMTP_HOST");
  const from = pick(file, "SMTP_FROM") || company.email;
  if (!host || !from) return null;
  const portRaw = pick(file, "SMTP_PORT") || "587";
  const port = Number(portRaw);
  return {
    host,
    port: Number.isFinite(port) && port > 0 ? port : 587,
    secure: pick(file, "SMTP_SECURE") === "true",
    user: pick(file, "SMTP_USER"),
    pass: pick(file, "SMTP_PASS"),
    from,
  };
}

export async function smtpStatus(): Promise<{
  configured: boolean;
  host: string;
  from: string;
  port: number;
  user: string;
}> {
  const smtp = await resolveSmtp();
  if (!smtp) {
    return {
      configured: false,
      host: "",
      from: company.email,
      port: 587,
      user: "",
    };
  }
  return {
    configured: true,
    host: smtp.host,
    from: smtp.from,
    port: smtp.port,
    user: smtp.user,
  };
}

export async function saveSmtpConfig(input: {
  host: string;
  port?: number;
  secure?: boolean;
  user: string;
  pass?: string;
  from: string;
}): Promise<void> {
  const host = input.host.trim();
  const from = input.from.trim() || company.email;
  if (!host) throw new Error("Podaj host SMTP.");
  if (!from.includes("@")) throw new Error("Podaj adres nadawcy (From).");

  const current = await loadSmtpFile();
  const pass = input.pass?.trim() || current.SMTP_PASS || pick(current, "SMTP_PASS") || process.env.SMTP_PASS?.trim() || "";
  const user = input.user.trim() || current.SMTP_USER || "";
  const port = input.port && input.port > 0 ? input.port : 587;
  const secure = Boolean(input.secure);

  await fs.mkdir(path.dirname(SMTP_ENV_FILE), { recursive: true, mode: 0o700 });
  const lines = [
    "# SMTP — potwierdzenia zamówień. Nie commituj.",
    `SMTP_HOST=${host}`,
    `SMTP_PORT=${port}`,
    `SMTP_SECURE=${secure ? "true" : "false"}`,
    `SMTP_USER=${user}`,
    `SMTP_PASS=${pass}`,
    `SMTP_FROM=${from}`,
  ];
  const tmp = `${SMTP_ENV_FILE}.tmp`;
  await fs.writeFile(tmp, `${lines.join("\n")}\n`, { mode: 0o600 });
  await fs.rename(tmp, SMTP_ENV_FILE);
}

function shopUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    "https://wrohaus.pl"
  ).replace(/\/$/, "");
}

async function getTransporter() {
  const smtp = await resolveSmtp();
  if (!smtp) return null;

  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth:
      smtp.user && smtp.pass
        ? {
            user: smtp.user,
            pass: smtp.pass,
          }
        : undefined,
  });
}

export function logEmailFailure(
  context: string,
  orderId: string,
  err: unknown
): void {
  console.error(
    `[poczta] ${context}`,
    orderId,
    err instanceof Error ? err.message : err
  );
}

async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html: string;
  logId?: string;
}): Promise<boolean> {
  const smtp = await resolveSmtp();
  const transporter = await getTransporter();

  if (!smtp || !transporter) {
    console.warn(
      "[poczta] SMTP nie skonfigurowane — mail nie wyszedł",
      options.logId || options.to
    );
    if (process.env.NODE_ENV === "development") {
      console.info(`Do: ${options.to}`);
      console.info(`Temat: ${options.subject}`);
      console.info(options.text);
    }
    return false;
  }

  await transporter.sendMail({
    from: `${company.brandName} <${smtp.from}>`,
    replyTo: company.email,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
  return true;
}

function orderLineVariant(item: StoreOrder["items"][number]): string {
  const parts = [item.colorName, item.sizeName, item.optionsName].filter(Boolean);
  return parts.length ? ` (${parts.join(", ")})` : "";
}

function orderLinesText(order: StoreOrder): string {
  return order.items
    .map(
      (item) =>
        `• ${item.name}${orderLineVariant(item)} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`
    )
    .join("\n");
}

function orderLinesHtml(order: StoreOrder): string {
  const items = order.items
    .map((item) => {
      const label = `${item.name}${orderLineVariant(item)} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;
      return `<li>${escapeHtml(label)}</li>`;
    })
    .join("");
  return `<ul>${items}</ul>`;
}

function deliveryText(order: StoreOrder): string {
  const line = [order.address, [order.postalCode, order.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return line || "—";
}

function textVar(value: string): EmailVar {
  return { text: value, html: escapeHtml(value) };
}

function orderEmailVars(order: StoreOrder): Record<string, EmailVar> {
  const accountUrl = `${shopUrl()}/konto?tab=orders`;
  const delivery = order.deliveryFee ? formatPrice(order.deliveryFee) : "Gratis";
  return {
    sklep: textVar(company.brandName),
    klient: textVar(order.customer),
    numer: textVar(order.id),
    produkty: { text: orderLinesText(order), html: orderLinesHtml(order) },
    dostawa: textVar(delivery),
    kwota: textVar(formatPrice(order.total)),
    adres: textVar(deliveryText(order)),
    telefon: textVar(order.phone?.trim() || "—"),
    link: {
      text: accountUrl,
      html: `<a href="${escapeHtml(accountUrl)}">${escapeHtml(accountUrl)}</a>`,
    },
    kontakt: {
      text: company.email,
      html: `<a href="mailto:${escapeHtml(company.email)}">${escapeHtml(company.emailDisplay)}</a>`,
    },
    firma: textVar(company.legalName),
  };
}

function wrapHtml(html: string): string {
  return `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.55;color:#222">${html}</div>`;
}

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  const subject = `Nowe hasło — ${company.brandName}`;
  const text = `Aby ustawić nowe hasło w sklepie ${company.brandName}, otwórz link (ważny 2 godziny):\n${resetUrl}\n\nJeśli to nie Ty prosiłeś o zmianę, zignoruj tę wiadomość.`;
  const html = `<p>Aby ustawić nowe hasło w sklepie ${company.brandName}, otwórz link (ważny 2 godziny):</p><p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p><p>Jeśli to nie Ty prosiłeś o zmianę, zignoruj tę wiadomość.</p>`;
  return sendMail({ to, subject, text, html: wrapHtml(html) });
}

/** Tekst „przed wpłatą”. Kasa go nie wysyła — potwierdzenie klienta idzie po opłaceniu. */
export async function sendOrderCreatedEmail(order: StoreOrder): Promise<boolean> {
  const templates = await getEmailTemplates();
  const vars = orderEmailVars(order);
  const subject = renderEmailTemplate(templates.createdSubject, vars).text;
  const body = renderEmailTemplate(templates.createdBody, vars);

  return sendMail({
    to: order.email,
    subject,
    text: body.text,
    html: wrapHtml(body.html),
    logId: `created:${order.id}`,
  });
}

export async function sendPaymentConfirmedEmail(order: StoreOrder): Promise<boolean> {
  const templates = await getEmailTemplates();
  const vars = orderEmailVars(order);
  const subject = renderEmailTemplate(templates.paidSubject, vars).text;
  const body = renderEmailTemplate(templates.paidBody, vars);

  return sendMail({
    to: order.email,
    subject,
    text: body.text,
    html: wrapHtml(body.html),
    logId: `paid:${order.id}`,
  });
}

export async function sendAdminNewOrderEmail(
  order: StoreOrder,
  adminEmail: string
): Promise<boolean> {
  if (!adminEmail) return false;
  const subject = `[${company.brandName}] Nowe zamówienie ${order.id}`;
  const text = [
    `Nowe zamówienie ${order.id}`,
    `Klient: ${order.customer} (${order.email})`,
    `Telefon: ${order.phone ?? "—"}`,
    `Adres: ${order.address ?? ""}, ${order.postalCode ?? ""} ${order.city ?? ""}`,
    `Suma: ${formatPrice(order.total)}`,
  ].join("\n");

  return sendMail({
    to: adminEmail,
    subject,
    text,
    html: `<pre>${text}</pre>`,
    logId: `admin:${order.id}`,
  });
}

export async function sendTestEmail(to: string): Promise<boolean> {
  if (!to.includes("@")) throw new Error("Podaj adres e-mail do testu.");
  return sendMail({
    to,
    subject: `${company.brandName} — test poczty`,
    text: `To jest test. Potwierdzenia opłaconych zamówień będą wychodzić z tego konta SMTP.\n\n${company.legalName}`,
    html: `<p>To jest test. Potwierdzenia opłaconych zamówień będą wychodzić z tego konta SMTP.</p><p>${company.legalName}</p>`,
    logId: "test",
  });
}

export async function isEmailConfigured(): Promise<boolean> {
  return Boolean(await resolveSmtp());
}
