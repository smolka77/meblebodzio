"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  writeCookieConsent,
} from "@/lib/zgodaCookies";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function CookieBanner() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) {
      setVisible(false);
      return;
    }
    const current = readCookieConsent();
    setAnalytics(current?.analytics === true);
    setMarketing(current?.marketing === true);
    setVisible(current === null);

    function onOpenSettings() {
      const latest = readCookieConsent();
      setAnalytics(latest?.analytics === true);
      setMarketing(latest?.marketing === true);
      setCustomize(true);
      setVisible(true);
    }
    window.addEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, onOpenSettings);
  }, [pathname]);

  if (pathname.startsWith("/admin") || !visible) return null;

  function acceptAll() {
    writeCookieConsent(true, true);
    setVisible(false);
    setCustomize(false);
  }

  function rejectOptional() {
    writeCookieConsent(false, false);
    setVisible(false);
    setCustomize(false);
  }

  function saveCustom() {
    writeCookieConsent(analytics, marketing);
    setVisible(false);
    setCustomize(false);
  }

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[80] print:hidden"
    >
      <div className="page-gutter pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="page-width mb-3 rounded-2xl border border-taupe/40 bg-cream p-5 shadow-[0_16px_48px_-20px_rgba(17,17,17,0.35)] sm:p-6">
          <p
            id="cookie-banner-title"
            className="font-serif text-lg text-charcoal sm:text-xl"
          >
            {t("cookie.title")}
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-charcoal/80">
            {t("cookie.body")}{" "}
            <Link href="/polityka-cookies" className="underline underline-offset-2">
              {t("footer.cookies")}
            </Link>
            {" · "}
            <Link href="/polityka-prywatnosci" className="underline underline-offset-2">
              {t("footer.privacy")}
            </Link>
            .
          </p>

          {customize && (
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-charcoal"
                />
                <span>{t("cookie.analytics")}</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-charcoal"
                />
                <span>{t("cookie.marketing")}</span>
              </label>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={acceptAll}
              className="min-h-[44px] flex-1 rounded-full bg-charcoal px-6 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase sm:flex-none"
            >
              {t("cookie.acceptAll")}
            </button>
            <button
              type="button"
              onClick={rejectOptional}
              className="min-h-[44px] flex-1 rounded-full border-2 border-charcoal px-6 text-[11px] font-semibold tracking-[0.12em] text-charcoal uppercase sm:flex-none"
            >
              {t("cookie.reject")}
            </button>
            {customize ? (
              <button
                type="button"
                onClick={saveCustom}
                className="min-h-[44px] rounded-full border border-taupe/50 px-6 text-[11px] tracking-[0.12em] text-charcoal uppercase"
              >
                {t("cookie.save")}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCustomize(true)}
                className="min-h-[44px] rounded-full px-4 text-[11px] tracking-[0.12em] text-sand uppercase underline underline-offset-4"
              >
                {t("cookie.settings")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
