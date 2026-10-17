import type { AboutContent } from "@/lib/oNas";
import type { DeliveryContent } from "@/lib/dostawa";
import type { BlogPost, FaqCategory, ProductCategory } from "@/lib/typy";
import type { Locale } from "@/lib/jezyk/locale";
import { mappedText, translateCmsTexts } from "@/lib/jezyk/cmsTeksty";
import { categoryIntros } from "@/lib/dane";
import { translateCategoryIntro } from "@/lib/jezyk";

export async function localizeAbout(
  about: AboutContent,
  locale: Locale
): Promise<AboutContent> {
  if (locale === "pl") return about;
  const texts = [
    about.metaTitle,
    about.metaDescription,
    about.hero.eyebrow,
    about.hero.title,
    about.hero.description,
    about.story.imageAlt,
    about.story.kicker,
    about.story.title,
    about.story.paragraph1,
    about.story.paragraph2,
    about.values.kicker,
    about.values.title,
    about.timeline.kicker,
    about.timeline.title,
    about.cta.title,
    about.cta.text,
    about.cta.buttonLabel,
    ...about.stats.flatMap((item) => [item.value, item.label]),
    ...about.values.items.flatMap((item) => [item.title, item.text]),
    ...about.timeline.items.map((item) => item.event),
  ];
  const map = await translateCmsTexts(texts, locale);
  const tx = (value: string) => mappedText(value, map);
  return {
    ...about,
    metaTitle: tx(about.metaTitle),
    metaDescription: tx(about.metaDescription),
    hero: {
      ...about.hero,
      eyebrow: tx(about.hero.eyebrow),
      title: tx(about.hero.title),
      description: tx(about.hero.description),
    },
    story: {
      ...about.story,
      imageAlt: tx(about.story.imageAlt),
      kicker: tx(about.story.kicker),
      title: tx(about.story.title),
      paragraph1: tx(about.story.paragraph1),
      paragraph2: tx(about.story.paragraph2),
    },
    stats: about.stats.map((item) => ({
      ...item,
      value: tx(item.value),
      label: tx(item.label),
    })),
    values: {
      kicker: tx(about.values.kicker),
      title: tx(about.values.title),
      items: about.values.items.map((item) => ({
        ...item,
        title: tx(item.title),
        text: tx(item.text),
      })),
    },
    timeline: {
      kicker: tx(about.timeline.kicker),
      title: tx(about.timeline.title),
      items: about.timeline.items.map((item) => ({
        ...item,
        event: tx(item.event),
      })),
    },
    cta: {
      ...about.cta,
      title: tx(about.cta.title),
      text: tx(about.cta.text),
      buttonLabel: tx(about.cta.buttonLabel),
    },
  };
}

export async function localizeFaqCategories(
  categories: FaqCategory[],
  locale: Locale
): Promise<FaqCategory[]> {
  if (locale === "pl") return categories;
  const texts = categories.flatMap((category) => [
    category.title,
    ...category.items.flatMap((item) => [item.question, item.answer]),
  ]);
  const map = await translateCmsTexts(texts, locale);
  const tx = (value: string) => mappedText(value, map);
  return categories.map((category) => ({
    ...category,
    title: tx(category.title),
    items: category.items.map((item) => ({
      ...item,
      question: tx(item.question),
      answer: tx(item.answer),
    })),
  }));
}

export async function localizeDelivery(
  delivery: DeliveryContent,
  locale: Locale
): Promise<DeliveryContent> {
  if (locale === "pl") return delivery;
  const texts = [
    delivery.methodsSection.kicker,
    delivery.methodsSection.title,
    delivery.stepsSection.kicker,
    delivery.stepsSection.title,
    ...delivery.methods.flatMap((method) => [
      method.title,
      method.priceLabel,
      method.description,
      ...method.features,
    ]),
    ...delivery.steps.flatMap((step) => [step.step, step.title, step.text]),
  ];
  const map = await translateCmsTexts(texts, locale);
  const tx = (value: string) => mappedText(value, map);
  return {
    methodsSection: {
      kicker: tx(delivery.methodsSection.kicker),
      title: tx(delivery.methodsSection.title),
    },
    methods: delivery.methods.map((method) => ({
      ...method,
      title: tx(method.title),
      priceLabel: tx(method.priceLabel),
      description: tx(method.description),
      features: method.features.map((feature) => tx(feature)),
    })),
    stepsSection: {
      kicker: tx(delivery.stepsSection.kicker),
      title: tx(delivery.stepsSection.title),
    },
    steps: delivery.steps.map((step) => ({
      ...step,
      step: tx(step.step),
      title: tx(step.title),
      text: tx(step.text),
    })),
  };
}

export async function localizeBlogPosts(
  posts: BlogPost[],
  locale: Locale
): Promise<BlogPost[]> {
  if (locale === "pl" || posts.length === 0) return posts;
  const texts = posts.flatMap((post) => [
    post.title,
    post.excerpt,
    post.category,
    post.readTime,
    post.seoTitle,
    post.seoDescription,
    ...post.content,
  ]);
  const map = await translateCmsTexts(texts, locale);
  const tx = (value: string) => mappedText(value, map);
  return posts.map((post) => ({
    ...post,
    title: tx(post.title),
    excerpt: tx(post.excerpt),
    category: tx(post.category),
    readTime: tx(post.readTime),
    seoTitle: post.seoTitle ? tx(post.seoTitle) : post.seoTitle,
    seoDescription: post.seoDescription
      ? tx(post.seoDescription)
      : post.seoDescription,
    content: post.content.map((paragraph) => tx(paragraph)),
  }));
}

export async function localizeBlogPost(
  post: BlogPost,
  locale: Locale
): Promise<BlogPost> {
  const [localized] = await localizeBlogPosts([post], locale);
  return localized ?? post;
}

export async function localizeCategoryIntro(
  category: ProductCategory,
  custom: string | undefined,
  locale: Locale
): Promise<string> {
  const fallback = translateCategoryIntro(locale, category);
  const text = custom?.trim();
  if (!text) return fallback;
  if (locale === "pl") return text;
  if (text === categoryIntros[category]?.trim()) return fallback;
  const map = await translateCmsTexts([text], locale);
  return mappedText(text, map);
}

export async function localizeListingIntro(
  custom: string | undefined,
  fallback: string,
  locale: Locale
): Promise<string> {
  const text = custom?.trim();
  if (!text) return fallback;
  if (locale === "pl") return text;
  const map = await translateCmsTexts([text], locale);
  return mappedText(text, map);
}
