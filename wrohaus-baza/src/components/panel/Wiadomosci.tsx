"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, MessageSquare, Paperclip, Trash2, ArrowLeft, FolderX, Loader2, X } from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { ChatMessageContent } from "@/components/czat/TrescWiadomosci";
import {
  formatChatDate,
  messagePreview,
  uploadChatFile,
} from "@/lib/klientCzatu";
import type { ChatAttachment, ChatConversation } from "@/lib/typy";

const CLEAR_ATTACHMENTS_PHRASE = "WYCZYŚĆ ZAŁĄCZNIKI";

export function AdminMessages() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [clearingAttachments, setClearingAttachments] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearPhrase, setClearPhrase] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/chat");
    if (res.ok) {
      const data: ChatConversation[] = await res.json();
      setConversations(data);
      setSelected((prev) =>
        prev ? data.find((c) => c.id === prev.id) ?? null : null
      );
    }
  }, []);

  useEffect(() => {
    loadList();
    const interval = setInterval(loadList, 3000);
    return () => clearInterval(interval);
  }, [loadList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.messages]);

  async function selectConversation(conv: ChatConversation) {
    setSelected(conv);
    setError("");
    if (conv.unreadByAdmin > 0) {
      await fetch(`/api/chat/${conv.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read_admin" }),
      });
      loadList();
    }
  }

  async function sendReply(messageText: string, attachment?: ChatAttachment) {
    if (!selected || sending) return;
    if (!messageText.trim() && !attachment) return;

    setSending(true);
    setError("");
    const res = await fetch(`/api/chat/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: messageText, attachment }),
    });
    setSending(false);
    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
      setReply("");
      loadList();
    } else {
      setError("Nie udało się wysłać wiadomości");
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    await sendReply(reply);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading || !selected) return;

    setUploading(true);
    setError("");
    try {
      const attachment = await uploadChatFile(file);
      await sendReply(reply, attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd uploadu");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteChat() {
    if (!selected || deleting) return;
    if (
      !confirm(
        `Usunąć całą rozmowę z ${selected.visitorName}? Tej operacji nie można cofnąć.`
      )
    ) {
      return;
    }

    setDeleting(true);
    const res = await fetch(`/api/chat/${selected.id}`, { method: "DELETE" });
    setDeleting(false);

    if (res.ok) {
      setSelected(null);
      loadList();
    } else {
      setError("Nie udało się usunąć rozmowy");
    }
  }

  async function handleClearAttachments() {
    if (clearingAttachments) return;
    if (clearPhrase.trim() !== CLEAR_ATTACHMENTS_PHRASE) {
      setError(`Wpisz dokładnie: ${CLEAR_ATTACHMENTS_PHRASE}`);
      return;
    }

    setClearingAttachments(true);
    setError("");
    const res = await fetch("/api/admin/clear-chat-uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmPhrase: clearPhrase.trim() }),
    });
    setClearingAttachments(false);

    if (res.ok) {
      const data = (await res.json()) as { message?: string };
      setClearModalOpen(false);
      setClearPhrase("");
      setError("");
      alert(data.message ?? "Załączniki czatu zostały usunięte.");
      loadList();
      if (selected) {
        const refresh = await fetch(`/api/chat/${selected.id}`);
        if (refresh.ok) setSelected(await refresh.json());
      }
    } else {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Nie udało się wyczyścić załączników");
    }
  }

  const totalUnread = conversations.reduce((s, c) => s + c.unreadByAdmin, 0);
  const busy = sending || uploading;

  return (
    <>
      <AdminHeader title="Wiadomości live" />
      <div className="flex min-h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)]">
        <div
          className={`w-full shrink-0 overflow-y-auto border-r border-taupe/30 bg-white sm:w-80 ${
            selected ? "hidden sm:block" : "block"
          }`}
        >
          <div className="border-b border-taupe/30 px-4 py-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-sand uppercase">
                Rozmowy {totalUnread > 0 && `· ${totalUnread} nowych`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setClearPhrase("");
                  setError("");
                  setClearModalOpen(true);
                }}
                className="flex shrink-0 items-center gap-1 text-[10px] text-red-600 underline-offset-2 hover:underline"
                title="Usuń pliki załączników z serwera"
              >
                <FolderX className="h-3.5 w-3.5" />
                Wyczyść pliki
              </button>
            </div>
          </div>
          {conversations.length === 0 ? (
            <p className="p-6 text-center text-sm text-sand">
              Brak wiadomości — czat pojawi się, gdy klient napisze ze strony sklepu.
            </p>
          ) : (
            conversations.map((conv) => {
              const last = conv.messages[conv.messages.length - 1];
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => selectConversation(conv)}
                  className={`w-full border-b border-taupe/10 px-4 py-3 text-left transition-colors hover:bg-cream-light/60 ${
                    selected?.id === conv.id ? "bg-cream-light" : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-charcoal">
                      {conv.visitorName}
                    </span>
                    {conv.unreadByAdmin > 0 && (
                      <span className="shrink-0 rounded-full bg-charcoal px-2 py-0.5 text-[10px] text-cream">
                        {conv.unreadByAdmin}
                      </span>
                    )}
                  </div>
                  {conv.visitorEmail && (
                    <p className="truncate text-xs text-sand">{conv.visitorEmail}</p>
                  )}
                  <p className="mt-1 truncate text-xs text-sand">
                    {last ? messagePreview(last) : "—"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-sand/70">
                    {formatChatDate(conv.lastMessageAt)}
                  </p>
                </button>
              );
            })
          )}
        </div>

        <div
          className={`flex min-w-0 flex-1 flex-col bg-cream ${
            selected ? "flex" : "hidden sm:flex"
          }`}
        >
          {!selected ? (
            <div className="hidden flex-1 flex-col items-center justify-center text-sand sm:flex">
              <MessageSquare className="h-12 w-12 opacity-30" strokeWidth={1} />
              <p className="mt-4 text-sm">Wybierz rozmowę z listy</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-taupe/30 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="touch-target -ml-1 flex shrink-0 items-center justify-center text-sand sm:hidden"
                    aria-label="Wróć"
                  >
                    <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
                  </button>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-charcoal">
                      {selected.visitorName}
                    </p>
                    {selected.visitorEmail && (
                      <p className="truncate text-sm text-sand">
                        {selected.visitorEmail}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteChat}
                  disabled={deleting}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-2 text-xs text-red-600 transition-colors active:bg-red-50 disabled:opacity-50 sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Usuń czat</span>
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                {selected.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}
                  >
                    <ChatMessageContent
                      msg={msg}
                      timeLabel={formatChatDate(msg.createdAt)}
                      senderLabel={
                        msg.sender === "visitor" ? selected.visitorName : undefined
                      }
                      timeClassName={
                        msg.sender === "admin" ? "text-cream/50" : "text-sand"
                      }
                      bubbleClassName={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm sm:max-w-[70%] ${
                        msg.sender === "admin"
                          ? "bg-charcoal text-cream"
                          : "border border-taupe/30 bg-white text-charcoal"
                      }`}
                    />
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="border-t border-taupe/30 bg-red-50 px-4 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <form
                onSubmit={handleReply}
                className="safe-bottom flex gap-2 border-t border-taupe/30 bg-white p-3 sm:gap-3 sm:p-4"
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-taupe/30 text-charcoal hover:bg-cream-light disabled:opacity-40"
                  aria-label="Wyślij załącznik"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={uploading ? "Wysyłanie pliku…" : "Napisz odpowiedź…"}
                  className="flex-1 rounded-lg border border-taupe/30 px-4 py-2.5 text-sm focus:border-charcoal focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !reply.trim()}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg bg-charcoal px-4 py-2.5 text-sm text-cream hover:bg-charcoal/85 disabled:opacity-40 sm:px-5"
                >
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Wyślij</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="clear-attachments-title"
            className="w-full max-w-md rounded-xl border border-taupe/30 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                  Serwer · załączniki czatu
                </p>
                <h2
                  id="clear-attachments-title"
                  className="mt-1 font-serif text-xl text-charcoal"
                >
                  Wyczyścić folder załączników?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="text-sand hover:text-charcoal"
                aria-label="Zamknij"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-sand">
              Usunie wszystkie pliki z{" "}
              <code className="text-xs text-charcoal">data/uploads/chat</code>{" "}
              i wyczyści odwołania w rozmowach. Treść wiadomości tekstowych
              zostanie — znikną tylko załączniki (zdjęcia, PDF itd.).
            </p>
            <label className="mt-5 block text-xs text-sand">
              Wpisz <strong className="text-charcoal">{CLEAR_ATTACHMENTS_PHRASE}</strong>{" "}
              aby potwierdzić
              <input
                type="text"
                value={clearPhrase}
                onChange={(e) => setClearPhrase(e.target.value)}
                className="mt-2 w-full rounded-lg border border-taupe/30 px-3 py-2 text-sm text-charcoal focus:border-charcoal focus:outline-none"
                autoComplete="off"
              />
            </label>
            {error && clearModalOpen && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setClearModalOpen(false)}
                className="rounded-lg border border-taupe/30 px-4 py-2 text-sm text-charcoal hover:bg-cream-light"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={handleClearAttachments}
                disabled={clearingAttachments}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {clearingAttachments && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Usuń pliki
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
