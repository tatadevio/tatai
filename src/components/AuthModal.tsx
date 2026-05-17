"use client";

import { useState, useRef, useEffect } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GithubAuthProvider,
  signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Phone, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { TataILogo } from "./Logo";

type Tab = "email" | "phone";
type EmailMode = "signin" | "signup";

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier; }
}

export function AuthModal() {
  const { showLogin, setShowLogin } = useAuth();
  const [tab, setTab] = useState<Tab>("email");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLogin) {
      setError(""); setEmail(""); setPassword(""); setPhone(""); setOtp("");
      setOtpSent(false); setConfirmResult(null);
    }
  }, [showLogin]);

  function friendlyError(code: string) {
    const map: Record<string, string> = {
      "auth/user-not-found": "No account with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "Email already registered. Sign in instead.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-phone-number": "Invalid phone number. Use international format (+1234567890).",
      "auth/invalid-verification-code": "Wrong OTP code. Try again.",
      "auth/too-many-requests": "Too many attempts. Please wait a moment.",
      "auth/popup-closed-by-user": "Login cancelled.",
      "auth/account-exists-with-different-credential": "Account exists with different sign-in method.",
    };
    return map[code] ?? "Something went wrong. Please try again.";
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (emailMode === "signin") {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as {code: string}).code));
    } finally { setLoading(false); }
  }

  async function handleGithub() {
    setLoading(true); setError("");
    try {
      await signInWithPopup(auth, new GithubAuthProvider());
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as {code: string}).code));
    } finally { setLoading(false); }
  }

  async function sendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current!, { size: "invisible" });
      }
      const result = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setConfirmResult(result);
      setOtpSent(true);
    } catch (err: unknown) {
      setError(friendlyError((err as {code: string}).code));
    } finally { setLoading(false); }
  }

  async function verifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmResult) return;
    setLoading(true); setError("");
    try {
      await confirmResult.confirm(otp);
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as {code: string}).code));
    } finally { setLoading(false); }
  }

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
      <div className="w-full max-w-[400px] bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/[0.08] overflow-hidden" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <TataILogo className="w-7 h-7" />
            <span className="font-bold text-[16px] text-neutral-900 dark:text-white">Sign in to tataI</span>
          </div>
          <button onClick={() => setShowLogin(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] text-neutral-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          {/* GitHub */}
          <button
            onClick={handleGithub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-sm font-medium text-neutral-800 dark:text-white disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/[0.08]" />
            <span className="text-xs text-neutral-400 dark:text-neutral-500">OR</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/[0.08]" />
          </div>

          {/* Tabs */}
          <div className="flex bg-neutral-100 dark:bg-white/[0.05] rounded-xl p-1">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  tab === t
                    ? "bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white/70"
                }`}
              >
                {t === "email" ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                {t === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>

          {/* Email form */}
          {tab === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {emailMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {emailMode === "signin" ? "Sign in" : "Create account"}
              </button>

              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                {emailMode === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => { setEmailMode(m => m === "signin" ? "signup" : "signin"); setError(""); }} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  {emailMode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </form>
          )}

          {/* Phone form */}
          {tab === "phone" && (
            <div className="space-y-3">
              {!otpSent ? (
                <form onSubmit={sendOTP} className="space-y-3">
                  <input
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                  />
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Use international format, e.g. +1 for US</p>
                  {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Send code
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOTP} className="space-y-3">
                  <button type="button" onClick={() => { setOtpSent(false); setError(""); }} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Change number
                  </button>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">Code sent to <strong>{phone}</strong></p>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 text-sm focus:outline-none focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
                  />
                  {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
                  <button type="submit" disabled={loading || otp.length < 6} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Verify & sign in
                  </button>
                </form>
              )}
              <div ref={recaptchaRef} />
            </div>
          )}

          <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500">
            By signing in you agree to our{" "}
            <a href="/terms" className="underline hover:text-neutral-600 dark:hover:text-neutral-300">Terms</a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-neutral-600 dark:hover:text-neutral-300">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
