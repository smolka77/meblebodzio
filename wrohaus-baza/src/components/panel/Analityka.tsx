"use client";

import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { RevenueChart } from "@/components/panel/WykresPrzychodu";
import { formatPrice } from "@/lib/dane";
import type { Product, RevenueTimelines, StoreOrder } from "@/lib/typy";

interface AnalyticsPayload {
  stats: {
    conversionRate: number;
    revenue: number;
    orders: number;
    revenueOrders: number;
    activeSessions: number;
    activeCarts: number;
  };
  revenueTimeline: RevenueTimelines;
  products: Product[];
  orders: StoreOrder[];
  live: {
    sessions: { id: string; path: string; cartCount: number; cartTotal: number }[];
  };
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);

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
  }, []);

  if (!data) {
    return (
      <>
        <AdminHeader title="Analityka" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  const { stats, revenueTimeline, products, orders, live } = data;
  const categoryBreakdown = products.reduce(
    (acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 5);
  const cancelled = orders.filter((o) => o.status === "cancelled").length;
  const returnRate =
    orders.length > 0 ? Math.round((cancelled / orders.length) * 1000) / 10 : 0;

  return (
    <>
      <AdminHeader title="Analityka" />
      <div className="admin-page">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <p className="text-xs text-sand uppercase">Aktywne sesje (live)</p>
            <p className="mt-1 text-3xl font-semibold text-charcoal">
              {stats.activeSessions}
            </p>
          </div>
          <div className="rounded-xl border border-taupe/30 bg-white p-4">
            <p className="text-xs text-sand uppercase">Koszyki z produktami</p>
            <p className="mt-1 text-3xl font-semibold text-charcoal">
              {stats.activeCarts}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RevenueChart data={revenueTimeline} pollMs={5000} />

          <div className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Produkty wg kategorii</h3>
            <div className="mt-6 space-y-4">
              {Object.entries(categoryBreakdown).map(([cat, count]) => (
                <div key={cat}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-charcoal">{cat}</span>
                    <span className="text-sand">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-cream-light">
                    <div
                      className="h-full rounded-full bg-charcoal"
                      style={{ width: `${(count / products.length) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Top produkty (cena)</h3>
            <ol className="mt-4 space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-charcoal">
                    {i + 1}. {p.name}
                  </span>
                  <span className="font-medium text-charcoal">{formatPrice(p.price)}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Kluczowe wskaźniki</h3>
            <dl className="mt-4 space-y-4">
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Konwersja</dt>
                <dd className="text-sm font-medium text-charcoal">{stats.conversionRate}%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Średnia wartość koszyka</dt>
                <dd className="text-sm font-medium text-charcoal">
                  {stats.revenueOrders > 0
                    ? formatPrice(Math.round(stats.revenue / stats.revenueOrders))
                    : formatPrice(0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-sand">Wskaźnik anulowań</dt>
                <dd className="text-sm font-medium text-charcoal">{returnRate}%</dd>
              </div>
            </dl>
          </div>
        </div>

        {live.sessions.length > 0 && (
          <div className="mt-8 rounded-xl border border-taupe/30 bg-white p-6">
            <h3 className="text-sm font-medium text-charcoal">Aktywne sesje na stronie</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-sand uppercase">
                    <th className="pb-2 font-medium">Strona</th>
                    <th className="pb-2 font-medium">Pozycje w koszyku</th>
                    <th className="pb-2 font-medium">Wartość koszyka</th>
                  </tr>
                </thead>
                <tbody>
                  {live.sessions.map((s) => (
                    <tr key={s.id} className="border-t border-taupe/10">
                      <td className="py-2 text-charcoal">{s.path || "/"}</td>
                      <td className="py-2 text-sand">{s.cartCount}</td>
                      <td className="py-2 text-charcoal">{formatPrice(s.cartTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
