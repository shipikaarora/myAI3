"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { useChat } from "@ai-sdk/react";
import {
  ArrowUp,
  Loader2,
  Plus,
  Square,
  Bot,
  Sparkles,
  Building2,
  FileText,
  Landmark,
  Scale,
  User,
  History,
  Settings as SettingsIcon,
  FileStack,
  Info,
  PanelLeftOpen,

  X,
  Home,
  HelpCircle,
  IndianRupee,
  Clock,
  CheckCircle2,
  Heart,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Menu,
} from "lucide-react";
import { useWebSpeech } from "@/hooks/use-web-speech";
import { ChatSidebarLeft } from "@/components/chat-sidebar-left";
import { ChatSidebarRight } from "@/components/chat-sidebar-right";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Helper to extract text from UIMessage
// function getPlainText(message: UIMessage): string {
//   return (
//     message.parts
//       ?.map((p) => (p.type === "text" ? p.text : ""))
//       .join(" ") || ""
//   );
// }
import { MessageWall } from "@/components/messages/message-wall";

import type { UIMessage } from "ai";
import { useEffect, useState, useRef } from "react";
import {
  AI_NAME,
  CLEAR_CHAT_TEXT,
  OWNER_NAME,
  WELCOME_MESSAGE,
} from "@/config";
import Link from "next/link";
import Image from "next/image";

// =======================
//  Validation
// =======================

const formSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty.")
    .max(2000, "Message must be at most 2000 characters."),
});

// =======================
//  Local storage helpers
// =======================

const STORAGE_KEY = "chat-messages";

type StorageData = {
  messages: UIMessage[];
  durations: Record<string, number>;
};

const loadMessagesFromStorage = (): StorageData => {
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
  durations: Record<string, number>,
) => {
  if (typeof window === "undefined") return;
  try {
    const data: StorageData = { messages, durations };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save messages to localStorage:", error);
  }
};

// =======================
//  Component
// =======================

export default function Chat() {
  // Welcome music – plays once on first click/tap
  const [hasPlayedMusic, setHasPlayedMusic] = useState(false);

  useEffect(() => {
    if (hasPlayedMusic) return;

    const playMusic = () => {
      if (hasPlayedMusic) return;

      const audio = new Audio("/welcome-music.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => { });

      setTimeout(() => audio.pause(), 30000); // max 30 seconds
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
    setDurations((prev) => ({
      ...prev,
      [key]: duration,
    }));
  };

  // Scroll handling
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const userScrolledUpRef = useRef(false);

  // Floating navigator state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [currentPolicyIndex, setCurrentPolicyIndex] = useState(0);
  const initialInputRef = useRef("");


  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    supported: voiceSupported,
  } = useWebSpeech();



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPolicyIndex((prev) => (prev + 1) % POLICY_UPDATES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll: only when user is at bottom (showScrollDown === false)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // If user has scrolled up (checked via ref) → DON'T auto-scroll
    if (userScrolledUpRef.current) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "auto",
    });
  }, [messages, status]);

  // Inject welcome message if nothing saved
  useEffect(() => {
    if (
      isClient &&
      initialMessages.length === 0 &&
      !welcomeMessageShownRef.current
    ) {
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

  // Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    sendMessage({ text: data.message });
    form.reset();
    resetTranscript();
    stopListening();
  }

  // Sync transcript to input
  useEffect(() => {
    if (isListening && transcript) {
      form.setValue("message", transcript);
    }
  }, [transcript, isListening, form]);



  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations: Record<string, number> = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

  const SUGGESTED_ACTIONS = [
    { label: "Check eligibility", action: "Check my eligibility for PMEGP scheme" },
    { label: "Document list", action: "What documents do I need for a mudra loan?" },
    { label: "Application steps", action: "How to apply for Udyam Registration?" },
    { label: "Subsidy details", action: "Explain the subsidy structure of PMEGP" },
  ];

  const POLICY_UPDATES = [
    "GST & MSME: Composition scheme and threshold limits can impact your eligibility for certain schemes – keep turnover updated on all registrations.",
    "Udyam Registration: It is mandatory for availing most MSME benefits. Ensure your details are up to date.",
    "PM Vishwakarma: New scheme launched for artisans and craftspeople with collateral-free credit support.",
    "Delayed Payments: File a case with MSEFC if your payment is delayed beyond 45 days.",
    "ZED Certification: Get certified to avail subsidies on technology adoption and testing.",
  ];

  const quickPrompts = [
    "Check which MSME schemes I qualify for",
    "Help me with delayed payments / MSME Samadhaan",
    "I want a collateral-free loan for machinery",
    "Explain Udyam registration in simple words",
  ];

  const heroSlides = [
    {
      icon: <Building2 className="h-4 w-4" />,
      title: "PMEGP Subsidy",
      text: "Capital subsidy up to 35% for new manufacturing & service units.",
    },
    {
      icon: <Landmark className="h-4 w-4" />,
      title: "CGTMSE Loans",
      text: "Collateral-free loans for MSMEs with guarantee coverage.",
    },
    {
      icon: <FileText className="h-4 w-4" />,
      title: "Udyam & GST Help",
      text: "Understand registration, turnover limits, and documentation.",
    },
    {
      icon: <Scale className="h-4 w-4" />,
      title: "MSME Samadhaan",
      text: "Guidance on resolving delayed payments legally.",
    },
  ];

  return (
    <div
      className="h-dvh bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #FFF5EC, #FFE7D1, #FFFDF8), url(/bg-pattern.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto, 360px",
      }}
    >
      {/* FLOATING NAVIGATOR TOGGLE BUTTON – LEFT SIDE */}
      <button
        type="button"
        aria-label="Open quick navigator"
        onClick={() => setIsNavigatorOpen((prev) => !prev)}
        className="fixed left-6 top-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg hover:from-orange-600 hover:to-rose-500 md:hidden"
      >
        {isNavigatorOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <PanelLeftOpen className="h-5 w-5" />
        )}
      </button>

      {/* FLOATING NAVIGATOR PANEL */}
      {isNavigatorOpen && (
        <div className="fixed left-6 top-40 z-40 w-80 rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-2xl backdrop-blur md:hidden">
          <h3 className="mb-3 text-xl font-semibold text-orange-900">
            Quick Navigator
          </h3>

          {/* User Profile */}
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <User className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-medium text-orange-900">
                User Profile
              </span>
              <span className="text-base text-orange-600">
                View / update your MSME and owner details (coming soon).
              </span>
            </div>
          </button>

          {/* Chat History */}
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <History className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-orange-900">
                Chat History
              </span>
              <span className="text-base text-orange-600">
                Quickly jump back to recent discussions (coming soon).
              </span>
            </div>
          </button>

          {/* Settings */}
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <SettingsIcon className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-orange-900">
                Settings
              </span>
              <span className="text-base text-orange-600">
                Language, theme, and other preferences (coming soon).
              </span>
            </div>
          </button>

          {/* Schemes */}
          <button
            type="button"
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50"
            onClick={() =>
              sendMessage({
                text: "Give me a list of major MSME schemes (central, state, bank-linked) and group them by category with one-line descriptions.",
              })
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <FileStack className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-orange-900">
                Schemes
              </span>
              <span className="text-base text-orange-600">
                Ask the bot to list and explain major schemes in one place.
              </span>
            </div>
          </button>

          {/* Disclaimer */}
          <div className="flex gap-2 rounded-xl bg-orange-50 p-3">
            <div className="mt-0.5">
              <Info className="h-4 w-4 text-orange-700" />
            </div>
            <p className="text-xs leading-snug text-orange-800">
              <span className="font-semibold">Disclaimer:</span> This chatbot
              provides informational guidance based on MSME rules. It does not
              replace official government notifications, portal instructions, or
              professional legal / financial advice.
            </p>
          </div>
        </div>
      )}

      <div className="flex h-full w-full flex-col md:flex-row">
        {/* LEFT FIXED SIDEBAR (DESKTOP) */}
        <div className="hidden md:flex h-full w-[400px] shrink-0">
          <ChatSidebarLeft />
        </div>

        {/* MAIN + RIGHT GUIDE */}
        <main className="flex h-full flex-1 items-stretch px-3 py-4 md:px-6 md:py-6">
          <div className="flex h-full w-full flex-row gap-4">
            {/* CENTER CHAT COLUMN */}
            <div className="flex h-full min-w-0 flex-1 flex-col items-stretch">
              {/* CHAT CARD */}
              <div className="relative flex h-full w-full flex-1 flex-col rounded-3xl border border-orange-100 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-md">
                {/* HEADER */}
                <header className="flex items-center justify-between border-b border-orange-100 px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-center gap-3">
                    {/* Mobile Menu Trigger */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                          <Menu className="h-6 w-6 text-orange-700" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="p-0 w-[85vw] sm:w-[400px] border-none bg-transparent">
                        <ChatSidebarLeft />
                      </SheetContent>
                    </Sheet>

                    <div className="relative hidden md:block">
                      <div className="h-12 w-12 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
                        <Image
                          src="/logo.png"
                          alt="Udyami Logo"
                          width={48}
                          height={48}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-emerald-500" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-slate-900">
                        Chat with {AI_NAME}
                      </h1>
                      <p className="text-sm text-slate-500">
                        MSME schemes & documentation — simple, practical
                        answers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">

                    <span className="hidden items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-base font-medium text-blue-700 md:flex">
                      <Sparkles className="h-3 w-3" />
                      Powered by AI + MSME rules
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer rounded-full border-orange-200 text-lg hidden md:flex"
                      onClick={clearChat}
                      aria-label="Start new chat"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      {CLEAR_CHAT_TEXT}
                    </Button>

                    {/* Mobile Info Trigger */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                          <Info className="h-6 w-6 text-orange-700" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="p-0 w-[85vw] sm:w-[350px] border-none bg-transparent">
                        <ChatSidebarRight
                          currentPolicyIndex={currentPolicyIndex}
                          policyUpdates={POLICY_UPDATES}
                          onSendMessage={(text) => sendMessage({ text })}
                        />
                      </SheetContent>
                    </Sheet>
                  </div>
                </header>

                {/* HERO + MESSAGES AREA */}
                <div className="relative flex min-h-0 flex-1">
                  <div
                    ref={scrollContainerRef}
                    className="flex min-h-0 flex-1 flex-col overflow-y-scroll overflow-x-hidden px-4 py-3 md:px-6 md:py-4"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      const atBottom =
                        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
                      setShowScrollDown(!atBottom);
                      userScrolledUpRef.current = !atBottom;
                    }}
                  >
                    {/* Content wrapper with consistent width */}
                    <div className="min-w-full w-full">
                      {/* Hero strip when conversation is new */}
                      <div className={`mb-4 ${messages.length > 2 ? 'invisible h-0 overflow-hidden' : ''}`}>
                        <p className="mb-2 text-base font-medium uppercase tracking-wide text-orange-600">
                          Key MSME benefits you can ask about
                        </p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {heroSlides.map((slide, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => sendMessage({ text: `${slide.title} ${slide.text}` })}
                              className="min-w-[200px] cursor-pointer rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 px-3 py-3 text-left text-lg text-slate-800 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                            >
                              <div className="mb-1 flex items-center gap-1.5 text-base font-semibold text-orange-800">
                                {slide.icon}
                                <span>{slide.title}</span>
                              </div>
                              <p className="text-base leading-snug">
                                {slide.text}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quick prompts at the very start */}
                      <div className={`mb-4 flex flex-wrap gap-2 text-lg ${messages.length > 2 ? 'invisible h-0 overflow-hidden' : ''}`}>
                        {quickPrompts.map((label) => (
                          <button
                            key={label}
                            type="button"
                            className="rounded-full border border-orange-200 bg-white px-3 py-1 text-base text-slate-700 shadow-sm transition-all duration-200 hover:scale-105 hover:border-orange-300 hover:bg-orange-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                            onClick={() => {
                              sendMessage({ text: label });
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      {/* MESSAGES */}
                      <div className="flex w-full flex-col">
                        {isClient ? (
                          <>
                            <MessageWall
                              messages={messages}
                              status={status}
                              durations={durations}
                              onDurationChange={handleDurationChange}
                            />
                            {status === "submitted" && (
                              <div className="mt-2 flex w-full max-w-xs items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-base text-orange-700 shadow-sm">
                                <div className="flex gap-1">
                                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400" />
                                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:120ms]" />
                                  <span className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-orange-400 [animation-delay:240ms]" />
                                </div>
                                <span>Udyami is preparing your answer…</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex w-full justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Close width constraint wrapper */}
                  </div>

                  {/* Scroll-to-bottom pill */}
                  {showScrollDown && (
                    <button
                      type="button"
                      onClick={() => {
                        const el = scrollContainerRef.current;
                        if (!el) return;
                        el.scrollTo({
                          top: el.scrollHeight,
                          behavior: "smooth",
                        });
                        setShowScrollDown(false);
                        userScrolledUpRef.current = false;
                      }}
                      className="absolute bottom-24 right-4 rounded-full bg-slate-900/80 px-3 py-1 text-base text-white shadow-lg"
                    >
                      Jump to latest
                    </button>
                  )}
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
                            <div className="relative flex items-center h-12 rounded-full bg-white shadow-sm border border-orange-200 px-2 transition-all duration-300 focus-within:border-orange-600 focus-within:ring-4 focus-within:ring-orange-100 focus-within:shadow-md">
                              <input
                                {...field}
                                id="chat-form-message"
                                className="flex-1 bg-transparent border-none text-xl placeholder:text-slate-400 !outline-none !ring-0 !shadow-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none px-2 min-w-0"
                                style={{ boxShadow: "none", outline: "none" }}
                                placeholder='Type your question… e.g., "Can I get CGTMSE for a ₹20L machinery loan?"'
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

                              {/* MIC BUTTON */}
                              {voiceSupported && status === "ready" && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className={`h-10 w-10 rounded-full transition-all shrink-0 mr-1 ${isListening
                                    ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse"
                                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    }`}
                                  onClick={() => {
                                    if (isListening) {
                                      stopListening();
                                    } else {
                                      form.setValue("message", ""); // Clear existing text
                                      resetTranscript();
                                      startListening();
                                    }
                                  }}
                                  title="Voice Input"
                                >
                                  <Mic className={`h-5 w-5 ${isListening ? "fill-current" : ""}`} />
                                </Button>
                              )}

                              {/* SEND BUTTON */}
                              {(status === "ready" || status === "error") && (
                                <Button
                                  className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md hover:from-orange-600 hover:to-rose-500 shrink-0"
                                  type="submit"
                                  disabled={!field.value.trim()}
                                  size="icon"
                                  aria-label="Send message"
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                              )}

                              {/* STOP BUTTON */}
                              {(status === "streaming" || status === "submitted") && (
                                <Button
                                  className="h-9 w-9 rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 shrink-0"
                                  size="icon"
                                  type="button"
                                  onClick={stop}
                                  aria-label="Stop generating"
                                >
                                  <Square className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {fieldState.error && (
                              <p className="mt-1 text-base text-rose-500">
                                {fieldState.error.message}
                              </p>
                            )}
                            <div className="mt-1 flex justify-end px-2">
                              <span className={`text-xs font-medium transition-colors ${(field.value?.length || 0) > 1800 ? "text-rose-500" : "text-slate-400"
                                }`}>
                                {field.value?.length || 0}/2000
                              </span>
                            </div>
                          </Field>
                        )}
                      />
                    </FieldGroup>
                  </form>
                  <p className="mt-2 text-sm text-slate-400">
                    Tip: Rough ranges (turnover, loan amount, years) are enough
                    – you don’t need exact figures.
                  </p>
                </div>
              </div>

              {/* FOOTER SMALL LINE */}
              <div className="mt-4 flex items-center justify-center text-base text-slate-400">
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

            {/* RIGHT KNOWLEDGE PANEL */}
            <div className="hidden md:flex h-full w-[350px] shrink-0">
              <ChatSidebarRight
                currentPolicyIndex={currentPolicyIndex}
                policyUpdates={POLICY_UPDATES}
                onSendMessage={(text) => sendMessage({ text })}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



