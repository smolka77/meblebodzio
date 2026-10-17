"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { payu } from "@/lib/payu";
import { company } from "@/lib/firma";
import { useLanguage } from "@/kontekst/KontekstJezyka";

export function PayUCheckoutNotices({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  if (compact) {
    return (
      <div className="rounded-xl border border-taupe/25 bg-cream-light/50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-charcoal" strokeWidth={1.5} />
            <span className="text-sm font-medium text-charcoal">{t("cart.payuMethods")}</span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-sand transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>

        {open && (
          <div className="space-y-3 border-t border-taupe/20 px-4 py-4 text-xs leading-relaxed text-charcoal/75">
            <p>
              {t("payu.seller", {
                legal: company.legalName,
                brand: company.brandName,
                address: company.fullAddress,
                nip: company.nip,
                statement: company.statementName,
              })}{" "}
              <a href={`mailto:${company.email}`} className="underline underline-offset-2">
                {company.emailDisplay}
              </a>
              .
            </p>
            <p>{t("payu.body", { name: payu.legalName })}</p>
            <p>{payu.paymentOrderNotice}</p>
            <p>
              {t("payu.accept")}{" "}
              <a
                href={payu.paymentTermsUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                {t("payu.terms")}
              </a>
              .
            </p>
            <p>{payu.privacyNotice}</p>
            <p>{payu.privacyNoticeMore}</p>
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/regulamin" className="underline underline-offset-2">
                {t("footer.terms")}
              </Link>
              <Link href="/polityka-prywatnosci" className="underline underline-offset-2">
                {t("footer.privacy")}
              </Link>
              <Link href="/polityka-zwrotow" className="underline underline-offset-2">
                {t("product.returnPolicy")}
              </Link>
              <Link href="/formularz-odstapienia" className="underline underline-offset-2">
                {t("footer.withdrawal")}
              </Link>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs leading-relaxed text-sand">
      <p>
        {t("payu.seller", {
          legal: company.legalName,
          brand: company.brandName,
          address: company.fullAddress,
          nip: company.nip,
          statement: company.statementName,
        })}{" "}
        <a href={`mailto:${company.email}`} className="underline underline-offset-2">
          {company.emailDisplay}
        </a>
        .
      </p>
      <p>{t("payu.body", { name: payu.legalName })}</p>
      <p>{payu.paymentOrderNotice}</p>
      <p>
        {t("payu.accept")}{" "}
        <a
          href={payu.paymentTermsUrl}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          {t("payu.terms")}
        </a>
        .
      </p>
      <p>{payu.privacyNotice}</p>
    </div>
  );
}
