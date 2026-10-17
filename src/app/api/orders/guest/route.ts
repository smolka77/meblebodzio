import { NextResponse } from "next/server";
import {
  getOrderById,
  guestAccessTokenOk,
  toUserOrder,
} from "@/lib/serwer/zamowienia";
import { enforceRateLimit } from "@/lib/serwer/limitZadan";

const ORDER_ID_RE = /^ORD-\d{1,8}$/;
const GUEST_TOKEN_RE = /^[a-f0-9]{48}$/;

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "orders-guest", 40, 15 * 60 * 1000);
  if (limited) return limited;

  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim() ?? "";
  const token = url.searchParams.get("g")?.trim() ?? "";

  if (!ORDER_ID_RE.test(id) || !GUEST_TOKEN_RE.test(token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const order = await getOrderById(id);
  if (!order || !guestAccessTokenOk(order, token)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toUserOrder(order), {
    headers: { "Cache-Control": "no-store" },
  });
}
