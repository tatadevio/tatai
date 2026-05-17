"use client";

import { useState, useRef, useEffect } from "react";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, GithubAuthProvider, GoogleAuthProvider,
  signInWithPhoneNumber, RecaptchaVerifier, ConfirmationResult,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { X, Mail, Phone, Eye, EyeOff, ArrowLeft, Loader2, ChevronDown, Search } from "lucide-react";
import { TataILogo } from "./Logo";

type Tab = "email" | "phone";
type EmailMode = "signin" | "signup";

declare global {
  interface Window { recaptchaVerifier?: RecaptchaVerifier; }
}

const COUNTRIES = [
  { code: "+1",   flag: "🇺🇸", name: "United States",   iso: "US" },
  { code: "+44",  flag: "🇬🇧", name: "United Kingdom",   iso: "GB" },
  { code: "+7",   flag: "🇷🇺", name: "Russia",           iso: "RU" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan",       iso: "KG" },
  { code: "+7",   flag: "🇰🇿", name: "Kazakhstan",       iso: "KZ" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan",       iso: "UZ" },
  { code: "+90",  flag: "🇹🇷", name: "Turkey",           iso: "TR" },
  { code: "+971", flag: "🇦🇪", name: "UAE",               iso: "AE" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia",     iso: "SA" },
  { code: "+49",  flag: "🇩🇪", name: "Germany",          iso: "DE" },
  { code: "+33",  flag: "🇫🇷", name: "France",           iso: "FR" },
  { code: "+39",  flag: "🇮🇹", name: "Italy",            iso: "IT" },
  { code: "+34",  flag: "🇪🇸", name: "Spain",            iso: "ES" },
  { code: "+31",  flag: "🇳🇱", name: "Netherlands",      iso: "NL" },
  { code: "+48",  flag: "🇵🇱", name: "Poland",           iso: "PL" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine",          iso: "UA" },
  { code: "+86",  flag: "🇨🇳", name: "China",            iso: "CN" },
  { code: "+81",  flag: "🇯🇵", name: "Japan",            iso: "JP" },
  { code: "+82",  flag: "🇰🇷", name: "South Korea",      iso: "KR" },
  { code: "+91",  flag: "🇮🇳", name: "India",            iso: "IN" },
  { code: "+92",  flag: "🇵🇰", name: "Pakistan",         iso: "PK" },
  { code: "+880", flag: "🇧🇩", name: "Bangladesh",       iso: "BD" },
  { code: "+62",  flag: "🇮🇩", name: "Indonesia",        iso: "ID" },
  { code: "+60",  flag: "🇲🇾", name: "Malaysia",         iso: "MY" },
  { code: "+63",  flag: "🇵🇭", name: "Philippines",      iso: "PH" },
  { code: "+66",  flag: "🇹🇭", name: "Thailand",         iso: "TH" },
  { code: "+84",  flag: "🇻🇳", name: "Vietnam",          iso: "VN" },
  { code: "+20",  flag: "🇪🇬", name: "Egypt",            iso: "EG" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria",          iso: "NG" },
  { code: "+27",  flag: "🇿🇦", name: "South Africa",     iso: "ZA" },
  { code: "+254", flag: "🇰🇪", name: "Kenya",            iso: "KE" },
  { code: "+55",  flag: "🇧🇷", name: "Brazil",           iso: "BR" },
  { code: "+52",  flag: "🇲🇽", name: "Mexico",           iso: "MX" },
  { code: "+54",  flag: "🇦🇷", name: "Argentina",        iso: "AR" },
  { code: "+57",  flag: "🇨🇴", name: "Colombia",         iso: "CO" },
  { code: "+56",  flag: "🇨🇱", name: "Chile",            iso: "CL" },
  { code: "+1",   flag: "🇨🇦", name: "Canada",           iso: "CA" },
  { code: "+61",  flag: "🇦🇺", name: "Australia",        iso: "AU" },
  { code: "+64",  flag: "🇳🇿", name: "New Zealand",      iso: "NZ" },
  { code: "+972", flag: "🇮🇱", name: "Israel",           iso: "IL" },
  { code: "+98",  flag: "🇮🇷", name: "Iran",             iso: "IR" },
  { code: "+964", flag: "🇮🇶", name: "Iraq",             iso: "IQ" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait",           iso: "KW" },
  { code: "+974", flag: "🇶🇦", name: "Qatar",            iso: "QA" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan",       iso: "AZ" },
  { code: "+995", flag: "🇬🇪", name: "Georgia",          iso: "GE" },
  { code: "+374", flag: "🇦🇲", name: "Armenia",          iso: "AM" },
  { code: "+375", flag: "🇧🇾", name: "Belarus",          iso: "BY" },
  { code: "+32",  flag: "🇧🇪", name: "Belgium",          iso: "BE" },
  { code: "+46",  flag: "🇸🇪", name: "Sweden",           iso: "SE" },
  { code: "+47",  flag: "🇳🇴", name: "Norway",           iso: "NO" },
  { code: "+45",  flag: "🇩🇰", name: "Denmark",          iso: "DK" },
  { code: "+358", flag: "🇫🇮", name: "Finland",          iso: "FI" },
  { code: "+41",  flag: "🇨🇭", name: "Switzerland",      iso: "CH" },
  { code: "+43",  flag: "🇦🇹", name: "Austria",          iso: "AT" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic",   iso: "CZ" },
  { code: "+36",  flag: "🇭🇺", name: "Hungary",          iso: "HU" },
  { code: "+40",  flag: "🇷🇴", name: "Romania",          iso: "RO" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria",         iso: "BG" },
  { code: "+30",  flag: "🇬🇷", name: "Greece",           iso: "GR" },
  { code: "+351", flag: "🇵🇹", name: "Portugal",         iso: "PT" },
  { code: "+353", flag: "🇮🇪", name: "Ireland",          iso: "IE" },
];

export function AuthModal() {
  const { showLogin, setShowLogin } = useAuth();
  const [tab, setTab] = useState<Tab>("email");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropOpen, setCountryDropOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [confirmResult, setConfirmResult] = useState<ConfirmationResult | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!showLogin) {
      setError(""); setEmail(""); setPassword(""); setPhoneNum(""); setOtp("");
      setOtpSent(false); setConfirmResult(null); setCountryDropOpen(false);
    }
  }, [showLogin]);

  useEffect(() => {
    if (countryDropOpen) setTimeout(() => countrySearchRef.current?.focus(), 50);
  }, [countryDropOpen]);

  const filteredCountries = countrySearch
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.includes(countrySearch)
      )
    : COUNTRIES;

  function friendlyError(code: string) {
    const map: Record<string, string> = {
      "auth/user-not-found": "No account with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/invalid-credential": "Wrong email or password.",
      "auth/email-already-in-use": "Email already registered. Sign in instead.",
      "auth/invalid-email": "Invalid email address.",
      "auth/weak-password": "Password must be at least 6 characters.",
      "auth/invalid-phone-number": "Invalid phone number. Include country code.",
      "auth/invalid-verification-code": "Wrong OTP code. Try again.",
      "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
      "auth/popup-closed-by-user": "Login cancelled.",
      "auth/account-exists-with-different-credential": "Account exists with a different sign-in method.",
      "auth/cancelled-popup-request": "Only one login window allowed at a time.",
      "auth/unauthorized-domain": "This domain is not authorized. Contact support.",
      "auth/captcha-check-failed": "reCAPTCHA failed. Please refresh and try again.",
      "auth/quota-exceeded": "SMS quota exceeded. Try again later.",
      "auth/missing-phone-number": "Please enter a phone number.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/internal-error": "Server error. Please try again.",
    };
    return map[code] ?? `Something went wrong (${code}).`;
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const firebaseAuth = getFirebaseAuth();
      if (emailMode === "signin") {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        // Set display name: use entered name, or derive from email
        const displayName = name.trim() || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        await updateProfile(cred.user, { displayName });
      }
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as { code: string }).code));
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    setLoading(true); setError("");
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as { code: string }).code));
    } finally { setLoading(false); }
  }

  async function handleGithub() {
    setLoading(true); setError("");
    try {
      await signInWithPopup(getFirebaseAuth(), new GithubAuthProvider());
      setShowLogin(false);
    } catch (err: unknown) {
      setError(friendlyError((err as { code: string }).code));
    } finally { setLoading(false); }
  }

  async function sendOTP(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const fullPhone = `${selectedCountry.code}${phoneNum.replace(/^0+/, "")}`;
    try {
      const firebaseAuth = getFirebaseAuth();
      // Always create a fresh verifier to avoid stale state
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = undefined;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, recaptchaRef.current!, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => { window.recaptchaVerifier = undefined; },
      });
      const result = await signInWithPhoneNumber(firebaseAuth, fullPhone, window.recaptchaVerifier);
      setConfirmResult(result);
      setOtpSent(true);
    } catch (err: unknown) {
      // Reset verifier so next attempt starts fresh
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch {}
        window.recaptchaVerifier = undefined;
      }
      setError(friendlyError((err as { code: string }).code));
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
      setError(friendlyError((err as { code: string }).code));
    } finally { setLoading(false); }
  }

  if (!showLogin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
      <div
        className="w-full sm:max-w-[400px] bg-white dark:bg-[#1a1a1a] rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-neutral-200 dark:border-white/[0.08] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar on mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <TataILogo className="w-7 h-7" />
            <span className="font-bold text-[15px] text-neutral-900 dark:text-white">Sign in to tatAI</span>
          </div>
          <button onClick={() => setShowLogin(false)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] text-neutral-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-3">

          {/* Social buttons */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] active:scale-[0.97] transition-all text-[13px] font-medium text-neutral-800 dark:text-white disabled:opacity-50"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
            <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-neutral-200 dark:bg-white/[0.08]" />
          </div>

          {/* Tabs */}
          <div className="flex bg-neutral-100 dark:bg-white/[0.05] rounded-xl p-1">
            {(["email", "phone"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-white dark:bg-white/[0.1] text-neutral-900 dark:text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {t === "email" ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                {t === "email" ? "Email" : "Phone"}
              </button>
            ))}
          </div>

          {/* ── Email form ── */}
          {tab === "email" && (
            <form onSubmit={handleEmailAuth} className="space-y-2.5">
              {emailMode === "signup" && (
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
              />
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={emailMode === "signin" ? "current-password" : "new-password"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors pr-10"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && <p className="text-red-500 dark:text-red-400 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

              <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {emailMode === "signin" ? "Sign in" : "Create account"}
              </button>

              <p className="text-center text-[12px] text-neutral-500 dark:text-neutral-400">
                {emailMode === "signin" ? "No account? " : "Already have one? "}
                <button type="button" onClick={() => { setEmailMode(m => m === "signin" ? "signup" : "signin"); setError(""); }} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  {emailMode === "signin" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </form>
          )}

          {/* ── Phone form ── */}
          {tab === "phone" && (
            <div className="space-y-2.5">
              {!otpSent ? (
                <form onSubmit={sendOTP} className="space-y-2.5">
                  {/* Phone input with country picker */}
                  <div className="flex gap-2">
                    {/* Country selector */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setCountryDropOpen(v => !v)}
                        className="h-full flex items-center gap-1.5 px-3 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-800 dark:text-white text-sm hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="font-medium text-[13px]">{selectedCountry.code}</span>
                        <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                      </button>

                      {countryDropOpen && (
                        <>
                          <div className="fixed inset-0 z-50" onClick={() => setCountryDropOpen(false)} />
                          <div className="absolute bottom-full mb-1 left-0 z-50 w-[260px] bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-white/[0.1] rounded-2xl shadow-xl overflow-hidden">
                            {/* Search */}
                            <div className="p-2 border-b border-neutral-100 dark:border-white/[0.06]">
                              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50 dark:bg-white/[0.05] rounded-lg">
                                <Search className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                                <input
                                  ref={countrySearchRef}
                                  type="text"
                                  placeholder="Search country..."
                                  value={countrySearch}
                                  onChange={(e) => setCountrySearch(e.target.value)}
                                  className="flex-1 bg-transparent text-[13px] text-neutral-800 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="max-h-[200px] overflow-y-auto">
                              {filteredCountries.map((c, i) => (
                                <button
                                  key={`${c.iso}-${i}`}
                                  type="button"
                                  onClick={() => { setSelectedCountry(c); setCountryDropOpen(false); setCountrySearch(""); }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-colors text-left ${selectedCountry.iso === c.iso && selectedCountry.code === c.code ? "bg-blue-50 dark:bg-blue-500/10" : ""}`}
                                >
                                  <span className="text-lg leading-none">{c.flag}</span>
                                  <span className="flex-1 text-[13px] text-neutral-800 dark:text-white truncate">{c.name}</span>
                                  <span className="text-[12px] font-medium text-neutral-400 dark:text-neutral-500 flex-shrink-0">{c.code}</span>
                                </button>
                              ))}
                              {filteredCountries.length === 0 && (
                                <p className="text-center text-sm text-neutral-400 py-6">No results</p>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Phone number input */}
                    <input
                      type="tel"
                      placeholder="Phone number"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value.replace(/[^0-9]/g, ""))}
                      required
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                    />
                  </div>

                  {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

                  <button type="submit" disabled={loading || phoneNum.length < 6} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send verification code
                  </button>
                </form>
              ) : (
                <form onSubmit={verifyOTP} className="space-y-2.5">
                  <button type="button" onClick={() => { setOtpSent(false); setError(""); }} className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-3.5 h-3.5" /> Change number
                  </button>
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">
                    Code sent to <strong className="text-neutral-800 dark:text-white">{selectedCountry.code} {phoneNum}</strong>
                  </p>
                  <div className="flex gap-2 justify-center">
                    {[0,1,2,3,4,5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={otp[i] ?? ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          const arr = otp.split("");
                          arr[i] = v;
                          const next = arr.join("").slice(0, 6);
                          setOtp(next);
                          if (v && i < 5) {
                            const nextInput = e.target.parentElement?.children[i + 1] as HTMLInputElement;
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            const prev = (e.target as HTMLInputElement).parentElement?.children[i - 1] as HTMLInputElement;
                            prev?.focus();
                          }
                        }}
                        className="w-10 h-12 text-center text-lg font-bold rounded-xl border-2 border-neutral-200 dark:border-white/[0.1] bg-neutral-50 dark:bg-white/[0.04] text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      />
                    ))}
                  </div>

                  {error && <p className="text-red-500 text-xs bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">{error}</p>}

                  <button type="submit" disabled={loading || otp.length < 6} className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Verify & sign in
                  </button>
                </form>
              )}
              <div ref={recaptchaRef} />
            </div>
          )}

          <p className="text-center text-[11px] text-neutral-400 dark:text-neutral-500 pt-1">
            By continuing you agree to our{" "}
            <a href="/terms" className="underline hover:text-neutral-600 dark:hover:text-neutral-300">Terms</a>{" "}
            &{" "}
            <a href="/privacy" className="underline hover:text-neutral-600 dark:hover:text-neutral-300">Privacy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
