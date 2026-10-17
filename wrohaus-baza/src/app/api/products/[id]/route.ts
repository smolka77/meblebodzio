import { NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  toPublicProduct,
} from "@/lib/serwer/produkty";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { isAdminAuthenticated } from "@/lib/serwer/uwierzytelnianie";
import { productSaveError } from "@/lib/szkicProduktu";
import type { Product } from "@/lib/typy";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(id);
  const admin = await isAdminAuthenticated();
  if (!product || (!admin && product.draft)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(admin ? product : toPublicProduct(product));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const existing = await getProductById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const body = (await request.json()) as Partial<Product> & {
    originalPrice?: number | null;
    lowestPrice30Days?: number | null;
  };
  const asDraft = "draft" in body ? Boolean(body.draft) : Boolean(existing.draft);
  const error = productSaveError({ ...existing, ...body }, asDraft);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  const product = await updateProduct(id, body);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
