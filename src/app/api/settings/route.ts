import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/serwer/ustawienia";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { ShopSettings } from "@/lib/typy";

export async function GET() {
  const settings = await getSettings();
  const { adminPassword: _, adminUsername: __, adminAuthVersion: ___, ...safe } =
    settings;
  return NextResponse.json(safe);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as Partial<ShopSettings>;
  const updated = await updateSettings(body);
  const { adminPassword: _, adminUsername: __, adminAuthVersion: ___, ...safe } =
    updated;
  return NextResponse.json(safe);
}
