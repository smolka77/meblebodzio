import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import type { ContactMessage } from "@/lib/typy";

const FILE = "contact-messages.json";

export async function getContactMessages(): Promise<ContactMessage[]> {
  await ensureStoreSeeded();
  const messages = await readStore<ContactMessage[]>(FILE, []);
  return messages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getUnreadContactCount(): Promise<number> {
  const messages = await getContactMessages();
  return messages.filter((m) => !m.read).length;
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ ok: boolean; message: string; id?: string }> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const phone = input.phone?.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    return { ok: false, message: "Wypełnij wymagane pola formularza" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Podaj prawidłowy adres e-mail" };
  }

  const entry: ContactMessage = {
    id: crypto.randomUUID(),
    name,
    email,
    phone: phone || undefined,
    subject,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const messages = await getContactMessages();
  await writeStore(FILE, [entry, ...messages]);
  return { ok: true, message: "Dziękujemy — wiadomość została wysłana.", id: entry.id };
}

export async function markContactMessageRead(id: string): Promise<boolean> {
  const messages = await getContactMessages();
  const index = messages.findIndex((m) => m.id === id);
  if (index === -1) return false;
  messages[index] = { ...messages[index], read: true };
  await writeStore(FILE, messages);
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const messages = await getContactMessages();
  const next = messages.filter((m) => m.id !== id);
  if (next.length === messages.length) return false;
  await writeStore(FILE, next);
  return true;
}

export async function getContactMessageById(id: string): Promise<ContactMessage | null> {
  const messages = await getContactMessages();
  return messages.find((m) => m.id === id) ?? null;
}
