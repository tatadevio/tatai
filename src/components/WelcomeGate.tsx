"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { TataILogo } from "./Logo";
import {
  signInWithRedirect, GoogleAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { X } from "lucide-react";

const SEEN_KEY = "tatai_welcome_seen";

export function WelcomeGate() {
  const { user, loading, setShowLogin } = useAuth();
  const [visible, setVisible] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user) { setVisible(false); return; }
    const seen = localStorage.getItem(SEEN_KEY);
    if (!seen) setVisible(true);
  }, [user, loading]);

  function dismiss() {
    localStorage.setItem(SEEN_KEY, "1");
    setVisible(false);
  }

  function openEmail() {
    dismiss();
    setShowLogin(true);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) { openEmail(); return; }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithRedirect(auth, provider);
    } catch {
      setGoogleLoading(false);
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full sm:max-w-[400px] bg-white dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-neutral-200 dark:border-white/[0.08] overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
        </div>

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] text-neutral-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-6 pt-6 pb-7 space-y-5">
          {/* Hero */}
          <div className="flex flex-col items-center text-center gap-3 pb-1">
            <TataILogo className="w-14 h-14" />
            <div>
              <h2 className="text-[22px] font-bold text-neutral-900 dark:text-white tracking-tight">Welcome to tatAI</h2>
              <p className="text-[14px] text-neutral-500 dark:text-white/40 mt-1">Sign in to save your chats and unlock more</p>
            </div>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] active:scale-[0.98] transition-all text-[14px] font-semibold text-neutral-800 dark:text-white disabled:opacity-60 shadow-sm"
          >
            {googleLoading ? (
              <span className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Email option */}
          <button
            onClick={openEmail}
            className="w-full py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Continue with email
          </button>

          {/* Guest */}
          <button
            onClick={dismiss}
            className="w-full text-center text-[13px] text-neutral-400 dark:text-white/30 hover:text-neutral-600 dark:hover:text-white/50 transition-colors"
          >
            Continue as guest →
          </button>

          <p className="text-center text-[11px] text-neutral-400 dark:text-white/20 -mt-1">
            By continuing, you agree to our{" "}
            <a href="/terms" target="_blank" className="underline hover:text-neutral-600 dark:hover:text-white/40">Terms</a>
            {" & "}
            <a href="/privacy" target="_blank" className="underline hover:text-neutral-600 dark:hover:text-white/40">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
