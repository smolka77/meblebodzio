import { NextResponse } from "next/server";
import { getOrdersForUser } from "@/lib/serwer/zamowienia";
import {
  getRequiredCustomerUserId,
  requireCustomer,
} from "@/lib/serwer/ochronaKlienta";

export async function GET() {
  const denied = await requireCustomer();
  if (denied) return denied;

  const userId = await getRequiredCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrdersForUser(userId);
  return NextResponse.json(orders);
}
