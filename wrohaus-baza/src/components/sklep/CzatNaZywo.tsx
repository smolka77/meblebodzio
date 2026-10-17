"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Send, X, Headphones, Paperclip } from "lucide-react";
import { useShop } from "@/kontekst/KontekstSklepu";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { ChatMessageContent } from "@/components/czat/TrescWiadomosci";
import {
  getChatVisitorId,
  formatChatTime,
  uploadChatFile,
} from "@/lib/klientCzatu";
import type { ChatAttachment, ChatConversation } from "@/lib/typy";

export function LiveChatWidget() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const { user } = useShop();
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [started, setStarted] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [footerInView, setFooterInView] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisitorId(getChatVisitorId());
    if (user) {
      setVisitorName(user.name);
      setStarted(true);
    }
  }, [user]);

  const loadConversation = useCallback(
    async (markRead = false) => {
      if (!visitorId) return;
      const res = await fetch(`/api/chat?visitorId=${visitorId}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data) return;

      setConversation(data);
      setStarted(true);

      if (markRead && data.unreadByVisitor > 0) {
        await fetch(`/api/chat/${data.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read_visitor", visitorId }),
        });
        setConversation((prev) =>
          prev ? { ...prev, unreadByVisitor: 0 } : prev
        );
      }
    },
    [visitorId]
  );

  useEffect(() => {
    if (!visitorId) return;
    loadConversation(open);
  }, [visitorId, open, loadConversation]);

  useEffect(() => {
    if (!visitorId || !open) return;
    const interval = setInterval(() => loadConversation(true), 8000);
    return () => clearInterval(interval);
  }, [open, visitorId, loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    let disposed = false;
    let intersecting = false;
    let hovering = false;
    const observers: IntersectionObserver[] = [];
    const boundFooters = new WeakSet<HTMLElement>();
    const timeouts: number[] = [];

    const sync = () => {
      if (!disposed) setFooterInView(intersecting || hovering);
    };

    const onPointerEnter = () => {
      hovering = true;
      sync();
    };

    const onPointerLeave = () => {
      hovering = false;
      sync();
    };

    const bindFooter = (footer: HTMLElement) => {
      if (boundFooters.has(footer)) return;
      boundFooters.add(footer);

      footer.addEventListener("pointerenter", onPointerEnter);
      footer.addEventListener("pointerleave", onPointerLeave);

      const observer = new IntersectionObserver(
        (entries) => {
          intersecting = entries.some((entry) => entry.isIntersecting);
          sync();
        },
        {
          threshold: [0, 0.01, 0.05],
          rootMargin: "0px 0px 96px 0px",
        }
      );
      observer.observe(footer);
      observers.push(observer);
    };

    const scanFooters = () => {
      document
        .querySelectorAll<HTMLElement>("#site-footer")
        .forEach((footer) => bindFooter(footer));
      sync();
    };

    scanFooters();
    for (const delay of [50, 150, 400, 900]) {
      timeouts.push(window.setTimeout(scanFooters, delay));
    }

    return () => {
      disposed = true;
      timeouts.forEach((id) => window.clearTimeout(id));
      observers.forEach((observer) => observer.disconnect());
      document.querySelectorAll<HTMLElement>("#site-footer").forEach((footer) => {
        footer.removeEventListener("pointerenter", onPointerEnter);
        footer.removeEventListener("pointerleave", onPointerLeave);
      });
      intersecting = false;
      hovering = false;
      setFooterInView(false);
    };
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  async function sendMessage(messageText: string, attachment?: ChatAttachment) {
    if (!visitorId || sending) return;
    if (!messageText.trim() && !attachment) return;

    setSending(true);
    setError("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        visitorName: visitorName.trim() || user?.name || t("chat.guest"),
        visitorEmail: user?.email,
        userId: user?.id,
        text: messageText,
        attachment,
        conversationId: conversation?.id,
      }),
    });

    setSending(false);
    if (res.ok) {
      const conv = await res.json();
      setConversation(conv);
      setText("");
      setStarted(true);
    } else {
      setError(t("chat.sendFail"));
    }
  }

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    if (!visitorName.trim()) return;
    setStarted(true);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage(text);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || uploading) return;

    setUploading(true);
    setError("");
    try {
      const attachment = await uploadChatFile(file);
      await sendMessage(text, attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("chat.uploadFail"));
    } finally {
      setUploading(false);
    }
  }

  const unread = conversation?.unreadByVisitor ?? 0;
  const busy = sending || uploading;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((wasOpen) => {
            if (!wasOpen) {
              setConversation((prev) =>
                prev ? { ...prev, unreadByVisitor: 0 } : prev
              );
            }
            return !wasOpen;
          });
        }}
        data-chat-fab
        aria-hidden={footerInView}
        tabIndex={footerInView ? -1 : undefined}
        className={`safe-bottom fixed right-4 bottom-4 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-charcoal text-cream shadow-[0_12px_32px_-12px_rgba(17,17,17,0.45)] transition-all duration-300 active:scale-95 hover:scale-105 hover:bg-charcoal/90 sm:right-6 sm:bottom-6 ${
          footerInView
            ? "pointer-events-none translate-y-3 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
        aria-label={t("chat.label")}
      >
        {open ? (
          <X className="h-6 w-6" strokeWidth={2} />
        ) : (
          <>
            <Headphones className="h-6 w-6" strokeWidth={1.75} />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-terracotta px-1 text-[10px] font-bold text-cream">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </>
        )}
      </button>

      {open && !footerInView && (
        <div className="animate-fade-in-up safe-bottom fixed inset-x-3 bottom-[5.5rem] z-[90] flex max-h-[min(480px,calc(100dvh-7.5rem))] flex-col overflow-hidden rounded-[1.75rem] border border-taupe/25 bg-cream shadow-[0_24px_64px_-24px_rgba(17,17,17,0.4)] sm:inset-x-auto sm:right-6 sm:bottom-24 sm:h-[480px] sm:max-h-none sm:w-[380px]">
          <div className="relative border-b-[3px] border-terracotta bg-charcoal px-5 py-4 text-cream">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-cream/10">
                <Headphones className="h-5 w-5" strokeWidth={1.75} />
                <span className="absolute right-0.5 bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-charcoal bg-terracotta" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-[family-name:var(--font-outfit)] text-[15px] font-black tracking-[-0.04em]">
                  wrohaus
                  <span className="ml-[0.12em] inline-block h-[0.22em] w-[0.22em] translate-y-[-0.15em] rounded-full bg-terracotta" />
                </p>
                <p className="mt-0.5 text-[12px] font-medium text-cream/70">
                  {t("chat.advisor")}
                </p>
              </div>
            </div>
          </div>

          {!started ? (
            <form
              onSubmit={handleStart}
              className="flex flex-1 flex-col justify-center px-6 py-8"
            >
              <p className="font-serif text-2xl text-charcoal">{t("chat.helpTitle")}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-charcoal/65">
                {t("chat.helpBody")}
              </p>
              <input
                type="text"
                required
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                placeholder={t("chat.namePh")}
                className="mt-6 w-full rounded-full border border-taupe/40 bg-white px-5 py-3.5 text-sm text-charcoal placeholder:text-sand focus:border-charcoal focus:outline-none"
              />
              <button
                type="submit"
                className="mt-3 rounded-full bg-terracotta py-3.5 text-[12px] font-semibold tracking-[0.12em] text-cream uppercase transition-colors hover:bg-terracotta/90"
              >
                {t("chat.start")}
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-cream-light/50 px-4 py-4">
                {(!conversation || conversation.messages.length === 0) && (
                  <p className="rounded-2xl bg-white/80 px-4 py-6 text-center text-sm leading-relaxed text-charcoal/55">
                    {t("chat.empty")}
                  </p>
                )}
                {conversation?.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "visitor" ? "justify-end" : "justify-start"}`}
                  >
                    <ChatMessageContent
                      msg={msg}
                      timeLabel={formatChatTime(msg.createdAt)}
                      senderLabel={msg.sender === "admin" ? t("chat.advisorName") : undefined}
                      visitorId={visitorId}
                      timeClassName={
                        msg.sender === "visitor" ? "text-cream/55" : "text-sand"
                      }
                      bubbleClassName={`max-w-[85%] px-4 py-2.5 text-sm shadow-[0_8px_20px_-16px_rgba(17,17,17,0.35)] ${
                        msg.sender === "visitor"
                          ? "rounded-2xl rounded-br-md bg-charcoal text-cream"
                          : "rounded-2xl rounded-bl-md border border-taupe/20 bg-white text-charcoal"
                      }`}
                    />
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {error && (
                <p className="bg-red-50 px-4 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <form
                onSubmit={handleSend}
                className="flex items-center gap-2 border-t border-taupe/20 bg-cream px-3 py-3"
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
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-taupe/35 bg-white text-charcoal transition-colors hover:bg-cream-light disabled:opacity-40"
                  aria-label={t("chat.attach")}
                >
                  <Paperclip className="h-4 w-4" strokeWidth={2} />
                </button>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={uploading ? t("chat.uploading") : t("chat.placeholder")}
                  className="min-w-0 flex-1 rounded-full border border-taupe/35 bg-white px-4 py-2.5 text-sm text-charcoal placeholder:text-sand focus:border-charcoal focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={busy || !text.trim()}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream transition-colors hover:bg-terracotta/90 disabled:opacity-40"
                  aria-label={t("chat.send")}
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
