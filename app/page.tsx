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
  Menu,
  X,
  User,
  History,
  Globe2,
  Map,
  Settings as SettingsIcon,
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
import { useRouter } from "next/navigation";

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
//  Sliding App Navigation
// =======================

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
};

const APP_NAV_ITEMS: NavItem[] = [
  {
    label: "User Profile",
    href: "/profile",
    icon: User,
    description: "Basic details, preferences & saved info.",
  },
  {
    label: "Chat History",
    href: "/history",
    icon: History,
    description: "See past conversations with Udyami.",
  },
  {
    label: "National Schemes",
    href: "/schemes/national",
    icon: Globe2,
    description: "Major schemes applicable across India.",
  },
  {
    label: "State Schemes",
    href: "/schemes/state",
    icon: Map,
    description: "State-specific incentives & subsidies.",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    description: "Language, tone & experience controls.",
  },
];

function SlidingNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-72 max-w-full transform bg-[#FFF7EC] shadow-xl transition-transform duration-300 ease-out border-r border-orange-200 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Udyami Navigation
              </p>
              <p className="text-[11px] text-slate-500">
                Jump quickly to key sections.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-500 hover:bg-orange-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm">
          {APP_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => {
                  onClose();
                  router.push(item.href);
                }}
                className="w-full rounded-xl bg-white/80 px-3 py-3 text-left shadow-sm border border-orange-100 hover:border-orange-300 hover:bg-orange-50 transition flex items-start gap-3"
              >
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white text-xs">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-orange-100 px-5 py-3 text-[11px] text-slate-500">
          Tip: These pages can be simple placeholders now; you can build
          detailed views later.
        </div>
      </aside>
    </div>
  );
}

// =======================
//  Right info carousel
// =======================

const CAROUSEL_ITEMS = [
  {
    title: "Turnover bands are enough",
    body: "You don’t need exact numbers. Rough turnover ranges help Udyami pick the right scheme band for you.",
  },
  {
    title: "Keep bank statements clean",
    body: "Most banks look closely at your last 6–12 months of business transactions and EMI behaviour.",
  },
  {
    title: "Udyam registration unlocks schemes",
    body: "Many subsidies and guarantees expect Udyam registration. It’s usually the first upgrade to plan.",
  },
  {
    title: "State policies matter",
    body: "Power subsidy, interest subvention, and capex support often differ by state and even district.",
  },
];

function RightInfoCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((prev) => (prev + 1) % CAROUSEL_ITEMS.length),
      6000
    );
    return () => clearInterval(id);
  }, []);

  const current = CAROUSEL_ITEMS[index];

  return (
    <aside className="hidden lg:flex w-72 flex-col rounded-3xl border border-orange-100 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-md p-4 text-xs text-slate-800">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-orange-600">
        Did you know?
      </p>

      <div className="relative flex-1 overflow-hidden">
        <div className="animate-[slideUp_0.4s_ease-out]">
          <p className="mb-1 text-xs font-semibold text-slate-900">
            {current.title}
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {current.body}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1">
          {CAROUSEL_ITEMS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-3 rounded-full transition-all ${
                i === index ? "bg-orange-500" : "bg-orange-200"
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400">Auto-updates every few seconds</span>
      </div>
    </aside>
  );
}

// =======================
//  Main component
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

  // Scroll handling
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

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

  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, #FFF5EC, #FFE7D1, #FFFDF8), url(/bg-pattern.png)",
        backgroundRepeat: "repeat",
        backgroundSize: "auto, 360px",
      }}
    >
      {/* Sliding app navigation */}
      <SlidingNav open={isNavOpen} onClose={() => setIsNavOpen(false)} />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-row">
        {/* STATIC MSME SIDEBAR (original content) */}
        <aside className="hidden h-screen w-[260px] flex-col border-r border-orange-200 bg-[#FFF3E5] px-6 py-6 shadow-sm md:flex">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="h-40 w-40 rounded-full bg-white shadow-md flex items-center justify-center">
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
            <div className="text-center mt-2">
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

          <p className="mt-auto pt-6 text-[11px] text-center text-orange-500">
            Made for Indian MSMEs with ❤
            <span className="block opacity-80">
              © {new Date().getFullYear()} {OWNER_NAME}
            </span>
          </p>
        </aside>

        {/* MAIN CONTENT: center chat + right info carousel */}
        <main className="flex-1 px-3 py-4 md:px-6 md:py-6 flex items-stretch">
          <div className="flex h-full w-full flex-row gap-4">
            {/* CHAT CARD */}
            <div className="flex h-full flex-1 flex-col items-center justify-center">
              <div className="relative flex h-[calc(100vh-4rem)] w-full max-w-3xl flex-col rounded-3xl border border-orange-100 bg-white/80 shadow-[0_24px_60px_rgba(15,23,42,0.06)] backdrop-blur-md">
                {/* HEADER */}
                <header className="flex items-center justify-between border-b border-orange-100 px-4 py-3 md:px-6 md:py-4">
                  <div className="flex items-center gap-3">
                    {/* hamburger for app nav */}
                    <button
                      type="button"
                      onClick={() => setIsNavOpen(true)}
                      className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-700 shadow-sm hover:bg-orange-50 md:hidden"
                      aria-label="Open navigation"
                    >
                      <Menu className="h-4 w-4" />
                    </button>

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
                        MSME schemes & documentation — simple, practical
                        answers.
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

                {/* HERO SLIDES + MESSAGES */}
                <div className="relative flex-1 overflow-hidden">
                  {/* Scrollable content */}
                  <div
                    ref={scrollContainerRef}
                    className="flex h-full flex-col overflow-y-auto px-4 py-3 md:px-6 md:py-4"
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
                              className="min-w-[200px] max-w-[220px] rounded-2xl bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 px-3 py-3 text-xs text-slate-800 shadow-sm border border-orange-100"
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
                    <div className="flex flex-col items-center justify-end min-h-full">
                      {isClient ? (
                        <>
                          <MessageWall
                            messages={messages}
                            status={status}
                            durations={durations}
                            onDurationChange={handleDurationChange}
                          />
                          {/* Typing indicator */}
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
                        <div className="flex w-full max-w-2xl justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                        </div>
                      )}
                      <div ref={bottomRef} />
                    </div>
                  </div>

                  {/* Scroll-to-bottom pill */}
                  {showScrollDown && (
                    <button
                      type="button"
                      onClick={() =>
                        scrollContainerRef.current?.scrollTo({
                          top: scrollContainerRef.current.scrollHeight,
                          behavior: "smooth",
                        })
                      }
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
                                placeholder='Type your question… e.g., “Can I get CGTMSE for a ₹20L machinery loan?”'
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
                    Tip: Rough ranges (turnover, loan amount, years) are enough
                    – you don’t need exact figures.
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

            {/* RIGHT INFO CAROUSEL */}
            <RightInfoCarousel />
          </div>
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
