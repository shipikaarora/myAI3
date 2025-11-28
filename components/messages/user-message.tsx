import { UIMessage } from "ai";
import { Response } from "@/components/ai-elements/response";

type UserMessageProps = {
  message: UIMessage;
};

/**
 * Renders USER content only.
 * Bubble/background is handled by MessageWall.
 */
export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="text-lg whitespace-pre-wrap leading-relaxed">
      {message.parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <Response key={`${message.id}-${i}`}>
              {part.text}
            </Response>
          );
        }
        return null;
      })}
    </div>
  );
}
