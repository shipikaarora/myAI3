import { Message } from "ai";

export function UserMessage({ message }: { message: Message }) {
  return (
    <div className="bubble-user">
      {message.content}
    </div>
  );
}
