"use client";

export const dynamic = "force-dynamic";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Code, FileText, Search, Zap, Crown,
  MessageSquare, Settings, ChevronRight, Info, Shield,
  FileTerminal, PanelLeft,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TataILogo } from "@/components/Logo";

const SUGGESTIONS = [
  { icon: Code, label: "Write code", desc: "Debug, build, explain", prompt: "Help me write a Python script to sort a list of files by date." },
  { icon: FileText, label: "Draft content", desc: "Emails, posts, docs", prompt: "Write a professional LinkedIn post about launching a new AI startup." },
  { icon: Search, label: "Research", desc: "Explain anything", prompt: "Explain how large language models work in simple terms." },
  { icon: Zap, label: "Brainstorm", desc: "Ideas & strategy", prompt: "Give me 10 startup ideas in the AI space for 2026." },
];

const BOTTOM_LINKS = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Info, label: "About tataI", href: "/about" },
  { icon: Shield, label: "Privacy Policy", href: "/privacy" },
  { icon: FileTerminal, label: "Terms of Service", href: "/terms" },
];

interface UserData { plan: "free" | "pro"; messages_today: number; messages_total: number; }
interface Session { id: string; title: string; }

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [limitError, setLimitError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchUserData = useCallback(async () => {
    const res = await fetch("/api/user");
    if (res.ok) setUserData(await res.json());
  }, []);

  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => setLimitError("Daily limit reached. Upgrade to Pro for unlimited messages."),
    onFinish: () => fetchUserData(),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    if (!input.trim() || isLoading) return;
    setLimitError("");
    const text = input.trim();
    if (messages.length === 0) setSessions((p) => [{ id: Date.now().toString(), title: text.slice(0, 36) }, ...p]);
    sendMessage({ text });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function newChat() { setMessages([]); setInput(""); setLimitError(""); }

  const isPro = userData?.plan === "pro";
  const messagesLeft = userData ? Math.max(0, 10 - (userData.messages_today ?? 0)) : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-full bg-neutral-50 dark:bg-[#0a0a0a]">

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-[260px]" : "w-0"} transition-all duration-200 overflow-hidden flex-shrink-0 flex flex-col bg-white dark:bg-[#111] border-r border-neutral-200 dark:border-white/[0.06]`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-[18px]">
          <TataILogo className="w-8 h-8 flex-shrink-0" />
          <span className="font-bold text-[17px] tracking-tight text-neutral-900 dark:text-white">tataI</span>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-1">
          <button onClick={newChat} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.06] transition-colors text-sm text-neutral-500 dark:text-white/50 hover:text-neutral-900 dark:hover:text-white group">
            <div className="w-6 h-6 rounded-lg bg-neutral-100 dark:bg-white/[0.06] group-hover:bg-neutral-200 dark:group-hover:bg-white/10 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            New conversation
          </button>
        </div>

        {/* Chat history */}
        <ScrollArea className="flex-1 px-3">
          {sessions.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-neutral-400 dark:text-white/25 px-3 pt-3 pb-1.5 uppercase tracking-widest">Recent</p>
              {sessions.map((s) => (
                <button key={s.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm truncate transition-colors text-neutral-500 dark:text-white/40 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-800 dark:hover:text-white/70 text-left">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  {s.title}
                </button>
              ))}
            </>
          )}
        </ScrollArea>

        {/* Bottom links */}
        <div className="px-3 py-2 border-t border-neutral-100 dark:border-white/[0.06]">
          {BOTTOM_LINKS.map(({ icon: Icon, label, href }) => (
            <button key={label} onClick={() => router.push(href)} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-500 dark:text-white/40 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-800 dark:hover:text-white/70 transition-colors text-left">
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Upgrade + user */}
        <div className="p-3 border-t border-neutral-100 dark:border-white/[0.06] space-y-1">
          {!isPro ? (
            <button onClick={() => router.push("/upgrade")} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-600/15 dark:to-violet-600/15 hover:from-blue-100 dark:hover:from-blue-600/25 hover:to-violet-100 dark:hover:to-violet-600/25 border border-blue-100 dark:border-blue-500/20 transition-all group">
              <Crown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Upgrade to Pro</p>
                {messagesLeft !== null && <p className="text-xs text-blue-500/60 dark:text-blue-400/50">{messagesLeft} messages left today</p>}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-blue-500/50 group-hover:text-blue-600 dark:text-blue-400/50 transition-colors" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-600 dark:text-amber-400 font-semibold">Pro — Unlimited</span>
            </div>
          )}

          <button onClick={() => router.push("/settings")} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors">
            <UserButton />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm font-medium text-neutral-700 dark:text-white/70 truncate">{user?.firstName ?? user?.username ?? "You"}</p>
              <p className="text-xs text-neutral-400 dark:text-white/25 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white/80 dark:bg-transparent backdrop-blur-sm">
          <button onClick={() => setSidebarOpen((v) => !v)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40 hover:text-neutral-700 dark:hover:text-white">
            <PanelLeft className="w-4 h-4" />
          </button>
          {!sidebarOpen && (
            <div className="flex items-center gap-2">
              <TataILogo className="w-6 h-6" />
              <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataI</span>
            </div>
          )}
          {isPro && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-400/15 px-2.5 py-1 rounded-full">
              <Crown className="w-3 h-3" /> Pro
            </span>
          )}
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full py-16 px-6 gap-10">
              <div className="text-center">
                <TataILogo className="w-14 h-14 mx-auto mb-5 drop-shadow-xl" />
                <h1 className="text-[28px] font-bold text-neutral-900 dark:text-white mb-2 tracking-tight">
                  {greeting}{user?.firstName ? `, ${user.firstName}` : ""}
                </h1>
                <p className="text-neutral-500 dark:text-white/35 text-[15px]">What can I help you with today?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-[520px]">
                {SUGGESTIONS.map(({ icon: Icon, label, desc, prompt }) => (
                  <button key={label} onClick={() => { setSessions((p) => [{ id: Date.now().toString(), title: prompt.slice(0, 36) }, ...p]); sendMessage({ text: prompt }); }}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-white dark:bg-white/[0.04] hover:bg-neutral-50 dark:hover:bg-white/[0.08] border border-neutral-200 dark:border-white/[0.07] hover:border-blue-200 dark:hover:border-white/[0.14] transition-all text-left group shadow-sm hover:shadow-md dark:shadow-none">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-white/80 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{label}</p>
                      <p className="text-xs text-neutral-400 dark:text-white/30 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-5 py-8 flex flex-col gap-7">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" && <TataILogo className="w-8 h-8 flex-shrink-0 mt-1 drop-shadow-md" />}
                  <div className={`max-w-[78%] text-[14.5px] leading-relaxed rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-md shadow-lg shadow-blue-500/20"
                      : "bg-white dark:bg-white/[0.05] text-neutral-800 dark:text-white/85 border border-neutral-200 dark:border-white/[0.07] rounded-tl-md shadow-sm dark:shadow-none"
                  }`}>
                    {m.parts.map((part, i) => part.type === "text" ? <span key={i} className="whitespace-pre-wrap">{part.text}</span> : null)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <TataILogo className="w-8 h-8 flex-shrink-0 drop-shadow-md" />
                  <div className="bg-white dark:bg-white/[0.05] border border-neutral-200 dark:border-white/[0.07] rounded-2xl rounded-tl-md px-4 py-3.5 flex items-center gap-1.5 shadow-sm dark:shadow-none">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400/70 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 pb-5 pt-3 bg-white/80 dark:bg-transparent backdrop-blur-sm border-t border-neutral-200 dark:border-white/[0.06]">
          <div className="max-w-[720px] mx-auto">
            {limitError && (
              <div className="mb-3 flex items-center justify-between bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-3">
                <p className="text-amber-700 dark:text-amber-400 text-sm">{limitError}</p>
                <button onClick={() => router.push("/upgrade")} className="ml-3 text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
                  Upgrade →
                </button>
              </div>
            )}
            <div className="flex items-end gap-3 bg-white dark:bg-white/[0.05] border border-neutral-200 dark:border-white/[0.09] hover:border-blue-300 dark:hover:border-white/[0.14] focus-within:border-blue-500 dark:focus-within:border-blue-500/50 rounded-2xl px-4 py-3 transition-all shadow-sm dark:shadow-none">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask tataI anything..."
                className="flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-white/25 text-[14.5px] min-h-[24px] max-h-[180px] p-0 leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 hover:scale-105"
                    : "bg-neutral-100 dark:bg-white/[0.07] cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-white dark:text-white" />
              </button>
            </div>
            <p className="text-center text-neutral-400 dark:text-white/[0.18] text-xs mt-2.5">tataI can make mistakes. Always verify important information.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
