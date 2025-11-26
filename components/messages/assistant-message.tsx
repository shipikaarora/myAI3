import { UIMessage } from "ai";

export function AssistantMessage({ message }: { message: UIMessage }) {
  const text =
    message.parts?.map((p) => (p.type === "text" ? p.text : "")).join(" ") ||
    "";

  return (
    <div className="whitespace-pre-wrap leading-relaxed text-[15px] text-foreground/90">
      {text}
    </div>
  );
}
