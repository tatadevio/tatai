"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Check, Zap, ArrowLeft, Shield, Infinity } from "lucide-react";
import { TataILogo } from "@/components/Logo";

const FREE_FEATURES = [
  "10 messages per day",
  "Access to tataI",
  "Basic chat",
];

const PRO_FEATURES = [
  { text: "Unlimited messages", icon: Infinity },
  { text: "Faster AI responses", icon: Zap },
  { text: "Priority support", icon: Shield },
  { text: "All future features", icon: Sparkles },
  { text: "Cancel anytime", icon: Check },
];

export default function UpgradePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function createOrder() {
    const res = await fetch("/api/paypal/create-order", { method: "POST" });
    const data = await res.json();
    return data.id;
  }

  async function onApprove(data: { orderID: string }) {
    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: data.orderID }),
    });
    const result = await res.json();
    if (result.success) {
      setSuccess(true);
      setTimeout(() => router.push("/"), 2500);
    } else {
      setError("Payment failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-neutral-500 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <TataILogo className="w-7 h-7" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataI</span>
        </div>
        <div className="w-14" />
      </header>

      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50 dark:bg-[#0a0a0a]">
        <div className="w-full max-w-3xl">
          {success ? (
            <div className="text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">Welcome to Pro!</h2>
              <p className="text-neutral-500 dark:text-white/40 text-[15px]">You now have unlimited access to tataI.</p>
              <p className="text-neutral-400 dark:text-white/25 text-sm mt-2">Redirecting you back...</p>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-full px-4 py-1.5 mb-5">
                  <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Simple pricing</span>
                </div>
                <h1 className="text-[36px] font-bold text-neutral-900 dark:text-white mb-3 tracking-tight">
                  Unlock the full power of tataI
                </h1>
                <p className="text-neutral-500 dark:text-white/40 text-[16px] max-w-md mx-auto">
                  Upgrade to Pro and get unlimited AI conversations, faster responses, and priority support.
                </p>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-2 gap-5">
                {/* Free */}
                <div className="bg-white dark:bg-white/[0.03] border border-neutral-200 dark:border-white/[0.08] rounded-3xl p-7">
                  <div className="mb-6">
                    <p className="text-neutral-400 dark:text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Free</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold text-neutral-900 dark:text-white">$0</span>
                      <span className="text-neutral-400 dark:text-white/30 text-sm mb-1.5">/ month</span>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {FREE_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-neutral-400 dark:text-white/40">
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
                <div className="relative bg-gradient-to-b from-violet-500/[0.12] to-indigo-500/[0.06] border border-violet-500/25 rounded-3xl p-7 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-violet-500/30">
                      <Zap className="w-3 h-3" /> POPULAR
                    </span>
                  </div>

                  <div className="mb-6">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">Pro</p>
                    <div className="flex items-end gap-1.5">
                      <span className="text-4xl font-bold text-white">$9.99</span>
                      <span className="text-white/40 text-sm mb-1.5">/ month</span>
                    </div>
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

                  {error && (
                    <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
                  )}

                  {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? (
                    <PayPalScriptProvider
                      options={{
                        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
                        currency: "USD",
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 44 }}
                        createOrder={createOrder}
                        onApprove={onApprove}
                        onError={() => setError("Payment error. Please try again.")}
                      />
                    </PayPalScriptProvider>
                  ) : (
                    <a
                      href="mailto:support@tatai.cloud"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
                    >
                      Contact us to upgrade →
                    </a>
                  )}
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-8 mt-8">
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
