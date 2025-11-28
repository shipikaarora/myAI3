import { UIMessage, ToolCallPart, ToolResultPart } from "ai";
import { Response } from "@/components/ai-elements/response";
import { ReasoningPart } from "./reasoning-part";
import { ToolCall, ToolResult } from "./tool-call";

type AssistantMessageProps = {
  message: UIMessage;
  status?: string;
  isLastMessage?: boolean;
  durations?: Record<string, number>;
  onDurationChange?: (key: string, duration: number) => void;
};

/**
 * Renders ASSISTANT content (text, reasoning, tool calls/results).
 * Bubble/background is handled by MessageWall, not here.
 */
export function AssistantMessage({
  message,
  status,
  isLastMessage,
  durations = {},
  onDurationChange,
}: AssistantMessageProps) {
  return (
    <div className="text-lg flex flex-col gap-3 whitespace-pre-wrap leading-relaxed">
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
