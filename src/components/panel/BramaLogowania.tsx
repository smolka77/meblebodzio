"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/uklad/Logo";

type AuthStep = "login" | "totp" | "app";

type GatePayload = {
  ok?: boolean;
  step?: AuthStep;
  csrf?: string;
  error?: string;
  _status?: number;
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-taupe/30 bg-white px-4 py-3.5 text-[16px] leading-normal transition-colors focus:border-charcoal focus:outline-none";

const primaryBtn =
  "mt-2 w-full min-h-[48px] rounded-full bg-charcoal py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85 disabled:opacity-50";

const ghostBtn =
  "mt-3 w-full min-h-[48px] rounded-full border border-taupe/40 bg-transparent py-4 text-[11px] tracking-[0.12em] text-charcoal uppercase transition-colors hover:bg-cream-light";

async function parseGate(res: Response): Promise<GatePayload> {
  try {
    const data = (await res.json()) as GatePayload;
    data._status = res.status;
    return data;
  } catch {
    return { ok: false, error: "Błąd serwera.", _status: res.status };
  }
}

async function gateStatus(): Promise<GatePayload> {
  try {
    const res = await fetch("/api/auth/admin", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    return parseGate(res);
  } catch {
    return { ok: false, error: "Serwer nie odpowiada. Odśwież stronę." };
  }
}

async function gateApi(body: Record<string, unknown>): Promise<GatePayload> {
  try {
    const res = await fetch("/api/auth/admin", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    return parseGate(res);
  } catch {
    return { ok: false, error: "Serwer nie odpowiada. Odśwież stronę." };
  }
}

function GateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[28rem] rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
      <div className="mb-8 flex justify-center">
        <Logo compact href="/admin/login" />
      </div>
      {children}
    </div>
  );
}

export function AdminLoginGate() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("login");
  const [csrf, setCsrf] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [totpErr, setTotpErr] = useState("");
  const [busy, setBusy] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  function apply(data: GatePayload) {
    if (data.csrf) setCsrf(data.csrf);
    if (data.step) setStep(data.step);
    if (data.step === "app") {
      router.replace("/admin");
      router.refresh();
    }
  }

  useEffect(() => {
    gateStatus().then((data) => {
      if (!data.ok && data._status === 503) {
        setStep("login");
        setLoginErr(data.error || "Panel nie jest skonfigurowany.");
        return;
      }
      if (!data.csrf) {
        setLoginErr(data.error || "Nie udało się połączyć z panelem. Odśwież stronę.");
        return;
      }
      apply(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "totp") return;
    otpRefs.current.forEach((el) => {
      if (el) el.value = "";
    });
  }, [step]);

  function otpValue() {
    return otpRefs.current
      .map((el) => (el?.value ?? "").replace(/\D/g, ""))
      .join("")
      .slice(0, 6);
  }

  async function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginErr("");
    setBusy(true);
    const form = e.currentTarget;
    let token = csrf;
    if (!token) {
      const status = await gateStatus();
      token = status.csrf ?? "";
      if (token) setCsrf(token);
    }
    if (!token) {
      setBusy(false);
      setLoginErr("Nie udało się połączyć z panelem. Odśwież stronę.");
      return;
    }
    const data = await gateApi({
      action: "login",
      csrf: token,
      user: (form.elements.namedItem("user") as HTMLInputElement).value,
      pass: (form.elements.namedItem("pass") as HTMLInputElement).value,
    });
    setBusy(false);
    if (!data.ok) {
      setLoginErr(data.error || "Nie udało się zalogować.");
      if (data.csrf) setCsrf(data.csrf);
      return;
    }
    (form.elements.namedItem("pass") as HTMLInputElement).value = "";
    apply(data);
  }

  async function onTotp(e: FormEvent) {
    e.preventDefault();
    setTotpErr("");
    setBusy(true);
    const data = await gateApi({ action: "totp", csrf, code: otpValue() });
    setBusy(false);
    if (!data.ok) {
      setTotpErr(data.error || "Nieprawidłowy kod.");
      otpRefs.current.forEach((el) => {
        if (el) el.value = "";
      });
      otpRefs.current[0]?.focus();
      return;
    }
    apply(data);
  }

  async function backToLogin() {
    await gateApi({ action: "logout", csrf });
    setStep("login");
    setTotpErr("");
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-cream px-4 py-12 sm:px-6">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cream-light/80 blur-3xl" />
        <div className="absolute right-[-4rem] bottom-[-3rem] h-56 w-56 rounded-full bg-taupe/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[28rem]">
        {step === "login" && (
          <GateCard>
            <h1 className="text-center font-serif text-2xl text-charcoal sm:text-3xl">
              Logowanie
            </h1>
            <form onSubmit={onLogin} autoComplete="on" className="mt-8 space-y-5">
              <label className="block">
                <span className="text-[10px] tracking-[0.2em] text-sand uppercase">
                  Login
                </span>
                <input
                  type="text"
                  name="user"
                  required
                  maxLength={80}
                  autoComplete="username"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className={inputClass}
                />
              </label>
              <label className="block">
                <span className="text-[10px] tracking-[0.2em] text-sand uppercase">
                  Hasło
                </span>
                <input
                  type="password"
                  name="pass"
                  required
                  maxLength={200}
                  autoComplete="current-password"
                  className={inputClass}
                />
              </label>
              {loginErr ? (
                <p
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {loginErr}
                </p>
              ) : null}
              <button className={primaryBtn} type="submit" disabled={busy}>
                {busy ? "Logowanie..." : "Kontynuuj"}
              </button>
            </form>
          </GateCard>
        )}

        {step === "totp" && (
          <GateCard>
            <h1 className="text-center font-serif text-2xl text-charcoal sm:text-3xl">
              Kod z aplikacji
            </h1>
            <form onSubmit={onTotp} className="mt-8">
              <div className="mb-5 grid grid-cols-6 gap-2 sm:gap-2.5">
                {Array.from({ length: 6 }, (_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    aria-label={`Cyfra ${i + 1}`}
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    className="aspect-square w-full rounded-xl border border-taupe/40 bg-cream-light text-center text-[20px] font-medium text-charcoal focus:border-charcoal focus:outline-none"
                    onInput={(ev) => {
                      const input = ev.currentTarget;
                      input.value = input.value.replace(/\D/g, "").slice(-1);
                      if (input.value && otpRefs.current[i + 1]) {
                        otpRefs.current[i + 1]?.focus();
                      }
                      if (otpValue().length === 6) {
                        ev.currentTarget.form?.requestSubmit();
                      }
                    }}
                    onKeyDown={(ev) => {
                      if (
                        ev.key === "Backspace" &&
                        !ev.currentTarget.value &&
                        otpRefs.current[i - 1]
                      ) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }}
                    onPaste={(ev) => {
                      const text = (ev.clipboardData.getData("text") || "")
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      if (!text) return;
                      ev.preventDefault();
                      text.split("").forEach((ch, idx) => {
                        if (otpRefs.current[idx]) otpRefs.current[idx]!.value = ch;
                      });
                      if (text.length === 6) ev.currentTarget.form?.requestSubmit();
                    }}
                  />
                ))}
              </div>
              {totpErr ? (
                <p
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {totpErr}
                </p>
              ) : null}
              <button className={primaryBtn} type="submit" disabled={busy}>
                Zatwierdź
              </button>
              <button
                className={ghostBtn}
                type="button"
                onClick={backToLogin}
              >
                Wróć do logowania
              </button>
            </form>
          </GateCard>
        )}

        {step === "app" && (
          <p className="text-center text-sm text-sand">Otwieranie panelu…</p>
        )}
      </div>
    </div>
  );
}
