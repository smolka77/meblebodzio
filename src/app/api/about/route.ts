import { NextResponse } from "next/server";
import { getAbout, updateAbout } from "@/lib/serwer/oNas";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { AboutContent } from "@/lib/oNas";

export async function GET() {
  const about = await getAbout();
  return NextResponse.json(about);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<AboutContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const updated = await updateAbout(body);
  return NextResponse.json(updated);
}
