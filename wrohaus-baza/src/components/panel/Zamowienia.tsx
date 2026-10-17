"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
  Filter,
  ArrowLeft,
  X,
} from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { formatPrice } from "@/lib/dane";
import { formatChatDate } from "@/lib/klientCzatu";
import {
  orderDeliveryFee,
  orderSubtotal,
  orderDiscountAmount,
  orderCountsTowardRevenue,
  resolvePaymentStatus,
} from "@/lib/kasa";
import type { OrderStatus, PaymentStatus, StoreOrder } from "@/lib/typy";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Oczekujące",
  processing: "W realizacji",
  shipped: "Wysłane",
  delivered: "Dostarczone",
  cancelled: "Anulowane",
};

function paymentMethodLabel(method: string): string {
  switch (method) {
    case "blik":
      return "BLIK";
    case "card":
      return "Karta płatnicza";
    case "apple":
      return "Apple Pay";
    case "bank":
      return "Przelew";
    case "raty":
      return "Raty";
    default:
      return method;
  }
}

const statusStyles: Record<
  OrderStatus,
  { badge: string; dot: string; icon: typeof Clock }
> = {
  pending: {
    badge: "bg-amber-50 text-amber-800 ring-amber-200/60",
    dot: "bg-amber-500",
    icon: Clock,
  },
  processing: {
    badge: "bg-blue-50 text-blue-800 ring-blue-200/60",
    dot: "bg-blue-500",
    icon: Package,
  },
  shipped: {
    badge: "bg-violet-50 text-violet-800 ring-violet-200/60",
    dot: "bg-violet-500",
    icon: Truck,
  },
  delivered: {
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200/60",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    badge: "bg-red-50 text-red-800 ring-red-200/60",
    dot: "bg-red-500",
    icon: XCircle,
  },
};

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
];

type StatusFilter = OrderStatus | "all" | "payment_awaiting";
type SortKey = "newest" | "oldest" | "value_desc" | "value_asc";

function itemCount(order: StoreOrder) {
  return order.items.reduce((s, i) => s + i.quantity, 0);
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-200/60 ring-inset">
        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} />
        Płatność potwierdzona
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-800 ring-1 ring-red-200/60 ring-inset">
        <XCircle className="h-3 w-3" strokeWidth={1.5} />
        Płatność nieudana
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200/60 ring-inset">
      <Clock className="h-3 w-3" strokeWidth={1.5} />
      Oczekuje na płatność
    </span>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const { badge, dot } = statusStyles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ${badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {statusLabels[status]}
    </span>
  );
}

function OrderTimeline({
  status,
  onChange,
  onDelete,
  deleting,
}: {
  status: OrderStatus;
  onChange: (s: OrderStatus) => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-700">Zamówienie anulowane</p>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-9 w-9 items-center justify-center rounded-full text-red-700 hover:bg-red-100 disabled:opacity-50"
            aria-label="Usuń anulowane zamówienie"
            title="Usuń"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>
    );
  }

  const currentIdx = STATUS_FLOW.indexOf(status);

  return (
    <div className="space-y-3">
      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
        Status realizacji
      </p>
      <div className="flex flex-wrap gap-2">
        {STATUS_FLOW.map((step, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const Icon = statusStyles[step].icon;
          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                active
                  ? "border-charcoal bg-charcoal text-cream shadow-sm"
                  : done
                    ? "border-taupe/30 bg-cream-light text-charcoal hover:border-charcoal/30"
                    : "border-taupe/20 bg-white text-sand hover:border-taupe/40 hover:text-charcoal"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              {statusLabels[step]}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onChange("cancelled")}
          className="flex items-center gap-2 rounded-lg border border-taupe/20 bg-white px-3 py-2 text-xs text-sand transition-all hover:border-red-200 hover:text-red-600"
        >
          <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
          Anuluj
        </button>
      </div>
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [selected, setSelected] = useState<StoreOrder | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data: StoreOrder[] = await res.json();
      setOrders(data);
      setSelected((prev) =>
        prev ? data.find((o) => o.id === prev.id) ?? prev : data[0] ?? null
      );
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  async function updateStatus(id: string, status: OrderStatus) {
    setUpdating(true);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    await load();
  }

  async function confirmPayment(id: string) {
    setUpdating(true);
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPayment: true }),
    });
    setUpdating(false);
    await load();
  }

  async function removeCancelled(id: string) {
    if (!confirm(`Usunąć anulowane zamówienie ${id}?`)) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setUpdating(false);
    if (!res.ok) return;
    setOrders((current) => current.filter((o) => o.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }

  const stats = useMemo(() => {
    const revenueOrders = orders.filter(orderCountsTowardRevenue);
    const revenue = revenueOrders.reduce((s, o) => s + o.total, 0);
    return {
      total: orders.length,
      awaitingPayment: orders.filter(
        (o) => resolvePaymentStatus(o) === "awaiting" && o.status !== "cancelled"
      ).length,
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      revenue,
      revenueCount: revenueOrders.length,
      avg: revenueOrders.length ? Math.round(revenue / revenueOrders.length) : 0,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter === "payment_awaiting") {
      list = list.filter(
        (o) => resolvePaymentStatus(o) === "awaiting" && o.status !== "cancelled"
      );
    } else if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      switch (sort) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "value_desc":
          return b.total - a.total;
        case "value_asc":
          return a.total - b.total;
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return list;
  }, [orders, statusFilter, query, sort]);

  const statusFilters: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "Wszystkie", count: stats.total },
    {
      key: "payment_awaiting",
      label: "Bez płatności",
      count: stats.awaitingPayment,
    },
    { key: "pending", label: "Oczekujące", count: stats.pending },
    { key: "processing", label: "W realizacji", count: stats.processing },
    { key: "shipped", label: "Wysłane", count: stats.shipped },
    { key: "delivered", label: "Dostarczone", count: stats.delivered },
    { key: "cancelled", label: "Anulowane", count: stats.cancelled },
  ];

  return (
    <>
      <AdminHeader title="Zamówienia" />
      <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:h-[calc(100vh-4rem)]">
        {/* KPI strip */}
        <div className="border-b border-taupe/20 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {[
              {
                label: "Przychód",
                value: formatPrice(stats.revenue),
                sub: `${stats.revenueCount} zrealizowanych i opłaconych`,
                icon: TrendingUp,
              },
              {
                label: "Średnia wartość",
                value: formatPrice(stats.avg),
                sub: "na zamówienie",
                icon: ShoppingBag,
              },
              {
                label: "Bez płatności",
                value: stats.awaitingPayment.toString(),
                sub: "do potwierdzenia",
                icon: Clock,
              },
              {
                label: "Oczekujące",
                value: stats.pending.toString(),
                sub: "do obsługi",
                icon: Clock,
              },
              {
                label: "W realizacji",
                value: stats.processing.toString(),
                sub: "pakowanie",
                icon: Package,
              },
              {
                label: "Wysłane / dostarczone",
                value: `${stats.shipped + stats.delivered}`,
                sub: `${stats.delivered} dostarczonych`,
                icon: Truck,
              },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div
                key={label}
                className="rounded-xl border border-taupe/25 bg-cream-light/30 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-wide text-sand uppercase">
                    {label}
                  </p>
                  <Icon className="h-4 w-4 text-sand" strokeWidth={1.5} />
                </div>
                <p className="mt-1 font-serif text-xl text-charcoal">{value}</p>
                <p className="mt-0.5 text-[10px] text-sand">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* List panel */}
          <div
            className={`flex w-full flex-col border-r border-taupe/30 bg-white lg:max-w-lg ${
              selected ? "hidden lg:flex" : "flex"
            }`}
          >
            {/* Toolbar */}
            <div className="space-y-3 border-b border-taupe/20 p-4">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sand" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Szukaj ID, klienta, produktu…"
                  className="w-full rounded-lg border border-taupe/30 py-2.5 pr-3 pl-9 text-sm focus:border-charcoal focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-sand" />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="flex-1 rounded-lg border border-taupe/30 px-2 py-1.5 text-xs text-charcoal focus:border-charcoal focus:outline-none"
                >
                  <option value="newest">Najnowsze</option>
                  <option value="oldest">Najstarsze</option>
                  <option value="value_desc">Najwyższa kwota</option>
                  <option value="value_asc">Najniższa kwota</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {statusFilters.map(({ key, label, count }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setStatusFilter(key)}
                    className={`rounded-full px-2.5 py-1 text-[10px] tracking-wide uppercase transition-colors ${
                      statusFilter === key
                        ? "bg-charcoal text-cream"
                        : "bg-cream-light text-sand hover:text-charcoal"
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span className="ml-1 opacity-70">({count})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Order list */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <ShoppingBag
                    className="h-10 w-10 text-sand/40"
                    strokeWidth={1}
                  />
                  <p className="mt-4 text-sm text-sand">Brak zamówień</p>
                  <p className="mt-1 text-xs text-sand/70">
                    {query || statusFilter !== "all"
                      ? "Zmień filtry wyszukiwania"
                      : "Pojawią się po złożeniu zamówienia w sklepie"}
                  </p>
                </div>
              ) : (
                filtered.map((order) => (
                  <div
                    key={order.id}
                    className={`flex items-stretch border-b border-taupe/10 transition-colors hover:bg-cream-light/50 ${
                      selected?.id === order.id ? "bg-cream-light" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      className="min-w-0 flex-1 px-4 py-4 text-left"
                    >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-charcoal">
                            {order.id}
                          </span>
                          <StatusBadge status={order.status} />
                          {resolvePaymentStatus(order) === "awaiting" &&
                            order.status !== "cancelled" && (
                              <PaymentBadge status="awaiting" />
                            )}
                          {resolvePaymentStatus(order) === "failed" &&
                            order.status !== "cancelled" && (
                              <PaymentBadge status="failed" />
                            )}
                        </div>
                        <p className="mt-1 truncate text-sm text-charcoal">
                          {order.customer}
                        </p>
                        <p className="truncate text-xs text-sand">{order.email}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-serif text-lg text-charcoal">
                          {formatPrice(order.total)}
                        </p>
                        <p className="text-[10px] text-sand">
                          {itemCount(order)}{" "}
                          {itemCount(order) === 1 ? "szt." : "szt."}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="truncate text-xs text-sand">
                        {order.items.map((i) => i.name).join(", ")}
                      </p>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 text-sand transition-transform ${
                          selected?.id === order.id ? "text-charcoal" : ""
                        }`}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-sand/70">
                      {formatChatDate(order.createdAt)}
                    </p>
                    </button>
                    {order.status === "cancelled" && (
                      <button
                        type="button"
                        onClick={() => removeCancelled(order.id)}
                        disabled={updating}
                        className="flex w-11 shrink-0 items-center justify-center text-sand hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Usuń zamówienie ${order.id}`}
                        title="Usuń anulowane zamówienie"
                      >
                        <X className="h-4 w-4" strokeWidth={1.75} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Detail panel */}
          <div
            className={`min-w-0 flex-1 flex-col bg-cream ${
              selected ? "flex" : "hidden lg:flex"
            }`}
          >
            {!selected ? (
              <div className="hidden flex-1 flex-col items-center justify-center text-sand lg:flex">
                <Package className="h-14 w-14 opacity-20" strokeWidth={1} />
                <p className="mt-4 font-serif text-lg text-charcoal/60">
                  Wybierz zamówienie
                </p>
                <p className="mt-1 text-sm">
                  Kliknij pozycję z listy, aby zobaczyć szczegóły
                </p>
              </div>
            ) : (
              <>
                <div className="border-b border-taupe/30 bg-white px-4 py-4 sm:px-6 sm:py-5">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="mb-3 flex min-h-[44px] items-center gap-2 text-sm text-sand lg:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                    Wróć do listy
                  </button>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-serif text-2xl text-charcoal">
                          {selected.id}
                        </h2>
                        <StatusBadge status={selected.status} />
                        <PaymentBadge status={resolvePaymentStatus(selected)} />
                      </div>
                      <p className="mt-1 text-sm text-sand">
                        Złożono {formatChatDate(selected.createdAt)} ·{" "}
                        {selected.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-wide text-sand uppercase">
                        Wartość zamówienia
                      </p>
                      <p className="font-serif text-3xl text-charcoal">
                        {formatPrice(selected.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    {resolvePaymentStatus(selected) === "awaiting" &&
                      selected.status !== "cancelled" && (
                        <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
                          <p className="text-sm font-medium text-amber-900">
                            Oczekiwanie na potwierdzenie płatności
                          </p>
                          <dl className="mt-3 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                              <dt className="text-amber-800/80">Kwota</dt>
                              <dd className="font-medium text-amber-950">
                                {formatPrice(selected.total)}
                              </dd>
                            </div>
                            <div className="flex justify-between gap-4">
                              <dt className="text-amber-800/80">Tytuł przelewu</dt>
                              <dd className="font-medium text-amber-950">
                                {selected.transferTitle ?? selected.id}
                              </dd>
                            </div>
                          </dl>
                          <button
                            type="button"
                            onClick={() => confirmPayment(selected.id)}
                            disabled={updating}
                            className="mt-4 min-h-[44px] w-full rounded-lg bg-charcoal px-4 py-2.5 text-xs tracking-wide text-cream uppercase hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
                          >
                            Potwierdź płatność
                          </button>
                        </div>
                      )}

                    <OrderTimeline
                      status={selected.status}
                      onChange={(s) => updateStatus(selected.id, s)}
                      onDelete={() => removeCancelled(selected.id)}
                      deleting={updating}
                    />
                    {updating && (
                      <p className="mt-2 text-xs text-sand">Aktualizowanie…</p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid gap-6 xl:grid-cols-2">
                    {/* Customer */}
                    <section className="rounded-xl border border-taupe/30 bg-white p-5">
                      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                        Klient
                      </p>
                      <p className="mt-2 font-medium text-charcoal">
                        {selected.customer}
                      </p>
                      <ul className="mt-4 space-y-3 text-sm">
                        <li className="flex items-center gap-3 text-sand">
                          <Mail className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                          <a
                            href={`mailto:${selected.email}`}
                            className="text-charcoal hover:underline"
                          >
                            {selected.email}
                          </a>
                        </li>
                        {selected.phone && (
                          <li className="flex items-center gap-3 text-sand">
                            <Phone className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                            <span className="text-charcoal">{selected.phone}</span>
                          </li>
                        )}
                        {(selected.address || selected.city) && (
                          <li className="flex items-start gap-3 text-sand">
                            <MapPin
                              className="mt-0.5 h-4 w-4 shrink-0"
                              strokeWidth={1.5}
                            />
                            <span className="text-charcoal">
                              {[selected.address, selected.postalCode, selected.city]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </li>
                        )}
                        {selected.userId ? (
                          <li className="text-xs text-sand">
                            Konto zarejestrowane · ID {selected.userId.slice(0, 8)}…
                          </li>
                        ) : (
                          <li className="text-xs text-sand">Zakupy jako gość (bez konta)</li>
                        )}
                      </ul>
                    </section>

                    {/* Summary */}
                    <section className="rounded-xl border border-taupe/30 bg-white p-5">
                      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                        Podsumowanie
                      </p>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-sand">Produkty</dt>
                          <dd className="text-charcoal">
                            {formatPrice(orderSubtotal(selected))}
                          </dd>
                        </div>
                        {orderDiscountAmount(selected) > 0 && (
                          <div className="flex justify-between">
                            <dt className="text-sand">
                              Rabat
                              {selected.couponCode ? ` (${selected.couponCode})` : ""}
                            </dt>
                            <dd className="text-emerald-700">
                              −{formatPrice(orderDiscountAmount(selected))}
                            </dd>
                          </div>
                        )}
                        {selected.paymentMethod && (
                          <div className="flex justify-between gap-4">
                            <dt className="text-sand">Płatność</dt>
                            <dd className="text-charcoal">
                              {paymentMethodLabel(selected.paymentMethod)}
                            </dd>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <dt className="text-sand">Dostawa</dt>
                          <dd className="text-charcoal">
                            {orderDeliveryFee(selected) === 0
                              ? "Gratis"
                              : formatPrice(orderDeliveryFee(selected))}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sand">Pozycje</dt>
                          <dd className="text-charcoal">{selected.items.length}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sand">Sztuk łącznie</dt>
                          <dd className="text-charcoal">{itemCount(selected)}</dd>
                        </div>
                        <div className="flex justify-between border-t border-taupe/20 pt-3">
                          <dt className="font-medium text-charcoal">Razem</dt>
                          <dd className="font-serif text-xl text-charcoal">
                            {formatPrice(selected.total)}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>

                  {/* Line items */}
                  <section className="mt-6 rounded-xl border border-taupe/30 bg-white">
                    <div className="border-b border-taupe/20 px-5 py-4">
                      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                        Produkty w zamówieniu
                      </p>
                    </div>
                    <div className="divide-y divide-taupe/15">
                      {selected.items.map((item, idx) => (
                        <div
                          key={`${item.productId}-${idx}`}
                          className="flex gap-4 px-5 py-4"
                        >
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-light">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Package className="h-6 w-6 text-sand" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-charcoal">{item.name}</p>
                            {item.colorName && (
                              <p className="mt-0.5 text-xs text-sand">
                                Kolor: {item.colorName}
                              </p>
                            )}
                            {item.sizeName && (
                              <p className="mt-0.5 text-xs text-sand">
                                Rozmiar: {item.sizeName}
                              </p>
                            )}
                            {item.optionsName && (
                              <p className="mt-0.5 text-xs text-sand">{item.optionsName}</p>
                            )}
                            <p className="mt-1 text-xs text-sand">
                              ID produktu: {item.productId}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm text-sand">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                            <p className="mt-1 font-medium text-charcoal">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
