"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Code, FileText, Search, Zap, Crown,
  MessageSquare, Settings, Info, Shield, FileTerminal,
  PanelLeft, Copy, Check, User, ChevronUp, LogIn, LogOut,
  Paperclip, Image as ImageIcon, X as XIcon, File,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TataILogo } from "@/components/Logo";
import { CodeBlock } from "@/components/CodeBlock";
import { useAuth } from "@/context/AuthContext";

const SUGGESTIONS = [
  { icon: Code, label: "Write code", desc: "Debug, build, explain", prompt: "Help me write a Python script that reads a CSV file and calculates statistics." },
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

interface Session { id: string; title: string; }

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-white transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function MessageContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
        h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            const lang = className?.replace("language-", "") ?? "";
            return <CodeBlock lang={lang}>{String(children).trim()}</CodeBlock>;
          }
          return <code className="font-mono text-[13px] bg-neutral-100 dark:bg-white/[0.08] px-1.5 py-0.5 rounded text-blue-600 dark:text-blue-400">{children}</code>;
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-400 pl-4 my-3 text-neutral-600 dark:text-white/60 italic">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3"><table className="w-full border-collapse border border-neutral-200 dark:border-white/[0.08] rounded-lg text-sm">{children}</table></div>
        ),
        th: ({ children }) => <th className="border border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-white/[0.04] px-3 py-2 text-left font-semibold">{children}</th>,
        td: ({ children }) => <td className="border border-neutral-200 dark:border-white/[0.08] px-3 py-2">{children}</td>,
        strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-white">{children}</strong>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:no-underline">{children}</a>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, logout, setShowLogin } = useAuth();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachPreviews, setAttachPreviews] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tatai_sessions");
      if (saved) setSessions(JSON.parse(saved));
    } catch {}
  }, []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Persist sessions list
  useEffect(() => {
    if (sessions.length > 0) {
      try { localStorage.setItem("tatai_sessions", JSON.stringify(sessions)); } catch {}
    }
  }, [sessions]);

  // Persist messages for active session
  useEffect(() => {
    if (activeSession && messages.length > 0 && !isLoading) {
      try {
        const serializable = messages.map(m => ({
          ...m,
          parts: m.parts.filter(p => p.type === "text"),
        }));
        localStorage.setItem(`tatai_msgs_${activeSession}`, JSON.stringify(serializable));
      } catch {}
    }
  }, [messages, activeSession, isLoading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    setAttachments((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setAttachPreviews((p) => [...p, e.target?.result as string]);
        reader.readAsDataURL(file);
      } else {
        setAttachPreviews((p) => [...p, ""]);
      }
    });
  }

  function removeAttachment(i: number) {
    setAttachments((p) => p.filter((_, idx) => idx !== i));
    setAttachPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  function handleSend() {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    const text = input.trim();
    const titleText = text || (attachments[0]?.name ?? "File upload");

    let sessionId = activeSession;
    if (messages.length === 0 || !sessionId) {
      sessionId = Date.now().toString();
      const newSession = { id: sessionId, title: titleText.slice(0, 40) };
      setSessions((p) => [newSession, ...p]);
      setActiveSession(sessionId);
    }

    if (attachments.length > 0) {
      const dt = new DataTransfer();
      attachments.forEach((f) => dt.items.add(f));
      sendMessage({ text, files: dt.files });
    } else {
      sendMessage({ text });
    }

    setInput("");
    setAttachments([]);
    setAttachPreviews([]);
    if (textareaRef.current) { textareaRef.current.style.height = "auto"; }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setActiveSession(null);
    setAttachments([]);
    setAttachPreviews([]);
    if (textareaRef.current) textareaRef.current.focus();
  }

  function loadSession(id: string) {
    try {
      const saved = localStorage.getItem(`tatai_msgs_${id}`);
      if (saved) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setMessages(JSON.parse(saved) as any);
      }
      setActiveSession(id);
    } catch {}
  }

  function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSessions(p => p.filter(s => s.id !== id));
    try { localStorage.removeItem(`tatai_msgs_${id}`); } catch {}
    if (activeSession === id) newChat();
    // Update persisted list
    try {
      const updated = sessions.filter(s => s.id !== id);
      localStorage.setItem("tatai_sessions", JSON.stringify(updated));
    } catch {}
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#212121]">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-[260px]" : "w-0"} transition-all duration-200 overflow-hidden flex-shrink-0 flex flex-col bg-neutral-50 dark:bg-[#171717]`}>
        {/* Logo + New chat */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <TataILogo className="w-7 h-7" />
            <span className="font-semibold text-[15px] text-neutral-900 dark:text-white">tataI</span>
          </div>
          <button onClick={newChat} title="New chat" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/50">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {sessions.length > 0 && (
            <p className="text-[11px] font-medium text-neutral-400 dark:text-white/25 px-2 pt-2 pb-1">Today</p>
          )}
          {sessions.map((s) => (
            <div
              key={s.id}
              onClick={() => loadSession(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-colors text-left cursor-pointer group ${
                activeSession === s.id
                  ? "bg-neutral-200 dark:bg-white/[0.08] text-neutral-900 dark:text-white"
                  : "text-neutral-600 dark:text-white/50 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-900 dark:hover:text-white/80"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate">{s.title}</span>
              <button
                onClick={(e) => deleteSession(s.id, e)}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-white/10 transition-all flex-shrink-0"
                title="Delete"
              >
                <XIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom — collapsible menu + user */}
        <div className="border-t border-neutral-200 dark:border-white/[0.06]">
          {/* Expandable menu items */}
          {menuOpen && (
            <div className="px-2 pt-2">
              {BOTTOM_LINKS.map(({ icon: Icon, label, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-neutral-500 dark:text-white/40 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-800 dark:hover:text-white/70 transition-colors text-left"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={() => router.push("/upgrade")}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/[0.08] transition-colors text-left font-medium"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Upgrade to Pro
                </button>
              )}
              {user && (
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              )}
              <div className="h-1" />
            </div>
          )}

          {/* User row with arrow toggle */}
          {user ? (
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[13px] font-semibold">{(user.displayName ?? user.email ?? "U")[0].toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 text-left min-w-0">
                <p className="text-[13px] font-medium text-neutral-800 dark:text-white/80 truncate">{user.displayName ?? user.email ?? "User"}</p>
                {user.displayName && user.email && <p className="text-[11px] text-neutral-400 dark:text-white/30 truncate">{user.email}</p>}
              </div>
              <ChevronUp className={`w-4 h-4 text-neutral-400 dark:text-white/30 flex-shrink-0 transition-transform duration-200 ${menuOpen ? "rotate-0" : "rotate-180"}`} />
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center flex-shrink-0">
                <LogIn className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              </div>
              <span className="flex-1 text-[13px] font-medium text-neutral-700 dark:text-white/60 text-left">Log in</span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-[#212121]">

        {/* Top bar */}
        <header className="flex items-center gap-2 px-4 py-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          {!sidebarOpen && (
            <>
              <TataILogo className="w-6 h-6 ml-1" />
              <span className="font-semibold text-neutral-900 dark:text-white text-[15px]">tataI</span>
            </>
          )}
        </header>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Welcome screen ── */
            <div className="flex flex-col items-center justify-center min-h-full px-4 pb-32">
              <TataILogo className="w-12 h-12 mb-5" />
              <h1 className="text-[26px] font-semibold text-neutral-900 dark:text-white mb-1">How can I help you?</h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-10">tataI is your personal AI assistant</p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-[560px]">
                {SUGGESTIONS.map(({ icon: Icon, label, desc, prompt }) => (
                  <button
                    key={label}
                    onClick={() => { const id = Date.now().toString(); setSessions((p) => [{ id, title: prompt.slice(0, 40) }, ...p]); setActiveSession(id); sendMessage({ text: prompt }); }}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] hover:bg-neutral-50 dark:hover:bg-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.14] transition-all text-left group"
                  >
                    <Icon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mt-0.5 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-800 dark:text-white/80">{label}</p>
                      <p className="text-[12px] text-neutral-400 dark:text-white/30 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Conversation ── */
            <div className="max-w-[760px] mx-auto px-4 py-6 space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  {m.role === "assistant" ? (
                    <TataILogo className="w-8 h-8 flex-shrink-0 mt-1" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-neutral-800 dark:bg-neutral-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 ${m.role === "user" ? "flex justify-end" : ""}`}>
                    {m.role === "user" ? (
                      <div className="max-w-[85%] flex flex-col gap-2 items-end">
                        {/* File/image parts */}
                        {m.parts.filter(p => p.type === "file").map((part, i) => {
                          if (part.type !== "file") return null;
                          const isImage = part.mediaType?.startsWith("image/");
                          if (isImage) {
                            const url = part.url ?? "";
                            return <img key={i} src={url} alt="uploaded" className="max-w-[280px] rounded-2xl rounded-tr-sm object-cover border border-neutral-200 dark:border-white/10" />;
                          }
                          return (
                            <div key={i} className="flex items-center gap-2 bg-neutral-100 dark:bg-[#2f2f2f] rounded-xl px-3 py-2 text-sm text-neutral-700 dark:text-white/70">
                              <File className="w-4 h-4 text-neutral-400" />
                              <span className="text-[13px]">{String(part.url ?? "File").split("/").pop()}</span>
                            </div>
                          );
                        })}
                        {/* Text part */}
                        {m.parts.some(p => p.type === "text" && p.type === "text" && (p as {type:"text";text:string}).text) && (
                          <div className="bg-neutral-100 dark:bg-[#2f2f2f] text-neutral-900 dark:text-white rounded-2xl rounded-tr-sm px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap">
                            {m.parts.map((part, i) => part.type === "text" ? part.text : null)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-neutral-800 dark:text-neutral-100 text-[14px] leading-relaxed">
                        <MessageContent content={m.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("")} />
                        <div className="mt-2 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity group-hover:opacity-100">
                          <CopyButton text={m.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("")} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && status === "submitted" && (
                <div className="flex gap-4">
                  <TataILogo className="w-8 h-8 flex-shrink-0" />
                  <div className="flex items-center gap-1 pt-2">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className={`px-4 pb-6 pt-2 ${messages.length === 0 ? "absolute bottom-0 left-0 right-0" : ""}`}>
          <div className="max-w-[760px] mx-auto">
            <div className="bg-white dark:bg-[#2f2f2f] border border-neutral-200 dark:border-neutral-600 rounded-2xl shadow-sm dark:shadow-none focus-within:border-neutral-400 dark:focus-within:border-neutral-400 transition-colors">

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                  {attachments.map((file, i) => (
                    <div key={i} className="relative group">
                      {attachPreviews[i] ? (
                        <img src={attachPreviews[i]} alt={file.name} className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-neutral-100 dark:bg-white/[0.08] border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-1 px-1">
                          <File className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                          <span className="text-[9px] text-neutral-400 dark:text-neutral-500 truncate w-full text-center">{file.name.split(".").pop()?.toUpperCase()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeAttachment(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 dark:bg-neutral-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                      {!attachPreviews[i] && (
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-0.5 w-16 truncate text-center">{file.name}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                onPaste={(e) => {
                  const items = Array.from(e.clipboardData.items);
                  const imageItem = items.find(item => item.type.startsWith("image/"));
                  if (imageItem) {
                    const file = imageItem.getAsFile();
                    if (file) addFiles(Object.assign(new DataTransfer(), { files: [file] }).files);
                  }
                }}
                placeholder={attachments.length > 0 ? "Add a message or just send the file..." : "Message tataI"}
                rows={1}
                className="w-full resize-none bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-[14px] leading-relaxed px-4 pt-3.5 pb-12 focus:outline-none min-h-[56px] max-h-[200px]"
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between px-3 pb-2.5">
                <div className="flex items-center gap-1">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.txt,.md,.js,.ts,.py,.html,.css,.json,.csv,.doc,.docx"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach files"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "image/*";
                        fileInputRef.current.click();
                        fileInputRef.current.accept = "image/*,.pdf,.txt,.md,.js,.ts,.py,.html,.css,.json,.csv,.doc,.docx";
                      }
                    }}
                    title="Attach image"
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    (input.trim() || attachments.length > 0) && !isLoading
                      ? "bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-200"
                      : "bg-neutral-200 dark:bg-neutral-600 cursor-not-allowed"
                  }`}
                >
                  <Send className={`w-3.5 h-3.5 ${(input.trim() || attachments.length > 0) && !isLoading ? "text-white dark:text-neutral-900" : "text-neutral-400"}`} />
                </button>
              </div>
            </div>
            <p className="text-center text-neutral-400 dark:text-neutral-500 text-[11px] mt-2">
              tataI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
