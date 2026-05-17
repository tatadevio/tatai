"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Code, FileText, Search, Zap, Crown,
  MessageSquare, Settings, Info, Shield, FileTerminal,
  PanelLeft, Copy, Check, User, ChevronUp, LogIn, LogOut,
  Paperclip, Image as ImageIcon, X as XIcon, File, ChevronDown,
  Zap as ZapIcon, Brain, Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TataILogo } from "@/components/Logo";
import { CodeBlock } from "@/components/CodeBlock";
import { useAuth } from "@/context/AuthContext";

const TATAI_MODELS = [
  {
    id: "tatai-flash",
    name: "Zara",
    fullName: "tataI Zara",
    desc: "Lightning fast answers",
    apiModel: "gpt-4o-mini",
    icon: ZapIcon,
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-400/10",
    badge: "Fast",
    proOnly: false,
  },
  {
    id: "tatai-smart",
    name: "Nova",
    fullName: "tataI Nova",
    desc: "Best for most tasks",
    apiModel: "gpt-4o",
    icon: Sparkles,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-400/10",
    badge: "Default",
    proOnly: false,
  },
  {
    id: "tatai-think",
    name: "Orion",
    fullName: "tataI Orion",
    desc: "Deep reasoning & analysis",
    apiModel: "o4-mini",
    icon: Brain,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-400/10",
    badge: "Pro",
    proOnly: true,
  },
] as const;

type ModelId = typeof TATAI_MODELS[number]["id"];

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

// Maps MIME type (and optional filename) → { label, color, bg, icon }
function fileTypeInfo(mime = "", fileName = "") {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return { label: "Image", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: "🖼️" };
  if (mime === "application/pdf" || ext === "pdf") return { label: "PDF", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10", icon: "📄" };
  if (mime.includes("word") || mime.includes("document") || ["doc","docx"].includes(ext)) return { label: "Word", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: "📝" };
  if (mime.includes("sheet") || mime.includes("excel") || ["xls","xlsx","csv"].includes(ext) || mime === "text/csv") return { label: "Spreadsheet", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", icon: "📊" };
  if (mime.includes("presentation") || mime.includes("powerpoint") || ["ppt","pptx"].includes(ext)) return { label: "Slides", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", icon: "📑" };
  if (mime === "text/html" || ext === "html" || ext === "htm") return { label: "HTML", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-500/10", icon: "🌐" };
  if (mime === "text/css" || ext === "css") return { label: "CSS", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: "🎨" };
  if (mime.includes("javascript") || ["js","jsx","ts","tsx","mjs"].includes(ext)) return { label: ext.toUpperCase() || "JS", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10", icon: "💛" };
  if (mime.includes("typescript") || ["ts","tsx"].includes(ext)) return { label: "TypeScript", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: "💙" };
  if (mime.includes("python") || ext === "py") return { label: "Python", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-500/10", icon: "🐍" };
  if (mime.includes("json") || ext === "json") return { label: "JSON", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10", icon: "🗂️" };
  if (["sh","bash","zsh"].includes(ext) || mime.includes("shell")) return { label: "Shell", color: "text-neutral-600 dark:text-neutral-400", bg: "bg-neutral-100 dark:bg-white/[0.08]", icon: "⚡" };
  if (["c","cpp","h","java","go","rs","rb","php","swift","kt"].includes(ext) || mime.includes("javascript") || mime.includes("python")) return { label: ext.toUpperCase() || "Code", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10", icon: "💻" };
  if (mime.includes("zip") || mime.includes("archive") || mime.includes("tar") || ["zip","rar","gz","tar","7z"].includes(ext)) return { label: "Archive", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-500/10", icon: "📦" };
  if (mime.startsWith("text/") || ["txt","md","log"].includes(ext)) return { label: ext === "md" ? "Markdown" : "Text", color: "text-neutral-600 dark:text-neutral-400", bg: "bg-neutral-100 dark:bg-white/[0.08]", icon: "📃" };
  return { label: ext.toUpperCase() || "File", color: "text-neutral-600 dark:text-neutral-400", bg: "bg-neutral-100 dark:bg-white/[0.08]", icon: "📎" };
}

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
        p: ({ children }) => <p className="mb-3 last:mb-0 leading-[1.72]">{children}</p>,
        h1: ({ children }) => <h1 className="text-[20px] font-bold mb-3 mt-5 first:mt-0 tracking-tight">{children}</h1>,
        h2: ({ children }) => <h2 className="text-[17px] font-bold mb-2.5 mt-5 first:mt-0 tracking-tight">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[15px] font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="leading-[1.65]">{children}</li>,
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          if (isBlock) {
            const lang = className?.replace("language-", "") ?? "";
            return <CodeBlock lang={lang}>{String(children).trim()}</CodeBlock>;
          }
          return <code className="font-mono text-[12.5px] bg-neutral-100 dark:bg-white/[0.09] px-1.5 py-[2px] rounded-md text-blue-600 dark:text-blue-400 border border-neutral-200/60 dark:border-white/[0.07]">{children}</code>;
        },
        blockquote: ({ children }) => (
          <blockquote className="border-l-[3px] border-blue-400 pl-4 my-3 text-neutral-500 dark:text-white/50 italic">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 dark:border-white/[0.08]"><table className="w-full border-collapse text-[13.5px]">{children}</table></div>
        ),
        th: ({ children }) => <th className="border-b border-r last:border-r-0 border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-white/[0.03] px-4 py-2.5 text-left font-semibold text-[13px] tracking-tight">{children}</th>,
        td: ({ children }) => <td className="border-b border-r last:border-r-0 border-neutral-200 dark:border-white/[0.06] px-4 py-2.5">{children}</td>,
        strong: ({ children }) => <strong className="font-semibold text-neutral-900 dark:text-white">{children}</strong>,
        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-2 decoration-blue-400/40 hover:decoration-blue-400 transition-colors">{children}</a>,
        hr: () => <hr className="border-neutral-200 dark:border-white/[0.08] my-4" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, logout, setShowLogin } = useAuth();
  const [isPro, setIsPro] = useState(false);

  // Check Pro status from Supabase when user logs in
  useEffect(() => {
    if (!user) { setIsPro(false); return; }
    user.getIdToken().then(token => {
      fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data?.plan === "pro") setIsPro(true); })
        .catch(() => {});
    });
  }, [user]);
  const [input, setInput] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachPreviews, setAttachPreviews] = useState<string[]>([]);
  // Track filenames separately so we can show them after send
  const pendingFileNames = useRef<string[]>([]);
  // Map messageId → filenames array for display
  const [msgFileNames, setMsgFileNames] = useState<Record<string, string[]>>({});
  const [selectedModel, setSelectedModel] = useState<ModelId>("tatai-smart");
  const [modelDropOpen, setModelDropOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile and set initial sidebar state
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Storage key scoped to logged-in user (or empty string for guests)
  const storageKey = user ? `tatai_sessions_${user.uid}` : null;

  // Load sessions from localStorage when user changes
  useEffect(() => {
    // Clear UI whenever user changes (login/logout)
    setSessions([]);
    setActiveSession(null);
    setMessages([]);
    if (!storageKey) return; // Guest — no history
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setSessions(JSON.parse(saved));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // If selected model is Pro-only but user isn't Pro, fall back to Nova
  const effectiveModel = (TATAI_MODELS.find(m => m.id === selectedModel)?.proOnly && !isPro)
    ? "tatai-smart"
    : selectedModel;
  const activeModelDef = TATAI_MODELS.find(m => m.id === effectiveModel) ?? TATAI_MODELS[1];

  // Always return a human-friendly name (never raw email)
  function getDisplayName(u: typeof user) {
    if (!u) return "User";
    if (u.displayName) return u.displayName;
    if (u.phoneNumber) return u.phoneNumber;
    if (u.email) {
      const local = u.email.split("@")[0];
      return local.replace(/[._\-+]/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();
    }
    return "User";
  }

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { model: activeModelDef.apiModel },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Persist sessions list (only for logged-in users)
  useEffect(() => {
    if (!storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(sessions)); } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessions, storageKey]);

  // Persist messages for active session (only for logged-in users)
  useEffect(() => {
    if (!storageKey) return;
    if (activeSession && messages.length > 0 && !isLoading) {
      try {
        const serializable = messages.map(m => ({
          ...m,
          parts: m.parts.filter(p => p.type === "text"),
        }));
        localStorage.setItem(`tatai_msgs_${user?.uid}_${activeSession}`, JSON.stringify(serializable));
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

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    const newFiles = Array.from(files);
    if (newFiles.length === 0) return;
    setAttachments((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      pendingFileNames.current.push(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setAttachPreviews((p) => [...p, e.target?.result as string]);
        reader.readAsDataURL(file);
      } else {
        setAttachPreviews((p) => [...p, ""]);
      }
    });
    textareaRef.current?.focus();
  }

  // ── Drag & drop handlers ──
  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current++;
    if (e.dataTransfer.items.length > 0) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) { dragCounterRef.current = 0; setIsDragging(false); }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) addFiles(files);
  }

  // ── Global paste handler (works from anywhere on the page) ──
  useEffect(() => {
    function handleGlobalPaste(e: ClipboardEvent) {
      const items = Array.from(e.clipboardData?.items ?? []);
      const files: File[] = [];
      for (const item of items) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    }
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const names = [...pendingFileNames.current];
      const capturedNames = names;

      // Separate images (vision) from text-readable files
      const imageFiles = attachments.filter(f => f.type.startsWith("image/"));
      const textFiles = attachments.filter(f => !f.type.startsWith("image/"));

      // Read all text files as strings, then send
      const readPromises = textFiles.map(f => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(
          `\n\n--- File: ${f.name} ---\n${e.target?.result as string}\n--- End of ${f.name} ---`
        );
        reader.onerror = () => resolve(`\n\n[Could not read file: ${f.name}]`);
        reader.readAsText(f);
      }));

      Promise.all(readPromises).then((fileContents) => {
        const combinedText = text + fileContents.join("");

        setTimeout(() => {
          setMsgFileNames(prev => {
            const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
            if (lastUserMsg) return { ...prev, [lastUserMsg.id]: capturedNames };
            return prev;
          });
        }, 200);

        if (imageFiles.length > 0) {
          const dt = new DataTransfer();
          imageFiles.forEach(f => dt.items.add(f));
          sendMessage({ text: combinedText, files: dt.files });
        } else {
          sendMessage({ text: combinedText });
        }
      });
    } else {
      sendMessage({ text });
    }

    pendingFileNames.current = [];
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
      const saved = localStorage.getItem(`tatai_msgs_${user?.uid}_${id}`);
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
    try { localStorage.removeItem(`tatai_msgs_${user?.uid}_${id}`); } catch {}
    if (activeSession === id) newChat();
    // Update persisted list
    if (storageKey) {
      try {
        const updated = sessions.filter(s => s.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
  }

  function closeSidebarOnMobile() {
    if (isMobile) setSidebarOpen(false);
  }

  return (
    <div className="flex h-full bg-white dark:bg-[#212121] overflow-hidden">

      {/* ── Mobile backdrop ── */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        ${isMobile
          ? `fixed left-0 top-0 bottom-0 z-40 w-[272px] transform transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`
          : `${sidebarOpen ? "w-[256px]" : "w-0"} transition-all duration-200 overflow-hidden flex-shrink-0`}
        flex flex-col bg-neutral-50 dark:bg-[#161616] h-full border-r border-neutral-200/60 dark:border-white/[0.05]
      `}>
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
              onClick={() => { loadSession(s.id); closeSidebarOnMobile(); }}
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

        {/* ── Bottom section ── */}
        <div className="border-t border-neutral-200 dark:border-white/[0.06] pt-1.5 pb-1">

          {/* These links are ALWAYS visible, logged in or not */}
          <div className="px-2">
            {BOTTOM_LINKS.map(({ icon: Icon, label, href }) => (
              <button
                key={label}
                onClick={() => { router.push(href); closeSidebarOnMobile(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-neutral-500 dark:text-white/40 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-800 dark:hover:text-white/70 transition-colors text-left"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            ))}
            <button
              onClick={() => { router.push("/upgrade"); closeSidebarOnMobile(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/[0.08] transition-colors text-left font-medium"
            >
              <Crown className="w-3.5 h-3.5 flex-shrink-0" />
              Upgrade to Pro
            </button>
          </div>

          {/* Divider */}
          <div className="mx-3 my-1.5 h-px bg-neutral-200 dark:bg-white/[0.05]" />

          {/* User row — shows account info if logged in, Log in button if not */}
          {user ? (
            <div>
              {/* Expandable: sign out */}
              {menuOpen && (
                <div className="px-2 pb-1">
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    Sign out
                  </button>
                </div>
              )}
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors rounded-xl mx-0"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full flex-shrink-0 object-cover ring-1 ring-black/5 dark:ring-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white text-[13px] font-semibold">{getDisplayName(user)[0].toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-800 dark:text-white/85 truncate leading-tight">{getDisplayName(user)}</p>
                  {user.email && <p className="text-[11px] text-neutral-400 dark:text-white/30 truncate mt-0.5">{user.email}</p>}
                </div>
                <ChevronUp className={`w-3.5 h-3.5 text-neutral-400 dark:text-white/25 flex-shrink-0 transition-transform duration-200 ${menuOpen ? "rotate-0" : "rotate-180"}`} />
              </button>
            </div>
          ) : (
            <div className="px-2 pb-1">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <LogIn className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                </div>
                <span className="text-[13px] font-medium text-neutral-700 dark:text-white/60">Log in</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main
        className="flex-1 flex flex-col min-w-0 relative bg-white dark:bg-[#212121]"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* ── Drop overlay ── */}
        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-blue-500/10 dark:bg-blue-400/10 border-2 border-dashed border-blue-500 dark:border-blue-400 rounded-none pointer-events-none">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl px-8 py-6 shadow-2xl border border-blue-200 dark:border-blue-500/30 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Paperclip className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-[16px] font-bold text-neutral-900 dark:text-white">Drop files here</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Images, PDFs, code files — anything</p>
            </div>
          </div>
        )}

        {/* Top bar */}
        <header className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-100 dark:border-white/[0.04]">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40 flex-shrink-0"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Mobile: center logo */}
          {isMobile ? (
            <div className="flex-1 flex items-center justify-center gap-2">
              <TataILogo className="w-6 h-6" />
              <span className="font-semibold text-neutral-900 dark:text-white text-[15px]">tataI</span>
            </div>
          ) : (
            !sidebarOpen && (
              <div className="flex items-center gap-2 ml-1">
                <TataILogo className="w-6 h-6" />
                <span className="font-semibold text-neutral-900 dark:text-white text-[15px]">tataI</span>
              </div>
            )
          )}

          {/* Mobile: new chat button on right */}
          {isMobile && (
            <button
              onClick={() => { newChat(); closeSidebarOnMobile(); }}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40 flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </header>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Welcome screen ── */
            <div className="flex flex-col items-center justify-center min-h-full px-4 pb-40 pt-10">
              {/* Logo glow */}
              <div className="relative mb-5">
                <div className="absolute inset-0 blur-2xl opacity-30 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full scale-150" />
                <TataILogo className="relative w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg" />
              </div>
              <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-neutral-900 dark:text-white mb-2 text-center">
                How can I help you?
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-[14px] sm:text-[15px] mb-9 text-center font-normal">
                Your intelligent AI assistant, always ready
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[540px]">
                {SUGGESTIONS.map(({ icon: Icon, label, desc, prompt }) => (
                  <button
                    key={label}
                    onClick={() => { const id = Date.now().toString(); setSessions((p) => [{ id, title: prompt.slice(0, 40) }, ...p]); setActiveSession(id); sendMessage({ text: prompt }); }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-neutral-200/80 dark:border-white/[0.07] bg-neutral-50/50 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.06] hover:border-neutral-300 dark:hover:border-white/[0.12] hover:shadow-sm active:scale-[0.98] transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-white/[0.07] shadow-sm border border-neutral-100 dark:border-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:border-blue-100 dark:group-hover:border-blue-500/20 group-hover:bg-blue-50 dark:group-hover:bg-blue-500/10 transition-all">
                      <Icon className="w-[18px] h-[18px] text-neutral-500 dark:text-neutral-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-800 dark:text-white/85 leading-tight">{label}</p>
                      <p className="text-[11.5px] text-neutral-400 dark:text-white/30 mt-0.5 leading-tight">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* ── Conversation ── */
            <div className="max-w-[760px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-5 sm:space-y-6">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-2.5 sm:gap-4 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  {m.role === "assistant" ? (
                    <TataILogo className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 mt-1" />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-800 dark:bg-neutral-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 ${m.role === "user" ? "flex justify-end" : ""}`}>
                    {m.role === "user" ? (
                      <div className="max-w-[88%] sm:max-w-[80%] flex flex-col gap-2 items-end">
                        {/* File/image parts */}
                        {m.parts.filter(p => p.type === "file").map((part, i) => {
                          if (part.type !== "file") return null;
                          const mime = part.mediaType ?? "";
                          const isImage = mime.startsWith("image/");
                          const storedNames = msgFileNames[m.id];
                          const fileName = storedNames?.[i] ?? null;

                          if (isImage) {
                            return (
                              <div key={i} className="relative group">
                                <img
                                  src={part.url ?? ""}
                                  alt={fileName ?? "uploaded image"}
                                  className="max-w-[220px] sm:max-w-[300px] rounded-2xl rounded-tr-sm object-cover shadow-sm border border-black/5 dark:border-white/[0.06]"
                                />
                                {fileName && (
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-2xl px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-[11px] truncate">{fileName}</p>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          const info = fileTypeInfo(mime, fileName ?? "");
                          const label = fileName ? fileName : info.label;
                          const ext = fileName ? fileName.split(".").pop()?.toUpperCase() : mime.split("/").pop()?.toUpperCase();

                          return (
                            <div key={i} className="flex items-center gap-3 bg-neutral-100 dark:bg-[#2a2a2a] border border-neutral-200/70 dark:border-white/[0.07] rounded-2xl rounded-tr-sm px-3.5 py-2.5 min-w-[160px] max-w-[260px]">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${info.bg}`}>
                                <span className="text-[18px] leading-none">{info.icon}</span>
                              </div>
                              <div className="min-w-0">
                                <p className={`text-[13px] font-semibold truncate ${info.color}`}>{label}</p>
                                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{ext} file</p>
                              </div>
                            </div>
                          );
                        })}
                        {/* Text part — only show if has actual text content */}
                        {(() => {
                          const textContent = m.parts
                            .filter(p => p.type === "text")
                            .map(p => p.type === "text" ? p.text : "")
                            .join("")
                            .trim();
                          if (!textContent) return null;
                          return (
                            <div className="bg-neutral-100 dark:bg-[#2a2a2a] text-neutral-900 dark:text-white/90 rounded-2xl rounded-tr-sm px-4 py-3 text-[14px] leading-[1.6] whitespace-pre-wrap font-[400] tracking-[-0.01em] shadow-sm">
                              {textContent}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-neutral-800 dark:text-neutral-100 text-[14.5px] leading-[1.7] tracking-[-0.01em]">
                        <MessageContent content={m.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("")} />
                        <div className="mt-1.5 flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
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
        <div className={`px-3 sm:px-4 pb-4 sm:pb-6 pt-2 ${messages.length === 0 ? "absolute bottom-0 left-0 right-0" : ""}`}>
          <div className="max-w-[760px] mx-auto">
            <div className="bg-white dark:bg-[#2a2a2a] border border-neutral-200 dark:border-white/[0.1] rounded-2xl shadow-sm dark:shadow-none focus-within:border-blue-400/60 dark:focus-within:border-white/[0.2] focus-within:shadow-md transition-all duration-150">

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                  {attachments.map((file, i) => {
                    const info = fileTypeInfo(file.type, file.name);
                    const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE";
                    return (
                      <div key={i} className="relative group flex-shrink-0">
                        {attachPreviews[i] ? (
                          /* Image preview */
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/10">
                            <img src={attachPreviews[i]} alt={file.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          /* Non-image file card */
                          <div className={`w-14 h-14 rounded-xl border border-neutral-200 dark:border-white/10 flex flex-col items-center justify-center gap-0.5 ${info.bg}`}>
                            <span className="text-[20px] leading-none">{info.icon}</span>
                            <span className={`text-[8px] font-bold tracking-wide ${info.color}`}>{ext}</span>
                          </div>
                        )}
                        {/* Remove button */}
                        <button
                          onClick={() => removeAttachment(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 dark:bg-neutral-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                        {/* Filename tooltip */}
                        <p className="text-[9px] text-neutral-400 dark:text-neutral-500 mt-1 w-14 truncate text-center leading-tight">{file.name}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={attachments.length > 0 ? "Add a message or just send the file..." : "Message tataI"}
                rows={1}
                className="w-full resize-none bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-[14.5px] leading-relaxed tracking-[-0.01em] px-4 pt-3.5 pb-12 focus:outline-none min-h-[56px] max-h-[200px]"
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

                  {/* Model selector */}
                  <div className="relative">
                    <button
                      onClick={() => setModelDropOpen(v => !v)}
                      className="flex items-center gap-1.5 pl-2 sm:pl-2.5 pr-1.5 sm:pr-2 py-1.5 rounded-lg text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:text-neutral-700 dark:hover:text-white transition-colors active:scale-95"
                    >
                      <activeModelDef.icon className={`w-3.5 h-3.5 flex-shrink-0 ${activeModelDef.color}`} />
                      <span className="hidden sm:inline">{activeModelDef.fullName}</span>
                      <span className="sm:hidden">{activeModelDef.name}</span>
                      <ChevronDown className="w-3 h-3 opacity-50" />
                    </button>

                    {modelDropOpen && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setModelDropOpen(false)} />
                        <div className="absolute bottom-full mb-2 left-0 z-40 w-[220px] bg-white dark:bg-[#1e1e1e] border border-neutral-200 dark:border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
                          <div className="px-3 py-2 border-b border-neutral-100 dark:border-white/[0.05]">
                            <p className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">Choose model</p>
                          </div>
                          {TATAI_MODELS.map((m) => {
                            const Icon = m.icon;
                            const isActive = m.id === selectedModel;
                            const locked = m.proOnly && !isPro;
                            return (
                              <button
                                key={m.id}
                                onClick={() => {
                                  if (locked) { setModelDropOpen(false); router.push("/upgrade"); return; }
                                  setSelectedModel(m.id); setModelDropOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left ${
                                  locked
                                    ? "opacity-60 cursor-pointer hover:bg-amber-50/50 dark:hover:bg-amber-400/5"
                                    : `hover:bg-neutral-50 dark:hover:bg-white/[0.05] ${isActive ? "bg-neutral-50 dark:bg-white/[0.04]" : ""}`
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${m.bg}`}>
                                  <Icon className={`w-3.5 h-3.5 ${m.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[13px] font-semibold text-neutral-800 dark:text-white/80">{m.fullName}</p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                      m.badge === "Fast" ? "bg-amber-100 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400" :
                                      m.badge === "Default" ? "bg-blue-100 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400" :
                                      "bg-violet-100 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400"
                                    }`}>{m.badge}</span>
                                  </div>
                                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{m.desc}</p>
                                </div>
                                {locked ? (
                                  <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                ) : isActive ? (
                                  <Check className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
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
            <p className="text-center text-neutral-400 dark:text-neutral-500/60 text-[11px] mt-2 tracking-wide">
              tataI can make mistakes · always verify important info
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
