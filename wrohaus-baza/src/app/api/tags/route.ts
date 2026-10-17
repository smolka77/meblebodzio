import { NextResponse } from "next/server";
import { getProductTags, updateProductTags } from "@/lib/serwer/tagi";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { ProductTagsConfig } from "@/lib/tagi";

export async function GET() {
  const tags = await getProductTags();
  return NextResponse.json(tags);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Partial<ProductTagsConfig>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nieprawidłowe żądanie" }, { status: 400 });
  }

  const updated = await updateProductTags(body);
  return NextResponse.json(updated);
}
