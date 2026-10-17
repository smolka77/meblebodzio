import { NextResponse } from "next/server";
import { deleteProducts } from "@/lib/serwer/produkty";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let ids: unknown;
  try {
    const body = (await request.json()) as { ids?: unknown };
    ids = body.ids;
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Podaj listę produktów." }, { status: 400 });
  }

  const removed = await deleteProducts(ids);
  return NextResponse.json({ ok: true, removed });
}
