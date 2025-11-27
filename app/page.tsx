"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MessageCircle,
  Info,
  ChevronRight,
  Sparkles,
  FileText,
  Banknote,
} from "lucide-react";

// ==============================
// MAIN PAGE
// ==============================
export default function UdyogMitraPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        {/* Top header strip */}
        <TopBrandBar />

        {/* 3-column layout */}
        <div className="mt-4 grid grid-cols-[260px_minmax(0,1fr)_320px] gap-6 h-[calc(100vh-5.5rem)]">
          <Sidebar />
          <ChatShell />
          <RightPanel />
        </div>
      </div>
    </main>
  );
}

// ==============================
// TOP BRAND BAR
// ==============================
function TopBrandBar() {
  return (
    <header className="flex items-center justify-between rounded-2xl border border-orange-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-full border border-orange-300 bg-white">
          {/* Replace with your own logo if needed */}
          <Image
            src="/ashoka.png"
            alt="Udyog Mitra"
            fill
            className="object-contain p-1.5"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-900">
            Udyog Mitra · MSME साथी
          </p>
          <p className="text-xs text-orange-700">
            MSME schemes & documentation — simple, practical answers.
          </p>
        </div>
      </div>

      <div className="hidden items-center gap-3 text-xs sm:flex">
        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-800">
          <Sparkles className="h-3 w-3" />
          Powered by AI + MSME rules
        </span>
      </div>
    </header>
  );
}

// ==============================
// LEFT SIDEBAR
// ==============================
function Sidebar() {
  const [active, setActive] = useState<string>("home");

  const navItems = [
    { id: "home", label: "Home" },
    { id: "udyam", label: "Udyam Registration" },
    { id: "gst", label: "GST Help" },
    { id: "loans", label: "Loan & Subsidy Schemes" },
    { id: "delayed", label: "Delayed Payments / Samadhaan" },
  ];

  return (
    <aside className="flex h-full flex-col rounded-3xl border border-orange-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      {/* Logo + title */}
      <div className="flex flex-col items-center gap-2 pb-4 border-b border-orange-100">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-orange-200 bg-white">
          <Image
            src="/ashoka.png"
            alt="Emblem"
            fill
            className="object-contain p-1.5"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-orange-900">Udyog Mitra</p>
          <p className="text-xs font-medium text-orange-700">MSME साथी</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 space-y-2 text-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition 
            ${
              active === item.id
                ? "bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-sm"
                : "bg-orange-50 text-orange-800 hover:bg-orange-100"
            }`}
          >
            <span>{item.label}</span>
            <ChevronRight
              className={`h-4 w-4 ${
                active === item.id ? "opacity-90" : "opacity-60"
              }`}
            />
          </button>
        ))}
      </nav>

      {/* Why use Udyami box */}
      <div className="mt-3 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-3 text-xs text-orange-900 border border-orange-100">
        <p className="mb-1 font-semibold">Why use Udyami?</p>
        <ul className="space-y-0.5 list-disc list-inside">
          <li>No document upload required</li>
          <li>Explains schemes in simple language</li>
          <li>Helps you prepare bank-ready documents</li>
        </ul>
        <p className="mt-2 text-[10px] text-orange-600">
          Made for Indian MSMEs with ❤️
        </p>
      </div>
    </aside>
  );
}

// ==============================
// CENTER CHAT SHELL
// ==============================
function ChatShell() {
  return (
    <section className="flex h-full flex-col rounded-3xl border border-orange-200 bg-white/90 shadow-sm backdrop-blur">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-orange-100 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-100">
            <MessageCircle className="h-5 w-5 text-orange-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-900">
              Chat with Udyami
            </p>
            <p className="text-xs text-orange-700">
              Ask about PMEGP, CGTMSE, Udyam, GST, delayed payments & more.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested key benefits */}
      <div className="border-b border-orange-100 px-5 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-orange-500">
          Key MSME benefits you can ask about
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <PillCard
            title="PMEGP Subsidy"
            subtitle="Capital subsidy up to 35% for new manufacturing & services."
          />
          <PillCard
            title="CGTMSE Loans"
            subtitle="Collateral-free loans for MSMEs with guarantee coverage."
          />
          <PillCard
            title="Udyam & GST Help"
            subtitle="Understand registration, turnover limits & documentation."
          />
        </div>
      </div>

      {/* Example quick questions */}
      <div className="border-b border-orange-100 px-5 py-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <QuickChip>Check which MSME schemes I qualify for</QuickChip>
          <QuickChip>I want a collateral-free loan for machinery</QuickChip>
          <QuickChip>Explain Udyam registration in simple words</QuickChip>
          <QuickChip>Help me with delayed payments / MSME Samadhaan</QuickChip>
        </div>
      </div>

      {/* CHAT AREA – plug your existing chat component here */}
      <div className="flex-1 overflow-hidden px-5 py-3">
        <div className="flex h-full flex-col rounded-2xl border border-orange-100 bg-orange-50/40">
          {/* 
            IMPORTANT:
            Replace the placeholder <DummyChatArea /> below
            with your real chat UI (MessageWall, input, etc.)
          */}
          <DummyChatArea />
        </div>
      </div>
    </section>
  );
}

// Pill cards for schemes
function PillCard(props: { title: string; subtitle: string }) {
  return (
    <div className="flex min-w-[180px] flex-1 flex-col rounded-2xl border border-orange-100 bg-orange-50/80 px-3 py-2">
      <p className="text-[11px] font-semibold text-orange-900">
        {props.title}
      </p>
      <p className="mt-0.5 text-[10px] leading-snug text-orange-700">
        {props.subtitle}
      </p>
    </div>
  );
}

// Quick chip buttons
function QuickChip({ children }: { children: React.ReactNode }) {
  return (
    <button className="rounded-full bg-white px-3 py-1 text-[11px] text-orange-800 shadow-sm hover:bg-orange-50">
      {children}
    </button>
  );
}

// Placeholder chat area — replace with your real chat implementation
function DummyChatArea() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-orange-900">
        <div className="rounded-2xl bg-white px-3 py-2 shadow-sm max-w-[70%]">
          👋 नमस्ते! I am <span className="font-semibold">Udyami</span>, your
          MSME साथी. Tell me about your business and I will help you find the
          right schemes, subsidies, and loan options.
        </div>
        <div className="rounded-2xl bg-orange-100 px-3 py-2 ml-auto max-w-[70%] text-right shadow-sm">
          Example: “My unit is in Maharashtra, manufacturing readymade
          garments, turnover ₹1.2 Cr. Which schemes can I apply for?”
        </div>
      </div>

      {/* INPUT BAR – replace with your useChat input */}
      <div className="border-t border-orange-100 bg-white/80 px-3 py-2">
        <div className="flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50/70 px-3 py-1">
          <input
            className="flex-1 bg-transparent text-xs text-orange-900 placeholder:text-orange-400 focus:outline-none"
            placeholder='Type your question… e.g., "Can I get CGTMSE for a ₹20L machinery loan?"'
          />
          <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-sm">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-orange-500">
          Tip: Rough ranges (turnover, loan amount, years) are enough — you
          don’t need exact figures.
        </p>
      </div>
    </div>
  );
}

// ==============================
// RIGHT PANEL – CONTEXT & INSIGHTS
// ==============================
function RightPanel() {
  return (
    <aside className="flex h-full flex-col rounded-3xl border border-orange-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      {/* Did you know header */}
      <div className="flex items-center justify-between pb-2 border-b border-orange-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-100">
            <Info className="h-4 w-4 text-orange-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-orange-900">
              Did you know?
            </p>
            <p className="text-[10px] text-orange-700">
              State policies, power subsidies & capex support differ by district.
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="mt-3 flex-1 space-y-3 overflow-y-auto text-xs text-orange-900">
        <RightPanelCard
          icon={<Banknote className="h-4 w-4" />}
          title="State policies matter"
          points={[
            "Power subsidy, interest subvention & capex support differ by state — sometimes even by district.",
            "Some states give higher subsidy for manufacturing vs services.",
            "Cluster / industrial area benefits can be over & above central schemes.",
          ]}
        />
        <RightPanelCard
          icon={<FileText className="h-4 w-4" />}
          title="Documents most MSMEs miss"
          points={[
            "Properly filled project report (DPR) aligned with scheme norms.",
            "Clear proof of promoter contribution & margin money.",
            "Consistent details across Udyam, GST, bank KYC & IT returns.",
          ]}
        />
        <RightPanelCard
          icon={<Sparkles className="h-4 w-4" />}
          title="How Udyami helps you"
          points={[
            "Maps your business profile to central + state schemes.",
            "Flags red-flags that can cause loan/scheme rejection.",
            "Generates simple checklists you can share with your CA / banker.",
          ]}
        />
      </div>

      {/* Footer strip */}
      <div className="mt-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-2 text-[10px] text-white">
        <p className="font-semibold">Pro tip for best answers</p>
        <p className="mt-1">
          Mention <span className="font-semibold">state, sector, turnover</span>{" "}
          and whether you are <span className="font-semibold">new or existing</span>{" "}
          unit. Udyami will instantly refine schemes for you.
        </p>
      </div>
    </aside>
  );
}

function RightPanelCard(props: {
  icon: React.ReactNode;
  title: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-3">
      <div className="mb-1 flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-white">
          {props.icon}
        </div>
        <p className="text-[11px] font-semibold text-orange-900">
          {props.title}
        </p>
      </div>
      <ul className="mt-1 space-y-1 list-disc list-inside text-[10px] text-orange-800">
        {props.points.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
}
