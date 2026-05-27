"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Sparkles, Check, Zap, ArrowLeft, Shield, Infinity, Crown, LogIn } from "lucide-react";
import { TataILogo } from "@/components/Logo";
import { useAuth } from "@/context/AuthContext";

// Load PayPal only on client, never during SSR, isolated so crash can't bubble up
const PayPalBox = dynamic(() => import("@/components/PayPalBox"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-11 rounded-xl bg-white/[0.08] animate-pulse" />
  ),
});

const FREE_FEATURES = [
  "10 messages every 5 hours",
  "tatAI Zara & Nova models",
  "File & image uploads",
  "Web browsing",
];

const PRO_FEATURES = [
  { text: "Unlimited messages", icon: Infinity },
  { text: "tatAI Orion — deep reasoning", icon: Crown },
  { text: "Faster responses", icon: Zap },
  { text: "Priority support", icon: Shield },
  { text: "All future features", icon: Sparkles },
  { text: "Cancel anytime", icon: Check },
];

export default function UpgradePage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const { user, loading, setShowLogin } = useAuth();

  // After logging in, the page stays on /upgrade — PayPal buttons become visible automatically
  function handleUpgradeClick() {
    if (!user) {
      // Store intent so user lands back here after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("tatai_login_redirect", "/upgrade");
      }
      setShowLogin(true);
    }
  }

  // On mount, clear any stored redirect if we're already here and logged in
  useEffect(() => {
    if (user && typeof window !== "undefined") {
      sessionStorage.removeItem("tatai_login_redirect");
    }
  }, [user]);

  // Handle PayPal redirect return — capture payment
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paypalStatus = params.get("paypal");
    const token = params.get("token"); // PayPal passes this as the order ID

    if (paypalStatus === "return" && token) {
      // Remove query params from URL
      window.history.replaceState({}, "", "/upgrade");

      const capture = async () => {
        try {
          let authHeader = "";
          if (user) {
            const idToken = await user.getIdToken();
            authHeader = `Bearer ${idToken}`;
          }
          const res = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(authHeader ? { Authorization: authHeader } : {}),
            },
            body: JSON.stringify({ orderID: token }),
          });
          const result = await res.json();
          if (result.success) {
            setSuccess(true);
            setTimeout(() => router.push("/"), 2500);
          }
        } catch { /* silent */ }
      };

      if (user) capture();
      // If user isn't loaded yet, wait for auth
    } else if (paypalStatus === "cancel") {
      window.history.replaceState({}, "", "/upgrade");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a] flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 text-neutral-500 dark:text-white/40 hover:text-neutral-800 dark:hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <TataILogo className="w-7 h-7" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tatAI</span>
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
              <p className="text-neutral-500 dark:text-white/40 text-[15px]">You now have unlimited access to tatAI.</p>
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
                  Unlock the full power of tatAI
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
                <div className="relative bg-gradient-to-b from-violet-600 to-indigo-700 dark:from-violet-500/[0.12] dark:to-indigo-500/[0.06] border border-violet-600/50 dark:border-violet-500/30 rounded-3xl p-6 sm:p-7 overflow-hidden">
                  <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-white/30 dark:via-violet-500/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center gap-1 bg-white/20 dark:bg-gradient-to-r dark:from-violet-600 dark:to-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <Zap className="w-3 h-3" /> POPULAR
                    </span>
                  </div>

                  <p className="text-white/60 dark:text-violet-400 text-xs font-semibold uppercase tracking-widest mb-3">Pro</p>
                  <div className="flex items-end gap-1.5 mb-6">
                    <span className="text-4xl font-bold text-white">$9.99</span>
                    <span className="text-white/60 text-sm mb-1.5">/ month</span>
                  </div>

                  <ul className="space-y-3 mb-7">
                    {PRO_FEATURES.map(({ text, icon: Icon }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                        <div className="w-5 h-5 rounded-full bg-white/20 dark:bg-violet-500/20 border border-white/30 dark:border-violet-500/30 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3 h-3 text-white dark:text-violet-400" />
                        </div>
                        {text}
                      </li>
                    ))}
                  </ul>

                  {/* PayPal — shown only when logged in */}
                  {loading ? (
                    <div className="w-full h-11 rounded-xl bg-white/30 dark:bg-white/[0.08] animate-pulse" />
                  ) : user ? (
                    <PayPalBox onSuccess={() => { setSuccess(true); setTimeout(() => router.push("/"), 2500); }} />
                  ) : null}
                  {!loading && !user && (
                    <button
                      onClick={handleUpgradeClick}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign in to upgrade
                    </button>
                  )}
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
