import { NextResponse } from "next/server";
import {
  deleteFurnitureLine,
  updateFurnitureLine,
  type FurnitureLineInput,
} from "@/lib/serwer/linieMeblowe";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const body = (await request.json()) as Partial<FurnitureLineInput>;
  const line = await updateFurnitureLine(id, body);
  if (!line) {
    return NextResponse.json(
      { error: "Nie znaleziono linii albo brak nazwy" },
      { status: 400 }
    );
  }
  return NextResponse.json(line);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteFurnitureLine(id);
  if (!ok) {
    return NextResponse.json({ error: "Nie znaleziono linii" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
