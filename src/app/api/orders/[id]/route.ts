import { NextResponse } from "next/server";
import {
  updateOrderStatus,
  confirmOrderPayment,
  deleteOrder,
  getOrderById,
} from "@/lib/serwer/zamowienia";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { queueOrderPaidAlerts } from "@/lib/serwer/powiadomieniaZamowien";
import type { OrderStatus } from "@/lib/typy";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as {
    status?: OrderStatus;
    confirmPayment?: boolean;
  };

  if (body.confirmPayment) {
    const before = await getOrderById(id);
    const alreadyPaid = before?.paymentStatus === "confirmed";
    const order = await confirmOrderPayment(id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!alreadyPaid && order.paymentStatus === "confirmed") {
      queueOrderPaidAlerts(order);
    }
    return NextResponse.json(order);
  }

  if (!body.status) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const order = await updateOrderStatus(id, body.status);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const existing = await getOrderById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "cancelled") {
    return NextResponse.json(
      { error: "Usunąć można tylko anulowane zamówienia" },
      { status: 400 }
    );
  }
  const ok = await deleteOrder(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
