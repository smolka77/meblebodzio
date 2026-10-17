import { createHash, createHmac, pbkdf2, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import { cookies, headers } from "next/headers";

const pbkdf2Async = promisify(pbkdf2);

export const ADMIN_COOKIE = "SOFSESSID";
const SESSION_IDLE_SEC = 28800;
const PENDING_TTL_SEC = 180;
const RATE_LOGIN_MAX = 8;
const RATE_WINDOW_SEC = 900;
const PBKDF2_ITERS_DEFAULT = 310000;
const PBKDF2_ITERS_MIN = 100000;
const PBKDF2_ITERS_MAX = 600000;

const PRIVATE_DIR = path.join(process.cwd(), "data", "private");
const AUTH_ENV_FILE = path.join(PRIVATE_DIR, "auth.env");
const SESSIONS_DIR = path.join(PRIVATE_DIR, "sessions");
const RATE_FILE = path.join(PRIVATE_DIR, "limity-logowan.json");

export type AuthStep = "login" | "totp" | "app";

type AdminSession = {
  csrf: string;
  auth: boolean;
  pending: boolean;
  pendingExp: number;
  totpUsed: number;
  bind: string;
  seen: number;
};

type AuthEnv = Record<string, string>;

const emptySession = (): AdminSession => ({
  csrf: randomBytes(32).toString("hex"),
  auth: false,
  pending: false,
  pendingExp: 0,
  totpUsed: 0,
  bind: "",
  seen: 0,
});

async function ensurePrivateDirs() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true, mode: 0o700 });
}

function parseAuthEnv(raw: string): AuthEnv {
  const text = raw.replace(/^\uFEFF/, "");
  const env: AuthEnv = {};
  for (const line of text.split(/\r?\n/)) {
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

export async function loadAuthEnv(): Promise<AuthEnv> {
  try {
    const raw = await fs.readFile(AUTH_ENV_FILE, "utf8");
    return parseAuthEnv(raw);
  } catch {
    return {};
  }
}

async function writeAuthEnv(env: AuthEnv): Promise<void> {
  await ensurePrivateDirs();
  const keys = [
    "ADMIN_USER",
    "ADMIN_PASS_ITERS",
    "ADMIN_PASS_SALT",
    "ADMIN_PASS_HASH",
    "ADMIN_TOTP_SECRET",
    "ADMIN_SESSION_SECRET",
  ];
  const lines = [
    "# Wrohaus admin gate — hashes only. Never commit.",
    ...keys.filter((key) => env[key]).map((key) => `${key}=${env[key]}`),
  ];
  const tmp = `${AUTH_ENV_FILE}.tmp`;
  await fs.writeFile(tmp, `${lines.join("\n")}\n`, { mode: 0o600 });
  await fs.rename(tmp, AUTH_ENV_FILE);
}

/** Jedyna ścieżka zapisu hasła — hash liczony z plaintextu w tym samym momencie. */
export async function setAdminPassword(password: string): Promise<void> {
  if (!password) throw new Error("Puste hasło.");
  const env = await loadAuthEnv();
  const salt = randomBytes(16);
  const hash = (await pbkdf2Async(
    password,
    salt,
    PBKDF2_ITERS_DEFAULT,
    32,
    "sha256"
  )) as Buffer;
  env.ADMIN_USER = env.ADMIN_USER || "frog";
  env.ADMIN_PASS_ITERS = String(PBKDF2_ITERS_DEFAULT);
  env.ADMIN_PASS_SALT = salt.toString("base64");
  env.ADMIN_PASS_HASH = hash.toString("base64");
  if (!env.ADMIN_SESSION_SECRET) {
    env.ADMIN_SESSION_SECRET = randomBytes(32).toString("hex");
  }
  await writeAuthEnv(env);
}

export function isAuthConfigured(env: AuthEnv): boolean {
  return Boolean(env.ADMIN_USER && env.ADMIN_PASS_HASH && env.ADMIN_TOTP_SECRET);
}

function isHttps(headerList: Headers): boolean {
  if (process.env.SOFELIO_COOKIE_SECURE === "true") return true;
  const forwarded = headerList.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return process.env.NODE_ENV === "production";
}

export function clientIp(headerList: Headers): string {
  const realIp = headerList.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return "0.0.0.0";
}

function clientKey(headerList: Headers): string {
  const ua = (headerList.get("user-agent") ?? "").slice(0, 180);
  return sha256Hex(`${clientIp(headerList)}|${ua}`);
}

function bindKey(headerList: Headers): string {
  return sha256Hex(clientIp(headerList));
}

function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function requestHost(headerList: Headers): string {
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  return host.toLowerCase().replace(/:\d+$/, "");
}

function hostnameFromUrl(value: string): string {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function originOk(headerList: Headers): boolean {
  const host = requestHost(headerList);
  if (!host) return false;
  const origin = (headerList.get("origin") ?? "").trim();
  if (origin && origin.toLowerCase() !== "null") {
    const oh = hostnameFromUrl(origin);
    return oh !== "" && safeEqual(host, oh);
  }
  const ref = (headerList.get("referer") ?? "").trim();
  if (ref) {
    const rh = hostnameFromUrl(ref);
    return rh !== "" && safeEqual(host, rh);
  }
  // Cursor Simple Browser / lokalny webview często nie wysyła Origin przy POST.
  return host === "localhost" || host === "127.0.0.1";
}

export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function b32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let buffer = 0;
  let bits = 0;
  const out: number[] = [];
  for (const ch of cleaned) {
    const val = alphabet.indexOf(ch);
    if (val < 0) continue;
    buffer = (buffer << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return Buffer.from(out);
}

function totpAt(secret: string, counter: number): string {
  const key = b32Decode(secret);
  const bin = Buffer.alloc(8);
  bin.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  bin.writeUInt32BE(counter >>> 0, 4);
  const h = createHmac("sha1", key).update(bin).digest();
  const offset = h[19] & 0x0f;
  const code = h.readUInt32BE(offset) & 0x7fffffff;
  return String(code % 1_000_000).padStart(6, "0");
}

export function totpVerify(secret: string, codeRaw: string): boolean {
  const code = codeRaw.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(code) || !secret) return false;
  const t = Math.floor(Date.now() / 1000 / 30);
  let ok = false;
  for (let i = -1; i <= 1; i++) {
    if (safeEqual(totpAt(secret, t + i), code)) ok = true;
  }
  return ok;
}

async function verifyPassword(pass: string, env: AuthEnv): Promise<boolean> {
  let iters = Number(env.ADMIN_PASS_ITERS ?? PBKDF2_ITERS_DEFAULT);
  if (!Number.isFinite(iters)) iters = PBKDF2_ITERS_DEFAULT;
  iters = Math.max(PBKDF2_ITERS_MIN, Math.min(PBKDF2_ITERS_MAX, iters));
  const salt = Buffer.from(env.ADMIN_PASS_SALT ?? "", "base64");
  const stored = Buffer.from(env.ADMIN_PASS_HASH ?? "", "base64");
  const dummy = Buffer.alloc(32);
  if (salt.length < 8 || stored.length !== 32) {
    const calc = (await pbkdf2Async(pass, dummy, iters, 32, "sha256")) as Buffer;
    timingSafeEqual(dummy, calc);
    return false;
  }
  const calc = (await pbkdf2Async(pass, salt, iters, 32, "sha256")) as Buffer;
  return timingSafeEqual(stored, calc);
}

function verifyUser(user: string, env: AuthEnv): boolean {
  const expected = env.ADMIN_USER ?? "";
  if (!expected || !user) return false;
  return safeEqual(expected, user);
}

function sessionPath(id: string): string {
  if (!/^[a-f0-9]{64}$/.test(id)) {
    throw new Error("bad session id");
  }
  return path.join(SESSIONS_DIR, `${id}.json`);
}

async function readSession(id: string): Promise<AdminSession | null> {
  try {
    const raw = await fs.readFile(sessionPath(id), "utf8");
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    return {
      csrf: typeof parsed.csrf === "string" ? parsed.csrf : randomBytes(32).toString("hex"),
      auth: parsed.auth === true,
      pending: parsed.pending === true,
      pendingExp: Number(parsed.pendingExp) || 0,
      totpUsed: Number(parsed.totpUsed) || 0,
      bind: typeof parsed.bind === "string" ? parsed.bind : "",
      seen: Number(parsed.seen) || 0,
    };
  } catch {
    return null;
  }
}

async function writeSession(id: string, session: AdminSession): Promise<void> {
  await ensurePrivateDirs();
  const dest = sessionPath(id);
  const tmp = `${dest}.${randomBytes(8).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(session), { mode: 0o600 });
  try {
    await fs.rename(tmp, dest);
  } catch {
    try {
      await fs.copyFile(tmp, dest);
    } catch {
      /* inny request nadpisal sesje w tym samym momencie */
    }
    await fs.unlink(tmp).catch(() => {});
  }
}

async function deleteSession(id: string): Promise<void> {
  try {
    await fs.unlink(sessionPath(id));
  } catch {
    // ignore
  }
}

function newSessionId(): string {
  return randomBytes(32).toString("hex");
}

async function cookieOptions() {
  const headerList = await headers();
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isHttps(headerList),
    path: "/",
  };
}

export async function readCookieId(): Promise<string | undefined> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return undefined;
  return value;
}

async function setCookieId(id: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, id, {
    ...(await cookieOptions()),
    maxAge: undefined,
  });
}

async function clearCookie(): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, "", {
    ...(await cookieOptions()),
    maxAge: 0,
  });
}

export async function loadOrCreateSession(): Promise<{
  id: string;
  session: AdminSession;
}> {
  await ensurePrivateDirs();
  const existing = await readCookieId();
  if (existing) {
    const session = await readSession(existing);
    if (session) return { id: existing, session };
  }
  const id = newSessionId();
  const session = emptySession();
  await writeSession(id, session);
  await setCookieId(id);
  return { id, session };
}

export async function regenerateSession(
  prevId: string,
  session: AdminSession
): Promise<{ id: string; session: AdminSession }> {
  const id = newSessionId();
  await writeSession(id, session);
  if (prevId !== id) await deleteSession(prevId);
  await setCookieId(id);
  return { id, session };
}

function resetAuth(session: AdminSession): AdminSession {
  return {
    ...session,
    auth: false,
    pending: false,
    pendingExp: 0,
    totpUsed: 0,
    bind: "",
    seen: 0,
  };
}

export async function authStep(
  session: AdminSession,
  headerList: Headers
): Promise<{ step: AuthStep; session: AdminSession }> {
  const bind = session.bind;
  const bindOk = bind !== "" && safeEqual(bind, bindKey(headerList));
  const now = Math.floor(Date.now() / 1000);

  if (session.auth) {
    if (!bindOk) return { step: "login", session: resetAuth(session) };
    if (session.seen > 0 && now - session.seen > SESSION_IDLE_SEC) {
      return { step: "login", session: resetAuth(session) };
    }
    return { step: "app", session: { ...session, seen: now } };
  }

  if (session.pending && session.pendingExp >= now) {
    if (!bindOk) return { step: "login", session: resetAuth(session) };
    return { step: "totp", session };
  }

  return {
    step: "login",
    session: { ...session, pending: false, pendingExp: 0 },
  };
}

export async function csrfOk(session: AdminSession, token: unknown): Promise<boolean> {
  return (
    typeof token === "string" &&
    token !== "" &&
    typeof session.csrf === "string" &&
    session.csrf !== "" &&
    safeEqual(session.csrf, token)
  );
}

export function rotateCsrf(session: AdminSession): AdminSession {
  return { ...session, csrf: randomBytes(32).toString("hex") };
}

export async function rateHit(bucket: string, max: number, windowSec: number): Promise<boolean> {
  await ensurePrivateDirs();
  let all: Record<string, number[]> = {};
  try {
    const raw = await fs.readFile(RATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as Record<string, number[]>;
    if (parsed && typeof parsed === "object") all = parsed;
  } catch {
    all = {};
  }
  const now = Math.floor(Date.now() / 1000);
  const hits = (all[bucket] ?? [])
    .map((t) => Number(t))
    .filter((t) => t > now - windowSec);
  const blocked = hits.length >= max;
  if (!blocked) hits.push(now);
  all[bucket] = hits;
  for (const [k, list] of Object.entries(all)) {
    const keep = list.map((t) => Number(t)).filter((t) => t > now - 3600);
    if (keep.length) all[k] = keep;
    else delete all[k];
  }
  const tmp = `${RATE_FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(all), { mode: 0o600 });
  await fs.rename(tmp, RATE_FILE);
  return blocked;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function failDelay() {
  await sleep(120 + Math.floor(Math.random() * 160));
}

export type GateResult = {
  ok: boolean;
  step?: AuthStep;
  csrf?: string;
  error?: string;
  status: number;
};

export async function handleGateAction(
  action: string,
  input: Record<string, unknown>
): Promise<GateResult> {
  const headerList = await headers();
  const env = await loadAuthEnv();

  if (!isAuthConfigured(env)) {
    return { ok: false, error: "Panel nie jest skonfigurowany.", status: 503 };
  }

  let { id, session } = await loadOrCreateSession();
  const stepped = await authStep(session, headerList);
  session = stepped.session;
  let step = stepped.step;

  const persist = async () => {
    await writeSession(id, session);
  };

  if (action === "status") {
    await persist();
    return { ok: true, step, csrf: session.csrf, status: 200 };
  }

  if (action === "login") {
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    if (await rateHit(`login:${clientKey(headerList)}`, RATE_LOGIN_MAX, RATE_WINDOW_SEC)) {
      return {
        ok: false,
        error: "Zbyt wiele prób. Spróbuj za kilka minut.",
        status: 429,
      };
    }
    const user = String(input.user ?? "").trim();
    const pass = String(input.pass ?? "");
    const userOk = verifyUser(user, env);
    const passOk = await verifyPassword(pass, env);
    if (!userOk || !passOk) {
      await failDelay();
      return { ok: false, error: "Nieprawidłowe dane logowania.", status: 200 };
    }
    session = resetAuth(rotateCsrf(session));
    session.pending = true;
    session.pendingExp = Math.floor(Date.now() / 1000) + PENDING_TTL_SEC;
    session.bind = bindKey(headerList);
    const regenerated = await regenerateSession(id, session);
    id = regenerated.id;
    session = regenerated.session;
    await persist();
    return { ok: true, step: "totp", csrf: session.csrf, status: 200 };
  }

  if (action === "totp") {
    if (step !== "totp") {
      await persist();
      return {
        ok: false,
        error: "Najpierw zaloguj się hasłem.",
        step,
        status: 400,
      };
    }
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    if (await rateHit(`totp:${clientKey(headerList)}`, RATE_LOGIN_MAX, RATE_WINDOW_SEC)) {
      return {
        ok: false,
        error: "Zbyt wiele prób. Spróbuj za kilka minut.",
        status: 429,
      };
    }
    const code = String(input.code ?? "");
    const secret = env.ADMIN_TOTP_SECRET ?? "";
    let ok = totpVerify(secret, code);
    const slot = Math.floor(Date.now() / 1000 / 30);
    if (ok && session.totpUsed === slot) ok = false;
    if (!ok) {
      await failDelay();
      return { ok: false, error: "Nieprawidłowy kod uwierzytelniający.", status: 200 };
    }
    session.auth = true;
    session.totpUsed = slot;
    session.bind = bindKey(headerList);
    session.seen = Math.floor(Date.now() / 1000);
    session.pending = false;
    session.pendingExp = 0;
    session = rotateCsrf(session);
    const regenerated = await regenerateSession(id, session);
    id = regenerated.id;
    session = regenerated.session;
    await persist();
    return { ok: true, step: "app", csrf: session.csrf, status: 200 };
  }

  if (action === "logout") {
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    await deleteSession(id);
    await clearCookie();
    return { ok: true, step: "login", status: 200 };
  }

  await persist();
  return { ok: false, error: "Nieznane żądanie.", status: 400 };
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const headerList = await headers();
  const id = await readCookieId();
  if (!id) return false;
  const session = await readSession(id);
  if (!session) return false;
  const { step, session: next } = await authStep(session, headerList);
  if (next !== session) await writeSession(id, next);
  return step === "app";
}

export async function destroyAdminSession(): Promise<void> {
  const id = await readCookieId();
  if (id) await deleteSession(id);
  await clearCookie();
}
