"use client";

export const dynamic = "force-dynamic";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Sparkles, Code, FileText, Search, Zap,
  Menu, Crown, MessageSquare, Settings, ChevronRight
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
  { icon: Code, label: "Write code", desc: "Debug, build, explain", prompt: "Help me write a Python script to sort a list of files by date." },
  { icon: FileText, label: "Draft content", desc: "Emails, posts, docs", prompt: "Write a professional LinkedIn post about launching a new AI startup." },
  { icon: Search, label: "Research", desc: "Explain anything", prompt: "Explain how large language models work in simple terms." },
  { icon: Zap, label: "Brainstorm", desc: "Ideas & strategy", prompt: "Give me 10 startup ideas in the AI space for 2026." },
];

interface UserData {
  plan: "free" | "pro";
  messages_today: number;
  messages_total: number;
}

interface ChatSession {
  id: string;
  title: string;
}

export default function Home() {
  const { user } = useUser();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || isLoading) return;
    setLimitError("");
    const text = input.trim();
    if (messages.length === 0) {
      setSessions((p) => [{ id: Date.now().toString(), title: text.slice(0, 36) }, ...p]);
    }
    sendMessage({ text });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function newChat() { setMessages([]); setInput(""); setLimitError(""); }

  function handleSuggestion(prompt: string) {
    setLimitError("");
    setSessions((p) => [{ id: Date.now().toString(), title: prompt.slice(0, 36) }, ...p]);
    sendMessage({ text: prompt });
  }

  const isPro = userData?.plan === "pro";
  const messagesLeft = userData ? Math.max(0, 10 - (userData.messages_today ?? 0)) : null;

  return (
    <div className="flex h-full bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-[260px]" : "w-0"} transition-all duration-200 overflow-hidden flex-shrink-0 flex flex-col bg-[#111111] border-r border-white/[0.06]`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[17px] text-white tracking-tight">tataI</span>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-2">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-sm text-white/60 hover:text-white group"
          >
            <div className="w-6 h-6 rounded-lg bg-white/[0.06] group-hover:bg-white/10 flex items-center justify-center transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            New conversation
          </button>
        </div>

        {/* History */}
        <ScrollArea className="flex-1 px-3">
          {sessions.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-white/25 px-3 pt-3 pb-1.5 uppercase tracking-widest">Recent</p>
              {sessions.map((s) => (
                <button key={s.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm truncate transition-colors text-white/40 hover:bg-white/[0.05] hover:text-white/70 text-left">
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
                  {s.title}
                </button>
              ))}
            </>
          )}
        </ScrollArea>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/[0.06] space-y-1">
          {!isPro ? (
            <button
              onClick={() => router.push("/upgrade")}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 border border-violet-500/20 transition-all group"
            >
              <Crown className="w-4 h-4 text-violet-400" />
              <div className="flex-1 text-left">
                <p className="text-sm text-violet-300 font-medium">Upgrade to Pro</p>
                {messagesLeft !== null && (
                  <p className="text-xs text-violet-400/50">{messagesLeft} messages left today</p>
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-violet-400/50 group-hover:text-violet-400 transition-colors" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-yellow-400/80 font-medium">Pro — Unlimited</span>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer">
            <UserButton />
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white/70 font-medium truncate">{user?.firstName ?? user?.username ?? "You"}</p>
              <p className="text-xs text-white/25 truncate">{user?.emailAddresses?.[0]?.emailAddress}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-white/20" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.08] transition-colors text-white/40 hover:text-white"
          >
            <Menu className="w-4 h-4" />
          </button>
          {!sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">tataI</span>
            </div>
          )}
          {isPro && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/15 px-2.5 py-1 rounded-full font-medium">
              <Crown className="w-3 h-3" /> Pro
            </span>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full py-16 px-6 gap-10">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mx-auto mb-5">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-[28px] font-bold text-white mb-2 tracking-tight">
                  Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}{user?.firstName ? `, ${user.firstName}` : ""}
                </h1>
                <p className="text-white/35 text-[15px]">What can I help you with today?</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-[520px]">
                {SUGGESTIONS.map(({ icon: Icon, label, desc, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleSuggestion(prompt)}
                    className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-white/[0.12] transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-all">
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{label}</p>
                      <p className="text-xs text-white/30 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-[700px] mx-auto px-5 py-8 flex flex-col gap-7">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-violet-500/20">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] text-[14.5px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-2xl rounded-tr-md px-4 py-3 shadow-lg shadow-violet-500/20"
                      : "text-white/85 rounded-2xl rounded-tl-md px-4 py-3 bg-white/[0.05] border border-white/[0.07]"
                  }`}>
                    {m.parts.map((part, i) =>
                      part.type === "text" ? (
                        <span key={i} className="whitespace-pre-wrap">{part.text}</span>
                      ) : null
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/20">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/[0.05] border border-white/[0.07] rounded-2xl rounded-tl-md px-4 py-3.5 flex items-center gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-400/70 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="px-5 pb-5 pt-3">
          <div className="max-w-[700px] mx-auto">
            {limitError && (
              <div className="mb-3 flex items-center justify-between bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
                <p className="text-amber-400 text-sm">{limitError}</p>
                <button
                  onClick={() => router.push("/upgrade")}
                  className="ml-3 text-xs bg-amber-500 hover:bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  Upgrade →
                </button>
              </div>
            )}

            <div className="flex items-end gap-3 bg-white/[0.05] border border-white/[0.09] hover:border-white/[0.14] focus-within:border-violet-500/50 focus-within:bg-white/[0.07] rounded-2xl px-4 py-3 transition-all shadow-xl shadow-black/30">
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
                className="flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/25 text-[14.5px] min-h-[24px] max-h-[180px] p-0 leading-relaxed"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  input.trim() && !isLoading
                    ? "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105"
                    : "bg-white/[0.07] cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <p className="text-center text-white/[0.18] text-xs mt-2.5">tataI can make mistakes. Always verify important information.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
