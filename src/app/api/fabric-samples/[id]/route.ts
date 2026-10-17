import { NextResponse } from "next/server";
import {
  deleteFabricSampleRequest,
  markFabricSampleRead,
} from "@/lib/serwer/probkiTkanin";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const { action } = (await request.json()) as { action: "read" | "delete" };
  if (action === "delete") {
    const ok = await deleteFabricSampleRequest(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  const ok = await markFabricSampleRead(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteFabricSampleRequest(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
