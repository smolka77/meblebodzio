import Link from "next/link";
import type { BlogPost } from "@/lib/typy";
import { StoreImage } from "@/components/sklep/ObrazSklepu";
import { GUIDE_SLUGS } from "@/lib/glownaTresc";
import * as I from "./ikony";

/** Trzy poradniki z bloga: najpierw wskazane slugi, potem najnowsze artykuły. */
export function wybierzPoradniki(posts: BlogPost[], limit = 3): BlogPost[] {
  const picked = GUIDE_SLUGS.map((slug) => posts.find((post) => post.slug === slug)).filter(
    (post): post is BlogPost => Boolean(post)
  );
  for (const post of posts) {
    if (picked.length >= limit) break;
    if (!picked.includes(post)) picked.push(post);
  }
  return picked.slice(0, limit);
}

export function PoradnikiBlog({ posts }: { posts: BlogPost[] }) {
  const guides = wybierzPoradniki(posts);
  if (guides.length === 0) return null;

  return (
    <section className="pw py-16 lg:py-24">
      <div className="mb-8 flex items-end justify-between gap-4 lg:mb-10">
        <div>
          <p className="text-[13px] font-medium text-meta">Poradniki</p>
          <h2 className="font-display mt-1.5 text-[28px] leading-tight sm:text-[36px]">
            Dziennik dobrych wnętrz
          </h2>
        </div>
        <Link
          href="/blog"
          className="ulink hidden shrink-0 items-center gap-1.5 text-[14.5px] font-medium text-accent sm:flex"
        >
          Wszystkie artykuły
          <I.Arrow className="h-4 w-4" />
        </Link>
      </div>
      <ul className="grid gap-7 md:grid-cols-3 lg:gap-8">
        {guides.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-paper">
                <StoreImage
                  src={post.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-4 flex gap-2 text-[13px] text-meta">
                <span className="font-medium text-ink">{post.category}</span>·
                <span>{post.readTime} czytania</span>
              </div>
              <h3 className="mt-1.5 text-[19px] leading-snug font-semibold tracking-[-0.02em] underline-offset-4 group-hover:underline sm:text-[21px]">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-meta">{post.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
