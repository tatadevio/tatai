"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Send, Plus, Code, FileText, Search, Zap, Crown,
  MessageSquare, Settings, Info, Shield, FileTerminal,
  PanelLeft, Copy, Check, User, ChevronUp, LogIn, LogOut,
  Paperclip, Image as ImageIcon, X as XIcon, File, ChevronDown,
  Zap as ZapIcon, Mic, MicOff, Volume2, Video, VideoOff, PhoneOff,
  ThumbsUp, ThumbsDown, RefreshCw, Share2,
  MoreHorizontal, Pin, Pencil, Trash2, Link,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TataILogo } from "@/components/Logo";
import { CodeBlock } from "@/components/CodeBlock";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "@/hooks/useTranslation";

const TATAI_MODELS = [
  {
    id: "tatai-flash",
    name: "Zara",
    fullName: "Flash",
    descKey: "modelFlashDesc",
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
    fullName: "Nova",
    descKey: "modelNovaDesc",
    apiModel: "gpt-4o",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-400/10",
    badge: "Default",
    proOnly: false,
  },
  {
    id: "tatai-think",
    name: "Orion",
    fullName: "Orion",
    descKey: "modelOrionDesc",
    apiModel: "o4-mini",
    icon: Zap,
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-400/10",
    badge: "Pro",
    proOnly: true,
  },
] as const;

type ModelId = typeof TATAI_MODELS[number]["id"];


const BOTTOM_LINK_DEFS = [
  { icon: Settings, key: "settings" as const, href: "/settings" },
  { icon: Info, key: "about" as const, href: "/about" },
  { icon: Shield, key: "privacy" as const, href: "/privacy" },
  { icon: FileTerminal, key: "terms" as const, href: "/terms" },
];

interface Session { id: string; title: string; pinned?: boolean; }


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

function MessageActions({ text, onRegenerate, isLast, sessionId, getMessages }: { text: string; onRegenerate?: () => void; isLast?: boolean; sessionId?: string | null; getMessages?: () => { role: string; content: string }[] }) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<"up" | "down" | null>(null);
  const [shared, setShared] = useState(false);
  const [sharing, setSharing] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    setSharing(true);
    let url = "";
    try {
      const msgs = getMessages?.() ?? [];
      if (msgs.length > 0) {
        const res = await fetch("/api/share", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: msgs, title: msgs[0]?.content?.slice(0, 60) || "Shared Chat" }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.url) url = `${window.location.origin}${data.url}`;
        }
      }
    } catch {}
    if (!url) url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "tatAI — Your AI Assistant", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
    setSharing(false);
  }

  const btn = "p-1.5 rounded-lg text-neutral-400 dark:text-white/30 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-all active:scale-95";

  return (
    <div className="mt-2 flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <button onClick={copy} title="Copy" className={btn}>
        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <button onClick={() => setLiked(v => v === "up" ? null : "up")} title="Good response" className={`${btn} ${liked === "up" ? "text-green-500 dark:text-green-400" : ""}`}>
        <ThumbsUp className="w-3.5 h-3.5" />
      </button>
      <button onClick={() => setLiked(v => v === "down" ? null : "down")} title="Bad response" className={`${btn} ${liked === "down" ? "text-red-500 dark:text-red-400" : ""}`}>
        <ThumbsDown className="w-3.5 h-3.5" />
      </button>
      {isLast && onRegenerate && (
        <button onClick={onRegenerate} title="Regenerate" className={btn}>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
      <button onClick={share} title="Share" className={btn} disabled={sharing}>
        {shared ? <Check className="w-3.5 h-3.5 text-green-500" /> : sharing ? <span className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : <Share2 className="w-3.5 h-3.5" />}
      </button>
    </div>
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

function SessionRow({ s, activeSession, renamingId, renameValue, setRenameValue, commitRename, loadSession, closeSidebarOnMobile, setCtxMenu }: {
  s: Session; activeSession: string | null; renamingId: string | null; renameValue: string;
  setRenameValue: (v: string) => void; commitRename: (id: string) => void;
  loadSession: (id: string) => void; closeSidebarOnMobile: () => void;
  setCtxMenu: (v: { id: string; x: number; y: number } | null) => void;
}) {
  return (
    <div
      onClick={() => { if (renamingId !== s.id) { loadSession(s.id); closeSidebarOnMobile(); } }}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-colors text-left cursor-pointer group ${
        activeSession === s.id
          ? "bg-neutral-200 dark:bg-white/[0.08] text-neutral-900 dark:text-white"
          : "text-neutral-600 dark:text-white/50 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-900 dark:hover:text-white/80"
      }`}
    >
      {s.pinned ? <Pin className="w-3 h-3 flex-shrink-0 opacity-50" /> : <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />}
      {renamingId === s.id ? (
        <input
          autoFocus
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onBlur={() => commitRename(s.id)}
          onKeyDown={e => { if (e.key === "Enter") commitRename(s.id); if (e.key === "Escape") { } }}
          onClick={e => e.stopPropagation()}
          className="flex-1 bg-transparent border-b border-blue-500 outline-none text-[13px] text-neutral-900 dark:text-white"
        />
      ) : (
        <span className="flex-1 truncate">{s.title}</span>
      )}
      <button
        onClick={e => { e.stopPropagation(); const rect = e.currentTarget.getBoundingClientRect(); setCtxMenu({ id: s.id, x: rect.right - 176, y: rect.bottom + 4 }); }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-neutral-300 dark:hover:bg-white/10 transition-all flex-shrink-0"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading, logout, setShowLogin } = useAuth();
  const t = useTranslation();
  const SUGGESTIONS = useMemo(() => {
    const pool = [
      { icon: Code, label: t.suggWriteCode, desc: t.suggWriteCodeDesc, prompt: "Help me write a Python script that reads a CSV file and calculates statistics." },
      { icon: FileText, label: t.suggDraft, desc: t.suggDraftDesc, prompt: "Write a professional LinkedIn post about launching a new AI startup." },
      { icon: Search, label: t.suggResearch, desc: t.suggResearchDesc, prompt: "Explain how large language models work in simple terms." },
      { icon: Zap, label: t.suggBrainstorm, desc: t.suggBrainstormDesc, prompt: "Give me 10 startup ideas in the AI space for 2026." },
      { icon: Code, label: "Fix a bug", desc: "Paste code, get fix", prompt: "Here's my code — can you find and fix the bug?" },
      { icon: FileText, label: "Write an email", desc: "Clear & professional", prompt: "Write a professional follow-up email after a job interview." },
      { icon: Search, label: "Summarize text", desc: "TL;DR anything", prompt: "Summarize the following article in 5 bullet points:" },
      { icon: Zap, label: "Plan my week", desc: "Productive schedule", prompt: "Help me plan a productive week as a startup founder." },
      { icon: Code, label: "Learn a concept", desc: "Simple explanations", prompt: "Explain REST APIs like I'm 10 years old." },
      { icon: FileText, label: "Write a bio", desc: "About me & LinkedIn", prompt: "Write a short professional bio for my LinkedIn profile. I'm a software engineer at a startup." },
      { icon: Search, label: "Compare options", desc: "Pros & cons", prompt: "Compare React vs Vue vs Angular for a new web project in 2026." },
      { icon: Zap, label: "Generate ideas", desc: "Creative thinking", prompt: "Give me 10 creative content ideas for a tech YouTube channel." },
    ];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
  const [ctxMenu, setCtxMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
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
  const convSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Voice ──
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceSpeaking, setVoiceSpeaking] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceIsVideo, setVoiceIsVideo] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  // Inline voice-to-text recorder (mic button — separate from full call)
  const [inlineRecording, setInlineRecording] = useState(false);
  const [inlineTranscript, setInlineTranscript] = useState("");
  const inlineRecorderRef = useRef<MediaRecorder | null>(null);
  const inlineChunksRef = useRef<Blob[]>([]);
  const inlineStreamRef = useRef<MediaStream | null>(null);
  const voiceMenuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const voiceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceActiveRef = useRef(false);
  const voiceMutedRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenMsgIdRef = useRef<string | null>(null);
  const listeningActiveRef = useRef(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const synthRef = useRef<any>(null);
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

  // Sync URL bar with active session
  useEffect(() => {
    if (activeSession) {
      const url = `/?chat=${activeSession}`;
      if (window.location.pathname + window.location.search !== url) {
        window.history.replaceState(null, "", url);
      }
    } else {
      if (window.location.search) window.history.replaceState(null, "", "/");
    }
  }, [activeSession]);

  // Load sessions — Redis for logged-in users, localStorage for guests
  useEffect(() => {
    setSessions([]);
    setActiveSession(null);
    setMessages([]);
    if (!user) return;

    const urlChatId = new URLSearchParams(window.location.search).get("chat");

    // Try Redis first (cloud history)
    user.getIdToken().then(token =>
      fetch("/api/conversations", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSessions(data.map((s: any) => ({ id: s.id, title: s.title ?? "Chat", pinned: s.pinned })));
          } else if (storageKey) {
            // Fallback: migrate from localStorage
            const saved = localStorage.getItem(storageKey);
            if (saved) setSessions(JSON.parse(saved));
          }
          // Auto-load chat from URL after sessions are ready
          if (urlChatId) loadSession(urlChatId);
        })
        .catch(() => {
          if (storageKey) {
            const saved = localStorage.getItem(storageKey);
            if (saved) { try { setSessions(JSON.parse(saved)); } catch {} }
          }
          if (urlChatId) loadSession(urlChatId);
        })
    ).catch(() => {});
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

  const [chatLanguage, setChatLanguage] = useState("auto");
  useEffect(() => {
    const sync = () => setChatLanguage(localStorage.getItem("tatai_language") ?? "auto");
    sync();
    const onStorage = (e: StorageEvent) => { if (e.key === "tatai_language") sync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("tatai_lang_change", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("tatai_lang_change", sync);
    };
  }, []);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        model: activeModelDef.apiModel,
        language: chatLanguage,
      },
    }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-save conversation to Redis after each message
  useEffect(() => {
    if (!user || !activeSession || messages.length === 0) return;
    if (convSaveTimer.current) clearTimeout(convSaveTimer.current);
    convSaveTimer.current = setTimeout(async () => {
      try {
        const token = await user.getIdToken();
        const title = sessions.find(s => s.id === activeSession)?.title ?? "Chat";
        await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: activeSession, title, messages }),
        });
      } catch {}
    }, 1500);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeSession]);

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

  useEffect(() => {
    if (!showVoiceMenu) return;
    function close(e: MouseEvent) {
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(e.target as Node)) {
        setShowVoiceMenu(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showVoiceMenu]);

  function removeAttachment(i: number) {
    setAttachments((p) => p.filter((_, idx) => idx !== i));
    setAttachPreviews((p) => p.filter((_, idx) => idx !== i));
  }

  // ── Inline voice recorder (mic button → transcribe → insert text) ──
  async function startInlineRecording() {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      inlineStreamRef.current = stream;
    } catch {
      alert("Microphone access is required.");
      return;
    }
    inlineChunksRef.current = [];
    setInlineTranscript("");
    const recorder = new MediaRecorder(stream);
    inlineRecorderRef.current = recorder;
    recorder.ondataavailable = e => { if (e.data.size > 0) inlineChunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      inlineStreamRef.current?.getTracks().forEach(t => t.stop());
      inlineStreamRef.current = null;
      const blob = new Blob(inlineChunksRef.current, { type: "audio/webm" });
      if (blob.size < 1000) return;
      try {
        const form = new FormData();
        form.append("audio", blob, "audio.webm");
        const res = await fetch("/api/transcribe", { method: "POST", body: form });
        const { text } = await res.json();
        if (text?.trim()) setInlineTranscript(text.trim());
      } catch { /* silent */ }
    };
    recorder.start();
    setInlineRecording(true);
  }

  function stopInlineRecording() {
    inlineRecorderRef.current?.stop();
    setInlineRecording(false);
  }

  function cancelInlineRecording() {
    inlineRecorderRef.current?.stop();
    inlineStreamRef.current?.getTracks().forEach(t => t.stop());
    inlineStreamRef.current = null;
    setInlineRecording(false);
    setInlineTranscript("");
  }

  function sendInlineTranscript() {
    if (!inlineTranscript.trim()) return;
    setInput(inlineTranscript.trim());
    setInlineTranscript("");
  }

  // ── Voice functions (Whisper + OpenAI TTS) ──

  // Attach camera stream to <video> element when video mode mounts
  useEffect(() => {
    if (voiceActive && voiceIsVideo && micStreamRef.current && videoRef.current) {
      videoRef.current.srcObject = micStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [voiceActive, voiceIsVideo]);

  async function startVoiceMode(withVideo = false) {
    setShowVoiceMenu(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo ? { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      micStreamRef.current = stream;
    } catch {
      alert(withVideo ? "Camera and microphone access are required for video calls." : "Microphone access is required for voice calls.");
      return;
    }
    lastSpokenMsgIdRef.current = null;
    listeningActiveRef.current = false;
    voiceActiveRef.current = true;
    voiceMutedRef.current = false;
    setVoiceSeconds(0);
    setVoiceIsVideo(withVideo);
    setVoiceActive(true);
    setVoiceMuted(false);
    voiceTimerRef.current = setInterval(() => setVoiceSeconds(s => s + 1), 1000);
    setTimeout(startListeningWhisper, 300);
  }

  function startListeningWhisper() {
    if (!voiceActiveRef.current || voiceMutedRef.current || !micStreamRef.current) return;
    if (listeningActiveRef.current) return; // already listening — prevent re-entry
    listeningActiveRef.current = true;

    // AudioContext for silence detection
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    const source = ctx.createMediaStreamSource(micStreamRef.current);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    analyserRef.current = analyser;

    // Use audio-only stream — avoids sending video frames to Whisper (huge files)
    const audioTracks = micStreamRef.current.getAudioTracks();
    const audioStream = new MediaStream(audioTracks);
    const recorder = new MediaRecorder(audioStream);
    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      listeningActiveRef.current = false;
      ctx.close().catch(() => {});
      if (!voiceActiveRef.current) return;
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size < 2000) {
        if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 300);
        return;
      }
      await transcribeAndReply(blob);
    };

    recorder.start();
    setVoiceListening(true);
    setVoiceTranscript("");

    // Time-based silence detection (reliable regardless of frame rate)
    const data = new Uint8Array(analyser.frequencyBinCount);
    let hasSpeech = false;
    let silenceStart: number | null = null;

    function checkSilence() {
      if (!voiceActiveRef.current || recorder.state !== "recording") return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      if (avg > 12) {
        hasSpeech = true;
        silenceStart = null;
      } else if (avg < 8) {
        if (silenceStart === null) silenceStart = Date.now();
        const silentMs = Date.now() - silenceStart;
        const threshold = hasSpeech ? 1800 : 4000; // 1.8s after speech, 4s before
        if (silentMs > threshold) {
          recorder.stop();
          setVoiceListening(false);
          return;
        }
      } else {
        silenceStart = null;
      }
      requestAnimationFrame(checkSilence);
    }
    requestAnimationFrame(checkSilence);
  }

  async function transcribeAndReply(blob: Blob) {
    if (!voiceActiveRef.current) return;
    try {
      const form = new FormData();
      form.append("audio", blob, "audio.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const { text } = await res.json();
      if (!text?.trim() || !voiceActiveRef.current) {
        if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 300);
        return;
      }
      setVoiceTranscript(text.trim());

      // Send to AI
      const sessionId = activeSession ?? Date.now().toString();
      if (!activeSession) {
        setSessions(p => [{ id: sessionId, title: text.slice(0, 40) }, ...p]);
        setActiveSession(sessionId);
      }
      setInput(text.trim());
      sendMessage({ text: text.trim() });
      setInput("");
    } catch {
      if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 500);
    }
  }

  async function speakWithTTS(text: string) {
    if (!voiceActiveRef.current) return;
    currentAudioRef.current?.pause();
    setVoiceSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok || !voiceActiveRef.current) throw new Error("tts failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        setVoiceSpeaking(false);
        setVoiceTranscript("");
        if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 400);
      };
      audio.onerror = () => {
        setVoiceSpeaking(false);
        if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 400);
      };
      await audio.play();
    } catch {
      setVoiceSpeaking(false);
      if (voiceActiveRef.current && !voiceMutedRef.current) setTimeout(startListeningWhisper, 400);
    }
  }

  function toggleVoiceMute() {
    const next = !voiceMutedRef.current;
    voiceMutedRef.current = next;
    setVoiceMuted(next);
    if (next) {
      // Mute — stop recording
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setVoiceListening(false);
    } else {
      // Unmute — start listening again
      setTimeout(startListeningWhisper, 300);
    }
  }

  function stopVoiceMode() {
    voiceActiveRef.current = false;
    listeningActiveRef.current = false;
    lastSpokenMsgIdRef.current = null;
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    currentAudioRef.current?.pause();
    currentAudioRef.current = null;
    if (videoRef.current) { videoRef.current.srcObject = null; }
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setVoiceActive(false);
    setVoiceListening(false);
    setVoiceTranscript("");
    setVoiceSpeaking(false);
    setVoiceSeconds(0);
    setVoiceMuted(false);
    setVoiceIsVideo(false);
  }

  // Speak AI response via TTS when in voice mode
  useEffect(() => {
    if (!voiceActive || isLoading) return;
    const lastAI = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAI) return;
    // Don't re-speak a message we've already spoken
    if (lastAI.id === lastSpokenMsgIdRef.current) return;
    const text = lastAI.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("").slice(0, 600);
    if (!text) return;
    lastSpokenMsgIdRef.current = lastAI.id;
    // Stop mic before speaking (avoid recording our own TTS)
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    listeningActiveRef.current = false;
    setVoiceListening(false);
    speakWithTTS(text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isLoading]);

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

      // Read all text files; PDFs go through parse-pdf API, others use FileReader
      const readPromises = textFiles.map(f => new Promise<string>((resolve) => {
        if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
          const form = new FormData();
          form.append("file", f);
          fetch("/api/parse-pdf", { method: "POST", body: form })
            .then(r => r.json())
            .then(data => {
              if (data.text) {
                resolve(`\n\n--- PDF: ${f.name} (${data.pages} pages) ---\n${data.text}\n--- End of ${f.name} ---`);
              } else {
                resolve(`\n\n[Could not extract text from ${f.name}: ${data.error ?? "unknown error"}]`);
              }
            })
            .catch(() => resolve(`\n\n[Failed to read PDF: ${f.name}]`));
        } else {
          const reader = new FileReader();
          reader.onload = (e) => resolve(
            `\n\n--- File: ${f.name} ---\n${e.target?.result as string}\n--- End of ${f.name} ---`
          );
          reader.onerror = () => resolve(`\n\n[Could not read file: ${f.name}]`);
          reader.readAsText(f);
        }
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

  function regenerateLast() {
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    if (!lastUser) return;
    const text = lastUser.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("");
    // Remove last assistant message then resend
    setMessages(messages.filter(m => m.id !== messages[messages.length - 1]?.id));
    setTimeout(() => sendMessage({ text }), 50);
  }

  function newChat() {
    setMessages([]);
    setInput("");
    setActiveSession(null);
    setAttachments([]);
    setAttachPreviews([]);
    if (textareaRef.current) textareaRef.current.focus();
  }

  async function loadSession(id: string) {
    setActiveSession(id);
    setMessages([]);
    try {
      if (user) {
        const token = await user.getIdToken();
        const res = await fetch(`/api/conversations?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.messages) { setMessages(data.messages); return; }
        }
      }
      // Fallback: localStorage
      const saved = localStorage.getItem(`tatai_msgs_${user?.uid}_${id}`);
      if (saved) setMessages(JSON.parse(saved) as any);
    } catch {}
  }

  function deleteSession(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    setSessions(p => p.filter(s => s.id !== id));
    try { localStorage.removeItem(`tatai_msgs_${user?.uid}_${id}`); } catch {}
    if (user) {
      user.getIdToken().then(token =>
        fetch(`/api/conversations?id=${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
      ).catch(() => {});
    }
    if (activeSession === id) newChat();
    // Update persisted list
    if (storageKey) {
      try {
        const updated = sessions.filter(s => s.id !== id);
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
    }
  }

  function pinSession(id: string) {
    setSessions(p => {
      const updated = p.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s);
      const pinned = updated.filter(s => s.pinned);
      const rest = updated.filter(s => !s.pinned);
      const final = [...pinned, ...rest];
      if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(final)); } catch {} }
      return final;
    });
    setCtxMenu(null);
  }

  function startRename(id: string, currentTitle: string) {
    setRenamingId(id);
    setRenameValue(currentTitle);
    setCtxMenu(null);
  }

  function commitRename(id: string) {
    if (!renameValue.trim()) { setRenamingId(null); return; }
    setSessions(p => {
      const updated = p.map(s => s.id === id ? { ...s, title: renameValue.trim() } : s);
      if (storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(updated)); } catch {} }
      return updated;
    });
    setRenamingId(null);
  }

  async function shareSession(id: string) {
    setCtxMenu(null);
    try {
      const session = sessions.find(s => s.id === id);

      // Get messages: prefer in-memory (if active), else fetch from API
      let rawMsgs: typeof messages = [];
      if (id === activeSession && messages.length > 0) {
        rawMsgs = messages;
      } else if (user) {
        const token = await user.getIdToken();
        const res = await fetch(`/api/conversations?id=${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          rawMsgs = data.messages ?? [];
        }
      }

      const plainMsgs = rawMsgs.map((m: any) => ({
        role: m.role as string,
        content: Array.isArray(m.parts)
          ? m.parts.filter((p: any) => p.type === "text").map((p: any) => p.text ?? "").join("")
          : (m.content ?? ""),
      })).filter((m: any) => m.content);

      const shareRes = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: plainMsgs, title: session?.title || "Shared Chat" }),
      });
      const data = await shareRes.json();
      const url = (shareRes.ok && data.url)
        ? `${window.location.origin}${data.url}`
        : `${window.location.origin}/?chat=${id}`;
      await navigator.clipboard.writeText(url);
    } catch {
      navigator.clipboard.writeText(`${window.location.origin}/?chat=${id}`);
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
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <TataILogo className="w-7 h-7" />
            <span className="font-semibold text-[15px] text-neutral-900 dark:text-white">tatAI</span>
          </div>
          <button onClick={newChat} title="New chat" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/50">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto px-2 py-1" onClick={() => setCtxMenu(null)}>
          {sessions.filter(s => s.pinned).length > 0 && (
            <p className="text-[11px] font-medium text-neutral-400 dark:text-white/25 px-2 pt-2 pb-1">Pinned</p>
          )}
          {sessions.filter(s => s.pinned).map((s) => (
            <SessionRow key={s.id} s={s} activeSession={activeSession} renamingId={renamingId} renameValue={renameValue} setRenameValue={setRenameValue} commitRename={commitRename} loadSession={loadSession} closeSidebarOnMobile={closeSidebarOnMobile} setCtxMenu={setCtxMenu} />
          ))}
          {sessions.filter(s => !s.pinned).length > 0 && (
            <p className="text-[11px] font-medium text-neutral-400 dark:text-white/25 px-2 pt-2 pb-1">Today</p>
          )}
          {sessions.filter(s => !s.pinned).map((s) => (
            <SessionRow key={s.id} s={s} activeSession={activeSession} renamingId={renamingId} renameValue={renameValue} setRenameValue={setRenameValue} commitRename={commitRename} loadSession={loadSession} closeSidebarOnMobile={closeSidebarOnMobile} setCtxMenu={setCtxMenu} />
          ))}
        </div>

        {/* Context menu */}
        {ctxMenu && (() => {
          const s = sessions.find(x => x.id === ctxMenu.id);
          if (!s) return null;
          return (
            <div
              className="fixed z-[200] bg-white dark:bg-[#232323] border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-xl py-1 w-44"
              style={{ top: ctxMenu.y, left: ctxMenu.x }}
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => shareSession(s.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors">
                <Link className="w-3.5 h-3.5" /> Share link
              </button>
              <button onClick={() => startRename(s.id, s.title)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button onClick={() => pinSession(s.id)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-neutral-700 dark:text-white/70 hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors">
                <Pin className="w-3.5 h-3.5" /> {s.pinned ? "Unpin" : "Pin"}
              </button>
              <div className="my-1 mx-2 h-px bg-neutral-200 dark:bg-white/[0.06]" />
              <button onClick={(e) => { deleteSession(s.id, e); setCtxMenu(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          );
        })()}

        {/* ── Bottom section ── */}
        <div className="border-t border-neutral-200 dark:border-white/[0.06] pt-1.5 pb-1">

          {/* These links are ALWAYS visible, logged in or not */}
          <div className="px-2">
            {BOTTOM_LINK_DEFS.map(({ icon: Icon, key, href }) => (
              <button
                key={key}
                onClick={() => { router.push(href); closeSidebarOnMobile(); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-neutral-500 dark:text-white/40 hover:bg-neutral-100 dark:hover:bg-white/[0.05] hover:text-neutral-800 dark:hover:text-white/70 transition-colors text-left"
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {t[key]}
              </button>
            ))}
            <button
              onClick={() => { router.push("/upgrade"); closeSidebarOnMobile(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/[0.08] transition-colors text-left font-medium"
            >
              <Crown className="w-3.5 h-3.5 flex-shrink-0" />
              {t.upgrade}
            </button>
          </div>

          {/* Divider */}
          <div className="mx-3 my-1.5 h-px bg-neutral-200 dark:bg-white/[0.05]" />

          {/* User row — shows account info if logged in, Log in button if not */}
          {authLoading ? (
            <div className="flex items-center gap-3 px-4 py-3 mx-0">
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-white/[0.07] animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 rounded-full bg-neutral-200 dark:bg-white/[0.07] animate-pulse" />
                <div className="h-2 w-32 rounded-full bg-neutral-200 dark:bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          ) : user ? (
            <div>
              {/* Expandable: sign out */}
              {menuOpen && (
                <div className="px-2 pb-1">
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                    {t.signOut}
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
                <span className="text-[13px] font-medium text-neutral-700 dark:text-white/60">{t.signIn}</span>
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
          {/* Left: sidebar toggle */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40 flex-shrink-0"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Center: model selector (ChatGPT style) */}
          <div className="flex-1 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => setModelDropOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/[0.07] transition-colors group"
              >
                <span className="font-semibold text-neutral-900 dark:text-white text-[15px]">tatAI</span>
                <span className={`text-[13px] font-medium ${activeModelDef.color}`}>{activeModelDef.fullName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 dark:text-white/30 group-hover:text-neutral-600 dark:group-hover:text-white/60 transition-colors" />
              </button>

              {modelDropOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setModelDropOpen(false)} />
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-40 w-[230px] bg-white dark:bg-[#1c1c1c] border border-neutral-200 dark:border-white/[0.08] rounded-2xl shadow-xl overflow-hidden">
                    <div className="px-3 py-2.5 border-b border-neutral-100 dark:border-white/[0.05]">
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
                            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{t[m.descKey as keyof typeof t]}</p>
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

          {/* Right: Upgrade button (non-pro) + new chat (mobile) */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!isPro && (
              <button
                onClick={() => router.push("/upgrade")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[12px] font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-violet-500/20"
              >
                <Crown className="w-3 h-3" />
                {t.upgrade}
              </button>
            )}
            {isMobile && (
              <button
                onClick={() => { newChat(); closeSidebarOnMobile(); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-400 dark:text-white/40"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Messages / Welcome */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* ── Welcome screen ── */
            <div className="flex flex-col items-center justify-center min-h-full px-4 pb-40 pt-10">
              <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-neutral-900 dark:text-white mb-2 text-center">
                {t.howCanIHelp}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-[14px] sm:text-[15px] mb-9 text-center font-normal">
                {t.alwaysReady}
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
                      <div className="text-neutral-800 dark:text-neutral-100 text-[14.5px] leading-[1.7] tracking-[-0.01em] group">
                        <MessageContent content={m.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("")} />
                        <MessageActions
                          text={m.parts.filter(p => p.type === "text").map(p => p.type === "text" ? p.text : "").join("")}
                          isLast={m.id === messages[messages.length - 1]?.id}
                          onRegenerate={regenerateLast}
                          sessionId={activeSession}
                          getMessages={() => messages.map(msg => ({
                            role: msg.role,
                            content: msg.parts?.filter((p: {type:string}) => p.type === "text").map((p: {type:string;text?:string}) => p.type === "text" ? p.text ?? "" : "").join("") ?? "",
                          }))}
                        />
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

              {/* Inline voice recorder bar — replaces textarea while recording/showing transcript */}
              {(inlineRecording || inlineTranscript) ? (
                <div className="flex items-center gap-3 px-4 pt-3 pb-2 min-h-[56px]">
                  {/* Cancel */}
                  <button
                    onClick={cancelInlineRecording}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-white/[0.06] hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 dark:text-white/40 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>

                  {/* Waveform / transcript */}
                  <div className="flex-1 min-w-0">
                    {inlineRecording && !inlineTranscript ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-neutral-400 dark:text-white/40 mr-2">Listening…</span>
                        <div className="flex items-end gap-[3px] h-5">
                          {[8,14,20,16,10,18,12].map((h, i) => (
                            <div
                              key={i}
                              className="voice-bar"
                              style={{
                                height: h,
                                background: "#2563eb",
                                animationDuration: `${0.7 + i * 0.07}s`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] text-neutral-800 dark:text-white leading-snug truncate">{inlineTranscript}</p>
                    )}
                  </div>

                  {/* Send / confirm */}
                  {inlineTranscript ? (
                    <button
                      onClick={sendInlineTranscript}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                  ) : (
                    <button
                      onClick={stopInlineRecording}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center flex-shrink-0 transition-colors"
                    >
                      <Check className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              ) : (
              /* Textarea */
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={attachments.length > 0 ? "Add a message or just send the file..." : t.messagePlaceholder}
                rows={1}
                className="w-full resize-none bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-[14.5px] leading-relaxed tracking-[-0.01em] px-4 pt-3.5 pb-12 focus:outline-none min-h-[56px] max-h-[200px]"
              />
              )}

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

                {/* Right actions */}
                <div className="flex items-center gap-1.5">
                  {/* Mic — inline voice-to-text recorder */}
                  <button
                    onClick={inlineRecording ? stopInlineRecording : startInlineRecording}
                    title="Record voice"
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      inlineRecording
                        ? "bg-blue-500 text-white animate-pulse"
                        : "text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:text-blue-500 dark:hover:text-blue-400"
                    }`}
                  >
                    <Mic className="w-[17px] h-[17px]" />
                  </button>

                  {/* Call button — Voice / Video call dropdown */}
                  <div className="relative" ref={voiceMenuRef}>
                    <button
                      onClick={() => setShowVoiceMenu(v => !v)}
                      title="Voice or Video call"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-white/[0.08] hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.9 12.87 19.79 19.79 0 0 1 1.92 4.27 2 2 0 0 1 3.9 2.1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                    {showVoiceMenu && (
                      <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/[0.08] rounded-xl shadow-xl py-1 min-w-[160px] z-50">
                        <button
                          onClick={() => startVoiceMode(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-white/70 hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                          <Mic className="w-4 h-4 text-blue-500" />
                          Voice Call
                        </button>
                        <button
                          onClick={() => startVoiceMode(true)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-white/70 hover:bg-neutral-50 dark:hover:bg-white/[0.05] transition-colors"
                        >
                          <Video className="w-4 h-4 text-blue-500" />
                          Video Call
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={(!input.trim() && attachments.length === 0) || isLoading}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      (input.trim() || attachments.length > 0) && !isLoading
                        ? "bg-neutral-900 dark:bg-white hover:bg-neutral-700 dark:hover:bg-neutral-200"
                        : "bg-neutral-200 dark:bg-neutral-600 cursor-not-allowed"
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${(input.trim() || attachments.length > 0) && !isLoading ? "text-white dark:text-neutral-900" : "text-neutral-400"}`} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-neutral-400 dark:text-neutral-500/60 text-[11px] mt-2 tracking-wide">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* ── Voice / Video Call Overlay ── */}
        {voiceActive && (
          <div className="fixed inset-0 z-50 flex flex-col select-none bg-[#111]">

            {voiceIsVideo ? (
              /* ── VIDEO MODE: fullscreen camera ── */
              <>
                {/* Fullscreen camera */}
                <video
                  ref={videoRef}
                  autoPlay muted playsInline
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
                {/* Dim overlay for readability */}
                <div className="absolute inset-0 bg-black/20" />

                {/* Top HUD */}
                <div className="relative z-10 flex items-center justify-between px-5 pt-6">
                  <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <TataILogo className="w-4 h-4" />
                    <span className="text-white text-sm font-semibold">tatAI</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-white/70 text-xs font-mono tabular-nums">
                      {String(Math.floor(voiceSeconds / 60)).padStart(2, "0")}:{String(voiceSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* AI pip — bottom-right, branded blue circle */}
                <div className="absolute bottom-28 right-5 z-10">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all"
                    style={{
                      background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                      borderColor: voiceSpeaking ? "#2563eb" : "rgba(255,255,255,0.15)",
                      boxShadow: voiceSpeaking ? "0 0 20px rgba(37,99,235,0.6)" : "0 4px 20px rgba(0,0,0,0.4)",
                    }}
                  >
                    <TataILogo className="w-10 h-10" />
                  </div>
                  {/* Status badge */}
                  <div className={`mt-1.5 flex items-center justify-center gap-1.5 rounded-full py-0.5 px-2 ${voiceSpeaking ? "bg-blue-600" : voiceListening ? "bg-[#2563eb]/80" : "bg-black/50"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white text-[10px] font-semibold">{voiceSpeaking ? "Speaking" : voiceListening ? "Listening" : "Ready"}</span>
                  </div>
                </div>

                {/* Transcript overlay */}
                {voiceTranscript && (
                  <div className="absolute bottom-28 left-5 right-36 z-10">
                    <p className="text-white/80 text-sm italic bg-black/40 backdrop-blur-sm rounded-xl px-3 py-2 leading-snug">"{voiceTranscript}"</p>
                  </div>
                )}

                {/* Controls */}
                <div className="relative z-10 mt-auto pb-10 flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={toggleVoiceMute} className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm transition-all active:scale-90 ${voiceMuted ? "bg-white/20 border border-white/30" : "bg-black/40 border border-white/20"}`}>
                      {voiceMuted ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
                    </button>
                    <span className="text-white/40 text-[10px]">{voiceMuted ? "Unmute" : "Mute"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={stopVoiceMode} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all active:scale-90" style={{ boxShadow: "0 6px 24px rgba(239,68,68,0.5)" }}>
                      <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-white/40 text-[10px]">End</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <button className="w-14 h-14 rounded-full bg-black/40 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Video className="w-5 h-5 text-white" />
                    </button>
                    <span className="text-white/40 text-[10px]">Camera</span>
                  </div>
                </div>
              </>
            ) : (
              /* ── VOICE MODE: branded dark ── */
              <>
                {/* Top bar */}
                <div className="flex items-center justify-between px-5 pt-6 pb-4">
                  <div className="flex items-center gap-2">
                    <TataILogo className="w-5 h-5" />
                    <span className="text-white/70 text-sm font-bold tracking-tight">tatAI</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/[0.05] border border-white/[0.07] rounded-full px-3 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-white/40 text-xs font-mono tabular-nums">
                      {String(Math.floor(voiceSeconds / 60)).padStart(2, "0")}:{String(voiceSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Avatar */}
                <div className="flex-1 flex flex-col items-center justify-center gap-7">
                  <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                    {/* Pulse rings — brand blue only */}
                    {(voiceListening || voiceSpeaking) && (
                      <>
                        <div className="call-ring-1" style={{ borderColor: "rgba(37,99,235,0.5)" }} />
                        <div className="call-ring-2" style={{ borderColor: "rgba(37,99,235,0.3)" }} />
                      </>
                    )}
                    {/* Avatar circle */}
                    <div
                      className="relative z-10 w-[130px] h-[130px] rounded-full flex items-center justify-center transition-all duration-500"
                      style={{
                        background: "linear-gradient(135deg, #1d4ed8, #2563eb, #3b82f6)",
                        boxShadow: (voiceListening || voiceSpeaking)
                          ? "0 0 0 0px rgba(37,99,235,0), 0 0 60px rgba(37,99,235,0.5)"
                          : "0 0 30px rgba(37,99,235,0.2)",
                      }}
                    >
                      <TataILogo className="w-16 h-16" />
                    </div>
                  </div>

                  {/* Name + status */}
                  <div className="text-center">
                    <p className="text-white text-2xl font-bold tracking-tight mb-2">tatAI</p>
                    <div className="flex items-center justify-center gap-2 h-6">
                      <div className="flex items-end gap-[3px]">
                        {[0,1,2,3,4].map(i => (
                          <div key={i}
                            className={`call-sound-bar ${!(voiceListening || voiceSpeaking) ? "call-sound-bar-idle" : ""}`}
                            style={{
                              background: "#2563eb",
                              animationDuration: `${0.6 + i * 0.07}s`,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-white/40 text-sm font-medium">
                        {voiceSpeaking ? "Speaking…" : voiceListening ? "Listening…" : "Ready"}
                      </p>
                    </div>
                    {voiceTranscript && (
                      <p className="text-white/25 text-xs mt-4 max-w-[260px] mx-auto italic leading-relaxed">"{voiceTranscript}"</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="pb-14 flex items-center justify-center gap-8">
                  <div className="flex flex-col items-center gap-1.5">
                    <button onClick={toggleVoiceMute} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90 border ${voiceMuted ? "bg-white/10 border-white/20" : "bg-white/[0.06] border-white/[0.08]"}`}>
                      {voiceMuted ? <MicOff className="w-5 h-5 text-white/50" /> : <Mic className="w-5 h-5 text-white/70" />}
                    </button>
                    <span className="text-white/25 text-[10px]">{voiceMuted ? "Unmute" : "Mute"}</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button onClick={stopVoiceMode} className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all active:scale-90" style={{ boxShadow: "0 6px 24px rgba(239,68,68,0.45)" }}>
                      <PhoneOff className="w-6 h-6 text-white" />
                    </button>
                    <span className="text-white/25 text-[10px]">End</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <button className="w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-white/40" />
                    </button>
                    <span className="text-white/25 text-[10px]">Speaker</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
