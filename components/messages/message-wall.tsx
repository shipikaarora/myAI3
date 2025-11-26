import { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

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
  onQuickReply?: (text: string) => void; // optional hook for quick-reply buttons
};

/**
 * MessageWall
 * - Solid background
 * - Different bubbles for user vs assistant
 * - Highlights important assistant messages
 * - Day separators + timestamps
 * - Optional checklist and quick-reply chips
 */
export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
  onQuickReply,
}: MessageWallProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // find global index of last assistant message
  const lastAssistantIndexReversed = [...messages].reverse().findIndex(
    (m) => m.role === "assistant"
  );
  const lastAssistantIndex =
    lastAssistantIndexReversed === -1
      ? -1
      : messages.length - 1 - lastAssistantIndexReversed;

  let lastDayLabel: string | null = null;

  return (
    <div className="relative max-w-3xl w-full mx-auto">
      {/* Outer container with solid background */}
      <div className="relative rounded-3xl bg-background dark:bg-background shadow-sm border border-border px-3 py-4 md:px-5 md:py-6 overflow-hidden">
        {/* Top soft fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background/90 to-transparent" />

        <div className="flex flex-col gap-4 relative z-10">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            const plainText = getPlainText(message);
            const isImportant =
              isAssistant &&
              IMPORTANT_KEYWORDS.some((k) =>
                plainText.toLowerCase().includes(k)
              );

            const checklistItems = extractChecklist(plainText);
            const msgDate = getMessageDate(message);
            const timeLabel = formatTimeLabel(msgDate);
            const isLastAssistant = index === lastAssistantIndex;

            // Day separator
            let daySeparator: ReactNode = null;
            if (msgDate) {
              const currentDayLabel = formatDayLabel(msgDate);
              if (currentDayLabel !== lastDayLabel) {
                lastDayLabel = currentDayLabel;
                daySeparator = (
                  <div className="flex justify-center my-2">
                    <div className="px-3 py-1 rounded-full text-[11px] bg-slate-200/70 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-sm">
                      {currentDayLabel}
                    </div>
                  </div>
                );
              }
            }

            const rowClass = isAssistant
              ? "justify-start"
              : "justify-end";

            const baseBubbleClass = isAssistant
              ? "bg-slate-50/90 dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200/80 dark:border-slate-700/70"
              : "bg-indigo-500 text-white shadow-md";

            const importantClass = isImportant
              ? "border-2 border-yellow-500 bg-yellow-50/95 dark:bg-yellow-900 text-black dark:text-yellow-100 shadow-lg"
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
                      <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-yellow-700 dark:text-yellow-200">
                        <Info className="h-3 w-3" />
                        Important
                      </div>
                    )}

                    {/* Main content */}
                    <div
                      className={
                        isImportant ? "underline underline-offset-4" : ""
                      }
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
                      <div className="mt-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/70 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                        <div className="font-semibold mb-1">
                          Action items
                        </div>
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
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 flex justify-end">
                        {timeLabel}
                      </div>
                    )}

                    {/* Quick replies under LAST assistant message only */}
                    {isAssistant && isLastAssistant && onQuickReply && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {[
                          "Summarize this in simpler words",
                          "Give me a step-by-step checklist",
                          "Explain this in Hindi",
                        ].map((chip) => (
                          <Button
                            key={chip}
                            type="button"
                            variant="outline"
                            size="xs"
                            className="h-6 text-[11px] rounded-full border-slate-300/70 dark:border-slate-600/70 bg-white/70 dark:bg-slate-900/70"
                            onClick={() => onQuickReply(chip)}
                          >
                            {chip}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {status === "submitted" && (
            <div className="flex items-center gap-2 pl-2 mt-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Bottom soft fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
    </div>
  );
}
