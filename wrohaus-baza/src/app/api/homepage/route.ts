import { NextResponse } from "next/server";
import { getHomepage, updateHomepage } from "@/lib/serwer/stronaGlowna";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { HomepageContent } from "@/lib/stronaGlowna";

export async function GET() {
  const homepage = await getHomepage();
  return NextResponse.json(homepage);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<HomepageContent>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const updated = await updateHomepage(body);
  return NextResponse.json(updated);
}
