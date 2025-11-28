import React from "react";

interface SidebarItemProps {
    label: string;
    icon?: React.ReactNode;
    active?: boolean;
}

export function SidebarItem({ label, icon, active }: SidebarItemProps) {
    return (
        <button
            type="button"
            className={[
                "group flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left text-lg font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
                active
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md"
                    : "bg-white/60 text-slate-700 hover:bg-white hover:text-orange-700 hover:shadow-sm",
            ].join(" ")}
        >
            {icon && (
                <span
                    className={
                        active ? "text-white" : "text-orange-500 group-hover:text-orange-600"
                    }
                >
                    {icon}
                </span>
            )}
            <span className="flex-1 break-words leading-snug">{label}</span>
        </button>
    );
}
