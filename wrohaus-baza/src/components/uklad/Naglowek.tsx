"use client";

import Link from "next/link";
import {
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Heart,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { SearchOverlay } from "./NakladkaSzukania";
import { HeaderSearch } from "./SzukajkaNaglowka";
import { LanguageExpand, LanguageDrawerRow } from "./WyborJezyka";
import { PromoTopBar } from "@/components/glowna/PasekGorny";
import { type ShopNavGroup, type ShopNavItem, type ShopNavLink } from "@/lib/nawigacjaSklepu";
import { storefrontShopNav } from "@/lib/widocznoscKategorii";
import { lineFromHref, lineTextClass } from "@/lib/linieProduktow";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";

function navLinkPath(href: string): string {
  return href.split("?")[0] ?? href;
}

function withNamedLinesNav(
  items: ShopNavItem[],
  lines: { slug: string; name: string }[]
): ShopNavItem[] {
  const children: ShopNavLink[] = [
    {
      type: "link",
      labelKey: "nav.linesAll",
      label: "Wszystkie linie",
      href: "/linie",
    },
    ...lines.map((line) => ({
      type: "link" as const,
      labelKey: "nav.lines" as const,
      label: line.name,
      href: `/linie/${line.slug}`,
    })),
  ];
  const group: ShopNavGroup = {
    type: "group",
    id: "named-lines",
    labelKey: "nav.lines",
    label: "Linie",
    children,
  };
  return items.map((item) =>
    item.type === "link" && item.href === "/linie" ? group : item
  );
}

function groupContainsPath(group: ShopNavGroup, pathname: string): boolean {
  return group.children.some((child) => navLinkPath(child.href) === pathname);
}

function DesktopNavLink({
  item,
  hrefLabel,
}: {
  item: ShopNavLink;
  hrefLabel: (href: string, fallback?: string) => string;
}) {
  const line = lineFromHref(item.href);
  return (
    <Link
      href={item.href}
      className={`whitespace-nowrap text-[13px] font-medium transition-colors xl:text-[15px] ${
        line
          ? `font-semibold ${lineTextClass[line]}`
          : "text-charcoal hover:text-terracotta"
      }`}
    >
      {hrefLabel(item.href, item.label)}
    </Link>
  );
}

function DesktopNavGroup({
  group,
  t,
  hrefLabel,
}: {
  group: ShopNavGroup;
  t: (key: ShopNavGroup["labelKey"]) => string;
  hrefLabel: (href: string, fallback?: string) => string;
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        aria-haspopup="menu"
        className="flex items-center gap-1 whitespace-nowrap text-[13px] font-medium text-charcoal transition-colors hover:text-terracotta xl:text-[15px]"
      >
        {t(group.labelKey)}
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-sand transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
          strokeWidth={1.75}
        />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 min-w-[220px] -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div
          role="menu"
          className="rounded-xl border border-taupe/30 bg-cream py-2 shadow-[0_16px_40px_-24px_rgba(17,17,17,0.45)]"
        >
          {group.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              role="menuitem"
              className="block px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-cream-light hover:text-terracotta"
            >
              {hrefLabel(child.href, child.label)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`touch-target flex items-center justify-center text-charcoal transition-colors hover:text-sand ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function HeaderAction({
  href,
  label,
  badge,
  children,
  className = "",
  badgeClassName = "bg-charcoal",
}: {
  href: string;
  label: string;
  badge?: number;
  children: React.ReactNode;
  className?: string;
  badgeClassName?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative flex min-w-[52px] flex-col items-center justify-center gap-1 px-2 py-1 text-charcoal transition-colors hover:text-sand ${className}`}
    >
      <span className="relative">
        {children}
        {badge != null && badge > 0 && (
          <span
            className={`absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] text-cream ${badgeClassName}`}
          >
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>
      <span className="hidden text-[12px] font-medium lg:block">{label}</span>
    </Link>
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [canScrollMore, setCanScrollMore] = useState(false);
  const mobileListRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { cartCount, user, instagramUrl, savedConfigs, visibleProductCategories, customCategories } = useShop();
  const [namedLines, setNamedLines] = useState<{ slug: string; name: string }[]>([]);
  const { t, hrefLabel } = useLanguage();
  const navItems = useMemo(
    () =>
      withNamedLinesNav(
        storefrontShopNav(customCategories, visibleProductCategories),
        namedLines
      ),
    [visibleProductCategories, namedLines, customCategories]
  );

  useEffect(() => {
    fetch("/api/linie")
      .then((r) => r.json())
      .then((data: { slug?: string; name?: string }[]) => {
        if (!Array.isArray(data)) return;
        setNamedLines(
          data
            .filter((item) => item.slug && item.name)
            .map((item) => ({ slug: item.slug as string, name: item.name as string }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    document.body.classList.toggle("mobile-menu-open", mobileOpen);
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("mobile-menu-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchOpen) setMobileOpen(false);
  }, [searchOpen]);

  useEffect(() => {
    const el = stickyHeaderRef.current;
    if (!el) return;

    const syncHeaderHeight = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${el.offsetHeight}px`
      );
    };

    syncHeaderHeight();
    const ro = new ResizeObserver(syncHeaderHeight);
    ro.observe(el);
    window.addEventListener("resize", syncHeaderHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeaderHeight);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setOpenGroups({});
      setCanScrollMore(false);
      return;
    }
    const next: Record<string, boolean> = {};
    for (const item of navItems) {
      if (item.type === "group" && groupContainsPath(item, pathname)) {
        next[item.id] = true;
      }
    }
    setOpenGroups(next);
  }, [mobileOpen, pathname, navItems]);

  useEffect(() => {
    if (!mobileOpen) return;
    const el = mobileListRef.current;
    if (!el) return;

    const list = el;
    function updateScrollHint() {
      const more = list.scrollHeight - list.scrollTop - list.clientHeight > 10;
      setCanScrollMore(more);
    }

    updateScrollHint();
    const t = window.setTimeout(updateScrollHint, 340);
    list.addEventListener("scroll", updateScrollHint, { passive: true });
    const ro = new ResizeObserver(updateScrollHint);
    ro.observe(list);
    return () => {
      window.clearTimeout(t);
      list.removeEventListener("scroll", updateScrollHint);
      ro.disconnect();
    };
  }, [mobileOpen, openGroups, instagramUrl]);

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <>
      <div ref={stickyHeaderRef} className="sticky top-0 z-50">
        <div className="safe-top bg-charcoal">
          <PromoTopBar />
        </div>
        <header className="border-b border-taupe/30 bg-cream/95 backdrop-blur-md">
        <div className="page-gutter">
        <div className="page-width flex items-center gap-4 py-3.5 sm:gap-6 lg:py-4">
          <Logo compact />

          <HeaderSearch />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex min-h-[52px] min-w-0 flex-1 items-center gap-3 rounded-full border border-taupe/40 bg-white px-5 text-left text-[15px] text-sand shadow-[0_4px_16px_-12px_rgba(17,17,17,0.35)] transition-colors hover:border-taupe lg:hidden"
          >
            <Search className="h-5 w-5 shrink-0 text-charcoal" strokeWidth={1.5} />
            <span className="truncate">{t("header.search")}</span>
          </button>

          <div className="flex items-center gap-1">
            <HeaderAction
              href="/konto"
              label={t("header.account")}
              className="hidden sm:flex"
            >
              <User className="h-6 w-6" strokeWidth={1.5} />
            </HeaderAction>
            <HeaderAction
              href="/konto?tab=configs"
              label={t("header.saved")}
              badge={savedConfigs.length}
              badgeClassName="bg-terracotta"
              className="hidden sm:flex"
            >
              <Heart className="h-6 w-6" strokeWidth={1.5} />
            </HeaderAction>
            <HeaderAction
              href="/koszyk"
              label={t("header.cart")}
              badge={cartCount}
              badgeClassName="bg-terracotta"
            >
              <ShoppingBag className="h-6 w-6" strokeWidth={1.5} />
            </HeaderAction>
            <LanguageExpand />
            <IconButton
              aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
              className="lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-6 w-6" strokeWidth={1.5} />
              ) : (
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              )}
            </IconButton>
          </div>
        </div>
        </div>

        <nav className="page-gutter hidden overflow-visible border-t border-taupe/20 lg:block">
          <div className="page-width flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-3 xl:gap-x-7">
            {navItems.map((item) =>
              item.type === "link" ? (
                <DesktopNavLink key={item.href} item={item} hrefLabel={hrefLabel} />
              ) : (
                <DesktopNavGroup
                  key={item.id}
                  group={item}
                  t={t}
                  hrefLabel={hrefLabel}
                />
              )
            )}
          </div>
        </nav>
      </header>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label={t("header.closeMenu")}
            className="animate-fade-in fixed inset-0 z-[60] bg-charcoal/35 backdrop-blur-[2px] lg:hidden"
            onClick={closeMobile}
          />
          <nav
            className="animate-slide-in-right fixed inset-y-0 right-0 z-[70] flex w-[min(100vw-3rem,320px)] flex-col bg-cream shadow-2xl lg:hidden"
            aria-label={t("header.menu")}
          >
            <div className="flex items-center justify-between border-b border-taupe/30 px-5 py-2 pt-[max(0.5rem,env(safe-area-inset-top,0px))]">
              <span className="text-[13px] font-black tracking-[0.22em] text-charcoal uppercase">
                {t("header.menu")}
              </span>
              <IconButton aria-label={t("header.close")} onClick={closeMobile}>
                <X className="h-6 w-6" strokeWidth={2.25} />
              </IconButton>
            </div>
            <LanguageDrawerRow />

            <div className="relative min-h-0 flex-1">
            <div
              ref={mobileListRef}
              className="h-full overflow-y-auto overscroll-contain px-3 py-1"
            >
              {navItems.map((item) => {
                if (item.type === "link") {
                  const line = lineFromHref(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex min-h-[52px] items-center justify-between rounded-lg px-3 text-sm font-medium tracking-wide active:bg-cream-light ${
                        line
                          ? `font-semibold ${lineTextClass[line]}`
                          : "text-charcoal"
                      }`}
                      onClick={closeMobile}
                    >
                      {hrefLabel(item.href, item.label)}
                      <ChevronRight className="h-4 w-4 text-sand" strokeWidth={1.5} />
                    </Link>
                  );
                }

                const expanded = Boolean(openGroups[item.id]);
                return (
                  <div key={item.id}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`mobile-nav-${item.id}`}
                      onClick={() =>
                        setOpenGroups((current) => ({
                          ...current,
                          [item.id]: !current[item.id],
                        }))
                      }
                      className="flex w-full min-h-[52px] items-center justify-between rounded-lg px-3 text-left active:bg-cream-light"
                    >
                      <span className="text-sm font-medium tracking-wide text-charcoal">
                        {t(item.labelKey)}
                      </span>
                      <Plus
                        className={`h-4 w-4 shrink-0 text-sand transition-transform duration-300 ${
                          expanded ? "rotate-45" : ""
                        }`}
                        strokeWidth={1.5}
                      />
                    </button>
                    <div
                      id={`mobile-nav-${item.id}`}
                      className={`grid transition-all duration-300 ease-in-out ${
                        expanded
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-3 border-l-2 border-charcoal/20">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="flex min-h-[52px] items-center justify-between px-3 text-sm font-medium tracking-wide text-charcoal active:bg-cream-light"
                              onClick={closeMobile}
                            >
                              {hrefLabel(child.href, child.label)}
                              <ChevronRight
                                className="h-4 w-4 text-sand"
                                strokeWidth={1.5}
                              />
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[52px] items-center justify-between rounded-lg px-3 text-sm font-medium tracking-wide text-charcoal active:bg-cream-light"
                  onClick={closeMobile}
                >
                  <span className="flex items-center gap-3">
                    <InstagramIcon className="h-5 w-5 text-charcoal" />
                    Instagram
                  </span>
                  <ChevronRight className="h-4 w-4 text-sand" strokeWidth={1.5} />
                </a>
              )}
            </div>
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-cream via-cream/75 to-transparent transition-opacity duration-300 ${
                canScrollMore ? "opacity-100" : "opacity-0"
              }`}
            />
            </div>

            <div className="space-y-1 border-t-2 border-charcoal/20 px-3 pt-5 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <Link
                href="/koszyk"
                className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 text-sm font-medium tracking-wide text-charcoal active:bg-cream-light"
                onClick={closeMobile}
              >
                <ShoppingBag className="h-5 w-5 text-charcoal" strokeWidth={2.25} />
                {t("header.cart")}
                {cartCount > 0 && (
                  <span className="ml-auto rounded-full bg-terracotta px-2 py-0.5 text-[10px] text-cream">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/konto?tab=configs"
                className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 text-sm font-medium tracking-wide text-charcoal active:bg-cream-light"
                onClick={closeMobile}
              >
                <Heart className="h-5 w-5 text-charcoal" strokeWidth={2.25} />
                {t("header.saved")}
                {savedConfigs.length > 0 && (
                  <span className="ml-auto rounded-full bg-terracotta px-2 py-0.5 text-[10px] text-cream">
                    {savedConfigs.length}
                  </span>
                )}
              </Link>
              <Link
                href="/konto"
                className="flex min-h-[52px] items-center gap-3 rounded-lg px-3 text-sm font-medium tracking-wide text-charcoal active:bg-cream-light"
                onClick={closeMobile}
              >
                <User className="h-5 w-5 text-charcoal" strokeWidth={2.25} />
                {user ? user.name : t("header.myAccount")}
              </Link>
            </div>
          </nav>
        </>
      )}

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
