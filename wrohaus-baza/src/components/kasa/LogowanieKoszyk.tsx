"use client";

import { useState } from "react";
import Link from "next/link";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-taupe/35 bg-cream/30 px-4 py-3.5 text-base text-charcoal transition-colors focus:border-charcoal focus:bg-white focus:outline-none";

export type CheckoutAuthMode = "guest" | "login" | "register";

export interface GuestCheckoutInput {
  name: string;
  email: string;
}

interface CheckoutAuthPanelProps {
  highlight?: boolean;
  defaultTab?: CheckoutAuthMode;
  guest: GuestCheckoutInput;
  onGuestChange: (next: GuestCheckoutInput) => void;
  mode: CheckoutAuthMode;
  onModeChange: (mode: CheckoutAuthMode) => void;
  guestErrors?: Partial<Record<keyof GuestCheckoutInput, string>>;
  onAuthenticated?: () => void;
}

export function CheckoutAuthPanel({
  highlight = false,
  guest,
  onGuestChange,
  mode,
  onModeChange,
  guestErrors = {},
  onAuthenticated,
}: CheckoutAuthPanelProps) {
  const { t } = useLanguage();
  const { login, register } = useShop();
  const [error, setError] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  function switchMode(next: CheckoutAuthMode) {
    onModeChange(next);
    setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ok = await login(loginForm.email, loginForm.password);
    if (ok) {
      onAuthenticated?.();
    } else {
      setError(t("account.loginError"));
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirm) {
      setError(t("account.passwordMismatch"));
      return;
    }
    if (registerForm.password.length < 8) {
      setError(t("account.passwordTooShort"));
      return;
    }
    const ok = await register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    });
    if (ok) {
      onAuthenticated?.();
    } else {
      setError(t("account.emailTaken"));
    }
  }

  const tabs: { id: CheckoutAuthMode; label: string }[] = [
    { id: "guest", label: t("cart.guestTab") },
    { id: "login", label: t("account.loginTab") },
    { id: "register", label: t("account.registerTab") },
  ];

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-[0_8px_28px_-18px_rgba(17,17,17,0.15)] sm:p-7 lg:p-8 ${
        highlight ? "border-terracotta/50 ring-2 ring-terracotta/15" : "border-taupe/20"
      }`}
    >
      <p className="text-sm leading-relaxed text-charcoal/70">{t("cart.accountHint")}</p>

      <div className="mt-5 grid grid-cols-3 gap-1 rounded-full bg-cream-light p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchMode(tab.id)}
            className={`rounded-full px-2 py-2.5 text-center text-[11px] leading-tight transition-all sm:text-sm ${
              mode === tab.id
                ? "bg-white font-semibold text-charcoal shadow-sm"
                : "text-sand hover:text-charcoal"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {mode === "guest" ? (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-relaxed text-charcoal/70">{t("cart.guestHint")}</p>
          <div>
            <label
              htmlFor="checkout-guest-name"
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("account.name")}
            </label>
            <input
              id="checkout-guest-name"
              type="text"
              autoComplete="name"
              value={guest.name}
              onChange={(e) => onGuestChange({ ...guest, name: e.target.value })}
              className={inputClass}
            />
            {guestErrors.name ? (
              <p className="mt-1.5 text-sm text-terracotta">{guestErrors.name}</p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="checkout-guest-email"
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("account.email")}
            </label>
            <input
              id="checkout-guest-email"
              type="email"
              autoComplete="email"
              value={guest.email}
              onChange={(e) => onGuestChange({ ...guest, email: e.target.value })}
              className={inputClass}
            />
            {guestErrors.email ? (
              <p className="mt-1.5 text-sm text-terracotta">{guestErrors.email}</p>
            ) : (
              <p className="mt-1.5 text-xs text-sand">{t("cart.guestEmailHint")}</p>
            )}
          </div>
        </div>
      ) : mode === "login" ? (
        <form onSubmit={handleLogin} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="checkout-login-email"
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("account.email")}
            </label>
            <input
              id="checkout-login-email"
              type="email"
              required
              autoComplete="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="checkout-login-password"
              className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
            >
              {t("account.password")}
            </label>
            <input
              id="checkout-login-password"
              type="password"
              required
              autoComplete="current-password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85"
          >
            {t("account.loginSubmit")}
          </button>
          <Link href="/konto?tab=forgot" className="inline-block text-sm text-charcoal underline underline-offset-2">
            {t("account.forgot")}
          </Link>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="mt-5 space-y-4">
          {(
            [
              ["name", t("account.name"), "text", "name"],
              ["email", t("account.email"), "email", "email"],
              ["password", t("account.password"), "password", "new-password"],
              ["confirm", t("account.passwordConfirm"), "password", "new-password"],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <div key={key}>
              <label
                htmlFor={`checkout-register-${key}`}
                className="text-[11px] font-semibold tracking-[0.14em] text-charcoal uppercase"
              >
                {label}
              </label>
              <input
                id={`checkout-register-${key}`}
                type={type}
                required
                autoComplete={autoComplete}
                value={registerForm[key]}
                onChange={(e) => setRegisterForm({ ...registerForm, [key]: e.target.value })}
                className={inputClass}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85"
          >
            {t("account.registerSubmit")}
          </button>
        </form>
      )}
    </div>
  );
}
