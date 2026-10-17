import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/strony/PowlokaStrony";
import { formatBlogDate } from "@/lib/blog";
import { isLocalUpload } from "@/lib/obrazy";
import { getBlogPosts } from "@/lib/serwer/blog";
import { stronaMeta } from "@/lib/seo";
import { getRequestLocale } from "@/lib/jezyk/serwer";
import { localizeBlogPosts } from "@/lib/jezyk/trescCms";

export const metadata = stronaMeta({
  title: "Blog i inspiracje wnętrzarskie",
  description:
    "Jak urządzić salon i sypialnię, dobrać szafę, materac i tkaninę. Inspiracje z polskiej manufaktury Wrohaus.",
  path: "/blog",
});

export default async function BlogPage() {
  const [postsRaw, locale] = await Promise.all([
    getBlogPosts(),
    getRequestLocale(),
  ]);
  const blogPosts = await localizeBlogPosts(postsRaw, locale);
  const featured = blogPosts.find((p) => p.featured) ?? blogPosts[0];
  const rest = featured
    ? blogPosts.filter((p) => p.id !== featured.id)
    : blogPosts;

  return (
    <PageShell
      eyebrow="Inspiracje & porady"
      title="Blog Wrohaus"
      description="Odkrywaj pomysły na aranację wnętrz, poznawaj nasze materiały i bądź na bieżąco z nowościami marki."
      path="/blog"
    >
      {featured && (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <Link
              href={`/blog/${featured.slug}`}
              className="group grid grid-cols-1 overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.2)] lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px]">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  unoptimized={isLocalUpload(featured.image)}
                />
              </div>
              <div className="flex flex-col justify-center bg-white p-8 lg:p-14">
                <span className="section-kicker tracking-[0.12em] uppercase">
                  Wyróżniony artykuł · {featured.category}
                </span>
                <h2 className="mt-4 font-serif text-3xl text-charcoal transition-colors group-hover:text-charcoal/80 md:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-sand">
                  {featured.excerpt}
                </p>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs text-sand">
                    {formatBlogDate(featured.date)} · {featured.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-charcoal uppercase">
                    Czytaj
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      strokeWidth={1.5}
                    />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      <section className="border-t border-taupe/30 bg-cream-light py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-10 section-kicker tracking-[0.12em] uppercase">
            Wszystkie artykuły
          </p>
          {rest.length === 0 ? (
            <p className="text-sm text-sand">Brak artykułów do wyświetlenia.</p>
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_24px_-16px_rgba(17,17,17,0.18)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={isLocalUpload(post.image)}
                    />
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] tracking-[0.15em] text-sand uppercase">
                        {post.category}
                      </span>
                      <span className="text-xs text-taupe">·</span>
                      <span className="text-xs text-sand">
                        {formatBlogDate(post.date)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-serif text-xl text-charcoal group-hover:underline">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-sand">
                      {post.excerpt}
                    </p>
                    <span className="mt-4 text-[12px] font-medium text-charcoal">
                      {post.readTime} czytania →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
          <p className="section-kicker tracking-[0.12em] uppercase">
            Newsletter
          </p>
          <h2 className="mt-2 font-serif text-3xl text-charcoal">
            Bądź na bieżąco
          </h2>
          <p className="mt-4 text-sm text-sand">
            Zapisz się na newsletter i otrzymuj nowe artykuły prosto na skrzynkę.
          </p>
          <Link
            href="/#newsletter"
            className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-charcoal px-10 py-4 text-[11px] font-semibold tracking-[0.12em] text-cream uppercase hover:bg-charcoal/85"
          >
            Zapisz się na stronie głównej
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
