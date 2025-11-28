import React from "react";

interface ChatSidebarRightProps {
    currentPolicyIndex: number;
    policyUpdates: string[];
    onSendMessage: (text: string) => void;
}

export function ChatSidebarRight({
    currentPolicyIndex,
    policyUpdates,
    onSendMessage,
}: ChatSidebarRightProps) {
    return (
        <aside className="flex h-full w-full flex-col rounded-3xl border border-orange-100 bg-white/80 px-5 py-5 text-lg text-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.04)] backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <p className="text-base font-semibold uppercase tracking-wide text-orange-700">
                        MSME Guide
                    </p>
                    <p className="text-base font-medium text-slate-900">
                        How to use this assistant
                    </p>
                </div>
                <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                    For Indian MSMEs
                </span>
            </div>

            {/* Policy ticker */}
            <div className="mb-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 p-3">
                <div className="mb-1 flex items-center gap-2 text-base font-semibold text-orange-800">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live policy & scheme pointers
                </div>
                <div className="relative overflow-hidden">
                    <p className="text-base leading-snug text-orange-800 transition-all duration-500 ease-in-out">
                        {policyUpdates[currentPolicyIndex]}
                    </p>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto">
                {/* NEW TO MSME */}
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                    <p className="mb-1 text-base font-semibold text-orange-800">
                        ▸ If you are NEW to MSME schemes
                    </p>
                    <ul className="space-y-1 text-base text-slate-700">
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "Create a simple checklist of registrations and licenses I must do first as a new MSME."
                                    )
                                }
                            >
                                Ask: “Create a simple checklist of registrations I must do first.”
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "Explain Udyam registration step-by-step for my business with a clear document list."
                                    )
                                }
                            >
                                Ask: “Explain Udyam registration step-by-step for my business.”
                            </button>
                        </li>
                    </ul>
                </div>

                {/* LOANS / SUBSIDIES */}
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                    <p className="mb-1 text-base font-semibold text-orange-800">
                        ▸ If you want LOANS / SUBSIDIES
                    </p>
                    <ul className="space-y-1 text-base text-slate-700">
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "Can I get a collateral-free loan under CGTMSE? These are my turnover and loan requirements."
                                    )
                                }
                            >
                                Ask: “Can I get a collateral-free loan under CGTMSE?”
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "What documents do banks usually ask MSMEs for when applying for a term loan and working capital?"
                                    )
                                }
                            >
                                Ask: “What documents do banks usually ask MSMEs for?”
                            </button>
                        </li>
                    </ul>
                </div>

                {/* DELAYED PAYMENTS */}
                <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-3">
                    <p className="mb-1 text-base font-semibold text-orange-800">
                        ▸ If you are facing DELAYED PAYMENTS
                    </p>
                    <ul className="space-y-1 text-base text-slate-700">
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "Explain MSME Samadhaan and how I can file a case for delayed payments from a large buyer."
                                    )
                                }
                            >
                                Ask: “Explain MSME Samadhaan and how to file a case.”
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="text-left hover:underline"
                                onClick={() =>
                                    onSendMessage(
                                        "Draft a polite email reminder quoting MSME payment rules and interest for delayed payment."
                                    )
                                }
                            >
                                Ask: “Draft a polite email reminder quoting MSME rules.”
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <p className="mt-3 text-[10px] leading-snug text-slate-400">
                This panel is for orientation only. Always verify final scheme details on
                official government portals and with your bank / professional advisor.
            </p>
        </aside>
    );
}
