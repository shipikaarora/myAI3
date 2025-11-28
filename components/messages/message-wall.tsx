// components/messages/message-wall.tsx

import type { ReactNode } from "react";
import type { UIMessage } from "ai";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const IMPORTANT_KEYWORDS = [
  "eligible",
  "not eligible",
  "important",
  "warning",
  "note",
  "must",
  "required",
  "deadline",
  "critical",
  "attention",
  "rejected",
  "approved",
  "documents",
  "action needed",
  "action items",
];

// Extract plain text from a UIMessage
function getPlainText(message: UIMessage): string {
  return (
    message.parts
      ?.map((p) => (p.type === "text" ? p.text : ""))
      .join(" ") || ""
  );
}

// Extract simple checklist items from text after "Action items"
function extractChecklist(text: string): string[] {
  const idx = text.toLowerCase().indexOf("action items");
  if (idx === -1) return [];

  const after = text.slice(idx).split("\n");
  const items: string[] = [];

  for (const line of after) {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      items.push(trimmed.replace(/^[-•]\s*/, ""));
    }
  }

  return items;
}

// Try to read timestamp from message
function getMessageDate(message: UIMessage): Date | null {
  const anyMsg = message as any;
  const ts = anyMsg.createdAt || anyMsg.timestamp;
  if (!ts) return null;
  try {
    return new Date(ts);
  } catch {
    return null;
  }
}

// Day label (“Today”, “Yesterday”, or date)
function formatDayLabel(date: Date): string {
  const today = new Date();
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffDays = (d.getTime() - t.getTime()) / (1000 * 60 * 60 * 24);

  if (diffDays === 0) return "Today";
  if (diffDays === -1) return "Yesterday";

  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Time label “HH:MM”
function formatTimeLabel(date: Date | null): string | null {
  if (!date) return null;
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

type MessageWallProps = {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
  // onQuickReply is kept optional for future, but we don't render chips anymore
  onQuickReply?: (text: string) => void;
};

/**
 * MessageWall
 * - No internal auto-scroll (scroll is handled in page.tsx)
 * - Different bubbles for user vs assistant
 * - Highlights important assistant messages
 * - Day separators + timestamps
 * - Optional checklist extraction
 */
export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
}: MessageWallProps) {
  // find global index of last assistant message (in case you want to style it)
  const lastAssistantIndexReversed = [...messages].reverse().findIndex(
    (m) => m.role === "assistant",
  );
  const lastAssistantIndex =
    lastAssistantIndexReversed === -1
      ? -1
      : messages.length - 1 - lastAssistantIndexReversed;

  let lastDayLabel: string | null = null;

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Soft fade at top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background/80 to-transparent" />

        <div className="relative z-10 flex flex-col gap-4">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            const plainText = getPlainText(message);
            const isImportant =
              isAssistant &&
              IMPORTANT_KEYWORDS.some((k) =>
                plainText.toLowerCase().includes(k),
              );

            const checklistItems = extractChecklist(plainText);
            const msgDate = getMessageDate(message);
            const timeLabel = formatTimeLabel(msgDate);
            const _isLastAssistant = index === lastAssistantIndex;

            // Day separator
            let daySeparator: ReactNode = null;
            if (msgDate) {
              const currentDayLabel = formatDayLabel(msgDate);
              if (currentDayLabel !== lastDayLabel) {
                lastDayLabel = currentDayLabel;
                daySeparator = (
                  <div className="my-2 flex justify-center">
                    <div className="rounded-full bg-slate-200/70 px-3 py-1 text-base text-slate-600 shadow-sm dark:bg-slate-800/80 dark:text-slate-300">
                      {currentDayLabel}
                    </div>
                  </div>
                );
              }
            }

            const rowClass = isAssistant ? "justify-start" : "justify-end";

            const baseBubbleClass = isAssistant
              ? "bg-slate-50/90 text-slate-900 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700/70"
              : "bg-indigo-500 text-white shadow-md";

            const importantClass = isImportant
              ? "border-2 border-yellow-500 bg-yellow-50/95 text-black shadow-lg dark:bg-yellow-900 dark:text-yellow-100"
              : "";

            return (
              <div key={message.id}>
                {daySeparator}

                <div className={`flex w-full ${rowClass}`}>
                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-3
                      backdrop-blur-sm transition-all duration-150
                      ${baseBubbleClass} ${importantClass}
                    `}
                  >
                    {/* Important badge */}
                    {isImportant && (
                      <div className="mb-1 flex items-center gap-1 text-base font-semibold text-yellow-700 dark:text-yellow-200">
                        <Info className="h-3 w-3" />
                        Important
                      </div>
                    )}

                    {/* Main content */}
                    <div
                      className={isImportant ? "underline underline-offset-4" : ""}
                    >
                      {isAssistant ? (
                        <AssistantMessage
                          message={message}
                          status={status}
                          isLastMessage={index === messages.length - 1}
                          durations={durations}
                          onDurationChange={onDurationChange}
                        />
                      ) : (
                        <UserMessage message={message} />
                      )}
                    </div>

                    {/* Checklist (optional) */}
                    {checklistItems.length > 0 && (
                      <div className="mt-3 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-base text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-200">
                        <div className="mb-1 font-semibold">Action items</div>
                        <ul className="space-y-1">
                          {checklistItems.map((item, idx) => (
                            <li
                              key={`${message.id}-item-${idx}`}
                              className="flex items-start gap-2"
                            >
                              <span className="mt-[3px] inline-block h-2 w-2 rounded-full bg-emerald-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Timestamp */}
                    {timeLabel && (
                      <div className="mt-1 flex justify-end text-base text-slate-500 dark:text-slate-400">
                        {timeLabel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {status === "submitted" && (
            <div className="mt-1 flex items-center gap-2 pl-2">
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-150" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-300" />
            </div>
          )}

          {/* Spacer at bottom */}
          <div />
        </div>

        {/* Bottom soft fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
    </div>
  );
}
