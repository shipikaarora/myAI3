"use client";

import Image from "next/image";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Header */}
      <header className="w-full border-b bg-white py-3 px-5 flex items-center gap-3">
        <Image
          src="/bizbuddy-logo.png"
          width={42}
          height={42}
          alt="BizBuddyAI Logo"
        />
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-sm">BizBuddy AI</span>
          <span className="text-xs text-gray-500 tracking-wide">
            MSME Chatbot Solutions
          </span>
        </div>
      </header>

      {/* Chat Scroll Area */}
      <div className="chat-stage">
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "bubble-user" : "bubble-assistant"}>
            {m.content}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSubmit} className="composer">
        <input
          className="composer-input"
          placeholder="Ask anything for your MSME — pricing, marketing, catalog, planning…"
          value={input}
          onChange={handleInputChange}
        />
        <button className="composer-button" type="submit">
          Send
        </button>
      </form>
    </div>
  );
}
