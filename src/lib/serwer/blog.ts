import { revalidatePath } from "next/cache";
import { isStoreMediaUrl } from "@/lib/obrazy";
import { getDefaultBlogPosts } from "@/lib/blogDomyslny";
import type { BlogPost } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { deleteBlogImage } from "./wgrywanieBloga";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";
import { SEO_DESC_MAX, SEO_TITLE_MAX, wyczyscMeta } from "@/lib/seoPola";
import { slugify } from "@/lib/slug";

const FILE = "blog.json";
const REDIRECTS = "przekierowania-blog-slug.json";

let blogSlugRepair: Promise<void> | null = null;

function intendedBlogSlug(slug: string): string {
  return slug.replace(/sofelio/gi, "wrohaus");
}

async function repairBlogSlugsOnce(): Promise<void> {
  const posts = await readStore<BlogPost[]>(FILE, getDefaultBlogPosts());
  if (!Array.isArray(posts) || posts.length === 0) return;
  const used = new Set(posts.map((post) => post.slug));
  const redirects: Record<string, string> = {};
  const next = posts.map((post) => {
    const intended = intendedBlogSlug(post.slug);
    if (!intended || intended === post.slug) return post;
    let target = intended;
    let n = 2;
    while (used.has(target) && target !== post.slug) {
      target = `${intended}-${n}`;
      n += 1;
    }
    used.delete(post.slug);
    used.add(target);
    redirects[post.slug] = target;
    return { ...post, slug: target };
  });
  if (Object.keys(redirects).length === 0) return;
  const existing = await readStore<Record<string, string>>(REDIRECTS, {});
  await writeStore(FILE, next);
  await writeStore(REDIRECTS, { ...existing, ...redirects });
}

async function ensureBlogSlugsRepaired(): Promise<void> {
  if (!blogSlugRepair) {
    blogSlugRepair = repairBlogSlugsOnce().catch((error) => {
      blogSlugRepair = null;
      throw error;
    });
  }
  await blogSlugRepair;
}

export async function getBlogSlugRedirect(slug: string): Promise<string | undefined> {
  await ensureBlogSlugsRepaired();
  const map = await readStore<Record<string, string>>(REDIRECTS, {});
  const mapped = map[slug]?.trim();
  if (mapped && mapped !== slug) return mapped;
  const guessed = intendedBlogSlug(slug);
  if (guessed === slug) return undefined;
  const posts = await readStore<BlogPost[]>(FILE, []);
  return posts.some((post) => post.slug === guessed) ? guessed : undefined;
}

export function estimateReadTime(content: string[]): string {
  const words = content
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min`;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  await ensureStoreSeeded();
  await ensureBlogSlugsRepaired();
  const posts = await readStore<BlogPost[]>(FILE, getDefaultBlogPosts());
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export async function getBlogPostById(id: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.id === id);
}

function revalidateBlog(slug?: string) {
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
}

function normalizeContent(content: string[]): string[] {
  return content.map((p) => p.trim()).filter(Boolean);
}

async function applyFeatured(posts: BlogPost[], featuredId?: string) {
  if (!featuredId) return posts;
  return posts.map((p) => ({
    ...p,
    featured: p.id === featuredId,
  }));
}

export type BlogPostInput = Omit<BlogPost, "id" | "readTime"> & {
  readTime?: string;
};

export async function createBlogPost(
  data: BlogPostInput
): Promise<BlogPost | null> {
  const title = data.title.trim();
  const excerpt = data.excerpt.trim();
  const content = normalizeContent(data.content);

  if (!title || !excerpt || !data.image.trim() || content.length === 0) {
    return null;
  }

  let posts = await getBlogPosts();
  const id = crypto.randomUUID();
  let slug = (data.slug?.trim() || slugify(title)) || id.slice(0, 8);

  if (posts.some((p) => p.slug === slug)) {
    slug = `${slug}-${id.slice(0, 6)}`;
  }

  const seoTitle = wyczyscMeta(data.seoTitle, SEO_TITLE_MAX);
  const seoDescription = wyczyscMeta(data.seoDescription, SEO_DESC_MAX);
  const post: BlogPost = {
    id,
    slug,
    title,
    excerpt,
    category: data.category.trim() || "Poradnik",
    date: data.date || new Date().toISOString().slice(0, 10),
    readTime: data.readTime?.trim() || estimateReadTime(content),
    image: data.image.trim(),
    featured: data.featured ?? false,
    content,
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
  };

  posts = [post, ...posts];
  if (post.featured) {
    posts = await applyFeatured(posts, post.id);
  }

  await writeStore(FILE, posts);
  revalidateBlog(post.slug);
  prefetchListingTranslationsFrom(post);
  return post;
}

export async function updateBlogPost(
  id: string,
  data: Partial<BlogPostInput>
): Promise<BlogPost | null> {
  let posts = await getBlogPosts();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = posts[index];
  const content = data.content
    ? normalizeContent(data.content)
    : current.content;

  let slug = data.slug?.trim() || current.slug;
  if (slug !== current.slug && posts.some((p) => p.slug === slug && p.id !== id)) {
    slug = `${slug}-${id.slice(0, 6)}`;
  }

  const updated: BlogPost = {
    ...current,
    ...data,
    id,
    slug,
    title: data.title?.trim() ?? current.title,
    excerpt: data.excerpt?.trim() ?? current.excerpt,
    category: data.category?.trim() ?? current.category,
    date: data.date ?? current.date,
    image: data.image?.trim() ?? current.image,
    content,
    readTime:
      data.readTime?.trim() ||
      (data.content ? estimateReadTime(content) : current.readTime),
  };

  if ("seoTitle" in data) {
    const title = wyczyscMeta(data.seoTitle, SEO_TITLE_MAX);
    if (title) updated.seoTitle = title;
    else delete updated.seoTitle;
  }

  if ("seoDescription" in data) {
    const description = wyczyscMeta(data.seoDescription, SEO_DESC_MAX);
    if (description) updated.seoDescription = description;
    else delete updated.seoDescription;
  }

  posts[index] = updated;
  if (updated.featured) {
    posts = await applyFeatured(posts, updated.id);
  }

  await writeStore(FILE, posts);
  revalidateBlog(updated.slug);
  if (current.slug !== updated.slug) revalidateBlog(current.slug);
  prefetchListingTranslationsFrom(updated);
  return updated;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const posts = await getBlogPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) return false;

  const next = posts.filter((p) => p.id !== id);
  await writeStore(FILE, next);

  if (isStoreMediaUrl(post.image)) {
    await deleteBlogImage(post.image);
  }

  revalidateBlog(post.slug);
  return true;
}
