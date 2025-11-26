import { Message } from "ai";

export function AssistantMessage({ message }: { message: Message }) {
  return (
    <div className="bubble-assistant">
      {message.content}
    </div>
  );
}
