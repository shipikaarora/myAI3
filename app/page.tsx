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
import { ArrowUp, Eraser, Loader2, Plus, PlusIcon, Square } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/app/components/Sidebar";
import { BadgeIndianRupee, FileText, ScrollText } from "lucide-react";
const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
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
    return {
      messages: parsed.messages || [],
      durations: parsed.durations || {},
    };
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error);
    return { messages: [], durations: {} };
  }
};
const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === 'undefined') return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    if (isClient) {
      saveMessagesToStorage(messages, durations);
    }
  }, [durations, messages, isClient]);
  const handleDurationChange = (key: string, duration: number) => {
    setDurations((prevDurations) => {
      const newDurations = { ...prevDurations };
      newDurations[key] = duration;
      return newDurations;
    });
  };
  useEffect(() => {
    if (isClient && initialMessages.length === 0 && !welcomeMessageShownRef.current) {
      const welcomeMessage: UIMessage = {
        id: `welcome-${Date.now()}`,
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
    const newDurations = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }
 return (
  <div className="flex h-screen font-sans bg-gradient-to-br from-orange-50 via-white to-green-50">
    
    {/* ←←← OFFICIAL TRICOLOR TOP BAR */}
    <div className="fixed top-0 left-0 right-0 z-50 h-24 bg-gradient-to-r from-orange-500 via-white to-green-500 shadow-2xl flex items-center justify-center gap-8">
      <img src="/ashoka.png" alt="Ashoka Chakra" className="w-16 h-16 animate-spin-slow" />
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 drop-shadow-lg">उद्योग मित्र</h1>
        <p className="text-lg font-bold text-blue-800">Udyog Mitra – आपका MSME साथी</p>
      </div>
      <img src="/ashoka.png" alt="Ashoka Chakra" className="w-16 h-16 animate-spin-slow" />
    </div>

    {/* Sidebar + Chat (tumhara purana wala) */}
    <Sidebar />
    <div className="flex-1 flex flex-col pt-24">
      <main className="flex-1 relative overflow-hidden bg-white/90">
        <div className="fixed top-24 left-0 right-0 z-40 bg-orange-100 border-b-4 border-orange-400 shadow-lg">
          <ChatHeader>
            <ChatHeaderBlock className="justify-center gap-3">
              <BadgeIndianRupee className="size-8 text-orange-700" />
              <p className="text-xl font-bold text-orange-900">MSME सहायता केंद्र</p>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        <div className="h-full overflow-y-auto px-5 py-4 pt-20 pb-40">
          <div className="max-w-4xl mx-auto">
            {isClient ? (
              <>
                <MessageWall messages={messages} status={status} durations={durations} onDurationChange={handleDurationChange} />
              </>
            ) : (
              <div className="flex justify-center py-32">
                <Loader2 className="size-12 animate-spin text-orange-600" />
              </div>
            )}
          </div>
        </div>

        {/* Input Box */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-orange-100 to-transparent p-5">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="relative">
                <Input
                  {...form.register("message")}
                  placeholder="यहाँ अपना सवाल पूछें... उदाहरण: Udyam Registration कैसे करें?"
                  className="h-16 pl-6 pr-20 text-lg rounded-full shadow-2xl border-4 border-orange-400 focus:border-orange-600 bg-white"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full size-14 bg-orange-600 hover:bg-orange-700"
                >
                  <ArrowUp className="size-8" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  </div>
);
