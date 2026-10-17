"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { isLocalUpload } from "@/lib/obrazy";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Star, ExternalLink } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { BlogFormModal } from "@/components/panel/FormularzBloga";
import { formatBlogDate } from "@/lib/blog";
import type { BlogPost } from "@/lib/typy";

export function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.slug.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Usunąć artykuł „${post.title}”?`)) return;
    await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <AdminHeader title="Blog" />
      <div className="admin-page">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sand" />
            <input
              type="text"
              placeholder="Szukaj artykułów..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-taupe/30 bg-white py-3 pr-4 pl-10 text-base focus:border-charcoal focus:outline-none sm:py-2.5 sm:text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Link
              href="/blog"
              target="_blank"
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg border border-taupe/30 bg-white px-4 py-2.5 text-sm sm:flex-none"
            >
              <ExternalLink className="h-4 w-4" />
              Podgląd
            </Link>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream sm:flex-none"
            >
              <Plus className="h-4 w-4" />
              Nowy artykuł
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-taupe/30 bg-white p-4">
          <p className="text-xs text-sand uppercase">Artykuły</p>
          <p className="mt-1 text-2xl font-semibold text-charcoal">{posts.length}</p>
        </div>

        {/* Mobile */}
        <div className="space-y-3 md:hidden">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-taupe/30 bg-white p-4"
            >
              <div className="flex gap-3">
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                    unoptimized={isLocalUpload(post.image)}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <p className="font-medium text-charcoal">{post.title}</p>
                    {post.featured && (
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                  <p className="text-xs text-sand">
                    {post.category} · {formatBlogDate(post.date)}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-taupe/15 pt-3">
                <button
                  type="button"
                  onClick={() => setEditing(post)}
                  className="flex min-h-[40px] flex-1 items-center justify-center gap-1 rounded-lg border border-taupe/30 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edytuj
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(post)}
                  className="flex min-h-[40px] min-w-[44px] items-center justify-center rounded-lg border border-red-200 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-hidden rounded-xl border border-taupe/30 bg-white md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-taupe/30 bg-cream-light/50 text-xs text-sand uppercase">
              <tr>
                <th className="px-4 py-3 font-medium">Artykuł</th>
                <th className="px-4 py-3 font-medium">Kategoria</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Czytanie</th>
                <th className="px-4 py-3 text-right font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((post) => (
                <tr key={post.id} className="border-b border-taupe/15 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 overflow-hidden rounded-lg">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized={isLocalUpload(post.image)}
                        />
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-charcoal">
                          {post.title}
                          {post.featured && (
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          )}
                        </p>
                        <p className="text-xs text-sand">/blog/{post.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sand">{post.category}</td>
                  <td className="px-4 py-3 text-sand">{formatBlogDate(post.date)}</td>
                  <td className="px-4 py-3 text-sand">{post.readTime}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-taupe/30 text-sand hover:text-charcoal"
                        aria-label="Podgląd"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditing(post)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-taupe/30"
                        aria-label="Edytuj"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(post)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600"
                        aria-label="Usuń"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-8 text-center text-sm text-sand">Brak artykułów</p>
          )}
        </div>
      </div>

      {creating && (
        <BlogFormModal
          onClose={() => setCreating(false)}
          onSaved={load}
        />
      )}
      {editing && (
        <BlogFormModal
          post={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
    </>
  );
}
