"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { company } from "@/lib/firma";
import { storefrontShopNav } from "@/lib/widocznoscKategorii";
import { CookieSettingsButton } from "./PrzyciskCookies";
import { payu } from "@/lib/payu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { useShop } from "@/kontekst/KontekstSklepu";
import { SocialIconLinks } from "./IkonySocial";
import { PaymentMethodIcons } from "./IkonyPlatnosci";

function FooterLinkList({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="text-[13px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </h4>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="text-sm text-sand transition-colors hover:text-cream"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ hideAbout }: { hideAbout?: boolean } = {}) {
  const { t, hrefLabel } = useLanguage();
  const { socialLinks, checkoutSettings, visibleProductCategories, customCategories } = useShop();
  const known = hideAbout !== undefined;
  const [aboutVisible, setAboutVisible] = useState(known ? !hideAbout : false);

  useEffect(() => {
    if (known) {
      setAboutVisible(!hideAbout);
      return;
    }
    let cancelled = false;
    fetch("/api/about")
      .then((r) => r.json())
      .then((data: { archived?: boolean }) => {
        if (!cancelled) setAboutVisible(!data?.archived);
      })
      .catch(() => {
        if (!cancelled) setAboutVisible(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hideAbout, known]);

  const shopLinks = storefrontShopNav(customCategories, visibleProductCategories).flatMap(
    (item) => (item.type === "link" ? [item] : item.children)
  ).map((item) => ({
    ...item,
    label: hrefLabel(item.href, item.label),
  }));
  const helpLinks = [
    { label: t("footer.delivery"), href: "/dostawa" },
    { label: t("footer.returns"), href: "/polityka-zwrotow" },
    { label: t("footer.faq"), href: "/faq" },
    { label: t("footer.contact"), href: "/kontakt" },
    { label: t("footer.warranty"), href: "/gwarancja" },
  ];
  const companyLinks = [
    ...(aboutVisible
      ? [{ label: t("footer.about"), href: "/o-nas" }]
      : []),
    { label: t("footer.contact"), href: "/kontakt" },
    { label: t("footer.blog"), href: "/blog" },
  ];
  const collaborationLinks = [{ label: t("footer.b2b"), href: "/b2b" }];

  return (
    <footer id="site-footer" className="mt-auto bg-charcoal text-cream">
      <div className="page-gutter">
      <div className="page-width site-footer-inner pt-12 sm:pt-16">
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            <Logo variant="dark" />
            <SocialIconLinks links={socialLinks} className="mt-5" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-sand">
              {t("footer.blurb")}
            </p>
            <div className="mt-6 space-y-1 text-xs leading-relaxed text-sand/90">
              <p>{company.legalName}</p>
              <p>NIP {company.nip}</p>
              <p>REGON {company.regon}</p>
              <p>{company.fullAddress}</p>
              <p>
                <a
                  href={`mailto:${company.email}`}
                  className="transition-colors hover:text-cream"
                >
                  {company.emailDisplay}
                </a>
              </p>
              {checkoutSettings?.phone ? (
                <p>
                  <a
                    href={`tel:${checkoutSettings.phone.replace(/\s/g, "")}`}
                    className="transition-colors hover:text-cream"
                  >
                    {checkoutSettings.phone}
                  </a>
                </p>
              ) : null}
              <p>{company.openingHoursShort}</p>
              <p className="pt-2">
                {t("footer.payu", { name: payu.legalName })}
              </p>
            </div>
          </div>
          <FooterLinkList title={t("footer.shop")} links={shopLinks} />
          <div className="space-y-8">
            <FooterLinkList title={t("footer.help")} links={helpLinks} />
            <FooterLinkList title={t("footer.company")} links={companyLinks} />
            <FooterLinkList title={t("footer.collab")} links={collaborationLinks} />
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-sand/20 pt-6 sm:mt-16 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <p className="text-[11px] font-medium tracking-[0.16em] text-sand uppercase">
            {t("footer.payments")}
          </p>
          <PaymentMethodIcons
            ariaLabel={t("footer.payments")}
            blik={t("footer.payBlik")}
            card={t("footer.payCard")}
            applePay={t("footer.payApple")}
            bank={t("footer.payBank")}
            payu={t("footer.payPayu")}
            installments={t("footer.payInstallments")}
          />
        </div>
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:mt-6 md:flex-row">
          <p className="text-center text-xs text-sand min-[400px]:text-left">
            <span className="block min-[400px]:inline">
              © 2026 {company.brandName}. {t("footer.rights")}
            </span>
            <span className="mx-2 hidden text-sand/40 min-[400px]:inline" aria-hidden>
              |
            </span>
            <a
              href="https://www.instagram.com/xmenago/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-block whitespace-nowrap text-cream/80 underline decoration-cream/25 underline-offset-4 transition-colors hover:text-cream hover:decoration-terracotta min-[400px]:mt-0"
            >
              made by @xmenago
            </a>
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-sand">
            <Link href="/polityka-prywatnosci" className="hover:text-cream">
              {t("footer.privacy")}
            </Link>
            <Link href="/regulamin" className="hover:text-cream">
              {t("footer.terms")}
            </Link>
            <Link href="/polityka-zwrotow" className="hover:text-cream">
              {t("footer.returns")}
            </Link>
            <Link href="/formularz-odstapienia" className="hover:text-cream">
              {t("footer.withdrawal")}
            </Link>
            <Link href="/polityka-cookies" className="hover:text-cream">
              {t("footer.cookies")}
            </Link>
            <CookieSettingsButton className="text-sand hover:text-cream" />
          </div>
        </div>
      </div>
      </div>
    </footer>
  );
}
