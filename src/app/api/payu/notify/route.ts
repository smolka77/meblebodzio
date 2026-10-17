import { NextResponse } from "next/server";
import {
  confirmOrderPayment,
  failOrderPayment,
  getOrderById,
  getOrderByPayUOrderId,
} from "@/lib/serwer/zamowienia";
import {
  isPayUPaymentCanceled,
  isPayUPaymentCompleted,
  shopOrderIdFromPayUExt,
  verifyPayUNotifySignature,
  type PayUNotifyPayload,
} from "@/lib/serwer/payuApi";
import { queueOrderPaidAlerts } from "@/lib/serwer/powiadomieniaZamowien";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("OpenPayu-Signature");

  if (!verifyPayUNotifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: PayUNotifyPayload;
  try {
    payload = JSON.parse(rawBody) as PayUNotifyPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const extOrderId = payload.order?.extOrderId;
  const payuOrderId = payload.order?.orderId;
  const status = payload.order?.status;

  if (!extOrderId && !payuOrderId) {
    return NextResponse.json({ ok: true });
  }

  const shopOrderId = extOrderId ? shopOrderIdFromPayUExt(extOrderId) : "";
  const order =
    (shopOrderId ? await getOrderById(shopOrderId) : undefined) ??
    (payuOrderId ? await getOrderByPayUOrderId(payuOrderId) : undefined);

  if (!order) {
    return NextResponse.json({ ok: true });
  }

  if (isPayUPaymentCompleted(status)) {
    const alreadyPaid = order.paymentStatus === "confirmed";
    const confirmed = await confirmOrderPayment(order.id);
    if (
      !alreadyPaid &&
      confirmed &&
      confirmed.paymentStatus === "confirmed"
    ) {
      queueOrderPaidAlerts(confirmed);
    }
  } else if (isPayUPaymentCanceled(status)) {
    await failOrderPayment(order.id);
  }

  return NextResponse.json({ ok: true });
}
