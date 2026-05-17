"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Check, Zap } from "lucide-react";

const FREE_FEATURES = ["10 messages per day", "Access to tataAI", "Basic chat"];
const PRO_FEATURES = ["Unlimited messages", "Faster responses", "Priority support", "All future features", "Cancel anytime"];

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
      setTimeout(() => router.push("/"), 2000);
    } else {
      setError("Payment failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Upgrade to tataAI Pro</h1>
          <p className="text-white/50">Unlock unlimited AI power</p>
        </div>

        {success ? (
          <div className="text-center bg-green-500/10 border border-green-500/20 rounded-2xl p-8">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-white mb-1">You&apos;re now Pro!</h2>
            <p className="text-white/50 text-sm">Redirecting you back...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="mb-4">
                <p className="text-white/50 text-sm font-medium uppercase tracking-wider mb-1">Free</p>
                <p className="text-3xl font-bold text-white">$0</p>
                <p className="text-white/30 text-sm">Forever</p>
              </div>
              <ul className="space-y-2 mb-6">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check className="w-4 h-4 text-white/30 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition"
              >
                Current plan
              </button>
            </div>

            {/* Pro */}
            <div className="bg-violet-600/10 border border-violet-500/30 rounded-2xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> POPULAR
                </span>
              </div>
              <div className="mb-4">
                <p className="text-violet-400 text-sm font-medium uppercase tracking-wider mb-1">Pro</p>
                <p className="text-3xl font-bold text-white">$9.99</p>
                <p className="text-white/30 text-sm">per month</p>
              </div>
              <ul className="space-y-2 mb-6">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

              <PayPalScriptProvider
                options={{
                  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                  createOrder={createOrder}
                  onApprove={onApprove}
                  onError={() => setError("Payment error. Please try again.")}
                />
              </PayPalScriptProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
