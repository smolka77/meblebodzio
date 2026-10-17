"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { ImageDropzone } from "@/components/panel/StrefaZdjec";
import { LookHotspotEditor } from "@/components/panel/EdytorKulekInspiracji";
import {
  DEFAULT_HOMEPAGE,
  mergeHomepage,
  MAX_HOMEPAGE_REVIEWS,
  newHomepageReview,
  type HomepageBenefitTile,
  type HomepageCard,
  type HomepageContent,
  type HomepageHero,
  type HomepageReview,
  type HomepageSection,
} from "@/lib/stronaGlowna";
import type { Product } from "@/lib/typy";

const inputClass =
  "mt-1 w-full rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none";

const emptyHero = (): HomepageHero => ({
  image: "",
  eyebrow: "Kolekcja",
  title: "",
  buttonLabel: "Zobacz",
  buttonHref: "/produkty",
});

const emptyCard = (): HomepageCard => ({
  label: "",
  description: "",
  image: "",
  href: "/produkty",
});

export function AdminHomepage() {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/homepage")
      .then((r) => r.json())
      .then((data) => setContent(mergeHomepage(data)))
      .catch(() => setContent(DEFAULT_HOMEPAGE));
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {});
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!content) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/homepage", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Nie udało się zapisać. Spróbuj ponownie.");
      return;
    }
    const updated = await res.json();
    setContent(mergeHomepage(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!content) {
    return (
      <>
        <AdminHeader title="Strona główna" />
        <div className="admin-page text-sm text-sand">Ładowanie...</div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Strona główna" />
      <div className="admin-page">
        <form onSubmit={handleSave} className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
          <p className="text-sm text-sand">
            Tekst zapisujesz po polsku. Angielski, niemiecki i ukraiński biorą
            aktualną treść z panelu i tłumaczą ją automatycznie.
          </p>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <section className="space-y-5 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Karuzela na górze</h3>
              <p className="mt-1 text-xs text-sand">
                Duże zdjęcie, nadtytuł, nagłówek i przycisk. Kolejne slajdy
                przewijają się automatycznie.
              </p>
            </div>
            <HeroEditor
              title="Slajd 1"
              slide={content.hero}
              onChange={(hero) => setContent({ ...content, hero })}
              onError={setError}
            />
            {content.heroSlides.map((slide, index) => (
              <HeroEditor
                key={`extra-${index}`}
                title={`Slajd ${index + 2}`}
                slide={slide}
                onChange={(next) =>
                  setContent({
                    ...content,
                    heroSlides: content.heroSlides.map((item, i) =>
                      i === index ? next : item
                    ),
                  })
                }
                onRemove={() =>
                  setContent({
                    ...content,
                    heroSlides: content.heroSlides.filter((_, i) => i !== index),
                  })
                }
                onError={setError}
              />
            ))}
            <button
              type="button"
              onClick={() =>
                setContent({
                  ...content,
                  heroSlides: [...content.heroSlides, emptyHero()],
                })
              }
              className="inline-flex items-center gap-2 text-sm text-charcoal"
            >
              <Plus className="h-4 w-4" /> Dodaj slajd
            </button>
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Bestsellery</h3>
              <p className="mt-1 text-xs text-sand">
                Teksty sekcji. Które produkty tu lądują, zaznaczasz przy produkcie:
                „Bestseller na stronie głównej”.
              </p>
            </div>
            <Field
              label="Nadtytuł"
              value={content.bestsellers.eyebrow}
              onChange={(eyebrow) =>
                setContent({
                  ...content,
                  bestsellers: { ...content.bestsellers, eyebrow },
                })
              }
            />
            <Field
              label="Nagłówek"
              value={content.bestsellers.title}
              onChange={(title) =>
                setContent({
                  ...content,
                  bestsellers: { ...content.bestsellers, title },
                })
              }
            />
            <Field
              label="Opis"
              value={content.bestsellers.intro}
              textarea
              onChange={(intro) =>
                setContent({
                  ...content,
                  bestsellers: { ...content.bestsellers, intro },
                })
              }
            />
          </section>

          <section className="space-y-4 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Zainspiruj się</h3>
              <p className="mt-1 text-xs text-sand">
                Zdjęcie aranżacji, białe kulki na meblach i produkt podpięty
                pod każdą kulkę. Możesz wrócić tutaj i zmienić zdjęcie, pozycje
                albo produkty.
              </p>
            </div>
            <ImageDropzone
              label="Zdjęcie aranżacji"
              folderHint="Duże zdjęcie salonu. Kulki ustawiasz poniżej."
              value={content.look.image}
              onChange={(image) =>
                setContent({ ...content, look: { ...content.look, image } })
              }
              uploadEndpoint="/api/products/upload"
              hidePreview
              onError={setError}
            />
            <LookHotspotEditor
              image={content.look.image}
              hotspots={content.look.hotspots}
              products={products}
              onChange={(hotspots) =>
                setContent({ ...content, look: { ...content.look, hotspots } })
              }
            />
            <Field
              label="Nadtytuł"
              value={content.look.eyebrow}
              onChange={(eyebrow) =>
                setContent({ ...content, look: { ...content.look, eyebrow } })
              }
            />
            <Field
              label="Nagłówek"
              value={content.look.title}
              onChange={(title) =>
                setContent({ ...content, look: { ...content.look, title } })
              }
            />
            <Field
              label="Opis"
              value={content.look.intro}
              textarea
              onChange={(intro) =>
                setContent({ ...content, look: { ...content.look, intro } })
              }
            />
            <Field
              label="Drugi akapit"
              value={content.look.intro2}
              textarea
              onChange={(intro2) =>
                setContent({ ...content, look: { ...content.look, intro2 } })
              }
            />
            <Field
              label="Nagłówek listy mebli"
              value={content.look.listLabel}
              onChange={(listLabel) =>
                setContent({ ...content, look: { ...content.look, listLabel } })
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Przycisk"
                value={content.look.ctaLabel}
                onChange={(ctaLabel) =>
                  setContent({ ...content, look: { ...content.look, ctaLabel } })
                }
              />
              <Field
                label="Link przycisku"
                value={content.look.ctaHref}
                onChange={(ctaHref) =>
                  setContent({ ...content, look: { ...content.look, ctaHref } })
                }
              />
            </div>
          </section>

          <SectionEditor
            title="Kategorie"
            hint="Ta siatka nie jest już na stronie głównej — zamiast niej są trzy linie produktowe (Smart, Comfort, Premium)."
            section={content.categories}
            onChange={(categories) => setContent({ ...content, categories })}
            onError={setError}
            allowComingSoon
          />

          <SectionEditor
            title="Kolekcje / linie"
            hint="Kafelki Smart, Comfort i Premium na stronie głównej — po aranżacjach. Zdjęcia ustawiasz tutaj; hasła BEST PRICE / BEST CHOICE / BEST DESIGN dopisuje sklep."
            section={content.collections}
            onChange={(collections) => setContent({ ...content, collections })}
            onError={setError}
            showCardDescription
          />

          <section className="space-y-5 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Dlaczego Wrohaus</h3>
              <p className="mt-1 text-xs text-sand">
                Sekcja na stronie głównej: zdjęcie manufaktury, kafelek zwrotu i
                kafelek dostawy. Zapis trafia od razu na sklep.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nadtytuł"
                value={content.benefits.eyebrow}
                onChange={(eyebrow) =>
                  setContent({
                    ...content,
                    benefits: { ...content.benefits, eyebrow },
                  })
                }
              />
              <Field
                label="Nagłówek sekcji"
                value={content.benefits.title}
                onChange={(title) =>
                  setContent({
                    ...content,
                    benefits: { ...content.benefits, title },
                  })
                }
              />
            </div>

            <div className="space-y-3 rounded-lg border border-taupe/30 p-4">
              <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
                Zdjęcie manufaktury
              </p>
              <ImageDropzone
                label="Zdjęcie"
                folderHint="Duże zdjęcie po lewej w sekcji Dlaczego Wrohaus."
                value={content.benefits.workshop.image}
                onChange={(image) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, image },
                    },
                  })
                }
                uploadEndpoint="/api/products/upload"
                onError={setError}
              />
              <Field
                label="Nadtytuł na zdjęciu"
                value={content.benefits.workshop.kicker}
                onChange={(kicker) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, kicker },
                    },
                  })
                }
              />
              <Field
                label="Nagłówek na zdjęciu"
                value={content.benefits.workshop.title}
                textarea
                onChange={(title) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, title },
                    },
                  })
                }
              />
              <Field
                label="Opis na zdjęciu"
                value={content.benefits.workshop.body}
                textarea
                onChange={(body) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, body },
                    },
                  })
                }
              />
              <Field
                label="Opis alternatywny zdjęcia"
                value={content.benefits.workshop.alt}
                onChange={(alt) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, alt },
                    },
                  })
                }
              />
              <Field
                label="Link ze zdjęcia"
                value={content.benefits.workshop.href}
                onChange={(href) =>
                  setContent({
                    ...content,
                    benefits: {
                      ...content.benefits,
                      workshop: { ...content.benefits.workshop, href },
                    },
                  })
                }
              />
            </div>

            <BenefitTileEditor
              title="Kafelek zwrotu"
              tile={content.benefits.returns}
              highlightHint="Duża liczba, np. 14"
              onChange={(returns) =>
                setContent({
                  ...content,
                  benefits: { ...content.benefits, returns },
                })
              }
            />
            <BenefitTileEditor
              title="Kafelek dostawy"
              tile={content.benefits.shipping}
              highlightHint="Duży tekst, np. od 249 zł"
              onChange={(shipping) =>
                setContent({
                  ...content,
                  benefits: { ...content.benefits, shipping },
                })
              }
            />
          </section>

          <section className="space-y-5 rounded-xl border border-taupe/30 bg-white p-6">
            <div>
              <h3 className="text-sm font-medium text-charcoal">Opinie na stronie głównej</h3>
              <p className="mt-1 text-xs text-sand">
                Kafelki z recenzjami pod sekcją „Dlaczego Wrohaus”. Możesz zmienić
                istniejące, dodać nowe albo usunąć — zapis idzie od razu na sklep.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nadtytuł"
                value={content.reviews.eyebrow}
                onChange={(eyebrow) =>
                  setContent({
                    ...content,
                    reviews: { ...content.reviews, eyebrow },
                  })
                }
              />
              <Field
                label="Ocena"
                value={content.reviews.rating}
                hint="Np. 4,9 / 5"
                onChange={(rating) =>
                  setContent({
                    ...content,
                    reviews: { ...content.reviews, rating },
                  })
                }
              />
            </div>
            <Field
              label="Nagłówek"
              value={content.reviews.title}
              onChange={(title) =>
                setContent({
                  ...content,
                  reviews: { ...content.reviews, title },
                })
              }
            />
            <Field
              label="Dopisek pod oceną"
              value={content.reviews.meta}
              onChange={(meta) =>
                setContent({
                  ...content,
                  reviews: { ...content.reviews, meta },
                })
              }
            />
            {content.reviews.items.map((review, index) => (
              <ReviewEditor
                key={review.id}
                index={index}
                review={review}
                onChange={(next) =>
                  setContent({
                    ...content,
                    reviews: {
                      ...content.reviews,
                      items: content.reviews.items.map((item, i) =>
                        i === index ? next : item
                      ),
                    },
                  })
                }
                onRemove={() =>
                  setContent({
                    ...content,
                    reviews: {
                      ...content.reviews,
                      items: content.reviews.items.filter((_, i) => i !== index),
                    },
                  })
                }
                onError={setError}
              />
            ))}
            <button
              type="button"
              disabled={content.reviews.items.length >= MAX_HOMEPAGE_REVIEWS}
              onClick={() =>
                setContent({
                  ...content,
                  reviews: {
                    ...content.reviews,
                    items: [...content.reviews.items, newHomepageReview()],
                  },
                })
              }
              className="inline-flex items-center gap-2 text-sm text-charcoal disabled:opacity-40"
            >
              <Plus className="h-4 w-4" /> Dodaj opinię
            </button>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85 disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Zapisywanie..." : saved ? "Zapisano!" : "Zapisz stronę główną"}
          </button>
        </form>
      </div>
    </>
  );
}

function ReviewEditor({
  index,
  review,
  onChange,
  onRemove,
  onError,
}: {
  index: number;
  review: HomepageReview;
  onChange: (review: HomepageReview) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-taupe/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
          Opinia {index + 1}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs text-sand hover:text-terracotta"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Usuń
        </button>
      </div>
      <ImageDropzone
        label="Zdjęcie"
        folderHint="Zdjęcie mebla albo aranżacji przy tej opinii."
        value={review.image}
        onChange={(image) => onChange({ ...review, image })}
        uploadEndpoint="/api/products/upload"
        onError={onError}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Imię / podpis"
          value={review.name}
          onChange={(name) => onChange({ ...review, name })}
        />
        <Field
          label="Miasto"
          value={review.city}
          onChange={(city) => onChange({ ...review, city })}
        />
      </div>
      <Field
        label="Produkt"
        value={review.product}
        onChange={(product) => onChange({ ...review, product })}
      />
      <Field
        label="Treść opinii"
        value={review.text}
        textarea
        onChange={(text) => onChange({ ...review, text })}
      />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="text-xs text-sand uppercase">{label}</label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
      {hint ? <p className="mt-1 text-xs text-sand">{hint}</p> : null}
    </div>
  );
}

function BenefitTileEditor({
  title,
  tile,
  highlightHint,
  onChange,
}: {
  title: string;
  tile: HomepageBenefitTile;
  highlightHint?: string;
  onChange: (tile: HomepageBenefitTile) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-taupe/30 p-4">
      <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
        {title}
      </p>
      <Field
        label="Duży tekst / liczba"
        value={tile.highlight}
        hint={highlightHint}
        onChange={(highlight) => onChange({ ...tile, highlight })}
      />
      <Field
        label="Nagłówek"
        value={tile.title}
        onChange={(titleValue) => onChange({ ...tile, title: titleValue })}
      />
      <Field
        label="Opis"
        value={tile.body}
        textarea
        onChange={(body) => onChange({ ...tile, body })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Tekst linku"
          value={tile.linkLabel}
          onChange={(linkLabel) => onChange({ ...tile, linkLabel })}
        />
        <Field
          label="Adres linku"
          value={tile.linkHref}
          onChange={(linkHref) => onChange({ ...tile, linkHref })}
        />
      </div>
    </div>
  );
}

function HeroEditor({
  title,
  slide,
  onChange,
  onRemove,
  onError,
}: {
  title: string;
  slide: HomepageHero;
  onChange: (slide: HomepageHero) => void;
  onRemove?: () => void;
  onError: (message: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-taupe/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
          {title}
        </p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-sand hover:text-red-600"
            aria-label="Usuń slajd"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <ImageDropzone
        label="Zdjęcie"
        folderHint="Tło slajdu karuzeli."
        value={slide.image}
        onChange={(image) => onChange({ ...slide, image })}
        uploadEndpoint="/api/products/upload"
        onError={onError}
      />
      <Field
        label="Nadtytuł"
        value={slide.eyebrow}
        onChange={(eyebrow) => onChange({ ...slide, eyebrow })}
      />
      <Field
        label="Nagłówek"
        value={slide.title}
        textarea
        onChange={(title) => onChange({ ...slide, title })}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Przycisk"
          value={slide.buttonLabel}
          onChange={(buttonLabel) => onChange({ ...slide, buttonLabel })}
        />
        <Field
          label="Link przycisku"
          value={slide.buttonHref}
          onChange={(buttonHref) => onChange({ ...slide, buttonHref })}
        />
      </div>
    </div>
  );
}

function SectionEditor({
  title,
  hint,
  section,
  onChange,
  onError,
  showCardDescription = false,
  allowComingSoon = false,
}: {
  title: string;
  hint: string;
  section: HomepageSection;
  onChange: (section: HomepageSection) => void;
  onError: (message: string) => void;
  showCardDescription?: boolean;
  allowComingSoon?: boolean;
}) {
  function updateCard(index: number, patch: Partial<HomepageCard>) {
    onChange({
      ...section,
      cards: section.cards.map((card, i) =>
        i === index ? { ...card, ...patch } : card
      ),
    });
  }

  return (
    <section className="space-y-5 rounded-xl border border-taupe/30 bg-white p-6">
      <div>
        <h3 className="text-sm font-medium text-charcoal">{title}</h3>
        <p className="mt-1 text-xs text-sand">{hint}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nadtytuł"
          value={section.eyebrow}
          onChange={(eyebrow) => onChange({ ...section, eyebrow })}
        />
        <Field
          label="Tytuł sekcji"
          value={section.title}
          onChange={(title) => onChange({ ...section, title })}
        />
      </div>
      <Field
        label="Opis sekcji"
        value={section.intro}
        textarea
        onChange={(intro) => onChange({ ...section, intro })}
      />

      {section.cards.map((card, index) => (
        <div
          key={`${title}-${index}`}
          className="space-y-3 rounded-lg border border-taupe/30 p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-charcoal uppercase">
              Kafelek {index + 1}
            </p>
            <button
              type="button"
              onClick={() =>
                onChange({
                  ...section,
                  cards: section.cards.filter((_, i) => i !== index),
                })
              }
              className="p-1.5 text-sand hover:text-red-600"
              aria-label="Usuń kafelek"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <ImageDropzone
            label="Zdjęcie"
            value={card.image}
            onChange={(url) => updateCard(index, { image: url })}
            uploadEndpoint="/api/products/upload"
            onError={onError}
          />
          <Field
            label="Nazwa"
            value={card.label}
            onChange={(label) => updateCard(index, { label })}
          />
          {showCardDescription && (
            <Field
              label="Opis"
              value={card.description}
              textarea
              onChange={(description) => updateCard(index, { description })}
            />
          )}
          <Field
            label="Link"
            value={card.href}
            onChange={(href) => updateCard(index, { href })}
          />
          {allowComingSoon && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(card.comingSoon)}
                onChange={(e) =>
                  updateCard(index, { comingSoon: e.target.checked })
                }
              />
              Wkrótce (bez linku, wyszarzone)
            </label>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange({ ...section, cards: [...section.cards, emptyCard()] })
        }
        className="inline-flex items-center gap-2 text-sm text-charcoal"
      >
        <Plus className="h-4 w-4" /> Dodaj kafelek
      </button>
    </section>
  );
}
