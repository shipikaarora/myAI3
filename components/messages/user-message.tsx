import { UIMessage } from "ai";
import { Response } from "@/components/ai-elements/response";

type Props = {
  message: UIMessage;
};

/**
 * Renders the USER content only.
 * Bubble/background is handled in MessageWall.
 */
export function UserMessage({ message }: Props) {
  return (
    <div className="text-sm whitespace-pre-wrap leading-relaxed">
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
