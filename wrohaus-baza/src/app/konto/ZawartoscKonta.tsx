"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Package,
  Mail,
  MessageCircle,
  Truck,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Heart,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/uklad/Naglowek";
import { Footer } from "@/components/uklad/Stopka";
import { useShop } from "@/kontekst/KontekstSklepu";
import { formatPrice } from "@/lib/dane";
import { isLocalUpload } from "@/lib/obrazy";
import { company } from "@/lib/firma";
import { storePolicies } from "@/lib/zasadySklepu";
import {
  buildTransferTitle,
  orderDeliveryFee,
  orderSubtotal,
  orderDiscountAmount,
  resolvePaymentStatus,
} from "@/lib/kasa";
import { PaymentAwaitingBadge } from "@/components/sklep/ZnaczekOczekiwania";
import { safeReturnPath } from "@/lib/nawigacja";

const statusLabels: Record<string, string> = {
  pending: "Oczekujące na realizację",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-taupe/30 bg-white px-4 py-3 text-[16px] leading-normal transition-colors focus:border-charcoal focus:outline-none";

function userInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AccountHelpPanel() {
  const links = [
    {
      icon: Mail,
      label: "Napisz do nas",
      description: company.emailDisplay,
      href: `mailto:${company.email}`,
    },
    {
      icon: MessageCircle,
      label: "Formularz kontaktowy",
      description: "Wyślij wiadomość do zespołu",
      href: "/kontakt",
    },
    {
      icon: Truck,
      label: "Dostawa i zwroty",
      description: `${storePolicies.returnsLabel} · ${storePolicies.deliveryTimeLabel}`,
      href: "/dostawa",
    },
  ];

  return (
    <div className="rounded-2xl bg-cream-light/80 p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
      <p className="text-[10px] tracking-[0.25em] text-sand uppercase">
        Potrzebujesz pomocy?
      </p>
      <h2 className="mt-2 font-serif text-xl text-charcoal">Skontaktuj się z nami</h2>
      <p className="mt-2 text-sm leading-relaxed text-sand">
        Doradzimy przy wyborze mebla, konfiguracji tapicerki i statusie zamówienia.{" "}
        {company.openingHoursShort}.
      </p>
      <ul className="mt-6 space-y-3">
        {links.map(({ icon: Icon, label, description, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex items-start gap-3 rounded-xl bg-white/80 p-4 transition-all hover:bg-white"
            >
              <Icon
                className="mt-0.5 h-4 w-4 shrink-0 text-sand transition-colors group-hover:text-charcoal"
                strokeWidth={1.5}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-charcoal">{label}</span>
                <span className="mt-0.5 block text-xs text-sand">{description}</span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-taupe opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                strokeWidth={1.5}
              />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/faq"
        className="mt-4 inline-flex items-center gap-1.5 text-[10px] tracking-[0.2em] text-charcoal/70 uppercase transition-colors hover:text-charcoal"
      >
        Zobacz FAQ
        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
      </Link>
    </div>
  );
}

function GuestBenefits() {
  const perks = [
    {
      icon: Package,
      title: "Historia zamówień",
      text: "Sprawdzaj status produkcji i dostawy w jednym miejscu.",
    },
    {
      icon: Clock,
      title: "Szybsze zakupy",
      text: "Historia zamówień i zapisane konfiguracje w jednym miejscu.",
    },
    {
      icon: ShieldCheck,
      title: "Bezpieczne konto",
      text: "Sesja serwerowa i szyfrowane dane — bez przechowywania konta w przeglądarce.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
        <p className="text-[10px] tracking-[0.25em] text-sand uppercase">Dlaczego konto?</p>
        <ul className="mt-5 space-y-5">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-light">
                <Icon className="h-4 w-4 text-charcoal" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-medium text-charcoal">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-sand">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <AccountHelpPanel />
    </div>
  );
}

export default function AccountPageContent() {
  const {
    user,
    orders,
    savedConfigs,
    checkoutSettings,
    login,
    register,
    logout,
    updateProfile,
    removeConfiguration,
    changePassword,
  } = useShop();
  const searchParams = useSearchParams();
  const router = useRouter();

  const returnTo = safeReturnPath(searchParams.get("next"));

  const [tab, setTab] = useState<
    "login" | "register" | "forgot" | "profile" | "orders" | "configs"
  >("login");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  useEffect(() => {
    if (user && returnTo) {
      router.replace(returnTo);
    }
  }, [user, returnTo, router]);

  useEffect(() => {
    const nextTab = searchParams.get("tab");
    if (nextTab === "orders") {
      setTab("orders");
    } else if (nextTab === "configs") {
      setTab("configs");
    } else if (nextTab === "register" && !user) {
      setTab("register");
    } else if (nextTab === "forgot" && !user) {
      setTab("forgot");
    } else if (user) {
      setTab("profile");
    }
  }, [searchParams, user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ok = await login(loginForm.email, loginForm.password);
    if (ok) {
      if (returnTo) {
        router.replace(returnTo);
        return;
      }
      setTab("profile");
    } else {
      setError("Nieprawidłowy e-mail lub hasło");
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (registerForm.password !== registerForm.confirm) {
      setError("Hasła nie są identyczne");
      return;
    }
    if (registerForm.password.length < 8) {
      setError("Hasło musi mieć min. 6 znaków");
      return;
    }
    const ok = await register({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    });
    if (ok) {
      if (returnTo) {
        router.replace(returnTo);
        return;
      }
      setTab("profile");
    } else {
      setError("Konto z tym e-mailem już istnieje");
    }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const ok = await updateProfile(profileForm);
    if (!ok) {
      setError("Nie udało się zapisać profilu");
      return;
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (passwordForm.next !== passwordForm.confirm) {
      setError("Nowe hasła nie są identyczne");
      return;
    }
    if (passwordForm.next.length < 8) {
      setError("Nowe hasło musi mieć min. 8 znaków");
      return;
    }
    const ok = await changePassword(passwordForm.current, passwordForm.next);
    if (ok) {
      setPasswordForm({ current: "", next: "", confirm: "" });
      setPasswordSaved(true);
      window.setTimeout(() => setPasswordSaved(false), 2500);
    }
  }

  const navTabClass = (active: boolean) =>
    `flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
      active
        ? "border-l-2 border-charcoal bg-white font-medium text-charcoal"
        : "border-l-2 border-transparent text-sand hover:bg-white/60 hover:text-charcoal"
    }`;

  return (
    <>
      <Header />
      <main>
        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] tracking-[0.28em] text-sand uppercase">Konto</p>
            <h1 className="mt-2 font-serif text-3xl text-charcoal md:text-4xl">
              {user ? `Witaj, ${user.name.split(" ")[0]}` : "Moje konto"}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-sand">
              {user
                ? "Zarządzaj danymi, sprawdzaj zamówienia i zapisane konfiguracje tapicerki."
                : returnTo === "/koszyk"
                  ? "Zaloguj się lub załóż konto — potem wrócisz do koszyka i dokończysz płatność PayU."
                  : "Zaloguj się lub załóż konto, aby śledzić zamówienia i zapisywać konfiguracje."}
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {user ? (
              <div className="grid gap-8 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)_minmax(0,300px)] lg:gap-10">
                <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
                  <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]">
                    <div className="flex items-center gap-4">
                      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-charcoal font-serif text-lg text-cream">
                        {userInitials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-charcoal">{user.name}</p>
                        <p className="truncate text-sm text-sand">{user.email}</p>
                      </div>
                    </div>
                    <nav className="mt-6 space-y-1 border-t border-taupe/20 pt-4">
                      <button
                        type="button"
                        onClick={() => setTab("profile")}
                        className={navTabClass(tab === "profile")}
                      >
                        <User className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        Mój profil
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("orders")}
                        className={navTabClass(tab === "orders")}
                      >
                        <Package className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                        Zamówienia
                        <span className="ml-auto rounded-full bg-cream-light px-2 py-0.5 text-[10px] text-charcoal">
                          {orders.length}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("configs")}
                        className={navTabClass(tab === "configs")}
                      >
                        <Heart
                          className={`h-4 w-4 shrink-0 ${
                            savedConfigs.length > 0
                              ? "fill-terracotta text-terracotta"
                              : ""
                          }`}
                          strokeWidth={1.5}
                          fill={savedConfigs.length > 0 ? "currentColor" : "none"}
                        />
                        Zapisane konfiguracje
                        <span className="ml-auto rounded-full bg-cream-light px-2 py-0.5 text-[10px] text-charcoal">
                          {savedConfigs.length}
                        </span>
                      </button>
                    </nav>
                    <button
                      type="button"
                      onClick={logout}
                      className="mt-4 flex w-full items-center gap-2 px-4 py-2 text-sm text-sand transition-colors hover:text-charcoal"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.5} />
                      Wyloguj się
                    </button>
                  </div>
                </aside>

                <div className="min-w-0">
                  {tab === "profile" && (
                    <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-taupe/20 pb-6">
                        <div>
                          <h2 className="font-serif text-2xl text-charcoal">Dane profilu</h2>
                          <p className="mt-1 text-sm text-sand">
                            Imię, e-mail i hasło do konta.
                          </p>
                        </div>
                        {(saved || passwordSaved) && (
                          <span className="rounded-full bg-cream-light px-3 py-1 text-xs text-charcoal">
                            Zapisano zmiany
                          </span>
                        )}
                      </div>

                      {error && tab === "profile" && (
                        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                          {error}
                        </p>
                      )}

                      <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase">
                              Imię i nazwisko
                            </label>
                            <input
                              type="text"
                              required
                              autoComplete="name"
                              value={profileForm.name}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, name: e.target.value })
                              }
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase">
                              E-mail
                            </label>
                            <input
                              type="email"
                              required
                              autoComplete="email"
                              value={profileForm.email}
                              onChange={(e) =>
                                setProfileForm({ ...profileForm, email: e.target.value })
                              }
                              className={inputClass}
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="rounded-full bg-charcoal px-8 py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85"
                        >
                          Zapisz dane
                        </button>
                      </form>

                      <div className="mt-10 border-t border-taupe/20 pt-8">
                        <h3 className="font-serif text-xl text-charcoal">Zmiana hasła</h3>
                        <p className="mt-1 text-sm text-sand">
                          Podaj aktualne hasło, a następnie wybierz nowe.
                        </p>
                        <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                          <div>
                            <label className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase">
                              Aktualne hasło
                            </label>
                            <input
                              type="password"
                              required
                              autoComplete="current-password"
                              value={passwordForm.current}
                              onChange={(e) =>
                                setPasswordForm({ ...passwordForm, current: e.target.value })
                              }
                              className={inputClass}
                            />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase">
                                Nowe hasło
                              </label>
                              <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={passwordForm.next}
                                onChange={(e) =>
                                  setPasswordForm({ ...passwordForm, next: e.target.value })
                                }
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase">
                                Powtórz nowe hasło
                              </label>
                              <input
                                type="password"
                                required
                                autoComplete="new-password"
                                value={passwordForm.confirm}
                                onChange={(e) =>
                                  setPasswordForm({ ...passwordForm, confirm: e.target.value })
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="rounded-full border border-charcoal px-8 py-3.5 text-[11px] font-semibold tracking-[0.12em] text-charcoal uppercase transition-colors hover:bg-charcoal hover:text-cream"
                          >
                            Zmień hasło
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {tab === "orders" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
                        <h2 className="font-serif text-2xl text-charcoal">Twoje zamówienia</h2>
                        <p className="mt-1 text-sm text-sand">
                          Status produkcji i dostawy każdego zamówienia.
                        </p>
                      </div>
                      {orders.length === 0 ? (
                        <div className="border border-dashed border-taupe/40 bg-cream-light/40 px-6 py-12 text-center">
                          <Package className="mx-auto h-8 w-8 text-sand" strokeWidth={1.2} />
                          <p className="mt-4 text-sm text-charcoal">Nie masz jeszcze zamówień</p>
                          <p className="mt-1 text-sm text-sand">
                            Odkryj kolekcje Wrohaus i dodaj pierwszy mebel do koszyka.
                          </p>
                          <Link
                            href="/produkty"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-[10px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
                          >
                            Przeglądaj produkty
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Link>
                        </div>
                      ) : (
                        orders.map((order) => {
                          const paymentStatus = resolvePaymentStatus(order);
                          const awaitingPayment = paymentStatus === "awaiting";
                          const paymentFailed = paymentStatus === "failed";
                          const subtotal = orderSubtotal(order);
                          const deliveryFee = orderDeliveryFee(order);
                          const discountAmount = orderDiscountAmount(order);
                          const transferTitle =
                            order.transferTitle ??
                            buildTransferTitle(
                              order.id,
                              checkoutSettings?.shopName ?? "Wrohaus"
                            );

                          return (
                          <div
                            key={order.id}
                            className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                                  Zamówienie
                                </p>
                                <p className="mt-1 font-medium text-charcoal">{order.id}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                {awaitingPayment ? (
                                  <PaymentAwaitingBadge />
                                ) : paymentFailed ? (
                                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
                                    Płatność nieudana
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                                    Płatność potwierdzona
                                  </span>
                                )}
                                {(!awaitingPayment || order.status !== "pending") && (
                                  <span className="rounded-full bg-cream-light px-3 py-1 text-xs font-medium text-charcoal">
                                    {statusLabels[order.status] ?? order.status}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="mt-2 text-sm text-sand">{order.date}</p>

                            {awaitingPayment && (
                              <div className="mt-6 border border-amber-200/70 bg-amber-50/50 p-5">
                                <p className="text-sm font-medium text-amber-900">
                                  Dane do przelewu
                                </p>
                                <dl className="mt-3 space-y-2 text-sm">
                                  <div className="flex justify-between gap-4">
                                    <dt className="text-amber-800/80">Kwota</dt>
                                    <dd className="font-medium text-charcoal">
                                      {formatPrice(order.total)}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between gap-4">
                                    <dt className="text-amber-800/80">Tytuł przelewu</dt>
                                    <dd className="font-medium text-charcoal">{transferTitle}</dd>
                                  </div>
                                  {checkoutSettings?.bankAccountNumber && (
                                    <div className="flex justify-between gap-4">
                                      <dt className="text-amber-800/80">Numer konta</dt>
                                      <dd className="text-right font-medium text-charcoal">
                                        {checkoutSettings.bankAccountNumber}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            )}
                            <div className="mt-6 space-y-4 border-t border-taupe/20 pt-6">
                              {order.items.map((item, itemIndex) => (
                                <div
                                  key={`${item.productId}-${item.colorName ?? "default"}-${itemIndex}`}
                                  className="flex items-center gap-4 text-sm"
                                >
                                  <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-cream-light">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      className="object-cover"
                                      sizes="56px"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-charcoal">{item.name}</p>
                                    <p className="text-sand">
                                      {item.colorName ? `${item.colorName}` : ""}
                                      {item.sizeName
                                        ? `${item.colorName ? " · " : ""}${item.sizeName}`
                                        : ""}
                                      {item.optionsName
                                        ? `${item.colorName || item.sizeName ? " · " : ""}${item.optionsName}`
                                        : ""}
                                      {(item.colorName || item.sizeName || item.optionsName) ? " · " : ""}
                                      Ilość: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="shrink-0 font-medium text-charcoal">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 space-y-2 border-t border-taupe/20 pt-4 text-sm">
                              <div className="flex justify-between">
                                <span className="text-sand">Produkty</span>
                                <span className="text-charcoal">{formatPrice(subtotal)}</span>
                              </div>
                              {discountAmount > 0 && (
                                <div className="flex justify-between text-emerald-700">
                                  <span>
                                    Rabat{order.couponCode ? ` (${order.couponCode})` : ""}
                                  </span>
                                  <span>−{formatPrice(discountAmount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-sand">Dostawa</span>
                                <span className="text-charcoal">
                                  {deliveryFee === 0 ? "Gratis" : formatPrice(deliveryFee)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 font-serif text-lg text-charcoal">
                                <span>Razem</span>
                                <span>{formatPrice(order.total)}</span>
                              </div>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {tab === "configs" && (
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-8">
                        <h2 className="font-serif text-2xl text-charcoal">
                          Zapisane konfiguracje
                        </h2>
                        <p className="mt-1 text-sm text-sand">
                          Modele i tkaniny, które chcesz przemyśleć albo wrócić do nich później.
                        </p>
                      </div>

                      {savedConfigs.length === 0 ? (
                        <div className="border border-dashed border-taupe/40 bg-cream-light/40 px-6 py-12 text-center">
                          <Heart className="mx-auto h-8 w-8 text-sand" strokeWidth={1.2} />
                          <p className="mt-4 text-sm text-charcoal">
                            Nie masz jeszcze zapisanych konfiguracji
                          </p>
                          <p className="mt-1 text-sm text-sand">
                            Na stronie produktu wybierz kolor i kliknij „Zapisz konfigurację”.
                          </p>
                          <Link
                            href="/produkty"
                            className="mt-6 inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3 text-[10px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
                          >
                            Przeglądaj produkty
                            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </Link>
                        </div>
                      ) : (
                        savedConfigs.map((config) => {
                          const thumb = config.productImage;
                          return (
                          <div
                            key={config.id}
                            className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:flex-row sm:items-center sm:p-6"
                          >
                            <Link
                              href={`/produkt/${config.productSlug}?kolor=${encodeURIComponent(config.colorId)}`}
                              className="relative h-28 w-full shrink-0 overflow-hidden bg-cream-light sm:h-24 sm:w-24"
                            >
                              <Image
                                src={thumb}
                                alt={config.productName}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 96px"
                                unoptimized={isLocalUpload(thumb)}
                              />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <p className="font-serif text-lg text-charcoal">
                                {config.productName}
                              </p>
                              {config.colorName ? (
                              <div className="mt-1 flex items-center gap-2 text-sm text-charcoal/80">
                                <span
                                  className="h-3.5 w-3.5 ring-1 ring-charcoal/15 ring-inset"
                                  style={{ backgroundColor: config.colorHex }}
                                />
                                <span>
                                  {config.fabricName && config.fabricName !== config.colorName
                                    ? `${config.fabricName} · ${config.colorName}`
                                    : config.colorName}
                                </span>
                              </div>
                              ) : null}
                              <p className="mt-2 text-xs text-sand">
                                Zapisano{" "}
                                {new Date(config.savedAt).toLocaleDateString("pl-PL")}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <Link
                                href={`/produkt/${config.productSlug}?kolor=${encodeURIComponent(config.colorId)}`}
                                className="inline-flex min-h-[40px] items-center rounded-full border border-charcoal px-4 text-[10px] tracking-[0.16em] text-charcoal uppercase hover:bg-charcoal hover:text-cream"
                              >
                                Otwórz
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeConfiguration(config.id)}
                                className="flex h-10 w-10 items-center justify-center rounded-full border border-taupe/30 text-sand hover:border-red-200 hover:text-red-600"
                                aria-label="Usuń konfigurację"
                              >
                                <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <AccountHelpPanel />
                </aside>
              </div>
            ) : (
              <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:items-start lg:gap-10">
                <div className="w-full self-start rounded-2xl border border-taupe/20 bg-white p-6 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)] sm:p-7">
                  <div className="flex rounded-full bg-cream-light p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTab("login");
                        setError("");
                      }}
                      className={`flex-1 rounded-full py-2.5 text-sm transition-all ${
                        tab === "login"
                          ? "bg-white font-semibold text-charcoal shadow-sm"
                          : "text-sand hover:text-charcoal"
                      }`}
                    >
                      Logowanie
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("register");
                        setError("");
                      }}
                      className={`flex-1 rounded-full py-2.5 text-sm transition-all ${
                        tab === "register"
                          ? "bg-white font-semibold text-charcoal shadow-sm"
                          : "text-sand hover:text-charcoal"
                      }`}
                    >
                      Rejestracja
                    </button>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                      {error}
                    </p>
                  )}

                  {tab === "login" && (
                    <form onSubmit={handleLogin} className="mt-6 space-y-4">
                      <div>
                        <label
                          htmlFor="account-login-email"
                          className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase"
                        >
                          E-mail
                        </label>
                        <input
                          id="account-login-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, email: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="account-login-password"
                          className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase"
                        >
                          Hasło
                        </label>
                        <input
                          id="account-login-password"
                          type="password"
                          required
                          autoComplete="current-password"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, password: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setTab("forgot");
                          setError("");
                          setResetSent(false);
                        }}
                        className="text-sm text-charcoal underline underline-offset-2"
                      >
                        Nie pamiętasz hasła?
                      </button>
                      <button
                        type="submit"
                        className="mt-2 w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85"
                      >
                        Zaloguj się
                      </button>
                    </form>
                  )}

                  {tab === "forgot" && (
                    <form
                      className="mt-6 space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setError("");
                        const status = await fetch("/api/auth").then((r) => r.json());
                        const res = await fetch("/api/auth", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "requestPasswordReset",
                            email: loginForm.email,
                            csrf: status.csrf,
                          }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          setError(data.error ?? "Nie udało się wysłać linku");
                          return;
                        }
                        setResetSent(true);
                      }}
                    >
                      <p className="text-sm leading-relaxed text-charcoal/75">
                        Podaj e-mail konta. Jeśli istnieje, wyślemy link do ustawienia nowego hasła.
                      </p>
                      <div>
                        <label
                          htmlFor="account-forgot-email"
                          className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase"
                        >
                          E-mail
                        </label>
                        <input
                          id="account-forgot-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, email: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      {resetSent ? (
                        <p className="text-sm text-charcoal">
                          Jeśli konto istnieje, wysłaliśmy instrukcję na ten e-mail.
                        </p>
                      ) : null}
                      <button
                        type="submit"
                        className="w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase"
                      >
                        Wyślij link
                      </button>
                      <button
                        type="button"
                        onClick={() => setTab("login")}
                        className="text-sm text-charcoal underline underline-offset-2"
                      >
                        Wróć do logowania
                      </button>
                    </form>
                  )}

                  {tab === "register" && (
                    <form onSubmit={handleRegister} className="mt-6 space-y-4">
                      {(
                        [
                          ["name", "Imię i nazwisko", "text"],
                          ["email", "E-mail", "email"],
                          ["password", "Hasło", "password"],
                          ["confirm", "Potwierdź hasło", "password"],
                        ] as const
                      ).map(([key, label, type]) => (
                        <div key={key}>
                          <label
                            htmlFor={`account-register-${key}`}
                            className="text-[10px] font-medium tracking-[0.18em] text-charcoal/55 uppercase"
                          >
                            {label}
                          </label>
                          <input
                            id={`account-register-${key}`}
                            type={type}
                            required
                            autoComplete={
                              key === "email"
                                ? "email"
                                : key === "name"
                                  ? "name"
                                  : key === "password"
                                    ? "new-password"
                                    : "new-password"
                            }
                            value={registerForm[key]}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, [key]: e.target.value })
                            }
                            className={inputClass}
                          />
                        </div>
                      ))}
                      <button
                        type="submit"
                        className="mt-2 w-full rounded-full bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-charcoal/85"
                      >
                        Utwórz konto
                      </button>
                    </form>
                  )}
                </div>

                <GuestBenefits />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
