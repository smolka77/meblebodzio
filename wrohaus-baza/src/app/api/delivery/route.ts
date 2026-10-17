import { NextResponse } from "next/server";
import { getDelivery, updateDelivery } from "@/lib/serwer/dostawa";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { DeliveryContent } from "@/lib/dostawa";

export async function GET() {
  const delivery = await getDelivery();
  return NextResponse.json(delivery);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<DeliveryContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const updated = await updateDelivery(body);
  return NextResponse.json(updated);
}
