import { NextResponse } from "next/server";
import { getLiveStats } from "@/lib/serwer/sesje";
import {
  getDashboardStats,
  getRevenueTimelines,
  getCustomersFromOrders,
} from "@/lib/serwer/statystyki";
import { getProducts } from "@/lib/serwer/produkty";
import { getOrders } from "@/lib/serwer/zamowienia";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const [stats, live, revenueTimeline, products, orders, customers] =
    await Promise.all([
      getDashboardStats(),
      getLiveStats(),
      getRevenueTimelines(),
      getProducts(),
      getOrders(),
      getCustomersFromOrders(),
    ]);

  return NextResponse.json({
    stats,
    live,
    revenueTimeline,
    products,
    orders: orders.slice(0, 10),
    customers: customers.slice(0, 10),
  });
}
