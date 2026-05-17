"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState } from "react";
import { Send, Plus, Sparkles, Code, FileText, Search, Zap, Menu, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const SUGGESTIONS = [
  { icon: Code, label: "Write code", prompt: "Help me write a Python script to sort a list of files by date." },
  { icon: FileText, label: "Draft content", prompt: "Write a professional LinkedIn post about launching a new AI startup." },
  { icon: Search, label: "Research", prompt: "Explain how large language models work in simple terms." },
  { icon: Zap, label: "Brainstorm", prompt: "Give me 10 startup ideas in the AI space for 2026." },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<{ id: string; title: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || isLoading) return;
    const text = input.trim();

    if (messages.length === 0) {
      setChatHistory((prev) => [{ id: Date.now().toString(), title: text.slice(0, 40) }, ...prev]);
    }

    sendMessage({ text });
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function newChat() {
    setMessages([]);
    setInput("");
  }

  function handleSuggestion(prompt: string) {
    setChatHistory((prev) => [{ id: Date.now().toString(), title: prompt.slice(0, 40) }, ...prev]);
    sendMessage({ text: prompt });
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0 bg-[#171717] border-r border-white/5 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">tataAI</span>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm text-white/80 hover:text-white"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        <ScrollArea className="flex-1 px-3">
          {chatHistory.length > 0 && (
            <p className="text-xs text-white/30 px-2 py-1 uppercase tracking-wider">Recent</p>
          )}
          {chatHistory.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-3 py-2 rounded-lg text-sm truncate transition text-white/50 hover:bg-white/5 hover:text-white/80"
            >
              {s.title}
            </button>
          ))}
        </ScrollArea>

        <div className="p-4 border-t border-white/5">
          <Badge variant="outline" className="text-violet-400 border-violet-400/30 bg-violet-400/10 text-xs">
            GPT-4o mini
          </Badge>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/50 hover:text-white"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {!sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white tracking-tight">tataAI</span>
            </div>
          )}
        </header>

        <ScrollArea className="flex-1 px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">How can I help?</h1>
                <p className="text-white/40 text-sm">tataAI — your AI superpower</p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleSuggestion(prompt)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/30 transition">
                      <Icon className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white transition">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  {m.role === "assistant" && (
                    <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-violet-600 text-white rounded-tr-sm"
                        : "bg-white/5 text-white/90 rounded-tl-sm border border-white/5"
                    }`}
                  >
                    {m.parts.map((part, i) =>
                      part.type === "text" ? <span key={i}>{part.text}</span> : null
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-3 focus-within:border-violet-500/50 transition">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message tataAI..."
                className="flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-white/30 text-sm min-h-[24px] max-h-[200px] p-0"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-center text-white/20 text-xs mt-2">tataAI can make mistakes. Use your judgment.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
