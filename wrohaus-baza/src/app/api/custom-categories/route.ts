import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { isAdminAuthenticated } from "@/lib/serwer/uwierzytelnianie";
import {
  createCustomCategory,
  getCustomCategories,
} from "@/lib/serwer/kategorieWlasne";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getCustomCategories();
  const admin = await isAdminAuthenticated();
  return NextResponse.json(admin ? rows : rows.filter((row) => row.visible));
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { name?: string; description?: string; parentGroup?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  try {
    const created = await createCustomCategory({
      name: body.name ?? "",
      description: body.description,
      parentGroup: body.parentGroup ?? "",
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Nie udało się dodać kategorii." },
      { status: 400 }
    );
  }
}
