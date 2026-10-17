import { NextResponse } from "next/server";
import { addFaqItem, getFaqCategories } from "@/lib/serwer/faq";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import { clampString } from "@/lib/serwer/walidacjaWejscia";

export async function GET() {
  const categories = await getFaqCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as {
    categoryTitle?: string;
    question?: string;
    answer?: string;
  };

  const item = await addFaqItem({
    categoryTitle: clampString(body.categoryTitle, 80),
    question: clampString(body.question, 300),
    answer: clampString(body.answer, 4000),
  });

  if (!item) {
    return NextResponse.json(
      { error: "Wypełnij kategorię, pytanie i odpowiedź" },
      { status: 400 }
    );
  }

  return NextResponse.json(item, { status: 201 });
}
