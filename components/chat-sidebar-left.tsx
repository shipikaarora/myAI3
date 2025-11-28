import React from "react";
import Image from "next/image";
import {
    Home,
    FileText,
    HelpCircle,
    IndianRupee,
    Clock,
    CheckCircle2,
    Heart,
} from "lucide-react";
import { SidebarItem } from "@/components/sidebar-item";
import { AI_NAME, OWNER_NAME } from "@/config";

export function ChatSidebarLeft() {
    return (
        <aside className="flex h-full w-full flex-col border-r border-orange-200 bg-[#FFF3E5] px-6 py-6 shadow-sm">
            <div className="flex flex-col items-center gap-5">
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
                    <p className="text-3xl font-bold text-orange-900 drop-shadow-sm">
                        Udyog Mitra
                    </p>
                    <p className="text-xl font-medium uppercase tracking-wide text-orange-600 drop-shadow-sm">
                        MSME साथी
                    </p>
                </div>
            </div>

            <nav className="mt-8 space-y-3">
                <SidebarItem label="Home" icon={<Home className="h-5 w-5" />} active />
                <SidebarItem
                    label="Udyam Registration"
                    icon={<FileText className="h-5 w-5" />}
                />
                <SidebarItem label="GST Help" icon={<HelpCircle className="h-5 w-5" />} />
                <SidebarItem
                    label="Loan & Subsidy Schemes"
                    icon={<IndianRupee className="h-5 w-5" />}
                />
                <SidebarItem
                    label="Delayed Payments / Samadhaan"
                    icon={<Clock className="h-5 w-5" />}
                />
            </nav>

            <div className="mt-8 rounded-2xl border border-white/50 bg-gradient-to-br from-orange-100/80 via-amber-100/80 to-rose-100/80 p-5 text-lg text-orange-900 shadow-sm backdrop-blur-sm">
                <p className="mb-3 font-bold text-xl">Why use {AI_NAME}?</p>
                <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-orange-600" />
                        <span className="leading-snug">No document upload required</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-orange-600" />
                        <span className="leading-snug">
                            Explains schemes in simple language
                        </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-orange-600" />
                        <span className="leading-snug">
                            Helps you prepare bank-ready documents
                        </span>
                    </li>
                </ul>
            </div>

            <p className="mt-auto flex flex-col items-center gap-1 pt-6 text-center text-base text-orange-600/80">
                <span className="flex items-center gap-1.5">
                    Made for Indian MSMEs with{" "}
                    <Heart className="h-4 w-4 fill-rose-500 text-rose-500 animate-pulse" />
                </span>
                <span className="text-sm opacity-80">
                    © {new Date().getFullYear()} {OWNER_NAME}
                </span>
            </p>
        </aside>
    );
}
