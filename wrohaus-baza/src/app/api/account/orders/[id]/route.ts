import { NextResponse } from "next/server";
import { getOrderById, orderOwnedByUser, toUserOrder } from "@/lib/serwer/zamowienia";
import {
  getRequiredCustomerUserId,
  requireCustomer,
} from "@/lib/serwer/ochronaKlienta";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireCustomer();
  if (denied) return denied;

  const userId = await getRequiredCustomerUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order || !orderOwnedByUser(order, userId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toUserOrder(order));
}
