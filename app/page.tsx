"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Plus, Square, Mic, MicOff } from "lucide-react";
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

const formSchema = z.object({
  message: z.string().min(1, "Message cannot be empty.").max(2000),
});

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = () => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { messages: [], durations: {} };
    return JSON.parse(stored);
  } catch {
    return { messages: [], durations: {} };
  }
};

const saveMessagesToStorage = (messages: UIMessage[], durations: Record<string, number>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, durations }));
  } catch {}
};

export default function Chat() {
  const [isClient, setIsClient] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const welcomeMessageShownRef = useRef(false);

  const stored = typeof window !== "undefined" ? loadMessagesFromStorage() : { messages: [], durations: {} };
  const [initialMessages] = useState<UIMessage[]>(stored.messages);

  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: initialMessages,
  });

  // -------------------------
  // VOICE RECORDING STATE
  // -------------------------
  const [isRecording, setIsRecording] = useState(false);
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: BlobPart[] = [];

  // -------------------------
  // START RECORDING
  // -------------------------
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", audioBlob);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const text = data.text;

        if (text && text.trim().length > 0) {
          sendMessage({ text });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop in 5 seconds
      setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setIsRecording(false);
        }
      }, 5000);
    } catch (err) {
      console.error("Voice error: ", err);
    }
  }

  // -------------------------
  // STOP RECORDING MANUALLY
  // -------------------------
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  }

  // -------------------------
  // LOCAL STORAGE + WELCOME MSG
  // -------------------------
  useEffect(() => {
    setIsClient(true);
    setDurations(stored.durations);
    setMessages(stored.messages);
  }, []);

  useEffect(() => {
    if (isClient) saveMessagesToStorage(messages, durations);
  }, [messages, durations, isClient]);

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

  // -------------------------
  // REACT HOOK FORM
  // -------------------------
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const onSubmit = (data: any) => {
    sendMessage({ text: data.message });
    form.reset();
  };

  const clearChat = () => {
    setMessages([]);
    setDurations({});
    saveMessagesToStorage([], {});
    toast.success("Chat cleared");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <main className="w-full dark:bg-black h-screen relative flex flex-col">
        {/* Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background pb-16">
          <ChatHeader>
            <ChatHeaderBlock />
            <ChatHeaderBlock className="justify-center items-center">
              <Avatar className="size-8 ring-1 ring-primary">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <Image src="/logo.png" alt="Logo" width={36} height={36} />
                </AvatarFallback>
              </Avatar>
              <p className="tracking-tight">Chat with {AI_NAME}</p>
            </ChatHeaderBlock>
            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        {/* Messages */}
        <div className="h-screen overflow-y-auto px-5 py-4 pt-[88px] pb-[150px]">
          <MessageWall messages={messages} status={status} durations={durations} onDurationChange={(k, v) => {}} />
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background pt-5 pb-3">
          <div className="max-w-3xl mx-auto w-full px-5">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FieldGroup>
                <Controller
                  name="message"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel className="sr-only">Message</FieldLabel>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Type a message or use voice…"
                          disabled={status === "streaming"}
                          className="h-14 pr-28 pl-5 bg-card rounded-[20px]"
                          autoComplete="off"
                        />

                        {/* Mic Button */}
                        {!isRecording ? (
                          <Button type="button" className="absolute right-14 top-2 rounded-full" size="icon" onClick={startRecording}>
                            <Mic className="size-4" />
                          </Button>
                        ) : (
                          <Button type="button" className="absolute right-14 top-2 rounded-full bg-red-600 text-white" size="icon" onClick={stopRecording}>
                            <MicOff className="size-4" />
                          </Button>
                        )}

                        {/* Send / Stop Buttons */}
                        {status === "ready" || status === "error" ? (
                          <Button type="submit" className="absolute right-3 top-2 rounded-full" size="icon" disabled={!field.value.trim()}>
                            <ArrowUp className="size-4" />
                          </Button>
                        ) : (
                          <Button type="button" className="absolute right-3 top-2 rounded-full" size="icon" onClick={stop}>
                            <Square className="size-4" />
                          </Button>
                        )}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </div>

          <div className="w-full text-center text-xs text-muted-foreground mt-3">
            © {new Date().getFullYear()} {OWNER_NAME} • <Link href="/terms">Terms</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
