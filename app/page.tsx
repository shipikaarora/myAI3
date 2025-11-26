"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useChat } from "@ai-sdk/react";
import { ArrowUp, Loader2, Mic, MicOff, Plus, Square, Volume2 } from "lucide-react";
import { MessageWall } from "@/components/messages/message-wall";
import { ChatHeader } from "@/app/parts/chat-header";
import { ChatHeaderBlock } from "@/app/parts/chat-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { AI_NAME, CLEAR_CHAT_TEXT, OWNER_NAME, WELCOME_MESSAGE } from "@/config";
import Image from "next/image";
import Link from "next/link";
import { Sidebar } from "@/app/components/Sidebar";

const formSchema = z.object({
  message: z.string().min(1).max(2000),
});

// Local storage
const STORAGE_KEY = "chat-messages";

// Load stored messages
const loadMessages = () => {
  if (typeof window === "undefined") return { messages: [], durations: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { messages: [], durations: {} };
    return JSON.parse(raw);
  } catch {
    return { messages: [], durations: {} };
  }
};

// Save stored messages
const saveMessages = (messages: UIMessage[], durations: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, durations }));
};

export default function ChatPage() {
  const [isClient, setIsClient] = useState(false);
  const welcomeShown = useRef(false);
  const stored = typeof window !== "undefined" ? loadMessages() : { messages: [], durations: {} };

  // useChat handler from ai-sdk
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    messages: stored.messages,
  });

  const [durations, setDurations] = useState(stored.durations);

  useEffect(() => {
    setIsClient(true);
    setMessages(stored.messages);
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (isClient) saveMessages(messages, durations);
  }, [messages, durations, isClient]);

  // Show welcome message if needed
  useEffect(() => {
    if (isClient && messages.length === 0 && !welcomeShown.current) {
      const welcome: UIMessage = {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
      };
      setMessages([welcome]);
      saveMessages([welcome], {});
      welcomeShown.current = true;
    }
  }, [isClient, messages.length]);

  // react-hook-form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { message: "" },
  });

  const handleOnSubmit = (data: any) => {
    sendMessage({ text: data.message });
    form.reset();
  };

  // ===========================
  // VOICE RECORDING LOGIC
  // ===========================
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const lastAudioURL = useRef<string | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

        // Playable audio URL (for user playback)
        lastAudioURL.current = URL.createObjectURL(audioBlob);

        const formData = new FormData();
        formData.append("file", audioBlob);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.text && data.text.trim()) {
          sendMessage({ text: data.text });
        }
      };

      recorder.start();
      setIsRecording(true);

      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
        setIsRecording(false);
      }, 5000);
    } catch (err) {
      console.error("Mic permission error:", err);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
    setIsRecording(false);
  };

  // Play back last audio note
  const playAudio = () => {
    if (lastAudioURL.current) {
      new Audio(lastAudioURL.current).play();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setDurations({});
    saveMessages([], {});
    toast.success("Chat cleared");
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 h-screen relative dark:bg-black">
        {/* HEADER */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background pb-16">
          <ChatHeader>
            <ChatHeaderBlock />
            <ChatHeaderBlock className="justify-center items-center">
              <Avatar className="size-8 ring-1 ring-primary">
                <AvatarImage src="/logo.png" />
                <AvatarFallback>
                  <Image src="/logo.png" width={36} height={36} alt="Logo" />
                </AvatarFallback>
              </Avatar>
              <p>Chat with {AI_NAME}</p>
            </ChatHeaderBlock>
            <ChatHeaderBlock className="justify-end">
              <Button variant="outline" size="sm" onClick={clearChat}>
                <Plus className="size-4" />
                {CLEAR_CHAT_TEXT}
              </Button>
            </ChatHeaderBlock>
          </ChatHeader>
        </div>

        {/* MESSAGES */}
        <div className="h-screen overflow-y-auto px-5 py-4 pt-[88px] pb-[150px]">
          <MessageWall messages={messages} status={status} durations={durations} onDurationChange={() => {}} />
        </div>

        {/* INPUT + MIC */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background pt-5 pb-3">
          <div className="max-w-3xl mx-auto w-full px-5">

            <form onSubmit={form.handleSubmit(handleOnSubmit)}>
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
                          placeholder="Type or speak your message…"
                          disabled={status === "streaming"}
                          className="h-14 pr-32 pl-5 bg-card rounded-[20px]"
                        />

                        {/* VOICE BUTTONS */}
                        {!isRecording ? (
                          <Button type="button" size="icon" className="absolute right-20 top-2 rounded-full"
                            onClick={startRecording}>
                            <Mic className="size-4" />
                          </Button>
                        ) : (
                          <Button type="button" size="icon" className="absolute right-20 top-2 rounded-full bg-red-600 text-white"
                            onClick={stopRecording}>
                            <MicOff className="size-4" />
                          </Button>
                        )}

                        {/* AUDIO PLAYBACK BUTTON */}
                        {lastAudioURL.current && (
                          <Button type="button" size="icon" className="absolute right-14 top-2 rounded-full"
                            onClick={playAudio}>
                            <Volume2 className="size-4" />
                          </Button>
                        )}

                        {/* SEND BUTTON */}
                        {(status === "ready" || status === "error") && (
                          <Button type="submit" size="icon" className="absolute right-3 top-2 rounded-full"
                            disabled={!field.value.trim()}>
                            <ArrowUp className="size-4" />
                          </Button>
                        )}

                        {/* STOP STREAM BUTTON */}
                        {(status === "submitted" || status === "streaming") && (
                          <Button type="button" size="icon" className="absolute right-3 top-2 rounded-full" onClick={stop}>
                            <Square className="size-4" />
                          </Button>
                        )}
                      </div>
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>

            <div className="text-center text-xs text-muted-foreground mt-3">
              © {new Date().getFullYear()} {OWNER_NAME} • <Link href="/terms">Terms</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
