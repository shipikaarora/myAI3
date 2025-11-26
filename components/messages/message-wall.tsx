import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import { Info } from "lucide-react";

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

function getPlainText(message: UIMessage): string {
  return (
    message.parts
      ?.map((p) => (p.type === "text" ? p.text : ""))
      .join(" ") || ""
  );
}

type Props = {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
};

/**
 * Main chat wall:
 * - Handles bubble layout & colours
 * - Scrolls to bottom on new message
 * - Highlights important assistant messages
 */
export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative max-w-3xl w-full mx-auto px-3">
      {/* Soft top fade */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

      <div className="flex flex-col gap-6 py-4">
        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          const plainText = getPlainText(message);
          const isImportant =
            isAssistant &&
            IMPORTANT_KEYWORDS.some((k) =>
              plainText.toLowerCase().includes(k)
            );

          // bubble colour classes
          const baseClasses = isAssistant
            ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 border border-slate-200/70 dark:border-slate-700/70"
            : "bg-indigo-500 text-white shadow-md";

          const importantClasses = isImportant
            ? "border-2 border-yellow-500 bg-yellow-50 dark:bg-yellow-900 text-black dark:text-yellow-100 shadow-lg"
            : "";

          return (
            <div
              key={message.id}
              className={`flex w-full ${
                isAssistant ? "justify-start" : "justify-end"
              }`}
              onMouseEnter={() => setHoveredId(message.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`
                  max-w-[80%] rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm
                  ${baseClasses} ${importantClasses}
                `}
              >
                {isImportant && (
                  <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-yellow-700 dark:text-yellow-200">
                    <Info className="h-3 w-3" />
                    Important
                  </div>
                )}

                <div className={isImportant ? "underline underline-offset-4" : ""}>
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

        {/* Typing indicator */}
        {status === "submitted" && (
          <div className="flex items-center gap-2 pl-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Soft bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
