import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import type { NewsletterSubscriber } from "@/lib/typy";

const FILE = "newsletter.json";

export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  await ensureStoreSeeded();
  const subs = await readStore<NewsletterSubscriber[]>(FILE, []);
  return subs.sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
}

export async function subscribeEmail(email: string): Promise<{ ok: boolean; message: string }> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, message: "Nieprawidłowy adres e-mail" };
  }
  const subs = await getSubscribers();
  if (subs.some((s) => s.email === normalized)) {
    return { ok: true, message: "Ten adres jest już zapisany do newslettera" };
  }
  const entry: NewsletterSubscriber = {
    id: crypto.randomUUID(),
    email: normalized,
    subscribedAt: new Date().toISOString(),
    active: true,
  };
  await writeStore(FILE, [entry, ...subs]);
  return { ok: true, message: "Dziękujemy za zapisanie się!" };
}

export async function unsubscribeEmail(id: string): Promise<boolean> {
  const subs = await getSubscribers();
  const index = subs.findIndex((s) => s.id === id);
  if (index === -1) return false;
  subs[index] = { ...subs[index], active: false };
  await writeStore(FILE, subs);
  return true;
}

export async function deleteSubscriber(id: string): Promise<boolean> {
  const subs = await getSubscribers();
  const next = subs.filter((s) => s.id !== id);
  if (next.length === subs.length) return false;
  await writeStore(FILE, next);
  return true;
}
