"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { CodeTicket } from "@/components/sklep/GrafikaKodu";

export function Newsletter({
  offer,
}: {
  offer?: { code: string; percent?: number };
}) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setSubmitted(true);
    setMessage(data.message ?? t("home.newsletterThanks"));
  }

  return (
    <section id="newsletter" className="page-gutter py-12 sm:py-16">
      <div className="page-width overflow-hidden rounded-2xl bg-charcoal px-6 py-12 text-center text-cream sm:rounded-3xl sm:px-12 sm:py-16">
        <p className="section-kicker tracking-[0.14em] text-cream/80 uppercase">
          {t("home.newsletterKicker")}
        </p>
        <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
          {t("home.newsletterTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-cream/80 sm:mt-4">
          {t("home.newsletterBody")}
        </p>
        {offer?.code ? (
          <CodeTicket
            kicker={t("home.newsletterKicker")}
            code={offer.code}
            detail={offer.percent ? `−${offer.percent}%` : undefined}
          />
        ) : null}
        {submitted ? (
          <p className="mt-8 text-sm text-cream">{message}</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-xl flex-col gap-3.5 sm:mt-8"
          >
            <div className="flex flex-col gap-3.5 sm:flex-row sm:gap-0">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("home.newsletterEmail")}
                className="min-h-[48px] flex-1 rounded-full border border-cream/20 bg-cream/10 px-5 py-3.5 text-base text-cream placeholder:text-cream/45 focus:border-cream/50 focus:outline-none sm:rounded-r-none sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-[15px] font-semibold text-charcoal transition-colors hover:bg-white disabled:opacity-50 sm:rounded-l-none sm:py-4"
              >
                {loading ? "..." : t("home.newsletterCta")}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <label className="flex cursor-pointer items-start gap-2 text-left text-xs leading-relaxed text-cream/70">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-cream"
              />
              <span>
                {t("home.newsletterConsent")}{" "}
                <a href="/polityka-prywatnosci" className="underline underline-offset-2">
                  {t("footer.privacy")}
                </a>
              </span>
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
