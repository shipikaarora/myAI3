import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { UserMessage } from "./user-message";
import { AssistantMessage } from "./assistant-message";
import { Copy, Volume2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

// Keywords for “important” messages
const IMPORTANT_KEYWORDS = [
  "eligible",
  "not eligible",
  "important",
  "warning",
  "note:",
  "note -",
  "required",
  "must",
  "deadline",
  "action needed",
  "critical",
  "approved",
  "rejected",
  "attention"
];

export function MessageWall({
  messages,
  status,
  durations,
  onDurationChange,
  lastBotAudioURL,
}: {
  messages: UIMessage[];
  status?: string;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
  lastBotAudioURL?: string | null;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyMessage = (text: string) => navigator.clipboard.writeText(text);

  const playAudio = () => {
    if (lastBotAudioURL) new Audio(lastBotAudioURL).play();
  };

  const isImportant = (text: string) =>
    IMPORTANT_KEYWORDS.some(k => text.toLowerCase().includes(k));

  return (
    <div className="relative max-w-3xl mx-auto w-full px-3">
      
      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10" />

      <div className="flex flex-col gap-6 py-4">

        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant";
          const textContent =
            msg.parts?.map((p) => (p.type === "text" ? p.text : "")).join(" ") || "";

          const important = isImportant(textContent);

          return (
            <div
              key={msg.id}
              className="relative group animate-fade-slide"
              onMouseEnter={() => setHover(msg.id)}
              onMouseLeave={() => setHover(null)}
            >
              {/* CHAT BUBBLE */}
              <div
                className={`
                  px-5 py-3 rounded-2xl w-fit max-w-[90%]
                  transition-all shadow-sm backdrop-blur-sm

                  ${isAssistant
                    ? "bg-[#f1f5f9] dark:bg-[#1f2937] border border-border text-foreground"
                    : "ml-auto bg-[#6366f1] text-white shadow-md"
                  }

                  ${important && isAssistant
                    ? "border border-yellow-500 bg-yellow-100 dark:bg-yellow-900 text-black dark:text-yellow-100 shadow-lg"
                    : ""
                  }
                `}
              >
                {/* Highlight header for important messages */}
                {important && isAssistant && (
                  <div className="flex items-center gap-1 mb-1 text-yellow-700 dark:text-yellow-200 font-semibold">
                    <Info className="h-4 w-4" />
                    Important
                  </div>
                )}

                {/* Underline important parts inside text */}
                <div className={important ? "underline underline-offset-4" : ""}>
                  {isAssistant ? (
                    <AssistantMessage
                      message={msg}
                      status={status}
                      isLastMessage={index === messages.length - 1}
                      durations={durations}
                      onDurationChange={onDurationChange}
                    />
                  ) : (
                    <UserMessage message={msg} />
                  )}
                </div>
              </div>

              {/* HOVER TOOLBAR */}
              {hover === msg.id && (
                <div
                  className={`absolute -top-3 ${
                    isAssistant ? "left-2" : "right-2"
                  } flex gap-1`}
                >
                  {/* Copy */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full shadow bg-background/70 border"
                    onClick={() => copyMessage(textContent)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>

                  {/* Replay Voice */}
                  {isAssistant && lastBotAudioURL && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full shadow bg-background/70 border"
                      onClick={playAudio}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing dots */}
        {status === "submitted" && (
          <div className="flex items-center gap-2 pl-2">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-150" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-300" />
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
