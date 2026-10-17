import { NextResponse } from "next/server";
import { deleteFabric, getFabricById, updateFabric } from "@/lib/serwer/tkaniny";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { FabricInput } from "@/lib/serwer/tkaniny";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fabric = await getFabricById(id);
  if (!fabric) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(fabric);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as Partial<FabricInput>;
  const fabric = await updateFabric(id, body);
  if (!fabric) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(fabric);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteFabric(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
