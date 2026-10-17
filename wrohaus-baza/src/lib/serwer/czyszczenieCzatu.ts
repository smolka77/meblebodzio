import fs from "fs/promises";
import path from "path";
import { readStore, writeStore } from "./baza";
import { deleteChatUpload, getChatUploadDir } from "./wgrywanieCzatu";
import type { ChatConversation } from "@/lib/typy";

const LEGACY_CHAT_DIR = path.join(process.cwd(), "public", "uploads", "chat");

async function removeAllFilesInDir(dir: string): Promise<number> {
  let removed = 0;
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      const full = path.join(dir, entry);
      const stat = await fs.stat(full);
      if (stat.isFile()) {
        await fs.unlink(full);
        removed += 1;
      }
    }
  } catch {
    // katalog może nie istnieć
  }
  return removed;
}

/** Usuwa wszystkie załączniki czatu z dysku i czyści odwołania w chats.json. */
export async function clearAllChatAttachments(): Promise<{
  filesRemoved: number;
  messagesCleared: number;
}> {
  const chats = await readStore<ChatConversation[]>("chats.json", []);
  let messagesCleared = 0;

  for (const conv of chats) {
    for (const msg of conv.messages) {
      if (msg.attachment?.url) {
        await deleteChatUpload(msg.attachment.url);
        delete msg.attachment;
        messagesCleared += 1;
      }
    }
  }

  await writeStore("chats.json", chats);

  const primaryRemoved = await removeAllFilesInDir(getChatUploadDir());
  const legacyRemoved = await removeAllFilesInDir(LEGACY_CHAT_DIR);

  return {
    filesRemoved: primaryRemoved + legacyRemoved,
    messagesCleared,
  };
}
