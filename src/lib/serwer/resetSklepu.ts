import { writeStore, readStore } from "./baza";
import { deleteChatUpload } from "./wgrywanieCzatu";
import type { ChatConversation } from "@/lib/typy";

/** Czyści dane operacyjne — bez produktów, ustawień, FAQ, bloga i tkanin. */
export async function resetOperationalData(): Promise<{
  cleared: string[];
}> {
  const chats = await readStore<ChatConversation[]>("chats.json", []);

  for (const conv of chats) {
    for (const msg of conv.messages) {
      if (msg.attachment?.url) {
        await deleteChatUpload(msg.attachment.url);
      }
    }
  }

  const cleared = [
    "orders.json",
    "users.json",
    "newsletter.json",
    "sessions.json",
    "chats.json",
    "contact-messages.json",
    "fabric-sample-requests.json",
  ] as const;

  await Promise.all([
    writeStore("orders.json", []),
    writeStore("users.json", []),
    writeStore("newsletter.json", []),
    writeStore("sessions.json", []),
    writeStore("chats.json", []),
    writeStore("contact-messages.json", []),
    writeStore("fabric-sample-requests.json", []),
  ]);

  return { cleared: [...cleared] };
}

export const RESET_CONFIRM_PHRASE = "USUŃ DANE";
