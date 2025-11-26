import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
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
];

type MessageWallProps = {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
};

// Helper to extract plain text from a UIMessage
function getPlainText(message: UIMessage): string {
  return (
    message.parts
      ?.map((p) => (p.type === "text" ? p.text : ""))
      .join(" ") || ""
  );
}

/**
 * MessageWall
 * - Gradient background container
 * - Different colours for user vs assistant
 * - Highlights important assistant messages
 * - Auto-scrolls on new messages
 */
export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
}: MessageWallProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative max-w-3xl w-full mx-auto">
      {/* Gradient background for the whole wall */}
      <div className="rounded-3xl bg-gradient-to-b from-[#fdfcfb] via-[#f7f8ff] to-[#eef6ff] dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-sm border border-white/40 dark:border-slate-800/60 px-3 py-4 md:px-5 md:py-6">
        {/* Soft top fade */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-background to-transparent rounded-t-3xl" />

        <div className="flex flex-col gap-6 relative z-10">
          {messages.map((message, index) => {
            const isAssistant = message.role === "assistant";
            const plainText = getPlainText(message);
            const isImportant =
              isAssistant &&
              IMPORTANT_KEYWORDS.some((k) =>
                plainText.toLowerCase().includes(k)
              );

            // Alignment
            const rowClass = isAssistant
              ? "justify-start"
              : "justify-end";

            // Bubble base colour
            const baseBubbleClass = isAssistant
              ? "bg-slate-50/90 dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200/80 dark:border-slate-700/70"
              : "bg-indigo-500 text-white shadow-md";

            // Extra highlight for important messages
            const importantClass = isImportant
              ? "border-2 border-yellow-500 bg-yellow-50/95 dark:bg-yellow-900 text-black dark:text-yellow-100 shadow-lg"
              : "";

            return (
              <div
                key={message.id}
                className={`flex w-full ${rowClass}`}
                onMouseEnter={() => setHoveredId(message.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
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
                </div>
              </div>
            );
          })}

          {/* Typing indicator for assistant */}
          {status === "submitted" && (
            <div className="flex items-center gap-2 pl-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Soft bottom fade (inside gradient) */}
        <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-10 bg-gradient-to-t from-background/80 to-transparent rounded-b-3xl" />
      </div>
    </div>
  );
}
