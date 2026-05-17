"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Check, Zap, ArrowLeft, Shield, Infinity, Crown } from "lucide-react";
import { TataILogo } from "@/components/Logo";

// Load PayPal only on client, never during SSR, isolated so crash can't bubble up
const PayPalBox = dynamic(() => import("@/components/PayPalBox"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-11 rounded-xl bg-white/[0.08] animate-pulse" />
  ),
});

const FREE_FEATURES = [
  "20 messages per day",
  "tataAI Zara & Nova models",
  "File & image uploads",
  "Web browsing",
];

const PRO_FEATURES = [
  { text: "Unlimited messages", icon: Infinity },
  { text: "tataAI Orion — deep reasoning", icon: Crown },
  { text: "Faster responses", icon: Zap },
  { text: "Priority support", icon: Shield },
  { text: "All future features", icon: Sparkles },
  { text: "Cancel anytime", icon: Check },
];

export default function UpgradePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-neutral-500 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <TataILogo className="w-7 h-7" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataAI</span>
        </div>
        <div className="w-14" />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">
          {success ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Welcome to Pro!</h2>
              <p className="text-neutral-500 dark:text-white/40 text-[15px]">You now have unlimited access to tataAI.</p>
              <p className="text-neutral-400 dark:text-white/25 text-sm mt-2">Redirecting you back…</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 rounded-full px-4 py-1.5 mb-5">
                  <Crown className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  <span className="text-violet-600 dark:text-violet-400 text-sm font-medium">Simple pricing</span>
                </div>
                <h1 className="text-[32px] sm:text-[38px] font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                  Unlock the full power of tataAI
                </h1>
                <p className="text-neutral-500 dark:text-white/40 text-[15px] max-w-md mx-auto">
                  Upgrade to Pro for unlimited AI conversations, Orion deep reasoning, and priority support.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Free */}
                <div className="bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-3xl p-6 sm:p-7">
                  <p className="text-neutral-400 dark:text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Free</p>
                  <div className="flex items-end gap-1.5 mb-6">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">$0</span>
                    <span className="text-neutral-400 dark:text-white/30 text-sm mb-1.5">/ month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {FREE_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-neutral-500 dark:text-white/50">
                        <div className="w-5 h-5 rounded-full border border-neutral-200 dark:border-white/[0.12] flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full py-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] text-neutral-400 dark:text-white/40 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    Current plan
                  </button>
                </div>

                {/* Pro */}
                <div className="relative bg-gradient-to-b from-violet-500/[0.12] to-indigo-500/[0.06] border border-violet-500/30 rounded-3xl p-6 sm:p-7 overflow-hidden">
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/30">
                      <Zap className="w-3 h-3" /> POPULAR
                    </span>
                  </div>

                  <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">Pro</p>
                  <div className="flex items-end gap-1.5 mb-6">
                    <span className="text-4xl font-bold text-white">$9.99</span>
                    <span className="text-white/40 text-sm mb-1.5">/ month</span>
                  </div>

                  <ul className="space-y-3 mb-7">
                    {PRO_FEATURES.map(({ text, icon: Icon }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-white/80">
                        <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-violet-400" />
                        </div>
                        {text}
                      </li>
                    ))}
                  </ul>

                  {/* PayPal loaded in isolation — crash here won't affect the rest */}
                  <PayPalBox onSuccess={() => { setSuccess(true); setTimeout(() => router.push("/"), 2500); }} />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                {[
                  { icon: Shield, text: "Secure payment via PayPal" },
                  { icon: Zap, text: "Instant activation" },
                  { icon: Check, text: "Cancel anytime" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-neutral-400 dark:text-white/25 text-xs">
                    <Icon className="w-3.5 h-3.5" />
                    {text}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
