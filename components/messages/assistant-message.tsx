import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";

type Props = {
  message: UIMessage;
  status?: string;
  isLastMessage?: boolean;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
};

/**
 * Renders the ASSISTANT content (text, reasoning, tools).
 * NOTE: This component does NOT render bubble/background.
 * Bubble styling is handled in MessageWall.
 */
export function AssistantMessage({
  message,
  status,
  isLastMessage,
  durations = {},
  onDurationChange,
}: Props) {
  return (
    <div className="text-sm flex flex-col gap-3 whitespace-pre-wrap leading-relaxed">
      {message.parts.map((part, i) => {
        const isStreaming =
          status === "streaming" &&
          isLastMessage &&
          i === message.parts.length - 1;

        const durationKey = `${message.id}-${i}`;
        const duration = durations[durationKey];

        if (part.type === "text") {
          return (
            <Response key={durationKey}>
              {part.text}
            </Response>
          );
        }

        if (part.type === "reasoning") {
          return (
            <ReasoningPart
              key={durationKey}
              part={part}
              isStreaming={isStreaming}
              duration={duration}
              onDurationChange={
                onDurationChange
                  ? (d) => onDurationChange(durationKey, d)
                  : undefined
              }
            />
          );
        }

        if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
          if ("state" in part && part.state === "output-available") {
            return (
              <ToolResult
                key={durationKey}
                part={part as unknown as ToolResultPart}
              />
            );
          }

          return (
            <ToolCall
              key={durationKey}
              part={part as unknown as ToolCallPart}
            />
          );
        }

        return null;
      })}
    </div>
  );
}
