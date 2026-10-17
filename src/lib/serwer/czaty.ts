import { readStore, writeStore } from "./baza";
import { ensureStoreSeeded } from "./startDanych";
import { deleteChatUpload } from "./wgrywanieCzatu";
import type { ChatAttachment, ChatConversation, ChatMessage } from "@/lib/typy";

const FILE = "chats.json";

export async function getConversations(): Promise<ChatConversation[]> {
  await ensureStoreSeeded();
  const chats = await readStore<ChatConversation[]>(FILE, []);
  return chats.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export async function getConversationById(
  id: string
): Promise<ChatConversation | undefined> {
  const chats = await getConversations();
  return chats.find((c) => c.id === id);
}

export async function getConversationByVisitorId(
  visitorId: string
): Promise<ChatConversation | undefined> {
  const chats = await getConversations();
  return chats.find((c) => c.visitorId === visitorId);
}

function buildMessage(
  sender: "visitor" | "admin",
  text: string,
  attachment?: ChatAttachment
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    sender,
    text: text.trim(),
    attachment,
    createdAt: new Date().toISOString(),
  };
}

function lastPreview(message: ChatMessage): string {
  if (message.text.trim()) return message.text.trim();
  if (message.attachment) return `📎 ${message.attachment.name}`;
  return "";
}

async function appendToConversation(
  existingIndex: number,
  chats: ChatConversation[],
  message: ChatMessage,
  updates: Partial<ChatConversation>,
  incrementAdmin: boolean
): Promise<ChatConversation> {
  const base = chats[existingIndex];
  const conv: ChatConversation = {
    ...base,
    ...updates,
    messages: [...base.messages, message],
    unreadByAdmin: incrementAdmin ? base.unreadByAdmin + 1 : base.unreadByAdmin,
    unreadByVisitor: incrementAdmin ? base.unreadByVisitor : base.unreadByVisitor + 1,
    lastMessageAt: message.createdAt,
  };
  chats[existingIndex] = conv;
  await writeStore(FILE, chats);
  return conv;
}

export async function sendVisitorMessage(input: {
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  userId?: string;
  text: string;
  attachment?: ChatAttachment;
  conversationId?: string;
}): Promise<ChatConversation> {
  if (!input.text.trim() && !input.attachment) {
    throw new Error("Wiadomość pusta");
  }

  const chats = await getConversations();
  const message = buildMessage("visitor", input.text, input.attachment);

  let existingIndex = -1;

  if (input.conversationId) {
    existingIndex = chats.findIndex((c) => c.id === input.conversationId);
    if (existingIndex < 0) {
      throw new Error("Rozmowa nie istnieje");
    }
    if (chats[existingIndex].visitorId !== input.visitorId) {
      throw new Error("Brak dostępu do rozmowy");
    }
  } else {
    existingIndex = chats.findIndex((c) => c.visitorId === input.visitorId);
  }

  if (existingIndex >= 0) {
    return appendToConversation(existingIndex, chats, message, {
      visitorName: input.visitorName || chats[existingIndex].visitorName,
      visitorEmail: input.visitorEmail ?? chats[existingIndex].visitorEmail,
      userId: input.userId ?? chats[existingIndex].userId,
    }, true);
  }

  const conv: ChatConversation = {
    id: crypto.randomUUID(),
    visitorId: input.visitorId,
    visitorName: input.visitorName,
    visitorEmail: input.visitorEmail,
    userId: input.userId,
    messages: [message],
    unreadByAdmin: 1,
    unreadByVisitor: 0,
    lastMessageAt: message.createdAt,
    createdAt: message.createdAt,
  };
  await writeStore(FILE, [...chats, conv]);
  return conv;
}

export async function sendAdminReply(
  conversationId: string,
  text: string,
  attachment?: ChatAttachment
): Promise<ChatConversation | null> {
  if (!text.trim() && !attachment) return null;

  const chats = await getConversations();
  const index = chats.findIndex((c) => c.id === conversationId);
  if (index === -1) return null;

  const message = buildMessage("admin", text, attachment);
  const conv: ChatConversation = {
    ...chats[index],
    messages: [...chats[index].messages, message],
    unreadByVisitor: chats[index].unreadByVisitor + 1,
    unreadByAdmin: 0,
    lastMessageAt: message.createdAt,
  };
  chats[index] = conv;
  await writeStore(FILE, chats);
  return conv;
}

export async function markReadByAdmin(conversationId: string): Promise<void> {
  const chats = await getConversations();
  const index = chats.findIndex((c) => c.id === conversationId);
  if (index === -1) return;
  chats[index] = { ...chats[index], unreadByAdmin: 0 };
  await writeStore(FILE, chats);
}

export async function markReadByVisitor(conversationId: string): Promise<void> {
  const chats = await getConversations();
  const index = chats.findIndex((c) => c.id === conversationId);
  if (index === -1) return;
  chats[index] = { ...chats[index], unreadByVisitor: 0 };
  await writeStore(FILE, chats);
}

export async function deleteConversation(conversationId: string): Promise<boolean> {
  const chats = await getConversations();
  const conv = chats.find((c) => c.id === conversationId);
  if (!conv) return false;

  for (const msg of conv.messages) {
    if (msg.attachment?.url) {
      await deleteChatUpload(msg.attachment.url);
    }
  }

  await writeStore(
    FILE,
    chats.filter((c) => c.id !== conversationId)
  );
  return true;
}

export async function getUnreadAdminCount(): Promise<number> {
  const chats = await getConversations();
  return chats.reduce((sum, c) => sum + c.unreadByAdmin, 0);
}

export async function visitorCanAccessChatFile(
  filename: string,
  visitorId: string
): Promise<boolean> {
  if (!filename || !visitorId) return false;
  const chats = await getConversations();
  for (const chat of chats) {
    if (chat.visitorId !== visitorId) continue;
    for (const message of chat.messages) {
      const url = message.attachment?.url ?? "";
      if (url.includes(filename)) return true;
    }
  }
  return false;
}

export { lastPreview as getMessagePreview };
