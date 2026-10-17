import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import {
  deleteCustomCategory,
  updateCustomCategory,
} from "@/lib/serwer/kategorieWlasne";
import { isCategoryNavGroupId } from "@/lib/nawigacjaSklepu";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;

  let body: {
    name?: string;
    description?: string;
    parentGroup?: string;
    visible?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  try {
    const updated = await updateCustomCategory(id, {
      name: body.name,
      description: body.description,
      visible: body.visible,
      ...(body.parentGroup && isCategoryNavGroupId(body.parentGroup)
        ? { parentGroup: body.parentGroup }
        : {}),
    });
    if (!updated) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nie udało się zapisać." },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;

  try {
    const ok = await deleteCustomCategory(id);
    if (!ok) {
      return NextResponse.json({ error: "Nie znaleziono" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nie udało się usunąć." },
      { status: 400 }
    );
  }
}
