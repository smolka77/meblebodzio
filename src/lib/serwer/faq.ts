import { revalidatePath } from "next/cache";
import { getDefaultFaqCategories } from "@/lib/faqDomyslne";
import type { FaqCategory, FaqItem } from "@/lib/typy";
import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { prefetchListingTranslationsFrom } from "@/lib/serwer/tlumaczenia";
import { slugify } from "@/lib/slug";

const FILE = "faq.json";

export async function getFaqCategories(): Promise<FaqCategory[]> {
  await ensureStoreSeeded();
  return readStore(FILE, getDefaultFaqCategories());
}

async function persistFaq(categories: FaqCategory[]) {
  await writeStore(FILE, categories);
  revalidatePath("/faq");
}

function uniqueCategoryId(title: string, categories: FaqCategory[]): string {
  const baseId = slugify(title, 48) || "kategoria";
  let id = baseId;
  let n = 1;
  while (categories.some((category) => category.id === id)) {
    id = `${baseId}-${n++}`;
  }
  return id;
}

function findOrCreateCategory(
  categories: FaqCategory[],
  title: string
): FaqCategory {
  const existing = categories.find(
    (category) => category.title.toLowerCase() === title.toLowerCase()
  );
  if (existing) return existing;
  const created: FaqCategory = {
    id: uniqueCategoryId(title, categories),
    title,
    items: [],
  };
  categories.push(created);
  return created;
}

export async function addFaqItem(input: {
  categoryTitle: string;
  question: string;
  answer: string;
}): Promise<FaqItem | null> {
  const question = input.question.trim();
  const answer = input.answer.trim();
  const categoryTitle = input.categoryTitle.trim();

  if (!categoryTitle || !question || !answer) return null;

  const categories = await getFaqCategories();
  const category = findOrCreateCategory(categories, categoryTitle);

  const item: FaqItem = {
    id: crypto.randomUUID(),
    question,
    answer,
  };
  category.items.push(item);
  await persistFaq(categories);
  prefetchListingTranslationsFrom(item);
  return item;
}

export async function updateFaqItem(
  itemId: string,
  input: { question: string; answer: string; categoryTitle?: string }
): Promise<FaqItem | null> {
  const question = input.question.trim();
  const answer = input.answer.trim();
  if (!itemId.trim() || !question || !answer) return null;

  const categories = await getFaqCategories();
  let source: FaqCategory | undefined;
  let item: FaqItem | undefined;
  for (const category of categories) {
    const found = category.items.find((entry) => entry.id === itemId);
    if (found) {
      source = category;
      item = found;
      break;
    }
  }
  if (!source || !item) return null;

  item.question = question;
  item.answer = answer;

  const nextTitle = input.categoryTitle?.trim();
  if (nextTitle && nextTitle.toLowerCase() !== source.title.toLowerCase()) {
    source.items = source.items.filter((entry) => entry.id !== itemId);
    const dest = findOrCreateCategory(categories, nextTitle);
    dest.items.push(item);
  }

  await persistFaq(categories.filter((category) => category.items.length > 0));
  prefetchListingTranslationsFrom(item);
  return item;
}

export async function renameFaqCategory(
  categoryId: string,
  title: string
): Promise<boolean> {
  const nextTitle = title.trim();
  if (!categoryId.trim() || !nextTitle) return false;

  const categories = await getFaqCategories();
  const category = categories.find((entry) => entry.id === categoryId);
  if (!category) return false;

  const other = categories.find(
    (entry) =>
      entry.id !== categoryId &&
      entry.title.toLowerCase() === nextTitle.toLowerCase()
  );
  if (other) {
    other.items.push(...category.items);
    await persistFaq(categories.filter((entry) => entry.id !== categoryId));
  } else {
    category.title = nextTitle;
    await persistFaq(categories);
  }
  prefetchListingTranslationsFrom({ title: nextTitle });
  return true;
}

export async function deleteFaqItem(itemId: string): Promise<boolean> {
  const categories = await getFaqCategories();
  let found = false;

  for (const category of categories) {
    const before = category.items.length;
    category.items = category.items.filter((item) => item.id !== itemId);
    if (category.items.length < before) found = true;
  }

  if (!found) return false;

  await persistFaq(categories.filter((category) => category.items.length > 0));
  return true;
}

export async function deleteFaqCategory(categoryId: string): Promise<boolean> {
  const id = categoryId.trim();
  if (!id) return false;
  const categories = await getFaqCategories();
  const next = categories.filter((category) => category.id !== id);
  if (next.length === categories.length) return false;
  await persistFaq(next);
  return true;
}
