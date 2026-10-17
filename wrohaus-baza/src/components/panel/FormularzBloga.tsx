"use client";

import { useState } from "react";
import { X, Plus, Trash2, Star } from "lucide-react";
import { ImageDropzone } from "@/components/panel/StrefaZdjec";
import { SeoFields } from "@/components/panel/PolaSeo";
import { BLOG_CATEGORIES } from "@/lib/blogDomyslny";
import type { BlogPost } from "@/lib/typy";
import { slugify } from "@/lib/slug";

type BlogFormData = Omit<BlogPost, "id" | "readTime"> & { readTime?: string };

const emptyForm = (): BlogFormData => ({
  slug: "",
  title: "",
  excerpt: "",
  category: BLOG_CATEGORIES[0],
  date: new Date().toISOString().slice(0, 10),
  image: "",
  featured: false,
  content: [""],
  seoTitle: "",
  seoDescription: "",
});

interface BlogFormModalProps {
  post?: BlogPost;
  onClose: () => void;
  onSaved: () => void;
}

export function BlogFormModal({ post, onClose, onSaved }: BlogFormModalProps) {
  const [form, setForm] = useState<BlogFormData>(() =>
    post
      ? {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          category: post.category,
          date: post.date,
          image: post.image,
          featured: post.featured ?? false,
          content: post.content.length ? post.content : [""],
          readTime: post.readTime,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
        }
      : emptyForm()
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!post);

  function updateContent(index: number, value: string) {
    setForm((f) => {
      const content = [...f.content];
      content[index] = value;
      return { ...f, content };
    });
  }

  function addParagraph() {
    setForm((f) => ({ ...f, content: [...f.content, ""] }));
  }

  function removeParagraph(index: number) {
    setForm((f) => ({
      ...f,
      content: f.content.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      slug: form.slug.trim() || slugify(form.title),
      content: form.content.map((p) => p.trim()).filter(Boolean),
    };

    const res = await fetch(post ? `/api/blog/${post.id}` : "/api/blog", {
      method: post ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setError(data.error ?? "Nie udało się zapisać artykułu");
      return;
    }

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-charcoal/40 sm:items-start sm:overflow-y-auto sm:p-4 sm:pt-12">
      <div className="flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-taupe/30 bg-white shadow-xl sm:max-h-none sm:max-w-3xl sm:rounded-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-taupe/30 px-4 py-4 sm:px-6">
          <h2 className="font-serif text-lg text-charcoal">
            {post ? "Edytuj artykuł" : "Nowy artykuł"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-taupe/30"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div>
            <label className="text-xs text-sand uppercase">Tytuł</label>
            <input
              required
              value={form.title}
              onChange={(e) => {
                const title = e.target.value;
                setForm((f) => ({
                  ...f,
                  title,
                  slug: slugTouched ? f.slug : slugify(title),
                }));
              }}
              className="mt-1.5 w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-sand uppercase">Slug (URL)</label>
              <input
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
                className="mt-1.5 w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-sand uppercase">Data publikacji</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="mt-1.5 w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-sand uppercase">Kategoria</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="mt-1.5 w-full rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex min-h-[42px] cursor-pointer items-center gap-2 rounded-lg border border-taupe/30 px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured ?? false}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, featured: e.target.checked }))
                  }
                  className="rounded"
                />
                <Star className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
                Wyróżniony na stronie bloga
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs text-sand uppercase">Zajawka</label>
            <textarea
              required
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="mt-1.5 w-full resize-y rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-taupe/30 bg-cream-light/40 p-4">
            <h3 className="text-sm font-medium text-charcoal">Google / SEO</h3>
            <div className="mt-3">
              <SeoFields
                title={form.seoTitle ?? ""}
                description={form.seoDescription ?? ""}
                onTitle={(seoTitle) => setForm((f) => ({ ...f, seoTitle }))}
                onDescription={(seoDescription) =>
                  setForm((f) => ({ ...f, seoDescription }))
                }
                titlePlaceholder={form.title || "Tytuł artykułu"}
                descriptionPlaceholder={form.excerpt || "Zajawka artykułu"}
                hint="Osobny tytuł i opis dla Google. Puste = tytuł i zajawka artykułu."
              />
            </div>
          </div>

          <ImageDropzone
            label="Zdjęcie tytułowe"
            folderHint="Zapis: data/uploads/blog (serwowane przez /api/media/blog/…)"
            value={form.image}
            onChange={(url) => setForm((f) => ({ ...f, image: url }))}
            uploadEndpoint="/api/blog/upload"
            required
            onError={setError}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs text-sand uppercase">
                Treść artykułu (akapity)
              </label>
              <button
                type="button"
                onClick={addParagraph}
                className="flex items-center gap-1 text-xs text-charcoal hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj akapit
              </button>
            </div>
            <div className="space-y-3">
              {form.content.map((paragraph, i) => (
                <div key={i} className="flex gap-2">
                  <textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) => updateContent(i, e.target.value)}
                    placeholder={`Akapit ${i + 1}`}
                    className="flex-1 resize-y rounded-lg border border-taupe/30 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none"
                  />
                  {form.content.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParagraph(i)}
                      className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600"
                      aria-label="Usuń akapit"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-taupe/20 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] rounded-lg border border-taupe/30 px-4 py-2 text-sm"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[44px] rounded-lg bg-charcoal px-6 py-2 text-sm text-cream disabled:opacity-60"
            >
              {saving ? "Zapisywanie…" : post ? "Zapisz zmiany" : "Opublikuj"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
