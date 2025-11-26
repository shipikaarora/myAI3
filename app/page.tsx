"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Square, Loader2 } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";

// ←←← YE IMPORT ADD KIYA (Sidebar)
import { Sidebar } from "@/app/components/Sidebar";

const formSchema = z.object({
  message: z.string().min(1).max(2000),
});

const STORAGE_KEY = 'chat-messages';

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): { messages: UIMessage[]; durations: Record<string, number> } => {
  if (typeof window === 'undefined') return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    const parsed = JSON.parse(stored);
    return { messages: parsed.messages || [], durations: parsed.durations || {} };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, durations }));
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error);
  }
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef<boolean>(false);

  const stored = typeof window !== 'undefined' ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) saveMessagesToStorage(messages, durations);
  }, [durations, messages, isClient]);

  const handleDurationChange = (key: string, duration: number) => {
    setDurations(prev => ({ ...prev, [key]: duration }));
  };

  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcomeMessage]);
      saveMessagesToStorage([welcomeMessage], {});
      welcomeMessageShownRef.current = true;
    }
  }, [isClient, initialMessages.length, setMessages]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
  }

  function clearChat() {
    setMessages([]);
    setDurations({});
    saveMessagesToStorage([], {});
    toast.success("Chat cleared");
  }

  return (
    <div className="flex h-screen font-sans">
      {/* ←←← LEFT SIDEBAR */}
      <Sidebar />

      {/* ←←← MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 relative overflow-hidden">
          {/* Header */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-orange-50 to-orange-50/90 backdrop-blur-sm border-b border-orange-200">
            <ChatHeader>
              <ChatHeaderBlock />
              <ChatHeaderBlock className="justify-center items-center gap-3">
                <Avatar className="size-9 ring-2 ring-orange-600">
                  <AvatarImage src="/logo.png" />
                  <AvatarFallback>
                    <Image src="/logo.png" alt="Logo" width={40} height={40} />
                  </AvatarFallback>
                </Avatar>
                <p className="text-lg font-bold text-orange-800">Chat with {AI_NAME}</p>
              </ChatHeaderBlock>
              <ChatHeaderBlock className="justify-end">
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <PlusIcon className="size-4" />
                  {CLEAR_CHAT_TEXT}
                </Button>
              </ChatHeaderBlock>
            </ChatHeader>
          </div>

          {/* Messages */}
          <div className="h-full overflow-y-auto px-5 py-4 pt-[88px] pb-[150px]">
            <div className="max-w-4xl mx-auto">
              {isClient ? (
                <>
                  <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
                  {status === "submitted" && (
                    <div className="flex justify-start">
                      <Loader2 className="size-5 animate-spin text-orange-600" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center py-20">
                  <Loader2 className="size-8 animate-spin text-orange-600" />
                </div>
              )}
            </div>
          </div>

          {/* Input Box */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-orange-50 via-orange-50/95 to-transparent">
            <div className="max-w-4xl mx-auto px-5 pt-5 pb-8">
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup>
                  <Controller
                    name="message"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="यहाँ अपना सवाल पूछें... (GST, Loan, Udyam Registration)"
                            className="h-16 pr-16 pl-6 text-lg rounded-3xl shadow-2xl border-2 border-orange-300 focus:border-orange-500 bg-white/90"
                            disabled={status === "streaming"}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />
                          {(status === "ready" || status === "error") && (
                            <Button
                              type="submit"
                              disabled={!field.value?.trim()}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full size-12 bg-orange-600 hover:bg-orange-700"
                            >
                              <ArrowUp className="size-6" />
                            </Button>
                          )}
                          {(status === "streaming" || status === "submitted") && (
                            <Button
                              type="button"
                              onClick={stop}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full size-12 bg-red-600 hover:bg-red-700"
                            >
                              <Square className="size-6" />
                            </Button>
                          )}
                        </div>
                      </Field>
                    )}
                  />
                </FieldGroup>
              </form>

              <div className="text-center mt-4 text-sm text-orange-700 font-medium">
                © {new Date().getFullYear()} {OWNER_NAME} •{" "}
                <Link href="/terms" className="underline">Terms</Link> • Powered by{" "}
                <Link href="https://ringel.ai" className="underline">Ringel.AI</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
