import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/uklad/Naglowek";
import { ShopFooter } from "@/components/uklad/StopkaSklepu";
import { DaneStrukturalne } from "@/components/strony/DaneStrukturalne";
import { formatBlogDate } from "@/lib/blog";
import { isLocalUpload } from "@/lib/obrazy";
import { getBlogPostBySlug, getBlogPosts, getBlogSlugRedirect } from "@/lib/serwer/blog";
import { jsonLdArtykul, jsonLdOkuszki, metaArtykulu } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeBlogPost, localizeBlogPosts } from "@/lib/jezyk/trescCms";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getBlogPostBySlug(slug);
  if (!raw) {
    const target = await getBlogSlugRedirect(slug);
    if (target) permanentRedirect(`/blog/${target}`);
    return { title: "Artykuł" };
  }
  const locale = await getRequestLocale();
  const post = await localizeBlogPost(raw, locale);
  return metaArtykulu(post);
}

export default async function BlogPostPage({
  params,
}: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const raw = await getBlogPostBySlug(slug);
  if (!raw) {
    const target = await getBlogSlugRedirect(slug);
    if (target) permanentRedirect(`/blog/${target}`);
    notFound();
  }

  const [locale, allPosts] = await Promise.all([
    getRequestLocale(),
    getBlogPosts(),
  ]);
  const relatedRaw = allPosts
    .filter((p) => p.slug !== slug && p.category === raw.category)
    .slice(0, 2);
  const [post, related] = await Promise.all([
    localizeBlogPost(raw, locale),
    localizeBlogPosts(relatedRaw, locale),
  ]);

  const localImage = isLocalUpload(post.image);

  return (
    <>
      <DaneStrukturalne
        dane={[
          jsonLdArtykul(post),
          jsonLdOkuszki([
            { name: "Strona główna", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Header />
      <main>
        <article>
          <div className="relative mx-4 mt-4 overflow-hidden rounded-2xl bg-charcoal sm:mx-6 sm:mt-5 sm:rounded-3xl lg:mx-8">
            <div className="relative h-[46vh] min-h-[320px] max-h-[520px]">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover opacity-80"
              sizes="100vw"
              priority
              unoptimized={localImage}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-3xl px-6 pb-10 lg:px-8">
              <Link
                href="/blog"
                className="mb-6 inline-flex items-center gap-2 text-[11px] tracking-[0.15em] text-cream/70 uppercase transition-colors hover:text-cream"
              >
                <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                Wróć do bloga
              </Link>
              <span className="text-[10px] tracking-[0.25em] text-cream/60 uppercase">
                {post.category}
              </span>
              <h1 className="mt-3 font-serif text-3xl text-cream md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-4 text-sm text-cream/70">
                {formatBlogDate(post.date)} · {post.readTime} czytania
              </p>
            </div>
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <p className="text-lg leading-[1.85] text-charcoal/90">
              {post.excerpt}
            </p>
            <div className="mt-10 space-y-6">
              {post.content.map((paragraph, i) => (
                <p
                  key={`${post.id}-${i}`}
                  className="text-sm leading-[1.9] text-charcoal/80"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="border-t border-taupe/30 bg-cream-light py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <p className="section-kicker tracking-[0.12em] uppercase">
                Powiązane artykuły
              </p>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/blog/${r.slug}`}
                    className="group flex gap-5 rounded-2xl bg-white p-5 shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        className="object-cover"
                        sizes="96px"
                        unoptimized={isLocalUpload(r.image)}
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-charcoal group-hover:underline">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-xs text-sand">
                        {formatBlogDate(r.date)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <ShopFooter />
    </>
  );
}
