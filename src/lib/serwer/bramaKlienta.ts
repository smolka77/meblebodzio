import { createHash, randomBytes } from "crypto";
import fs from "fs/promises";
import path from "path";
import { cookies, headers } from "next/headers";
import { authenticateUser, createUser, findUserById, changeUserPassword } from "./uzytkownicy";
import { clampString, isValidEmail } from "./walidacjaWejscia";
import { clientIp, originOk, rateHit, safeEqual } from "./bramaAdmina";
import type { UserProfile } from "@/lib/typy";

export const CUSTOMER_COOKIE = "SOFCSESSID";
const SESSION_IDLE_SEC = 86400;
const RATE_LOGIN_MAX = 10;
const RATE_WINDOW_SEC = 900;

const SESSIONS_DIR = path.join(process.cwd(), "data", "private", "customer-sessions");

type CustomerSession = {
  csrf: string;
  auth: boolean;
  userId: string;
  bind: string;
  seen: number;
};

const emptySession = (): CustomerSession => ({
  csrf: randomBytes(32).toString("hex"),
  auth: false,
  userId: "",
  bind: "",
  seen: 0,
});

async function ensureSessionsDir() {
  await fs.mkdir(SESSIONS_DIR, { recursive: true, mode: 0o700 });
}

function bindKey(headerList: Headers): string {
  return createHash("sha256").update(clientIp(headerList)).digest("hex");
}

function isHttps(headerList: Headers): boolean {
  if (process.env.SOFELIO_COOKIE_SECURE === "true") return true;
  const forwarded = headerList.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return process.env.NODE_ENV === "production";
}

function sessionPath(id: string): string {
  if (!/^[a-f0-9]{64}$/.test(id)) {
    throw new Error("bad session id");
  }
  return path.join(SESSIONS_DIR, `${id}.json`);
}

async function readSession(id: string): Promise<CustomerSession | null> {
  try {
    const raw = await fs.readFile(sessionPath(id), "utf8");
    const parsed = JSON.parse(raw) as Partial<CustomerSession>;
    return {
      csrf: typeof parsed.csrf === "string" ? parsed.csrf : randomBytes(32).toString("hex"),
      auth: parsed.auth === true,
      userId: typeof parsed.userId === "string" ? parsed.userId : "",
      bind: typeof parsed.bind === "string" ? parsed.bind : "",
      seen: Number(parsed.seen) || 0,
    };
  } catch {
    return null;
  }
}

async function writeSession(id: string, session: CustomerSession): Promise<void> {
  await ensureSessionsDir();
  const dest = sessionPath(id);
  const tmp = `${dest}.${randomBytes(8).toString("hex")}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(session), { mode: 0o600 });
  try {
    await fs.rename(tmp, dest);
  } catch {
    try {
      await fs.copyFile(tmp, dest);
    } catch {
      /* concurrent write */
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

export async function readCustomerCookieId(): Promise<string | undefined> {
  const store = await cookies();
  const value = store.get(CUSTOMER_COOKIE)?.value;
  if (!value || !/^[a-f0-9]{64}$/.test(value)) return undefined;
  return value;
}

async function setCookieId(id: string): Promise<void> {
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, id, {
    ...(await cookieOptions()),
    maxAge: undefined,
  });
}

async function clearCookie(): Promise<void> {
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, "", {
    ...(await cookieOptions()),
    maxAge: 0,
  });
}

export async function loadOrCreateCustomerSession(): Promise<{
  id: string;
  session: CustomerSession;
}> {
  await ensureSessionsDir();
  const existing = await readCustomerCookieId();
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

async function regenerateCustomerSession(
  prevId: string,
  session: CustomerSession
): Promise<{ id: string; session: CustomerSession }> {
  const id = newSessionId();
  await writeSession(id, session);
  if (prevId !== id) await deleteSession(prevId);
  await setCookieId(id);
  return { id, session };
}

function resetAuth(session: CustomerSession): CustomerSession {
  return {
    ...session,
    auth: false,
    userId: "",
    bind: "",
    seen: 0,
  };
}

async function validateSession(
  session: CustomerSession,
  headerList: Headers
): Promise<{ valid: boolean; session: CustomerSession }> {
  if (!session.auth || !session.userId) {
    return { valid: false, session: resetAuth(session) };
  }
  const bindOk =
    session.bind !== "" && safeEqual(session.bind, bindKey(headerList));
  if (!bindOk) {
    return { valid: false, session: resetAuth(session) };
  }
  const now = Math.floor(Date.now() / 1000);
  if (session.seen > 0 && now - session.seen > SESSION_IDLE_SEC) {
    return { valid: false, session: resetAuth(session) };
  }
  return { valid: true, session: { ...session, seen: now } };
}

async function csrfOk(session: CustomerSession, token: unknown): Promise<boolean> {
  return (
    typeof token === "string" &&
    token !== "" &&
    typeof session.csrf === "string" &&
    session.csrf !== "" &&
    safeEqual(session.csrf, token)
  );
}

function rotateCsrf(session: CustomerSession): CustomerSession {
  return { ...session, csrf: randomBytes(32).toString("hex") };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function failDelay() {
  await sleep(120 + Math.floor(Math.random() * 160));
}

export type CustomerAuthResult = {
  ok: boolean;
  authenticated?: boolean;
  user?: UserProfile | null;
  csrf?: string;
  error?: string;
  status: number;
};

export async function getCustomerAuthStatus(): Promise<CustomerAuthResult> {
  const headerList = await headers();
  const { id, session: initial } = await loadOrCreateCustomerSession();
  let session = initial;
  const checked = await validateSession(session, headerList);
  session = checked.session;

  let user: UserProfile | null = null;
  if (checked.valid) {
    user = (await findUserById(session.userId)) ?? null;
    if (!user) {
      session = resetAuth(session);
    }
  }

  await writeSession(id, session);
  return {
    ok: true,
    authenticated: checked.valid && user != null,
    user,
    csrf: session.csrf,
    status: 200,
  };
}

export async function handleCustomerAuthAction(
  action: string,
  input: Record<string, unknown>
): Promise<CustomerAuthResult> {
  const headerList = await headers();

  if (action !== "status" && !originOk(headerList)) {
    return { ok: false, error: "Niedozwolone żądanie.", status: 403 };
  }

  let { id, session } = await loadOrCreateCustomerSession();
  const checked = await validateSession(session, headerList);
  session = checked.session;

  const persist = async () => {
    await writeSession(id, session);
  };

  if (action === "status") {
    let user: UserProfile | null = null;
    if (checked.valid) {
      user = (await findUserById(session.userId)) ?? null;
      if (!user) session = resetAuth(session);
    }
    await persist();
    return {
      ok: true,
      authenticated: checked.valid && user != null,
      user,
      csrf: session.csrf,
      status: 200,
    };
  }

  if (action === "login") {
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    if (await rateHit(`customer-login:${clientIp(headerList)}`, RATE_LOGIN_MAX, RATE_WINDOW_SEC)) {
      return {
        ok: false,
        error: "Zbyt wiele prób. Spróbuj za kilka minut.",
        status: 429,
      };
    }
    const email = clampString(String(input.email ?? ""), 254).toLowerCase();
    const password = clampString(String(input.password ?? ""), 128);
    if (!email || !isValidEmail(email) || !password) {
      return { ok: false, error: "Nieprawidłowy e-mail lub hasło", status: 401 };
    }
    const profile = await authenticateUser(email, password);
    if (!profile) {
      await failDelay();
      return { ok: false, error: "Nieprawidłowy e-mail lub hasło", status: 401 };
    }
    session = rotateCsrf(emptySession());
    session.auth = true;
    session.userId = profile.id;
    session.bind = bindKey(headerList);
    session.seen = Math.floor(Date.now() / 1000);
    const regenerated = await regenerateCustomerSession(id, session);
    id = regenerated.id;
    session = regenerated.session;
    await persist();
    return {
      ok: true,
      authenticated: true,
      user: profile,
      csrf: session.csrf,
      status: 200,
    };
  }

  if (action === "register") {
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    if (await rateHit(`customer-register:${clientIp(headerList)}`, RATE_LOGIN_MAX, RATE_WINDOW_SEC)) {
      return {
        ok: false,
        error: "Zbyt wiele prób. Spróbuj za kilka minut.",
        status: 429,
      };
    }
    const name = clampString(String(input.name ?? ""), 120);
    const email = clampString(String(input.email ?? ""), 254).toLowerCase();
    const password = clampString(String(input.password ?? ""), 128);
    if (!name) {
      return { ok: false, error: "Imię jest wymagane", status: 400 };
    }
    if (!email || !isValidEmail(email)) {
      return { ok: false, error: "Nieprawidłowy e-mail", status: 400 };
    }
    const created = await createUser({ name, email, password });
    if ("error" in created) {
      const status = created.error.includes("już istnieje") ? 409 : 400;
      return { ok: false, error: created.error, status };
    }
    session = rotateCsrf(emptySession());
    session.auth = true;
    session.userId = created.id;
    session.bind = bindKey(headerList);
    session.seen = Math.floor(Date.now() / 1000);
    const regenerated = await regenerateCustomerSession(id, session);
    id = regenerated.id;
    session = regenerated.session;
    await persist();
    return {
      ok: true,
      authenticated: true,
      user: created,
      csrf: session.csrf,
      status: 201,
    };
  }

  if (action === "logout") {
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    await deleteSession(id);
    await clearCookie();
    return { ok: true, authenticated: false, user: null, status: 200 };
  }

  if (action === "changePassword") {
    if (!checked.valid) {
      return { ok: false, error: "Zaloguj się ponownie.", status: 401 };
    }
    if (!(await csrfOk(session, input.csrf))) {
      return { ok: false, error: "Sesja wygasła. Odśwież stronę.", status: 400 };
    }
    const currentPassword = clampString(String(input.currentPassword ?? ""), 128);
    const newPassword = clampString(String(input.newPassword ?? ""), 128);
    if (!currentPassword || !newPassword) {
      return {
        ok: false,
        error: "Uzupełnij aktualne i nowe hasło",
        status: 400,
      };
    }
    const user = await findUserById(session.userId);
    if (!user) {
      session = resetAuth(session);
      await persist();
      return { ok: false, error: "Zaloguj się ponownie.", status: 401 };
    }
    const result = await changeUserPassword(user.email, currentPassword, newPassword);
    if ("error" in result) {
      const status = result.error.includes("nieprawidłowe") ? 401 : 400;
      return { ok: false, error: result.error, status };
    }
    session = rotateCsrf(session);
    await persist();
    return { ok: true, csrf: session.csrf, status: 200 };
  }

  await persist();
  return { ok: false, error: "Nieznane żądanie.", status: 400 };
}

export async function isCustomerAuthenticated(): Promise<boolean> {
  const headerList = await headers();
  const id = await readCustomerCookieId();
  if (!id) return false;
  const session = await readSession(id);
  if (!session) return false;
  const checked = await validateSession(session, headerList);
  if (checked.session !== session) await writeSession(id, checked.session);
  return checked.valid;
}

export async function getCustomerUserId(): Promise<string | null> {
  const headerList = await headers();
  const id = await readCustomerCookieId();
  if (!id) return null;
  const session = await readSession(id);
  if (!session) return null;
  const checked = await validateSession(session, headerList);
  if (checked.session !== session) await writeSession(id, checked.session);
  return checked.valid ? session.userId : null;
}

export async function getCustomerSessionCsrf(): Promise<string | null> {
  const id = await readCustomerCookieId();
  if (!id) return null;
  const session = await readSession(id);
  return session?.csrf ?? null;
}

export async function destroyCustomerSession(): Promise<void> {
  const id = await readCustomerCookieId();
  if (id) await deleteSession(id);
  await clearCookie();
}
