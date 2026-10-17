"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Mail,
  Phone,
  Trash2,
  Inbox,
  MessageSquareText,
} from "lucide-react";
import { AdminHeader } from "@/components/panel/MenuBoczne";
import { formatChatDate } from "@/lib/klientCzatu";
import type { ContactMessage } from "@/lib/typy";

function messagePreview(text: string, max = 72) {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`;
}

export function AdminContact() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/contact");
    if (res.ok) {
      const data: ContactMessage[] = await res.json();
      setMessages(data);
      setSelected((prev) =>
        prev ? data.find((m) => m.id === prev.id) ?? null : null
      );
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === "unread") return messages.filter((m) => !m.read);
    return messages;
  }, [messages, filter]);

  const unreadCount = messages.filter((m) => !m.read).length;

  async function selectMessage(message: ContactMessage) {
    setSelected(message);
    if (!message.read) {
      await fetch(`/api/contact/${message.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "read" }),
      });
      load();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Usunąć tę wiadomość?")) return;
    await fetch(`/api/contact/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    load();
  }

  return (
    <>
      <AdminHeader title="Formularz kontaktowy" />
      <div className="flex min-h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)]">
        {/* Lista */}
        <div
          className={`flex w-full shrink-0 flex-col overflow-y-auto border-r border-taupe/30 bg-white sm:w-80 ${
            selected ? "hidden sm:flex" : "flex"
          }`}
        >
          <div className="border-b border-taupe/30 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-taupe/30 bg-white p-3">
                <p className="text-[10px] text-sand uppercase">Wszystkie</p>
                <p className="mt-1 text-lg font-semibold text-charcoal">
                  {messages.length}
                </p>
              </div>
              <div className="rounded-xl border border-taupe/30 bg-white p-3">
                <p className="text-[10px] text-sand uppercase">Nieprzeczytane</p>
                <p className="mt-1 text-lg font-semibold text-charcoal">
                  {unreadCount}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              {(["all", "unread"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`min-h-[36px] rounded-lg px-3 text-xs transition-colors ${
                    filter === key
                      ? "bg-charcoal text-cream"
                      : "border border-taupe/30 bg-white text-charcoal"
                  }`}
                >
                  {key === "all" ? "Wszystkie" : "Nowe"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <Inbox className="h-10 w-10 text-taupe/60" strokeWidth={1.25} />
                <p className="mt-4 text-sm text-sand">Brak wiadomości</p>
              </div>
            ) : (
              filtered.map((message) => (
                <button
                  key={message.id}
                  type="button"
                  onClick={() => selectMessage(message)}
                  className={`w-full border-b border-taupe/20 px-4 py-4 text-left transition-colors active:bg-cream-light hover:bg-cream-light/80 sm:px-5 ${
                    selected?.id === message.id ? "bg-cream-light" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`truncate text-sm ${message.read ? "font-normal text-charcoal/80" : "font-semibold text-charcoal"}`}
                    >
                      {message.name}
                    </p>
                    {!message.read && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-charcoal" />
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-sand">
                    {message.subject}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-charcoal/60">
                    {messagePreview(message.message)}
                  </p>
                  <p className="mt-2 text-[10px] text-sand">
                    {formatChatDate(message.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Szczegóły */}
        <div
          className={`min-h-0 flex-1 flex-col bg-cream/30 ${
            selected ? "flex" : "hidden sm:flex"
          }`}
        >
          {selected ? (
            <>
              <div className="flex items-center gap-3 border-b border-taupe/30 bg-white px-4 py-3 sm:px-6">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-taupe/30 sm:hidden"
                  aria-label="Wróć do listy"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-charcoal">
                    {selected.subject}
                  </p>
                  <p className="text-xs text-sand">
                    {formatChatDate(selected.createdAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(selected.id)}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg border border-red-200 text-red-600 active:bg-red-50"
                  aria-label="Usuń"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <div className="mx-auto max-w-2xl space-y-6">
                  <div className="rounded-xl border border-taupe/30 bg-white p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <MessageSquareText
                        className="mt-0.5 h-5 w-5 shrink-0 text-sand"
                        strokeWidth={1.5}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-charcoal">{selected.name}</p>
                        <a
                          href={`mailto:${selected.email}`}
                          className="mt-1 inline-flex items-center gap-1.5 text-sm text-charcoal/80 underline-offset-2 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {selected.email}
                        </a>
                        {selected.phone && (
                          <a
                            href={`tel:${selected.phone.replace(/\s/g, "")}`}
                            className="mt-1 flex items-center gap-1.5 text-sm text-charcoal/80"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {selected.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-taupe/20 pt-5">
                      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                        Temat
                      </p>
                      <p className="mt-2 text-sm text-charcoal">{selected.subject}</p>
                    </div>

                    <div className="mt-5 border-t border-taupe/20 pt-5">
                      <p className="text-[10px] tracking-[0.2em] text-sand uppercase">
                        Wiadomość
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-charcoal/85">
                        {selected.message}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-charcoal px-6 py-3 text-sm text-cream transition-colors hover:bg-charcoal/85"
                  >
                    <Mail className="h-4 w-4" />
                    Odpowiedz e-mailem
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
              <Inbox className="h-12 w-12 text-taupe/50" strokeWidth={1.25} />
              <p className="mt-4 font-serif text-xl text-charcoal">
                Wybierz wiadomość
              </p>
              <p className="mt-2 max-w-sm text-sm text-sand">
                Tutaj zobaczysz zapytania wysłane przez formularz kontaktowy na
                stronie sklepu.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
