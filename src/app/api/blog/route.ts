import { NextResponse } from "next/server";
import { createBlogPost, getBlogPosts } from "@/lib/serwer/blog";
import { requireAdmin } from "@/lib/serwer/ochronaApi";
import type { BlogPostInput } from "@/lib/serwer/blog";

export async function GET() {
  const posts = await getBlogPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await request.json()) as BlogPostInput;
  const post = await createBlogPost(body);
  if (!post) {
    return NextResponse.json(
      { error: "Uzupełnij tytuł, zajawkę, zdjęcie i treść artykułu" },
      { status: 400 }
    );
  }
  return NextResponse.json(post, { status: 201 });
}
