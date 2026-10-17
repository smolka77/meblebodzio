"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { SocialIcon } from "@/components/uklad/IkonySocial";
import type { SocialLink, SocialPlatform } from "@/lib/typy";
import { SOCIAL_PLATFORMS } from "@/lib/socialMedia";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

function newSocialLink(platform: SocialPlatform = "instagram"): SocialLink {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `social-${Date.now()}`;
  return { id, url: "", platform };
}

export function AdminSocialMedia() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) =>
        setSocialLinks(Array.isArray(data.socialLinks) ? data.socialLinks : [])
      )
      .catch(() => setSocialLinks([]));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!socialLinks) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ socialLinks }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
      return;
    }
    const data = await res.json();
    setSocialLinks(Array.isArray(data.socialLinks) ? data.socialLinks : []);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateLink(id: string, patch: Partial<SocialLink>) {
    setSocialLinks((prev) =>
      (prev ?? []).map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeLink(id: string) {
    setSocialLinks((prev) => (prev ?? []).filter((item) => item.id !== id));
  }

  if (socialLinks === null) {
    return (
      <>
        <AdminHeader title="Social media" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Social media" />
      <div className="admin-page">
        <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-6">
          <section className="rounded-xl border border-taupe/30 bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-medium text-charcoal">Linki w stopce</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-sand">
                  Ikony pojawią się pod logiem na stronie. Profil Instagram trafi też
                  do menu na telefonie.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSocialLinks([...socialLinks, newSocialLink()])}
                disabled={socialLinks.length >= 12}
                className="inline-flex items-center gap-1.5 rounded-lg border border-taupe/30 px-3 py-2 text-xs text-charcoal transition-colors hover:bg-cream disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Dodaj link
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {socialLinks.length === 0 ? (
                <p className="rounded-lg border border-dashed border-taupe/30 px-4 py-8 text-center text-sm text-sand">
                  Brak linków — dodaj pierwszy profil social media.
                </p>
              ) : (
                socialLinks.map((link, index) => (
                  <div
                    key={link.id}
                    className="rounded-lg border border-taupe/20 bg-cream/30 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/15 bg-charcoal text-cream">
                          <SocialIcon platform={link.platform} />
                        </span>
                        <span className="text-sm font-medium text-charcoal">
                          Link {index + 1}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLink(link.id)}
                        className="inline-flex items-center gap-1 text-xs text-sand transition-colors hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Usuń
                      </button>
                    </div>

                    <div>
                      <label className="text-xs text-sand uppercase">Platforma</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SOCIAL_PLATFORMS.map((platform) => {
                          const active = link.platform === platform.value;
                          return (
                            <button
                              key={platform.value}
                              type="button"
                              title={platform.label}
                              onClick={() =>
                                updateLink(link.id, { platform: platform.value })
                              }
                              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                                active
                                  ? "border-charcoal bg-charcoal text-cream"
                                  : "border-taupe/30 bg-white text-charcoal hover:border-charcoal/40"
                              }`}
                            >
                              <SocialIcon platform={platform.value} />
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs text-sand">
                        Wybrana:{" "}
                        {SOCIAL_PLATFORMS.find((p) => p.value === link.platform)?.label}
                      </p>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-sand uppercase">Adres URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(link.id, { url: e.target.value })}
                        placeholder="https://www.instagram.com/wrohaus"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div className="mt-4">
                      <label className="text-xs text-sand uppercase">
                        Etykieta (opcjonalnie)
                      </label>
                      <input
                        type="text"
                        value={link.label ?? ""}
                        onChange={(e) => updateLink(link.id, { label: e.target.value })}
                        placeholder="np. Oficjalny profil"
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz linki"}
          </button>
        </form>
      </div>
    </>
  );
}
