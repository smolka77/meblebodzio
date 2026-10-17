import { NextResponse } from "next/server";
import { getCustomersFromOrders } from "@/lib/serwer/statystyki";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const customers = await getCustomersFromOrders();
  return NextResponse.json(customers);
}
