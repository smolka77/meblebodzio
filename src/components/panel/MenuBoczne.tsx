"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/uklad/Logo";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Mail,
  MailOpen,
  LogOut,
  MessageSquare,
  Menu,
  X,
  HelpCircle,
  Inbox,
  Newspaper,
  Layers,
  Tag,
  Percent,
  Home,
  BookOpen,
  Skull,
  Share2,
  Truck,
  Tags,
  FolderKanban,
} from "lucide-react";
import { useAdminMobileNav } from "@/kontekst/KontekstMenuMobilnego";

type BadgeKey = "chat" | "contact" | "fabricSamples";

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: BadgeKey;
};

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Start",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Oferta",
    items: [
      { label: "Produkty", href: "/admin/produkty", icon: Package },
      { label: "Kategorie", href: "/admin/kategorie", icon: FolderTree },
      { label: "Tagi", href: "/admin/tagi", icon: Tags },
      { label: "Tkaniny", href: "/admin/tkaniny", icon: Layers, badgeKey: "fabricSamples" },
      { label: "Promocje", href: "/admin/promocje", icon: Percent },
      { label: "Linie", href: "/admin/linie", icon: FolderKanban },
    ],
  },
  {
    title: "Sprzedaż",
    items: [
      { label: "Zamówienia", href: "/admin/zamowienia", icon: ShoppingCart },
      { label: "Kody rabatowe", href: "/admin/kupony", icon: Tag },
      { label: "Klienci", href: "/admin/klienci", icon: Users },
    ],
  },
  {
    title: "Treść strony",
    items: [
      { label: "Strona główna", href: "/admin/strona-glowna", icon: Home },
      { label: "O nas", href: "/admin/o-nas", icon: BookOpen },
      { label: "Dostawa", href: "/admin/dostawa", icon: Truck },
      { label: "Social media", href: "/admin/social-media", icon: Share2 },
      { label: "Blog", href: "/admin/blog", icon: Newspaper },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Maile do klienta", href: "/admin/ustawienia#maile", icon: MailOpen },
    ],
  },
  {
    title: "Kontakt",
    items: [
      {
        label: "Wiadomości",
        href: "/admin/wiadomosci",
        icon: MessageSquare,
        badgeKey: "chat",
      },
      {
        label: "Formularz",
        href: "/admin/formularz",
        icon: Inbox,
        badgeKey: "contact",
      },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
    ],
  },
  {
    title: "Panel",
    items: [
      { label: "Analityka", href: "/admin/analityka", icon: BarChart3 },
      { label: "Ustawienia", href: "/admin/ustawienia", icon: Settings },
    ],
  },
  {
    title: "Inne",
    items: [{ label: "Kto to kurwa robił?", href: "/admin/kto-to-robil", icon: Skull }],
  },
];

function NavLinks({
  badgeCounts,
  onNavigate,
}: {
  badgeCounts: Record<BadgeKey, number>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {navGroups.map((group, groupIndex) => (
        <div
          key={group.title}
          className={groupIndex === 0 ? "" : "mt-3 border-t border-taupe/20 pt-3"}
        >
          <p className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-sand uppercase">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map(({ label, href, icon: Icon, badgeKey }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              const badgeCount = badgeKey ? badgeCounts[badgeKey] : 0;
              const showBadge = badgeCount > 0;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-charcoal text-cream"
                      : "text-charcoal active:bg-cream-light hover:bg-cream-light"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span className="flex-1">{label}</span>
                  {showBadge && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        active ? "bg-cream text-charcoal" : "bg-charcoal text-cream"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="safe-bottom border-t border-taupe/30 p-4">
      <button
        type="button"
        onClick={async () => {
          onNavigate?.();
          try {
            const status = await fetch("/api/auth/admin", {
              method: "GET",
              credentials: "same-origin",
              headers: { Accept: "application/json" },
            });
            const data = (await status.json()) as { csrf?: string };
            await fetch("/api/auth/admin", {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ action: "logout", csrf: data.csrf }),
            });
          } catch {
            // i tak wracamy do logowania
          }
          window.location.href = "/admin/login";
        }}
        className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-sm font-bold text-charcoal transition-colors active:bg-cream-light hover:bg-cream-light"
      >
        <LogOut className="h-4 w-4" strokeWidth={2} />
        Wyloguj
      </button>
    </div>
  );
}

export function AdminSidebar() {
  const { open, close } = useAdminMobileNav();
  const [badgeCounts, setBadgeCounts] = useState<Record<BadgeKey, number>>({
    chat: 0,
    contact: 0,
    fabricSamples: 0,
  });

  useEffect(() => {
    function load() {
      fetch("/api/chat?unread=count")
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) =>
          setBadgeCounts((prev) => ({ ...prev, chat: d.count ?? 0 }))
        )
        .catch(() => {});
      fetch("/api/contact?unread=count")
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) =>
          setBadgeCounts((prev) => ({ ...prev, contact: d.count ?? 0 }))
        )
        .catch(() => {});
      fetch("/api/fabric-samples?unread=count")
        .then((r) => (r.ok ? r.json() : { count: 0 }))
        .then((d) =>
          setBadgeCounts((prev) => ({ ...prev, fabricSamples: d.count ?? 0 }))
        )
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-taupe/30 bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-taupe/30 px-6">
          <Logo compact href="/admin" />
          <span className="ml-2 rounded bg-charcoal px-2 py-0.5 text-[9px] tracking-wider text-cream uppercase">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLinks badgeCounts={badgeCounts} />
        </nav>

        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <button
            type="button"
            aria-label="Zamknij menu"
            className="animate-fade-in fixed inset-0 z-[60] bg-charcoal/35 backdrop-blur-[2px] lg:hidden"
            onClick={close}
          />
          <aside className="animate-slide-in-right safe-bottom fixed inset-y-0 left-0 z-[70] flex w-[min(100vw-3rem,288px)] flex-col bg-white shadow-2xl lg:hidden">
            <div className="safe-top flex h-16 items-center justify-between border-b border-taupe/30 px-5">
              <div className="flex items-center" onClick={close}>
                <Logo compact href="/admin" />
                <span className="ml-2 rounded bg-charcoal px-2 py-0.5 text-[9px] tracking-wider text-cream uppercase">
                  Admin
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Zamknij"
                className="touch-target flex items-center justify-center text-charcoal"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4">
              <NavLinks badgeCounts={badgeCounts} onNavigate={close} />
            </nav>

            <SidebarFooter onNavigate={close} />
          </aside>
        </>
      )}
    </>
  );
}

export function AdminHeader({ title }: { title: string }) {
  const { toggle } = useAdminMobileNav();

  return (
    <header className="safe-top sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-taupe/30 bg-cream/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="Menu"
          className="touch-target -ml-1 flex shrink-0 items-center justify-center text-charcoal lg:hidden"
        >
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <h1 className="truncate font-serif text-lg text-charcoal sm:text-xl">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-charcoal text-xs text-cream">
          AD
        </div>
        <p className="hidden text-sm font-medium text-charcoal sm:block">
          Administrator
        </p>
      </div>
    </header>
  );
}
