import { ArrowLeft, Sparkles, Zap, Shield, Globe } from "lucide-react";
import Link from "next/link";
import { TataILogo } from "@/components/Logo";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111] sticky top-0 z-10">
        <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/40">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <TataILogo className="w-6 h-6" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataI</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <TataILogo className="w-16 h-16 mx-auto mb-5 drop-shadow-xl" />
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-3">About tataI</h1>
          <p className="text-neutral-500 dark:text-white/40 text-[16px] leading-relaxed">
            Your personal AI assistant, built to make you more productive, creative, and informed.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {[
            { icon: Sparkles, title: "Powered by AI", desc: "State-of-the-art language models for smart, accurate responses." },
            { icon: Zap, title: "Fast & Reliable", desc: "Streaming responses so you see answers as they're generated." },
            { icon: Shield, title: "Private & Secure", desc: "Your conversations are encrypted and never sold to third parties." },
            { icon: Globe, title: "Always Available", desc: "Access tataI from any device, anywhere, anytime." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-neutral-800 dark:text-white/80 text-sm mb-1">{title}</h3>
              <p className="text-xs text-neutral-500 dark:text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl p-6 text-center">
          <p className="text-sm text-neutral-500 dark:text-white/40">tataI v1.0 — Built with passion.</p>
          <p className="text-xs text-neutral-400 dark:text-white/20 mt-1">© {new Date().getFullYear()} tataI. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
