import { NextResponse } from "next/server";
import { createFabric, getFabrics } from "@/lib/serwer/tkaniny";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { FabricInput } from "@/lib/serwer/tkaniny";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get("active") !== "false";
  const fabrics = await getFabrics(activeOnly);
  return NextResponse.json(fabrics);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as FabricInput;
  const fabric = await createFabric(body);
  if (!fabric) {
    return NextResponse.json({ error: "Uzupełnij nazwę oraz zdjęcie lub wideo" }, { status: 400 });
  }
  return NextResponse.json(fabric, { status: 201 });
}
