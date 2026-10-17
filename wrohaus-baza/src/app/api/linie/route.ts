import { NextResponse } from "next/server";
import {
  createFurnitureLine,
  getFurnitureLines,
  type FurnitureLineInput,
} from "@/lib/serwer/linieMeblowe";
import { requireAdmin } from "@/lib/serwer/ochronaApi";

export async function GET() {
  const lines = await getFurnitureLines();
  return NextResponse.json(lines);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as FurnitureLineInput;
  const line = await createFurnitureLine(body);
  if (!line) {
    return NextResponse.json({ error: "Podaj nazwę linii" }, { status: 400 });
  }
  return NextResponse.json(line, { status: 201 });
}
