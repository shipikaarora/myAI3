"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, Bot, Sparkles } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";

import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import {
  AI_NAME,
  CLEAR_CHAT_TEXT,
  OWNER_NAME,
  WELCOME_MESSAGE,
} from "@/config";
import Link from "next/link";
import { Sidebar } from "@/app/components/Sidebar";

// ------------------ Validation ------------------

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

// ------------------ Local storage helpers ------------------

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): {
  messages: UIMessage[];
  durations: Record<string, number>;
} => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    const parsed = JSON.parse(stored);
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error("Failed to load messages from localStorage:", error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (
  messages: UIMessage[],
  durations: Record<string, number>
) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

// ------------------ Page component ------------------

export default function Chat() {
  // Welcome music – plays once on first click/tap
  const [hasPlayedMusic, setHasPlayedMusic] = useState(false);

  useEffect(() => {
    if (hasPlayedMusic) return;

    const playMusic = () => {
      if (hasPlayedMusic) return;

      const audio = new Audio("/welcome-music.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});

      setTimeout(() => audio.pause(), 30000); // 30 seconds max
      setHasPlayedMusic(true);
    };

    const handleFirstClick = () => {
      playMusic();
      document.removeEventListener("click", handleFirstClick);
      document.removeEventListener("touchstart", handleFirstClick);
    };

    document.addEventListener("click", handleFirstClick);
    document.addEventListener("touchstart", handleFirstClick);

    return () => {
      document.removeEventListener("click", handleFirstClick);
      document.removeEventListener("touchstart", handleFirstClick);
    };
  }, [hasPlayedMusic]);

  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored =
    typeof window !== "undefined"
      ? loadMessagesFromStorage()
      : { messages: [], durations: {} };

  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => ({
      ...prevDurations,
      [key]: duration,
    }));
  };

  // Inject welcome message if nothing in history
  useEffect(() => {
    if (
      isClient &&
      initialMessages.length === 0 &&
      !welcomeMessageShownRef.current
    ) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`, // FIXED: proper string id
        role: "assistant",
        parts: [
          {
            type: "text",
            text: WELCOME_MESSAGE,
          },
        ],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations: Record<string, number> = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #fff7ed, #ffedd5, #ffe4e6), url(/bg-pattern.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto, 400px",
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
        {/* LEFT: Sidebar */}
        <Sidebar />

        {/* RIGHT: Chat Area */}
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6 flex items-stretch">
          <div className="flex h-full w-full flex-col items-center justify-center">
            {/* Chat Shell Card */}
            <div className="flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col rounded-3xl border border-orange-100 bg-white/75 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur">
              {/* HEADER */}
              <header className="flex items-center justify-between border-b border-orange-100 px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-md">
                      <Bot className="h-5 w-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Chat with {AI_NAME}
                    </h2>
                    <p className="text-xs text-slate-500">
                      MSME schemes & documentation — simple, practical answers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700 md:flex">
                    <Sparkles className="mr-1 h-3 w-3" />
                    Powered by AI + MSME rules
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer rounded-full border-orange-200 text-xs"
                    onClick={clearChat}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {CLEAR_CHAT_TEXT}
                  </Button>
                </div>
              </header>

              {/* MESSAGES */}
              <div className="flex-1 overflow-y-auto px-4 py-3 md:px-6 md:py-4">
                <div className="flex flex-col items-center justify-end min-h-full">
                  {isClient ? (
                    <>
                      <MessageWall
                        messages={messages}
                        status={status}
                        durations={durations}
                        onDurationChange={handleDurationChange}
                      />
                      {status === "submitted" && (
                        <div className="mt-2 flex w-full max-w-3xl justify-start">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex w-full max-w-2xl justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </div>

              {/* INPUT BAR */}
              <div className="border-t border-orange-100 bg-white/90 px-4 py-3 md:px-6 md:py-4">
                <form id="chat-form" onSubmit={form.handleSubmit(onSubmit)}>
                  <FieldGroup>
                    <Controller
                      name="message"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel
                            htmlFor="chat-form-message"
                            className="sr-only"
                          >
                            Message
                          </FieldLabel>
                          <div className="relative">
                            <Input
                              {...field}
                              id="chat-form-message"
                              className="h-12 rounded-2xl bg-orange-50/70 pr-14 pl-4 text-sm placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-300"
                              placeholder="Type your question… e.g., “Can I get CGTMSE for a ₹20L machinery loan?”"
                              disabled={status === "streaming"}
                              aria-invalid={fieldState.invalid}
                              autoComplete="off"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  form.handleSubmit(onSubmit)();
                                }
                              }}
                            />
                            {(status === "ready" || status === "error") && (
                              <Button
                                className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md hover:from-orange-600 hover:to-rose-500"
                                type="submit"
                                disabled={!field.value.trim()}
                                size="icon"
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                            )}
                            {(status === "streaming" ||
                              status === "submitted") && (
                              <Button
                                className="absolute right-1.5 top-1.5 h-9 w-9 rounded-full"
                                size="icon"
                                type="button"
                                onClick={() => {
                                  stop();
                                }}
                              >
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          {fieldState.error && (
                            <p className="mt-1 text-[11px] text-rose-500">
                              {fieldState.error.message}
                            </p>
                          )}
                        </Field>
                      )}
                    />
                  </FieldGroup>
                </form>
                <p className="mt-2 text-[10px] text-slate-400">
                  Tip: Rough ranges (turnover, amount, years) are enough – you
                  don’t need exact figures.
                </p>
              </div>
            </div>

            {/* FOOTER SMALL LINE */}
            <div className="mt-4 flex items-center justify-center text-[11px] text-slate-400">
              © {new Date().getFullYear()} {OWNER_NAME}&nbsp;
              <Link href="/terms" className="underline">
                Terms of Use
              </Link>
              &nbsp;Powered by&nbsp;
              <Link href="https://ringel.ai/" className="underline">
                Ringel.AI
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
