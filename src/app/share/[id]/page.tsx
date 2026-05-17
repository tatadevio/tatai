"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TataILogo } from "@/components/Logo";
import { ArrowLeft, Copy, Check } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; parts?: { type: string; text?: string }[]; }

export default function SharePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState("Shared Chat");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/share?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); return; }
        setMessages(data.messages ?? []);
        setTitle(data.title ?? "Shared Chat");
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  if (notFound) return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center justify-center gap-4 text-white/50">
      <TataILogo className="w-12 h-12" />
      <p className="text-lg">Chat not found or has expired</p>
      <button onClick={() => router.push("/")} className="text-sm text-blue-400 hover:underline">Go to tatAI →</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#111]/90 backdrop-blur border-b border-white/[0.07] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-1.5 rounded-lg hover:bg-white/[0.07] transition-colors text-white/50 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <TataILogo className="w-7 h-7" />
          <div>
            <p className="font-semibold text-[14px] text-white leading-tight">{title}</p>
            <p className="text-[11px] text-white/35">Shared conversation · tatAI</p>
          </div>
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] transition-colors text-[13px] text-white/70"
        >
          {copied ? <><Check className="w-3.5 h-3.5 text-green-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {messages.map((m, i) => {
          const text = m.content || m.parts?.filter(p => p.type === "text").map(p => p.text ?? "").join("") || "";
          return (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6B4EFF] to-[#B060FF] flex items-center justify-center flex-shrink-0 mt-1">
                <TataILogo className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-[80%] ${m.role === "user"
              ? "bg-white/[0.08] rounded-2xl rounded-tr-md px-4 py-2.5 text-[14.5px] text-white/90"
              : "text-[14.5px] leading-[1.7] text-neutral-100"
            }`}>
              {m.role === "user" ? (
                <p>{text}</p>
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-white/[0.07] py-6 text-center">
        <p className="text-white/40 text-[13px] mb-3">Try tatAI for free</p>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B4EFF] to-[#B060FF] text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
        >
          Start chatting →
        </button>
      </div>
    </div>
  );
}
