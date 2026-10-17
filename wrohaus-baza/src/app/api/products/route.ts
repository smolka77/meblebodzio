import { NextResponse } from "next/server";
import { createProduct, getProducts, getPublicProducts } from "@/lib/serwer/produkty";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { isAdminAuthenticated } from "@/lib/serwer/uwierzytelnianie";
import { productSaveError } from "@/lib/szkicProduktu";
import type { Product } from "@/lib/typy";

export async function GET(request: Request) {
  const admin = await isAdminAuthenticated();
  const all = new URL(request.url).searchParams.get("all") === "1";
  const products = admin && all ? await getProducts() : await getPublicProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await request.json()) as Omit<Product, "id" | "slug"> & {
    slug?: string;
  };
  const error = productSaveError(body, Boolean(body.draft));
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  const product = await createProduct(body);
  return NextResponse.json(product, { status: 201 });
}
