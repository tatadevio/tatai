"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithRedirect, getRedirectResult, GoogleAuthProvider, updateProfile, sendPasswordResetEmail,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, Eye, EyeOff, Loader2 } from "lucide-react";
import { TataILogo } from "./Logo";

type Mode = "signin" | "signup";

const ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Wrong email or password",
  "auth/email-already-in-use": "Email already in use",
  "auth/weak-password": "Password must be at least 6 characters",
  "auth/invalid-email": "Invalid email address",
  "auth/user-not-found": "No account with that email",
  "auth/wrong-password": "Wrong password",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
};

function friendly(code: string) {
  return ERRORS[code] ?? "Something went wrong. Please try again.";
}

function consumeRedirect(router: ReturnType<typeof useRouter>) {
  const dest = typeof window !== "undefined"
    ? sessionStorage.getItem("tatai_login_redirect")
    : null;
  if (dest) {
    sessionStorage.removeItem("tatai_login_redirect");
    router.push(dest);
  }
}

export function AuthModal() {
  const { showLogin, setShowLogin } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email.trim()) { setError("Enter your email first, then click Forgot password"); return; }
    setResetLoading(true); setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) { setError("Auth not configured"); return; }
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (e: unknown) {
      setError(friendly((e as { code?: string }).code ?? ""));
    } finally { setResetLoading(false); }
  }

  if (!showLogin) return null;

  async function handleGoogle() {
    setLoading(true); setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) { setError("Auth not configured"); return; }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithRedirect(auth, provider);
      // Page will redirect — result is handled in AuthProvider via getRedirectResult
    } catch (e: unknown) {
      const code = (e as { code?: string }).code ?? "";
      const msg = friendly(code);
      if (msg) setError(msg);
      setLoading(false);
    }
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { setError("Fill in all fields"); return; }
    if (mode === "signup" && !name.trim()) { setError("Enter your name"); return; }
    if (mode === "signup" && !agreedToTerms) { setError("Please agree to the Terms of Service and Privacy Policy"); return; }
    setLoading(true); setError("");
    try {
      const auth = getFirebaseAuth();
      if (!auth) { setError("Auth not configured"); return; }
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      setShowLogin(false);
      consumeRedirect(router);
    } catch (e: unknown) {
      setError(friendly((e as { code?: string }).code ?? ""));
    } finally { setLoading(false); }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={() => setShowLogin(false)}
    >
      <div
        className="w-full sm:max-w-[400px] bg-white dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-neutral-200 dark:border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <TataILogo className="w-7 h-7" />
            <span className="font-bold text-[15px] text-neutral-900 dark:text-white">Sign in to tatAI</span>
          </div>
          <button
            onClick={() => setShowLogin(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] text-neutral-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] active:scale-[0.98] transition-all text-[14px] font-semibold text-neutral-800 dark:text-white disabled:opacity-50"
          >
            <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/[0.08]" />
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/[0.08]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
              className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500/60 transition-colors"
            />
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full bg-neutral-50 dark:bg-white/[0.04] border border-neutral-200 dark:border-white/[0.08] rounded-xl px-4 py-3 pr-11 text-[14px] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/30 focus:outline-none focus:border-blue-500/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-white/30 hover:text-neutral-600 dark:hover:text-white/60 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === "signin" && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-[12px] text-blue-500 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {resetLoading ? "Sending…" : "Forgot password?"}
                </button>
              </div>
            )}

            {resetSent && (
              <p className="text-green-500 dark:text-green-400 text-[12.5px] text-center bg-green-500/10 rounded-lg px-3 py-2">
                ✓ Reset link sent! Check your email.
              </p>
            )}

            {error && (
              <p className="text-red-500 dark:text-red-400 text-[12.5px] text-center">{error}</p>
            )}

            {/* Terms checkbox — signup only */}
            {mode === "signup" && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setAgreedToTerms(v => !v)}
                  className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    agreedToTerms
                      ? "bg-blue-600 border-blue-600"
                      : "border-neutral-300 dark:border-white/20 hover:border-blue-400"
                  }`}
                >
                  {agreedToTerms && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-[12.5px] text-neutral-500 dark:text-white/40 leading-5">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[14px] font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-[13px] text-neutral-500 dark:text-white/40">
            {mode === "signin" ? "No account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(m => m === "signin" ? "signup" : "signin"); setError(""); setResetSent(false); setAgreedToTerms(false); }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {mode === "signin" ? "Sign up free" : "Sign in"}
            </button>
          </p>

          {/* Passive notice for sign in */}
          {mode === "signin" && (
            <p className="text-center text-[11px] text-neutral-400 dark:text-white/20">
              By signing in, you agree to our{" "}
              <a href="/terms" target="_blank" className="underline hover:text-neutral-600 dark:hover:text-white/40">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="underline hover:text-neutral-600 dark:hover:text-white/40">Privacy Policy</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
