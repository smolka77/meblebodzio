import Image from "next/image";
import { FileText, Download } from "lucide-react";
import { formatFileSize, isImageMime } from "@/lib/klientCzatu";
import type { ChatMessage } from "@/lib/typy";

interface ChatMessageContentProps {
  msg: ChatMessage;
  timeLabel: string;
  timeClassName?: string;
  senderLabel?: string;
  bubbleClassName: string;
  visitorId?: string;
}

function withVisitorId(url: string, visitorId?: string) {
  if (!visitorId || url.includes("visitorId=")) return url;
  const join = url.includes("?") ? "&" : "?";
  return `${url}${join}visitorId=${encodeURIComponent(visitorId)}`;
}

export function ChatMessageContent({
  msg,
  timeLabel,
  timeClassName = "text-sand",
  senderLabel,
  bubbleClassName,
  visitorId,
}: ChatMessageContentProps) {
  const attachmentUrl = msg.attachment
    ? withVisitorId(msg.attachment.url, visitorId)
    : undefined;

  return (
    <div className={bubbleClassName}>
      {senderLabel && (
        <p className="mb-0.5 text-[9px] font-medium tracking-wide text-sand uppercase">
          {senderLabel}
        </p>
      )}
      {msg.text.trim() && <p className="leading-relaxed">{msg.text}</p>}
      {msg.attachment && attachmentUrl && (
        <div className={msg.text.trim() ? "mt-2" : ""}>
          {isImageMime(msg.attachment.mimeType) ? (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded"
            >
              <Image
                src={attachmentUrl}
                alt={msg.attachment.name}
                width={240}
                height={160}
                className="max-h-40 w-auto object-cover"
                unoptimized
              />
            </a>
          ) : (
            <a
              href={attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={msg.attachment.name}
              className="flex items-center gap-2 rounded border border-current/20 px-3 py-2 text-xs hover:opacity-80"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{msg.attachment.name}</span>
              <span className="shrink-0 opacity-60">
                {formatFileSize(msg.attachment.size)}
              </span>
              <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </a>
          )}
        </div>
      )}
      <p className={`mt-1 text-[9px] ${timeClassName}`}>{timeLabel}</p>
    </div>
  );
}
