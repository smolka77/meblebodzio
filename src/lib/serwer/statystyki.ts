import { getOrders } from "./zamowienia";
import { getProducts } from "./produkty";
import { getSubscribers } from "./newsletter";
import { getUsers } from "./uzytkownicy";
import { getLiveStats } from "./sesje";
import { orderCountsTowardRevenue } from "@/lib/kasa";
import type { Customer, DashboardStats, RevenueTimelines, RevenueTimelinePoint, RevenueTimelineSession, StoreOrder } from "@/lib/typy";

const MONTH_NAMES = ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"];

export async function getCustomersFromOrders(): Promise<Customer[]> {
  const [orders, users] = await Promise.all([getOrders(), getUsers()]);
  const map = new Map<string, Customer>();

  for (const user of users) {
    map.set(user.email.toLowerCase(), {
      id: user.id,
      name: user.name,
      email: user.email,
      orders: 0,
      totalSpent: 0,
      joined: user.createdAt?.split("T")[0] ?? new Date().toISOString().split("T")[0],
    });
  }

  for (const order of orders) {
    if (order.status === "cancelled") continue;
    if (order.email.endsWith("@sofelio.local")) continue;
    const key = order.email.toLowerCase();
    const existing = map.get(key);
    if (existing) {
      existing.orders += 1;
      existing.totalSpent += order.total;
    } else {
      map.set(key, {
        id: key,
        name: order.customer,
        email: order.email,
        orders: 1,
        totalSpent: order.total,
        joined: order.date,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getDashboardStats(): Promise<DashboardStats & {
  activeSessions: number;
  activeCarts: number;
  newsletterCount: number;
  ordersToday: number;
  lowStock: number;
}> {
  const [orders, products, live, subscribers] = await Promise.all([
    getOrders(),
    getProducts(),
    getLiveStats(),
    getSubscribers(),
  ]);

  const validOrders = orders.filter((o) => o.status !== "cancelled");
  const revenueOrders = orders.filter(orderCountsTowardRevenue);
  const revenue = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  const customers = await getCustomersFromOrders();
  const today = new Date().toISOString().split("T")[0];
  const ordersToday = orders.filter((o) => o.date === today).length;
  const liveProducts = products.filter((p) => !p.draft);
  const lowStock = liveProducts.filter((p) => !p.inStock).length;
  const sessions = live.activeSessions || 1;
  const conversionRate =
    sessions > 0
      ? Math.round((validOrders.length / Math.max(live.totalTrackedSessions, 1)) * 1000) / 10
      : 0;

  const lastMonthRevenue = getMonthlyRevenue(orders);
  const prevMonth = lastMonthRevenue.length >= 2 ? lastMonthRevenue[lastMonthRevenue.length - 2].value : 0;
  const currMonth = lastMonthRevenue.length >= 1 ? lastMonthRevenue[lastMonthRevenue.length - 1].value : 0;
  const revenueChange =
    prevMonth > 0 ? Math.round(((currMonth - prevMonth) / prevMonth) * 1000) / 10 : undefined;

  return {
    revenue,
    revenueChange: revenueChange ?? 0,
    revenueOrders: revenueOrders.length,
    orders: validOrders.length,
    ordersChange: 0,
    products: liveProducts.length,
    customers: customers.length,
    customersChange: 0,
    conversionRate,
    activeSessions: live.activeSessions,
    activeCarts: live.activeCarts,
    newsletterCount: subscribers.filter((s) => s.active).length,
    ordersToday,
    lowStock,
  };
}

export function getMonthlyRevenue(
  orders: Pick<StoreOrder, "total" | "createdAt" | "status" | "paymentStatus">[]
) {
  const valid = orders.filter(orderCountsTowardRevenue);
  const map = new Map<string, number>();

  for (const order of valid) {
    const d = new Date(order.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, (map.get(key) ?? 0) + order.total);
  }

  const entries = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6);

  return entries.map(([key, value]) => ({
    month: MONTH_NAMES[parseInt(key.split("-")[1], 10)] ?? "?",
    value,
  }));
}

export async function getMonthlyRevenueChart() {
  const orders = await getOrders();
  return getMonthlyRevenue(orders);
}

function formatTimeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildSessionTimeline(
  orders: StoreOrder[],
  filter: (date: Date) => boolean,
  sessionStart: Date
): RevenueTimelineSession {
  const filtered = orders
    .filter((o) => orderCountsTowardRevenue(o) && filter(new Date(o.createdAt)))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  const points: RevenueTimelinePoint[] = [
    {
      time: sessionStart.toISOString(),
      label: formatTimeLabel(sessionStart.toISOString()),
      cumulative: 0,
      delta: 0,
    },
  ];

  let cumulative = 0;
  for (const order of filtered) {
    cumulative += order.total;
    points.push({
      time: order.createdAt,
      label: formatTimeLabel(order.createdAt),
      cumulative,
      delta: order.total,
      orderId: order.id,
    });
  }

  const now = new Date();
  const last = points[points.length - 1];
  if (new Date(last.time).getTime() < now.getTime()) {
    points.push({
      time: now.toISOString(),
      label: formatTimeLabel(now.toISOString()),
      cumulative,
      delta: 0,
    });
  }

  return { points, total: cumulative };
}

export async function getRevenueTimelines(): Promise<RevenueTimelines> {
  const orders = await getOrders();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const allStart =
    orders.length > 0
      ? new Date(
          orders.reduce(
            (min, o) =>
              Math.min(min, new Date(o.createdAt).getTime()),
            Date.now()
          )
        )
      : todayStart;
  allStart.setHours(0, 0, 0, 0);

  return {
    today: buildSessionTimeline(
      orders,
      (d) => d.toDateString() === now.toDateString(),
      todayStart
    ),
    week: buildSessionTimeline(
      orders,
      (d) => d.getTime() >= weekStart.getTime(),
      weekStart
    ),
    all: buildSessionTimeline(orders, () => true, allStart),
  };
}
