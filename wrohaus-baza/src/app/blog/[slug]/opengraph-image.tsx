import { obrazMarki, obrazZdjecie } from "@/lib/ogObrazy";
import { zrodloObrazuOg } from "@/lib/serwer/obrazOg";
import { getBlogPostBySlug } from "@/lib/serwer/blog";

export const alt = "Blog Wrohaus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function BlogOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return obrazMarki("Inspiracje wnętrzarskie");

  const imageSrc = await zrodloObrazuOg(post.image);
  if (!imageSrc) return obrazMarki(post.title);

  try {
    return await obrazZdjecie({
      imageSrc,
      kicker: "Blog Wrohaus",
      tytul: post.title,
      podpis: post.excerpt,
    });
  } catch {
    return obrazMarki(post.title);
  }
}
