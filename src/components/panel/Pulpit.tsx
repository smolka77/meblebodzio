"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Activity,
  ShoppingBag,
  FolderTree,
  Percent,
  Settings,
  Search,
  MailOpen,
} from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { StatsCard } from "@/components/panel/KartaStatystyk";
import { RevenueChart } from "@/components/panel/WykresPrzychodu";
import { ResetStorePanel } from "@/components/panel/ResetSklepu";
import { formatPrice } from "@/lib/dane";
import { orderSummary } from "@/lib/narzedziaZamowien";
import { resolvePaymentStatus } from "@/lib/kasa";
import type { StoreOrder, RevenueTimelines } from "@/lib/typy";

const statusLabels: Record<string, string> = {
  pending: "Oczekujące",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

interface AnalyticsData {
  stats: {
    revenue: number;
    revenueChange: number;
    revenueOrders: number;
    orders: number;
    ordersChange: number;
    products: number;
    customers: number;
    customersChange: number;
    conversionRate: number;
    activeSessions: number;
    activeCarts: number;
    newsletterCount: number;
    ordersToday: number;
    lowStock: number;
  };
  revenueTimeline: RevenueTimelines;
  orders: StoreOrder[];
}

export function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [policeAlert, setPoliceAlert] = useState<"in" | "out" | null>(null);

  useEffect(() => {
    function load() {
      fetch("/api/analytics")
        .then((r) => r.json())
        .then(setData)
        .catch(() => {});
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  useEffect(() => {
    let show = false;
    try {
      show = sessionStorage.getItem("sofelio-police-alert") === "1";
      sessionStorage.removeItem("sofelio-police-alert");
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams(window.location.search);
    if (params.get("zgloszenie") === "1") {
      show = true;
      params.delete("zgloszenie");
      const query = params.toString();
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}`
      );
    }
    if (!show) return;
    setPoliceAlert("in");
    const fade = window.setTimeout(() => setPoliceAlert("out"), 2700);
    const hide = window.setTimeout(() => setPoliceAlert(null), 3000);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(hide);
    };
  }, []);

  const policeFlash =
    policeAlert && typeof document !== "undefined"
      ? createPortal(
          <div
            className={`fixed inset-0 z-[200] flex min-h-[100dvh] w-screen items-center justify-center bg-black/90 px-5 text-center transition-opacity duration-300 ${
              policeAlert === "out" ? "opacity-0" : "opacity-100"
            }`}
            aria-live="assertive"
          >
            <p className="max-w-xl font-black uppercase leading-tight tracking-wide text-[#e10600] text-[1.35rem] sm:text-4xl">
              Zgłaszasz na policję?!
              <span className="mt-3 block">Lepiej miej oczy dookoła głowy</span>
            </p>
          </div>,
          document.body
        )
      : null;

  if (!data) {
    return (
      <>
        {policeFlash}
        <AdminHeader title="Dashboard" />
        <div className="admin-page text-sm text-sand">Ładowanie danych...</div>
      </>
    );
  }

  const { stats, revenueTimeline, orders } = data;

  return (
    <>
      {policeFlash}
      <AdminHeader title="Dashboard" />
      <div className="admin-page">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Przychód"
            value={formatPrice(stats.revenue)}
            change={stats.revenueChange !== 0 ? stats.revenueChange : undefined}
            icon={DollarSign}
          />
          <StatsCard
            title="Zamówienia"
            value={stats.orders.toString()}
            icon={ShoppingCart}
          />
          <StatsCard
            title="Produkty"
            value={stats.products.toString()}
            icon={Package}
          />
          <StatsCard
            title="Klienci"
            value={stats.customers.toString()}
            icon={Users}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-medium text-charcoal">Szybki dostęp</h3>
          <p className="mt-1 text-sm text-sand">
            Nowe rzeczy z panelu są tu, reszta w menu po lewej — w działach.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                href: "/admin/produkty",
                label: "Produkty",
                hint: "Producent, meble od ręki, meble do 7 dni, ilość na magazynie",
                icon: Package,
              },
              {
                href: "/admin/kategorie",
                label: "Kategorie",
                hint: "Opisy na stronie kategorii i w Google",
                icon: FolderTree,
              },
              {
                href: "/admin/promocje",
                label: "Promocje",
                hint: "Akcja + zaznaczone meble ze sklepu",
                icon: Percent,
              },
              {
                href: "/admin/zamowienia",
                label: "Zamówienia",
                hint: "Sprzedaż, statusy, płatności",
                icon: ShoppingCart,
              },
              {
                href: "/admin/ustawienia#maile",
                label: "Maile do klienta",
                hint: "SMTP i treść potwierdzenia zamówienia",
                icon: MailOpen,
              },
              {
                href: "/admin/ustawienia#google-seo",
                label: "Google / SEO",
                hint: "Tytuł i opis strony głównej w Google",
                icon: Search,
              },
              {
                href: "/admin/ustawienia",
                label: "Ustawienia",
                hint: "Kontakt, dostawa, widoczność kategorii",
                icon: Settings,
              },
            ].map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="flex items-start gap-3 rounded-xl border border-taupe/30 bg-white p-4 transition-colors hover:border-charcoal/30 hover:bg-cream-light/40"
              >
                <item.icon
                  className="mt-0.5 h-4 w-4 shrink-0 text-sand"
                  strokeWidth={1.5}
                />
                <span>
                  <span className="block text-sm font-medium text-charcoal">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-sand">
                    {item.hint}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-sand uppercase">
              <Activity className="h-4 w-4" />
              Aktywne sesje
            </div>
            <p className="mt-2 text-3xl font-semibold text-charcoal">
              {stats.activeSessions}
            </p>
            <p className="mt-1 text-xs text-sand">Ostatnie 5 minut</p>
          </div>
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <div className="flex items-center gap-2 text-xs text-sand uppercase">
              <ShoppingBag className="h-4 w-4" />
              Aktywne koszyki
            </div>
            <p className="mt-2 text-3xl font-semibold text-charcoal">
              {stats.activeCarts}
            </p>
            <p className="mt-1 text-xs text-sand">Użytkownicy z produktami w koszyku</p>
          </div>
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <p className="text-xs text-sand uppercase">Newsletter</p>
            <p className="mt-2 text-3xl font-semibold text-charcoal">
              {stats.newsletterCount}
            </p>
            <p className="mt-1 text-xs text-sand">Aktywni subskrybenci</p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RevenueChart data={revenueTimeline} pollMs={5000} />
          </div>
          <div className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Szybkie statystyki</h3>
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Współczynnik konwersji</dt>
                <dd className="text-sm font-medium text-charcoal">
                  {stats.conversionRate}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Średnia wartość zamówienia</dt>
                <dd className="text-sm font-medium text-charcoal">
                  {stats.revenueOrders > 0
                    ? formatPrice(Math.round(stats.revenue / stats.revenueOrders))
                    : formatPrice(0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Produkty wyprzedane</dt>
                <dd className="text-sm font-medium text-red-600">{stats.lowStock}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Nowe zamówienia dziś</dt>
                <dd className="text-sm font-medium text-charcoal">{stats.ordersToday}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-taupe/30 bg-white">
          <div className="flex items-center justify-between border-b border-taupe/30 px-4 py-3 sm:px-6 sm:py-4">
            <h3 className="text-sm font-medium text-charcoal">Ostatnie zamówienia</h3>
            <a
              href="/admin/zamowienia"
              className="text-xs text-sand underline underline-offset-2 hover:text-charcoal"
            >
              Zobacz wszystkie
            </a>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-taupe/10 md:hidden">
            {orders.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-sand">
                Brak zamówień — pierwsze pojawi się po złożeniu zamówienia w sklepie.
              </p>
            ) : (
              orders.map((order) => (
                <a
                  key={order.id}
                  href="/admin/zamowienia"
                  className="block px-4 py-4 active:bg-cream-light/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-charcoal">{order.id}</p>
                      <p className="mt-0.5 truncate text-sm text-charcoal">{order.customer}</p>
                      <p className="truncate text-xs text-sand">{orderSummary(order)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-medium text-charcoal">{formatPrice(order.total)}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                      {resolvePaymentStatus(order) === "awaiting" &&
                        order.status !== "cancelled" && (
                          <span className="mt-1 block text-[10px] font-medium text-amber-700">
                            Oczekuje na płatność
                          </span>
                        )}
                      {resolvePaymentStatus(order) === "failed" &&
                        order.status !== "cancelled" && (
                          <span className="mt-1 block text-[10px] font-medium text-red-700">
                            Płatność nieudana
                          </span>
                        )}
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-sand">{order.date}</p>
                </a>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-taupe/20 text-left text-xs tracking-wide text-sand uppercase">
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Klient</th>
                  <th className="px-6 py-3 font-medium">Produkty</th>
                  <th className="px-6 py-3 font-medium">Kwota</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sand">
                      Brak zamówień — pierwsze pojawi się po złożeniu zamówienia w sklepie.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-taupe/10 transition-colors hover:bg-cream-light/50"
                  >
                    <td className="px-6 py-4 font-medium text-charcoal">{order.id}</td>
                    <td className="px-6 py-4 text-charcoal">{order.customer}</td>
                    <td className="px-6 py-4 text-sand">{orderSummary(order)}</td>
                    <td className="px-6 py-4 font-medium text-charcoal">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sand">{order.date}</td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ResetStorePanel onSuccess={() => setRefreshKey((k) => k + 1)} />
      </div>
    </>
  );
}
