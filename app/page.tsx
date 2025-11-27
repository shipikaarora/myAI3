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
  PanelRightOpen,
  X,
  ChevronRight,
} from "lucide-react";
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

// =======================
//  Static content for Knowledge Panel
// =======================

const policyUpdates: string[] = [
  "CGTMSE: Credit guarantee cover available for eligible MSME term loans and working capital – check bank-specific norms.",
  "PMEGP: Higher subsidy slabs for units in special categories and rural areas – verify updated ceilings on KVIC portal.",
  "Udyam: Aadhaar-based registration mandatory for availing most MSME schemes; ensure NIC/Udyam certificate is up to date.",
  "MSME Samadhaan: Suppliers can file delayed payment cases online if dues exceed 45 days – interest may be payable by buyer.",
  "GST & MSME: Composition scheme and threshold limits can impact your eligibility for certain schemes – keep turnover updated.",
];

const guidanceTopics: { title: string; bullets: string[] }[] = [
  {
    title: "If you are NEW to MSME schemes",
    bullets: [
      'Ask: “Create a simple checklist of registrations I must do first.”',
      'Ask: “Explain Udyam registration step-by-step for my business.”',
    ],
  },
  {
    title: "If you want LOANS / SUBSIDIES",
    bullets: [
      'Ask: “Can I get collateral-free loan under CGTMSE? Here are my turnover and loan needs.”',
      'Ask: “What documents do banks usually ask MSMEs for?”',
    ],
  },
  {
    title: "If you are facing DELAYED PAYMENTS",
    bullets: [
      'Ask: “Explain MSME Samadhaan and how to file a case.”',
      'Ask: “Draft a polite email reminder quoting MSME payment rules.”',
    ],
  },
];

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
      audio.play().catch(() => {});

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

  // Floating navigator state
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

  // Policy ticker (fade carousel)
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerFading, setTickerFading] = useState(false);

  useEffect(() => {
    if (policyUpdates.length <= 1) return;
    const interval = setInterval(() => {
      setTickerFading(true);
      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % policyUpdates.length);
        setTickerFading(false);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom whenever messages or status change
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
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
  }

  function clearChat() {
    const newMessages: UIMessage[] = [];
    const newDurations: Record<string, number> = {};
    setMessages(newMessages);
    setDurations(newDurations);
    saveMessagesToStorage(newMessages, newDurations);
    toast.success("Chat cleared");
  }

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

  const handleQuickReply = (text: string) => {
    sendMessage({ text });
  };

  return (
    <div
      className="h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #FFF5EC, #FFE7D1, #FFFDF8), url(/bg-pattern.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto, 360px",
      }}
    >
      {/* FLOATING NAVIGATOR TOGGLE BUTTON – LEFT */}
      <button
        type="button"
        aria-label="Open quick navigator"
        onClick={() => setIsNavigatorOpen((prev) => !prev)}
        className="fixed left-6 top-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-lg hover:from-orange-600 hover:to-rose-500"
      >
        {isNavigatorOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <PanelRightOpen className="h-5 w-5" />
        )}
      </button>

      {/* FLOATING NAVIGATOR PANEL – LEFT */}
      {isNavigatorOpen && (
        <div className="fixed left-6 top-40 z-40 w-80 rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-2xl backdrop-blur">
          <h3 className="mb-2 text-sm font-semibold text-orange-900">
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
              <span className="text-[13px] font-medium text-orange-900">
                User Profile
              </span>
              <span className="text-[11px] text-orange-600">
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
              <span className="text-[11px] text-orange-600">
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
              <span className="text-[11px] text-orange-600">
                Language, theme, and other preferences (coming soon).
              </span>
            </div>
          </button>

          {/* Schemes */}
          <button
            type="button"
            className="mb-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs hover:bg-orange-50"
            onClick={() =>
              handleQuickReply(
                "Give me a categorized list of important MSME schemes in India with 2-line descriptions."
              )
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
              <FileStack className="h-4 w-4 text-orange-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-orange-900">
                Schemes
              </span>
              <span className="text-[11px] text-orange-600">
                Ask the bot to list and explain major schemes in one place.
              </span>
            </div>
          </button>

          {/* Disclaimer */}
          <div className="flex gap-2 rounded-xl bg-orange-50 p-3">
            <div className="mt-0.5">
              <Info className="h-4 w-4 text-orange-700" />
            </div>
            <p className="text-[11px] leading-snug text-orange-800">
              <span className="font-semibold">Disclaimer:</span> This chatbot
              provides informational guidance based on MSME rules. It does not
              replace official government notifications, portal instructions, or
              professional legal / financial advice.
            </p>
          </div>
        </div>
      )}

      <div className="mx-auto flex h-full max-w-6xl flex-row">
        {/* FIXED LEFT SIDEBAR */}
        <aside className="hidden h-full w-[260px] flex-col border-r border-orange-200 bg-[#FFF3E5] px-6 py-6 shadow-sm md:flex">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-md">
                <Image
                  src="/ashoka.png"
                  alt="Ashoka Chakra"
                  width={136}
                  height={136}
                  className="animate-[spin_8s_linear_infinite]"
                  priority
                />
              </div>
              <div className="pointer-events-none absolute inset-2 rounded-full bg-white/10 blur-xl" />
            </div>
            <div className="mt-2 text-center">
              <p className="text-lg font-semibold text-orange-900">
                Udyog Mitra
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
                MSME साथी
              </p>
            </div>
          </div>

          <nav className="mt-8 space-y-2 text-sm">
            <SidebarItem label="Home" active />
            <SidebarItem label="Udyam Registration" />
            <SidebarItem label="GST Help" />
            <SidebarItem label="Loan & Subsidy Schemes" />
            <SidebarItem label="Delayed Payments / Samadhaan" />
          </nav>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-orange-100 via-amber-100 to-rose-100 p-4 text-xs text-orange-900 shadow-sm">
            <p className="mb-1 font-semibold">Why use {AI_NAME}?</p>
            <ul className="list-disc list-inside space-y-1">
              <li>No document upload required</li>
              <li>Explains schemes in simple language</li>
              <li>Helps you prepare bank-ready documents</li>
            </ul>
          </div>

          <p className="mt-auto pt-6 text-center text-[11px] text-orange-500">
            Made for Indian MSMEs with ❤
            <span className="block opacity-80">
              © {new Date().getFullYear()} {OWNER_NAME}
            </span>
          </p>
        </aside>

        {/* MAIN CHAT + RIGHT KNOWLEDGE PANEL */}
        <main className="flex h-full flex-1 items-stretch gap-4 px-3 py-4 md:px-6 md:py-6">
          {/* CHAT COLUMN – wide and stable */}
          <div className="flex h-full w-full flex-col md:flex-[3]">
            <div className="relative flex h-full w-full flex-1 flex-col rounded-3xl border border-orange-100 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-md">
              {/* HEADER */}
              <header className="flex items-center justify-between border-b border-orange-100 px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md">
                      <Bot className="h-5 w-5" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border border-white bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Image
                        src="/logo.png"
                        alt="Udyami Logo"
                        width={26}
                        height={26}
                        className="rounded-md object-contain"
                      />
                      <h1 className="text-sm font-semibold text-slate-900">
                        Chat with {AI_NAME}
                      </h1>
                    </div>
                    <p className="text-xs text-slate-500">
                      MSME schemes & documentation — simple, practical answers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700 md:flex">
                    <Sparkles className="h-3 w-3" />
                    Powered by AI + MSME rules
                  </span>
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

              {/* HERO + MESSAGES AREA */}
              <div className="relative flex min-h-0 flex-1 overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-3 md:px-6 md:py-4"
                  onScroll={(e) => {
                    const el = e.currentTarget;
                    const atBottom =
                      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
                    setShowScrollDown(!atBottom);
                  }}
                >
                  {/* Hero strip when conversation is new */}
                  {messages.length <= 2 && (
                    <div className="mb-4">
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-orange-600">
                        Key MSME benefits you can ask about
                      </p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {heroSlides.map((slide, idx) => (
                          <div
                            key={idx}
                            className="min-w-[200px] max-w-[220px] rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 px-3 py-3 text-xs text-slate-800 shadow-sm"
                          >
                            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-orange-800">
                              {slide.icon}
                              <span>{slide.title}</span>
                            </div>
                            <p className="text-[11px] leading-snug">
                              {slide.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick prompts at the very start */}
                  {messages.length <= 2 && (
                    <div className="mb-4 flex flex-wrap gap-2 text-xs">
                      {quickPrompts.map((label) => (
                        <button
                          key={label}
                          type="button"
                          className="rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] text-slate-700 shadow-sm transition hover:border-orange-300 hover:bg-orange-50"
                          onClick={() => {
                            sendMessage({ text: label });
                          }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MESSAGES */}
                  <div className="flex min-h-0 flex-1 flex-col justify-end">
                    {isClient ? (
                      <>
                        <MessageWall
                          messages={messages}
                          status={status}
                          durations={durations}
                          onDurationChange={handleDurationChange}
                        />
                        {status === "submitted" && (
                          <div className="mt-2 flex w-full max-w-xs items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-[11px] text-orange-700 shadow-sm">
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
                    }}
                    className="absolute bottom-24 right-4 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-white shadow-lg"
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
                          <div className="relative">
                            <Input
                              {...field}
                              id="chat-form-message"
                              className="h-12 rounded-full bg-orange-50/80 pr-14 pl-4 text-sm placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-300"
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
                  Tip: Rough ranges (turnover, loan amount, years) are enough –
                  you don’t need exact figures.
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

          {/* RIGHT-SIDE KNOWLEDGE PANEL */}
          <aside className="hidden h-full w-[320px] flex-col md:flex">
            <div className="flex h-full flex-col rounded-3xl border border-orange-100 bg-white/80 p-4 text-xs text-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.04)] backdrop-blur-md">
              {/* Header */}
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-orange-600">
                    MSME Guide
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    How to use this assistant
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-medium text-orange-700">
                  For Indian MSMEs
                </span>
              </div>

              {/* Policy ticker */}
              <div className="mb-4 rounded-2xl border border-dashed border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-orange-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live policy & scheme pointers
                </div>
                <p
                  className={`text-[11px] leading-snug text-orange-900 transition-opacity duration-300 ${
                    tickerFading ? "opacity-0" : "opacity-100"
                  }`}
                >
                  {policyUpdates[tickerIndex]}
                </p>
              </div>

              {/* Journeys – 2 bullets each */}
              <div className="mb-3 flex-1 space-y-3 overflow-y-auto pr-1">
                {guidanceTopics.map((section) => (
                  <div
                    key={section.title}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                  >
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-semibold text-slate-800">
                      <ChevronRight className="h-3 w-3 text-orange-500" />
                      {section.title}
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-700">
                      {section.bullets.map((b) => (
                        <li key={b} className="flex gap-1">
                          <span className="mt-[3px] h-1.5 w-1.5 rounded-full bg-slate-400" />
                          <button
                            type="button"
                            className="text-left hover:text-orange-700"
                            onClick={() => handleQuickReply(b)}
                          >
                            {b}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Mini disclaimer */}
              <p className="mt-1 text-[10px] leading-snug text-slate-400">
                This panel is for orientation only. Always verify final scheme
                details on official government portals and with your bank /
                professional advisor.
              </p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

// =======================
//  Sidebar item helper
// =======================

function SidebarItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={[
        "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs transition",
        active
          ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm"
          : "bg-orange-50 text-slate-800 hover:bg-orange-100",
      ].join(" ")}
    >
      <span className="font-medium">{label}</span>
    </button>
  );
}
