"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sun, Moon, Monitor, Crown, ChevronRight } from "lucide-react";
import { TataILogo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111] sticky top-0 z-10">
        <button onClick={() => router.push("/")} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/40">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <TataILogo className="w-6 h-6" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataI</span>
        </div>
        <span className="text-neutral-400 dark:text-white/30">/</span>
        <h1 className="font-semibold text-neutral-900 dark:text-white">Settings</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Profile */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05]">
            <h2 className="font-semibold text-neutral-900 dark:text-white text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">Profile</h2>
          </div>
          <div className="px-6 py-5 flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {(user?.displayName ?? user?.email ?? "U")[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white text-[15px]">{user?.displayName ?? "Guest"}</p>
              <p className="text-sm text-neutral-500 dark:text-white/40 mt-0.5">{user?.email ?? "Not signed in"}</p>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05]">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">Appearance</h2>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm font-medium text-neutral-700 dark:text-white/70 mb-3">Theme</p>
            {mounted && (
              <div className="flex gap-2">
                {THEMES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all ${
                      theme === value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "border-neutral-200 dark:border-white/[0.07] text-neutral-500 dark:text-white/40 hover:border-neutral-300 dark:hover:border-white/[0.12] hover:bg-neutral-50 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-100 dark:border-white/[0.05]">
            <h2 className="font-semibold text-sm uppercase tracking-wider text-neutral-500 dark:text-white/40">Subscription</h2>
          </div>
          <button onClick={() => router.push("/upgrade")} className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/20 flex items-center justify-center">
                <Crown className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-neutral-800 dark:text-white/80">Upgrade to Pro</p>
                <p className="text-xs text-neutral-400 dark:text-white/30">Unlimited messages, $9.99/month</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-white/30" />
          </button>
        </section>

        {/* Links */}
        <section className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl overflow-hidden divide-y divide-neutral-100 dark:divide-white/[0.05]">
          {[
            { label: "About tataI", href: "/about" },
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ].map(({ label, href }) => (
            <button key={label} onClick={() => router.push(href)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-neutral-50 dark:hover:bg-white/[0.03] transition-colors">
              <span className="text-sm text-neutral-700 dark:text-white/70">{label}</span>
              <ChevronRight className="w-4 h-4 text-neutral-400 dark:text-white/30" />
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}
