"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/uklad/Naglowek";
import { Footer } from "@/components/uklad/Stopka";
import { useLanguage } from "@/kontekst/KontekstJezyka";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3.5 text-base text-charcoal focus:border-charcoal focus:bg-white focus:outline-none";

function ResetForm() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("account.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("account.passwordMismatch"));
      return;
    }
    setSending(true);
    const status = await fetch("/api/auth").then((r) => r.json());
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "resetPassword",
        token,
        password,
        csrf: status.csrf,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (!res.ok) {
      setError(data.error ?? t("account.resetInvalid"));
      return;
    }
    setDone(true);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-3xl text-charcoal">{t("account.resetTitle")}</h1>
      {done ? (
        <p className="mt-6 text-sm text-charcoal">
          {t("account.resetOk")}{" "}
          <Link href="/konto" className="underline underline-offset-2">
            {t("account.loginSubmit")}
          </Link>
        </p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <div>
            <label htmlFor="reset-password" className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase">
              {t("account.password")}
            </label>
            <input
              id="reset-password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="reset-confirm" className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase">
              {t("account.passwordConfirm")}
            </label>
            <input
              id="reset-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !token}
            className="w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase disabled:opacity-50"
          >
            {t("account.resetSubmit")}
          </button>
        </form>
      )}
    </main>
  );
}

export default function PasswordResetPage() {
  return (
    <>
      <Header />
      <Suspense>
        <ResetForm />
      </Suspense>
      <Footer />
    </>
  );
}
