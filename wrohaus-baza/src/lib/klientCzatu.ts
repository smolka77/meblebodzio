import type { ChatAttachment, ChatMessage } from "@/lib/typy";
import { createClientId } from "@/lib/idKlienta";

const VISITOR_KEY = "sofelio-chat-visitor";

export function getChatVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = createClientId();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function formatChatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatChatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return formatChatTime(iso);
  }
  return d.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function messagePreview(msg: ChatMessage): string {
  if (msg.text.trim()) return msg.text.trim();
  if (msg.attachment) return `📎 ${msg.attachment.name}`;
  return "—";
}

export async function uploadChatFile(file: File): Promise<ChatAttachment> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("visitorId", getChatVisitorId());
  const res = await fetch("/api/chat/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Nie udało się wysłać pliku"
    );
  }
  return data as ChatAttachment;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}
