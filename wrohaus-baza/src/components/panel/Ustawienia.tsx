"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { SeoFields } from "@/components/panel/PolaSeo";
import { EmailTemplatesPanel } from "@/components/panel/SzablonyMaile";
import type { Product, ProductCategory, ShopSettings } from "@/lib/typy";
import { categoryLabels, productCategories } from "@/lib/dane";
import {
  SEO_DEFAULT_DESCRIPTION,
  SEO_DEFAULT_KEYWORDS,
  SEO_DEFAULT_TITLE,
} from "@/lib/seoPola";
import {
  DEFAULT_VISIBLE_PRODUCT_CATEGORIES,
  normalizeVisibleProductCategories,
} from "@/lib/widocznoscKategorii";

export function AdminSettings() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: ShopSettings) =>
        setSettings({
          ...data,
          visibleProductCategories: normalizeVisibleProductCategories(
            data.visibleProductCategories
          ),
        })
      )
      .catch(() => {});
    fetch("/api/products?all=1")
      .then((r) => r.json())
      .then((data: Product[]) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const productCounts = useMemo(() => {
    const counts = Object.fromEntries(
      productCategories.map((category) => [category, 0])
    ) as Record<ProductCategory, number>;
    for (const product of products) {
      if (product.draft) continue;
      counts[product.category] += 1;
    }
    return counts;
  }, [products]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setLoading(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  function toggleCategory(slug: ProductCategory, visible: boolean) {
    if (!settings) return;
    const current = normalizeVisibleProductCategories(
      settings.visibleProductCategories
    );
    const next = visible
      ? [...current, slug]
      : current.filter((item) => item !== slug);
    setSettings({
      ...settings,
      visibleProductCategories: normalizeVisibleProductCategories(next),
    });
  }

  function hideEmptyCategories() {
    if (!settings) return;
    const current = normalizeVisibleProductCategories(
      settings.visibleProductCategories
    );
    setSettings({
      ...settings,
      visibleProductCategories: current.filter(
        (slug) => productCounts[slug] > 0
      ),
    });
  }

  function restoreDefaultCategories() {
    if (!settings) return;
    setSettings({
      ...settings,
      visibleProductCategories: [...DEFAULT_VISIBLE_PRODUCT_CATEGORIES],
    });
  }

  if (!settings) {
    return (
      <>
        <AdminHeader title="Ustawienia" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  const visibleSet = new Set(
    normalizeVisibleProductCategories(settings.visibleProductCategories)
  );

  const inputClass =
    "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

  return (
    <>
      <AdminHeader title="Ustawienia" />
      <div className="admin-page">
        <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-6 sm:space-y-8">
          <div id="maile" className="scroll-mt-24 space-y-6">
            <MailNotifyPanel inputClass={inputClass} />
            <EmailTemplatesPanel />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                href: "/admin/kategorie",
                label: "Opisy kategorii",
                hint: "Tekst na stronie kategorii i w Google",
              },
              {
                href: "/admin/promocje",
                label: "Promocje",
                hint: "Akcje i lista mebli — nie kody rabatowe",
              },
              {
                href: "/admin/dostawa",
                label: "Treść dostawy",
                hint: "Tekst na stronie Dostawa",
              },
              {
                href: "/admin/social-media",
                label: "Social media",
                hint: "Linki do Instagramu i Facebooka",
              },
              {
                href: "/admin/ustawienia#maile",
                label: "Maile",
                hint: "SMTP i treść potwierdzenia zamówienia",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-taupe/30 bg-white px-4 py-3 transition-colors hover:border-charcoal/30 hover:bg-cream-light/40"
              >
                <span className="block text-sm font-medium text-charcoal">
                  {item.label}
                </span>
                <span className="mt-0.5 block text-xs text-sand">{item.hint}</span>
              </Link>
            ))}
          </div>

          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Sklep</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-sand uppercase">Nazwa sklepu</label>
                <input
                  type="text"
                  value={settings.shopName}
                  onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">E-mail kontaktowy</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Telefon</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">E-mail administratora</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  className={inputClass}
                />
              </div>
              <p className="text-xs leading-relaxed text-sand">
                Logowanie do panelu jest dwuskładnikowe (login + hasło + kod z aplikacji).
                Danych dostępu nie zmienia się tutaj.
              </p>
            </div>
          </section>

          <SmsNotifyPanel inputClass={inputClass} />

          <section
            id="google-seo"
            className="scroll-mt-24 rounded-xl border border-taupe/30 bg-white p-6"
          >
            <h3 className="text-sm font-medium text-charcoal">Google / SEO</h3>
            <div className="mt-4">
              <SeoFields
                title={settings.seoTitle ?? ""}
                description={settings.seoDescription ?? ""}
                keywords={settings.seoKeywords ?? ""}
                onTitle={(seoTitle) => setSettings({ ...settings, seoTitle })}
                onDescription={(seoDescription) =>
                  setSettings({ ...settings, seoDescription })
                }
                onKeywords={(seoKeywords) => setSettings({ ...settings, seoKeywords })}
                titlePlaceholder={SEO_DEFAULT_TITLE}
                descriptionPlaceholder={SEO_DEFAULT_DESCRIPTION}
                keywordsPlaceholder={SEO_DEFAULT_KEYWORDS.join(", ")}
                hint="To widać na stronie głównej w Google i przy udostępnianiu linku. Puste pola = obecny domyślny tekst sklepu."
              />
            </div>
          </section>

          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Dostawa i płatności</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs text-sand uppercase">Koszt dostawy (zł)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.deliveryFee}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryFee: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase" htmlFor="delivery-lead">
                  Tekst dostawy na stronie (jeden dla całego sklepu)
                </label>
                <input
                  id="delivery-lead"
                  type="text"
                  value={settings.deliveryLeadText ?? ""}
                  onChange={(e) =>
                    setSettings({ ...settings, deliveryLeadText: e.target.value })
                  }
                  placeholder="do 5 dni roboczych"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-sand">
                  Widać tam, gdzie produkt nie ma własnego terminu na karcie.
                </p>
              </div>
              <div>
                <label className="text-xs text-sand uppercase">
                  Próg darmowej dostawy (zł, 0 = wyłączone)
                </label>
                <input
                  type="number"
                  min={0}
                  value={settings.freeShippingThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      freeShippingThreshold: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={settings.discountCodesEnabled !== false}
                  onChange={(e) =>
                    setSettings({ ...settings, discountCodesEnabled: e.target.checked })
                  }
                />
                Kody rabatowe włączone
              </label>
              <label className="flex items-center gap-2 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={Boolean(settings.newsletterOfferEnabled)}
                  onChange={(e) =>
                    setSettings({ ...settings, newsletterOfferEnabled: e.target.checked })
                  }
                />
                Pokazuj kod newslettera na stronie głównej
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-sand uppercase" htmlFor="newsletter-code">
                    Kod newslettera
                  </label>
                  <input
                    id="newsletter-code"
                    type="text"
                    value={settings.newsletterOfferCode ?? ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        newsletterOfferCode: e.target.value.toUpperCase(),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-sand uppercase" htmlFor="newsletter-percent">
                    Rabat kodu (%)
                  </label>
                  <input
                    id="newsletter-percent"
                    type="number"
                    min={1}
                    max={90}
                    value={settings.newsletterOfferPercent ?? ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        newsletterOfferPercent:
                          e.target.value === "" ? undefined : Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Nazwa odbiorcy przelewu</label>
                <input
                  type="text"
                  value={settings.bankAccountName}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Numer konta bankowego</label>
                <input
                  type="text"
                  value={settings.bankAccountNumber}
                  onChange={(e) =>
                    setSettings({ ...settings, bankAccountNumber: e.target.value })
                  }
                  placeholder="np. 12 3456 7890 1234 5678 9012 3456"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-sand uppercase">Nazwa banku</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) =>
                    setSettings({ ...settings, bankName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <p className="text-sm text-sand">
                Tytuł przelewu generowany automatycznie:{" "}
                <span className="text-charcoal">{settings.shopName} ORD-123</span>
              </p>
              <div>
                <label className="text-xs text-sand uppercase">Dni na zwrot</label>
                <input
                  type="number"
                  value={settings.returnsDays}
                  onChange={(e) =>
                    setSettings({ ...settings, returnsDays: Number(e.target.value) })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-medium text-charcoal">
                  Widoczność kategorii
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-sand">
                  Wyłączone kategorie znikają z menu, stopki, strony głównej i mapy
                  strony. PayU wymaga, żeby puste kategorie nie były widoczne w sklepie.
                  Opisy stron kategorii edytujesz w{" "}
                  <Link href="/admin/kategorie" className="underline underline-offset-2">
                    Kategorie
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={hideEmptyCategories}
                  className="rounded-lg border border-taupe/40 px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light"
                >
                  Ukryj puste
                </button>
                <button
                  type="button"
                  onClick={restoreDefaultCategories}
                  className="rounded-lg border border-taupe/40 px-3 py-2 text-xs font-medium text-charcoal hover:bg-cream-light"
                >
                  Przywróć domyślne
                </button>
              </div>
            </div>
            <ul className="mt-5 divide-y divide-taupe/20">
              {productCategories.map((slug) => {
                const count = productCounts[slug] ?? 0;
                const checked = visibleSet.has(slug);
                return (
                  <li
                    key={slug}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => toggleCategory(slug, e.target.checked)}
                        className="h-4 w-4 rounded border-taupe/50 text-charcoal focus:ring-charcoal"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm text-charcoal">
                          {categoryLabels[slug]}
                        </span>
                        <span
                          className={`block text-xs ${
                            count === 0 ? "text-terracotta" : "text-sand"
                          }`}
                        >
                          {count === 0
                            ? "pusta — wyłącz na czas PayU"
                            : `${count} ${
                                count === 1
                                  ? "produkt"
                                  : count < 5
                                    ? "produkty"
                                    : "produktów"
                              }`}
                        </span>
                      </span>
                    </label>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase ${
                        checked
                          ? "bg-charcoal text-cream"
                          : "bg-cream-light text-sand"
                      }`}
                    >
                      {checked ? "Włączona" : "Wyłączona"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz ustawienia"}
          </button>
        </form>
      </div>
    </>
  );
}

function SmsNotifyPanel({ inputClass }: { inputClass: string }) {
  const [configured, setConfigured] = useState(false);
  const [to, setTo] = useState("660 591 361");
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/sms")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { configured?: boolean; to?: string } | null) => {
        if (!data) return;
        setConfigured(Boolean(data.configured));
        if (data.to) setTo(data.to);
      })
      .catch(() => {});
  }, []);

  async function saveToken() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/sms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json().catch(() => null)) as {
      configured?: boolean;
      to?: string;
      error?: string;
    } | null;
    setSaving(false);
    if (!res.ok) {
      setError(data?.error || "Nie udało się zapisać tokenu.");
      return;
    }
    setConfigured(Boolean(data?.configured));
    if (data?.to) setTo(data.to);
    setToken("");
    setMessage("Token zapisany. SMS o zamówieniach idzie na ten numer.");
  }

  async function sendTest() {
    setTesting(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/sms", { method: "POST" });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setTesting(false);
    if (!res.ok) {
      setError(data?.error || "Testowy SMS nie wyszedł.");
      return;
    }
    setMessage(`Testowy SMS poszedł na ${to}.`);
  }

  return (
    <section className="rounded-xl border border-taupe/30 bg-white p-6">
      <h3 className="text-sm font-medium text-charcoal">SMS o zamówieniach</h3>
      <p className="mt-2 text-sm leading-relaxed text-sand">
        Sklep dostaje SMS na{" "}
        <span className="font-medium text-charcoal">{to}</span> przy nowym i
        opłaconym zamówieniu. Klient po opłaceniu w PayU dostaje SMS na numer z
        zamówienia. Token OAuth z{" "}
        <a
          href="https://ssl.smsapi.pl/oauth/manage"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          SMSAPI.pl
        </a>
        . Token zostaje na serwerze, nie na stronie sklepu.
      </p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs text-sand uppercase">
            {configured ? "Nowy token (zostaw puste, jeśli bez zmian)" : "Token SMSAPI"}
          </label>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              if (token.trim().length >= 16) void saveToken();
            }}
            placeholder={configured ? "Token zapisany — wklej nowy, żeby podmienić" : "Wklej token OAuth"}
            className={inputClass}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || token.trim().length < 16}
            onClick={() => void saveToken()}
            className="min-h-[44px] rounded-lg bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/85 disabled:opacity-50"
          >
            {saving ? "Zapisywanie..." : "Zapisz token"}
          </button>
          <button
            type="button"
            disabled={testing || !configured}
            onClick={() => void sendTest()}
            className="min-h-[44px] rounded-lg border border-taupe/40 px-4 py-2 text-sm text-charcoal hover:bg-cream-light disabled:opacity-50"
          >
            {testing ? "Wysyłanie..." : "Wyślij testowy SMS"}
          </button>
        </div>
        {configured ? (
          <p className="text-xs text-charcoal">Token jest zapisany — powiadomienia są włączone.</p>
        ) : (
          <p className="text-xs text-terracotta">
            Bez tokenu zamówienie się zapisze, ale SMS nie wyjdzie.
          </p>
        )}
        {message ? <p className="text-xs text-charcoal">{message}</p> : null}
        {error ? <p className="text-xs text-terracotta">{error}</p> : null}
      </div>
    </section>
  );
}

function MailNotifyPanel({ inputClass }: { inputClass: string }) {
  const [configured, setConfigured] = useState(false);
  const [host, setHost] = useState("");
  const [port, setPort] = useState("587");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [from, setFrom] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mail")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            configured?: boolean;
            host?: string;
            port?: number;
            user?: string;
            from?: string;
          } | null
        ) => {
          if (!data) return;
          setConfigured(Boolean(data.configured));
          if (data.host) setHost(data.host);
          if (data.port) setPort(String(data.port));
          if (data.user) setUser(data.user);
          if (data.from) setFrom(data.from);
        }
      )
      .catch(() => {});
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/mail", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host,
        port: Number(port) || 587,
        user,
        pass,
        from,
        secure: port === "465",
      }),
    });
    const data = (await res.json().catch(() => null)) as {
      configured?: boolean;
      error?: string;
    } | null;
    setSaving(false);
    if (!res.ok) {
      setError(data?.error || "Nie udało się zapisać SMTP.");
      return;
    }
    setConfigured(Boolean(data?.configured));
    setPass("");
    setMessage("SMTP zapisane. Maile z potwierdzeniem pójdą do klienta po opłaceniu.");
  }

  async function sendTest() {
    setTesting(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/mail", { method: "POST" });
    const data = (await res.json().catch(() => null)) as {
      error?: string;
      to?: string;
    } | null;
    setTesting(false);
    if (!res.ok) {
      setError(data?.error || "Testowy e-mail nie wyszedł.");
      return;
    }
    setMessage(`Testowy e-mail poszedł na ${data?.to ?? "e-mail administratora"}.`);
  }

  return (
    <section className="rounded-xl border border-taupe/30 bg-white p-6">
      <h3 className="text-sm font-medium text-charcoal">Wysyłka maili (SMTP)</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-sand">
        <li>
          Niżej w sekcji <span className="text-charcoal">Sklep</span> wpisz{" "}
          <span className="text-charcoal">E-mail administratora</span> — na niego
          idzie test.
        </li>
        <li>
          Host, login i hasło weź z panelu skrzynki{" "}
          <span className="text-charcoal">kontakt@wrohaus.pl</span> (hosting
          domeny → poczta → SMTP). To nie ustawia się samo.
        </li>
        <li>
          Typowo: login = pełny adres e-mail, port <span className="text-charcoal">587</span>,
          nadawca = kontakt@wrohaus.pl. Gmail / Workspace: host{" "}
          <span className="text-charcoal">smtp.gmail.com</span>, hasło aplikacji
          (nie zwykłe hasło do Gmaila).
        </li>
        <li>
          Zapisz SMTP, potem wyślij testowy e-mail. Jak dojdzie — po opłaceniu
          zamówienia klient dostaje potwierdzenie automatycznie.
        </li>
      </ol>
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs text-sand uppercase">Host SMTP</label>
          <input
            type="text"
            autoComplete="off"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="np. smtp.zenbox.pl"
            className={inputClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-sand uppercase">Port</label>
            <input
              type="text"
              inputMode="numeric"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-sand uppercase">Nadawca (From)</label>
            <input
              type="email"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="kontakt@wrohaus.pl"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-sand uppercase">Login</label>
          <input
            type="text"
            autoComplete="off"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-sand uppercase">
            {configured ? "Nowe hasło (puste = bez zmian)" : "Hasło skrzynki"}
          </label>
          <input
            type="password"
            autoComplete="new-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || !host.trim()}
            onClick={() => void save()}
            className="min-h-[44px] rounded-lg bg-charcoal px-4 py-2 text-sm text-cream hover:bg-charcoal/85 disabled:opacity-50"
          >
            {saving ? "Zapisywanie..." : "Zapisz SMTP"}
          </button>
          <button
            type="button"
            disabled={testing || !configured}
            onClick={() => void sendTest()}
            className="min-h-[44px] rounded-lg border border-taupe/40 px-4 py-2 text-sm text-charcoal hover:bg-cream-light disabled:opacity-50"
          >
            {testing ? "Wysyłanie..." : "Wyślij testowy e-mail"}
          </button>
        </div>
        {configured ? (
          <p className="text-xs text-charcoal">SMTP jest zapisane — potwierdzenia mailowe są włączone.</p>
        ) : (
          <p className="text-xs text-terracotta">
            Bez SMTP zamówienie się zapisze, ale mail do klienta nie wyjdzie.
          </p>
        )}
        {message ? <p className="text-xs text-charcoal">{message}</p> : null}
        {error ? <p className="text-xs text-terracotta">{error}</p> : null}
      </div>
    </section>
  );
}
