import { NextResponse } from "next/server";
import { getOrderStatusUpdatesForUser } from "@/lib/serwer/zamowienia";
import {
  getRequiredCustomerUserId,
  requireCustomer,
} from "@/lib/serwer/ochronaKlienta";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

const ORDER_ID_RE = /^ORD-\d{1,8}$/;

export async function POST(request: Request) {
  const denied = await requireCustomer();
  if (denied) return denied;

  const limited = await enforceRateLimit(request, "orders-sync", 40, 15 * 60 * 1000);
  if (limited) return limited;

  const userId = await getRequiredCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids)]
        .filter((id): id is string => typeof id === "string" && ORDER_ID_RE.test(id))
        .slice(0, 50)
    : [];

  const updates = await getOrderStatusUpdatesForUser(userId, ids);
  return NextResponse.json(updates);
}
