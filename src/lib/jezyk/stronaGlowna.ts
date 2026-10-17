import { DEFAULT_HOMEPAGE, type HomepageContent } from "@/lib/stronaGlowna";
import {
  isUnchangedNavLabel,
  translate,
  translateHrefLabel,
  type Locale,
  type TranslateVars,
} from "@/lib/jezyk";
import type { MessageKey } from "@/lib/jezyk/slownik";
import {
  cmsOrDictionary,
  collectIfChanged,
  mappedText,
  translateCmsTexts,
} from "@/lib/jezyk/cmsTeksty";

const DEFAULT_REVIEW_TEXT_KEYS: Record<string, MessageKey> = {
  "review-marta": "home.reviewMarta",
  "review-piotr": "home.reviewPiotr",
  "review-anna": "home.reviewAnna",
};

function defaultReviewTextKey(id: string): MessageKey | undefined {
  return DEFAULT_REVIEW_TEXT_KEYS[id];
}

function collectHomepageCustomTexts(content: HomepageContent): string[] {
  const d = DEFAULT_HOMEPAGE;
  const bucket: string[] = [];
  collectIfChanged(bucket, content.hero.eyebrow, d.hero.eyebrow);
  collectIfChanged(bucket, content.hero.title, d.hero.title);
  collectIfChanged(bucket, content.hero.buttonLabel, d.hero.buttonLabel);
  content.heroSlides.forEach((slide, index) => {
    const fallback = d.heroSlides[index];
    if (!fallback) {
      bucket.push(slide.eyebrow, slide.title, slide.buttonLabel);
      return;
    }
    collectIfChanged(bucket, slide.eyebrow, fallback.eyebrow);
    collectIfChanged(bucket, slide.title, fallback.title);
    collectIfChanged(bucket, slide.buttonLabel, fallback.buttonLabel);
  });
  collectIfChanged(bucket, content.bestsellers.eyebrow, d.bestsellers.eyebrow);
  collectIfChanged(bucket, content.bestsellers.title, d.bestsellers.title);
  collectIfChanged(bucket, content.bestsellers.intro, d.bestsellers.intro);
  collectIfChanged(bucket, content.look.eyebrow, d.look.eyebrow);
  collectIfChanged(bucket, content.look.title, d.look.title);
  collectIfChanged(bucket, content.look.intro, d.look.intro);
  collectIfChanged(bucket, content.look.intro2, d.look.intro2);
  collectIfChanged(bucket, content.look.listLabel, d.look.listLabel);
  collectIfChanged(bucket, content.look.ctaLabel, d.look.ctaLabel);
  collectIfChanged(bucket, content.categories.eyebrow, d.categories.eyebrow);
  collectIfChanged(bucket, content.categories.title, d.categories.title);
  collectIfChanged(bucket, content.categories.intro, d.categories.intro);
  content.categories.cards.forEach((card, index) => {
    const fallback = d.categories.cards[index];
    const defaultLabel = fallback?.href === card.href ? fallback.label : "";
    if (!isUnchangedNavLabel(card.href, card.label) && card.label.trim() !== defaultLabel.trim()) {
      bucket.push(card.label);
    }
    if (card.description.trim()) {
      collectIfChanged(bucket, card.description, fallback?.description ?? "");
    }
  });
  collectIfChanged(bucket, content.collections.eyebrow, d.collections.eyebrow);
  collectIfChanged(bucket, content.collections.title, d.collections.title);
  collectIfChanged(bucket, content.collections.intro, d.collections.intro);
  content.collections.cards.forEach((card, index) => {
    const fallback = d.collections.cards[index];
    const defaultLabel = fallback?.href === card.href ? fallback.label : "";
    if (!isUnchangedNavLabel(card.href, card.label) && card.label.trim() !== defaultLabel.trim()) {
      bucket.push(card.label);
    }
    collectIfChanged(bucket, card.description, fallback?.description ?? "");
  });
  collectIfChanged(bucket, content.benefits.eyebrow, d.benefits.eyebrow);
  collectIfChanged(bucket, content.benefits.title, d.benefits.title);
  collectIfChanged(bucket, content.benefits.workshop.alt, d.benefits.workshop.alt);
  collectIfChanged(bucket, content.benefits.workshop.kicker, d.benefits.workshop.kicker);
  collectIfChanged(bucket, content.benefits.workshop.title, d.benefits.workshop.title);
  collectIfChanged(bucket, content.benefits.workshop.body, d.benefits.workshop.body);
  collectIfChanged(bucket, content.benefits.returns.title, d.benefits.returns.title);
  collectIfChanged(bucket, content.benefits.returns.body, d.benefits.returns.body);
  collectIfChanged(bucket, content.benefits.returns.linkLabel, d.benefits.returns.linkLabel);
  collectIfChanged(bucket, content.benefits.shipping.highlight, d.benefits.shipping.highlight);
  collectIfChanged(bucket, content.benefits.shipping.title, d.benefits.shipping.title);
  collectIfChanged(bucket, content.benefits.shipping.body, d.benefits.shipping.body);
  collectIfChanged(bucket, content.benefits.shipping.linkLabel, d.benefits.shipping.linkLabel);
  collectIfChanged(bucket, content.reviews.eyebrow, d.reviews.eyebrow);
  collectIfChanged(bucket, content.reviews.title, d.reviews.title);
  collectIfChanged(bucket, content.reviews.meta, d.reviews.meta);
  content.reviews.items.forEach((item) => {
    const fallback = d.reviews.items.find((row) => row.id === item.id);
    const key = defaultReviewTextKey(item.id);
    if (key && fallback && item.text.trim() === fallback.text.trim()) return;
    if (item.text.trim()) bucket.push(item.text);
    if (item.product.trim()) bucket.push(item.product);
    if (item.city.trim()) bucket.push(item.city);
  });
  return bucket;
}

function cardLabel(
  locale: Locale,
  href: string,
  cms: string,
  defaultLabel: string,
  map: Map<string, string>
): string {
  if (isUnchangedNavLabel(href, cms) || cms.trim() === defaultLabel.trim()) {
    return translateHrefLabel(locale, href, cms);
  }
  return mappedText(cms, map);
}

export async function localizeHomepage(
  content: HomepageContent,
  locale: Locale
): Promise<HomepageContent> {
  if (locale === "pl") return content;
  const t = (key: Parameters<typeof translate>[1], vars?: TranslateVars) =>
    translate(locale, key, vars);
  const d = DEFAULT_HOMEPAGE;
  const map = await translateCmsTexts(collectHomepageCustomTexts(content), locale);
  const pick = (cms: string, fallback: string, dictionary: string) =>
    cmsOrDictionary(cms, fallback, dictionary, map);

  return {
    ...content,
    hero: {
      ...content.hero,
      eyebrow: pick(content.hero.eyebrow, d.hero.eyebrow, t("home.heroEyebrow")),
      title: pick(content.hero.title, d.hero.title, t("home.heroTitle")),
      buttonLabel: pick(content.hero.buttonLabel, d.hero.buttonLabel, t("home.heroCta")),
    },
    heroSlides: content.heroSlides.map((slide, index) => {
      const fallback = d.heroSlides[index];
      const titleDict =
        index === 0
          ? t("home.slide1Title")
          : index === 1
            ? t("home.slide2Title")
            : slide.title;
      if (!fallback) {
        return {
          ...slide,
          eyebrow: mappedText(slide.eyebrow, map),
          title: mappedText(slide.title, map),
          buttonLabel: mappedText(slide.buttonLabel, map),
        };
      }
      return {
        ...slide,
        eyebrow: pick(slide.eyebrow, fallback.eyebrow, t("home.slideKicker")),
        title: pick(slide.title, fallback.title, titleDict),
        buttonLabel: pick(slide.buttonLabel, fallback.buttonLabel, t("home.seeCollection")),
      };
    }),
    bestsellers: {
      ...content.bestsellers,
      eyebrow: pick(content.bestsellers.eyebrow, d.bestsellers.eyebrow, t("home.bestKicker")),
      title: pick(content.bestsellers.title, d.bestsellers.title, t("home.bestTitle")),
      intro: pick(content.bestsellers.intro, d.bestsellers.intro, t("home.bestIntro")),
    },
    look: {
      ...content.look,
      eyebrow: pick(content.look.eyebrow, d.look.eyebrow, t("home.lookKicker")),
      title: pick(content.look.title, d.look.title, t("home.lookTitle")),
      intro: pick(content.look.intro, d.look.intro, t("home.lookIntro")),
      intro2: pick(content.look.intro2, d.look.intro2, t("home.lookIntro2")),
      listLabel: pick(content.look.listLabel, d.look.listLabel, t("home.lookList")),
      ctaLabel: pick(content.look.ctaLabel, d.look.ctaLabel, t("home.lookCta")),
    },
    categories: {
      eyebrow: pick(content.categories.eyebrow, d.categories.eyebrow, t("home.catKicker")),
      title: pick(content.categories.title, d.categories.title, t("home.catTitle")),
      intro: pick(content.categories.intro, d.categories.intro, t("home.catIntro")),
      cards: content.categories.cards.map((card, index) => {
        const fallback = d.categories.cards[index];
        const defaultLabel = fallback?.href === card.href ? fallback.label : card.label;
        return {
          ...card,
          label: cardLabel(locale, card.href, card.label, defaultLabel, map),
          description: mappedText(card.description, map),
        };
      }),
    },
    collections: {
      eyebrow: pick(content.collections.eyebrow, d.collections.eyebrow, t("home.colKicker")),
      title: pick(content.collections.title, d.collections.title, t("home.colTitle")),
      intro: pick(content.collections.intro, d.collections.intro, t("home.colIntro")),
      cards: content.collections.cards.map((card, index) => {
        const fallback = d.collections.cards[index];
        const defaultLabel = fallback?.href === card.href ? fallback.label : card.label;
        const defaultDesc = fallback?.href === card.href ? fallback.description : "";
        const lineDescKey =
          card.href === "/linia/smart"
            ? "line.smart.desc"
            : card.href === "/linia/comfort"
              ? "line.comfort.desc"
              : card.href === "/linia/premium"
                ? "line.premium.desc"
                : null;
        return {
          ...card,
          label: cardLabel(locale, card.href, card.label, defaultLabel, map),
          description: lineDescKey
            ? pick(card.description, defaultDesc, t(lineDescKey))
            : mappedText(card.description, map),
        };
      }),
    },
    benefits: {
      ...content.benefits,
      eyebrow: pick(content.benefits.eyebrow, d.benefits.eyebrow, t("home.benefitsKicker")),
      title: pick(content.benefits.title, d.benefits.title, t("home.benefitsTitle")),
      workshop: {
        ...content.benefits.workshop,
        alt: pick(content.benefits.workshop.alt, d.benefits.workshop.alt, t("home.workshopAlt")),
        kicker: pick(
          content.benefits.workshop.kicker,
          d.benefits.workshop.kicker,
          t("home.manufactory")
        ),
        title: pick(
          content.benefits.workshop.title,
          d.benefits.workshop.title,
          t("home.manufactoryTitle")
        ),
        body: pick(
          content.benefits.workshop.body,
          d.benefits.workshop.body,
          t("home.manufactoryBody", { warranty: t("top.warranty") })
        ),
      },
      returns: {
        ...content.benefits.returns,
        title: pick(content.benefits.returns.title, d.benefits.returns.title, t("home.returnDays")),
        body: pick(content.benefits.returns.body, d.benefits.returns.body, t("home.returnBody")),
        linkLabel: pick(
          content.benefits.returns.linkLabel,
          d.benefits.returns.linkLabel,
          t("home.returnLink")
        ),
      },
      shipping: {
        ...content.benefits.shipping,
        highlight: pick(
          content.benefits.shipping.highlight,
          d.benefits.shipping.highlight,
          t("policy.deliveryPrice")
        ),
        title: pick(
          content.benefits.shipping.title,
          d.benefits.shipping.title,
          t("home.shipPoland")
        ),
        body: pick(
          content.benefits.shipping.body,
          d.benefits.shipping.body,
          t("home.shipBody", { time: t("policy.deliveryTime") })
        ),
        linkLabel: pick(
          content.benefits.shipping.linkLabel,
          d.benefits.shipping.linkLabel,
          t("home.shipLink")
        ),
      },
    },
    reviews: {
      ...content.reviews,
      eyebrow: pick(content.reviews.eyebrow, d.reviews.eyebrow, t("home.reviewsKicker")),
      title: pick(content.reviews.title, d.reviews.title, t("home.reviewsTitle")),
      meta: pick(content.reviews.meta, d.reviews.meta, t("home.reviewsMeta")),
      items: content.reviews.items.map((item) => {
        const key = defaultReviewTextKey(item.id);
        const fallback = d.reviews.items.find((row) => row.id === item.id);
        const text =
          key && fallback && item.text.trim() === fallback.text.trim()
            ? t(key)
            : mappedText(item.text, map);
        return {
          ...item,
          text,
          product: mappedText(item.product, map),
          city: mappedText(item.city, map),
        };
      }),
    },
  };
}
