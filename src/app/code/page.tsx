"use client";

import { useState } from "react";
import Link from "next/link";

const INSTALL_CMD = "curl -L https://www.tatai.cloud/install.sh | bash";

const COMMANDS = [
  { cmd: "tatai", desc: "Start interactive AI coding session" },
  { cmd: 'tatai "fix this bug"', desc: "One-shot prompt, result in terminal" },
  { cmd: "tatai @src/app.ts", desc: "Include a file in context" },
  { cmd: "tatai @src/", desc: "Include a whole directory" },
];

const SLASH_COMMANDS = [
  { cmd: "/model", desc: "Switch between Flash / Nova / Ultra" },
  { cmd: "/read <file>", desc: "Load a file into the conversation" },
  { cmd: "/ls [dir]", desc: "Browse project files" },
  { cmd: "/paste", desc: "Multi-line paste mode" },
  { cmd: "/clear", desc: "Clear chat history" },
  { cmd: "/login <key>", desc: "Save your API key" },
  { cmd: "/exit", desc: "Quit" },
];

const DEMO_LINES = [
  { type: "system", text: "tatAI CLI v1.0.0 — Intelligence Unleashed" },
  { type: "system", text: 'Model: Nova  ·  Dir: ~/my-project' },
  { type: "prompt", text: "" },
  { type: "user", text: 'fix the TypeScript error in @src/api/chat.ts' },
  { type: "assistant", text: "I can see the issue — the `messages` parameter is typed as `any[]` but the function expects `UIMessage[]`. Here's the fix:" },
  { type: "code", text: `// src/api/chat.ts
import { UIMessage } from "ai";

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  // ...
}` },
  { type: "apply", text: "Apply changes to src/api/chat.ts? [y/N]" },
];

function TerminalDemo() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-purple-950/30 w-full max-w-2xl mx-auto">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1a1a1a] border-b border-white/8">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <span className="mx-auto text-xs text-white/30 font-mono">tatAI CLI</span>
      </div>
      {/* Content */}
      <div className="p-5 font-mono text-sm leading-7 space-y-1">
        <p className="text-purple-400">{DEMO_LINES[0].text}</p>
        <p className="text-white/30">{DEMO_LINES[1].text}</p>
        <p className="text-white/20">───────────────────────────────</p>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-green-400">●</span>
          <span className="text-purple-300 font-bold">You</span>
          <span className="text-white/40">›</span>
          <span className="text-white">{DEMO_LINES[3].text}</span>
        </div>
        <div className="pt-1">
          <span className="text-purple-400 font-bold">tatAI</span>
          <span className="text-white/40"> › </span>
          <span className="text-white/80">{DEMO_LINES[4].text}</span>
        </div>
        <pre className="mt-2 p-3 rounded-lg bg-white/5 text-green-300 text-xs leading-5 overflow-x-auto">{DEMO_LINES[5].text}</pre>
        <p className="text-yellow-400 pt-1">{DEMO_LINES[6].text} <span className="animate-pulse">▋</span></p>
      </div>
    </div>
  );
}

export default function CodePage() {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/8 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">tatAI</span>
          <span className="text-xs font-semibold text-white/40 bg-white/8 px-2 py-0.5 rounded-full border border-white/10">Code</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
          <a href="#commands" className="text-sm text-white/50 hover:text-white transition-colors">Commands</a>
          <Link href="/upgrade" className="text-sm bg-purple-600 hover:bg-purple-500 transition-colors px-4 py-1.5 rounded-full font-semibold">
            Upgrade
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-950/60 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
          v1.0.0 — Now available
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-tight">
          <span className="bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent">
            Code with AI,
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            right in your terminal
          </span>
        </h1>

        <p className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          tatAI Code CLI drops into any workflow. Read files, understand your codebase,
          write and apply changes — all from one command.
        </p>

        {/* Install command */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <button
            onClick={copy}
            className="flex items-center gap-3 bg-[#1a1a1a] border border-white/12 hover:border-purple-500/50 transition-all rounded-xl px-5 py-3 font-mono text-sm group"
          >
            <span className="text-white/40">$</span>
            <span className="text-white/80">{INSTALL_CMD}</span>
            <span className="text-white/30 group-hover:text-purple-400 transition-colors ml-2">
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-400">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </span>
          </button>
        </div>
        <p className="text-xs text-white/25">Requires Node.js 18+</p>
      </section>

      {/* Terminal demo */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <TerminalDemo />
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-20 border-t border-white/8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">How it works</h2>
          <p className="text-white/40 text-center mb-14">Three steps to AI-powered coding</p>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Install",
                desc: "One command installs tatAI globally. Works on macOS and Linux.",
                code: "curl -L tatai.cloud/install.sh | bash",
              },
              {
                step: "02",
                title: "Point at your code",
                desc: "Use @filename to include any file or folder in the conversation.",
                code: 'tatai "review @src/"',
              },
              {
                step: "03",
                title: "Apply changes",
                desc: "tatAI suggests edits. You approve each write with a single keypress.",
                code: "Apply to app.ts? [y/N]",
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
                <div className="text-4xl font-black text-purple-500/30 mb-4">{item.step}</div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed mb-4">{item.desc}</p>
                <code className="text-xs font-mono text-purple-300 bg-purple-950/40 px-3 py-2 rounded-lg block">
                  {item.code}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick-start examples */}
      <section className="px-6 py-20 border-t border-white/8 bg-white/2">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">Start in seconds</h2>
          <p className="text-white/40 text-center mb-14">Common ways to use tatAI Code</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {COMMANDS.map((item) => (
              <div key={item.cmd} className="flex items-start gap-4 bg-[#111] border border-white/8 rounded-xl p-4 hover:border-purple-500/25 transition-colors group">
                <span className="text-purple-400 mt-0.5">›</span>
                <div>
                  <code className="text-sm font-mono text-white group-hover:text-purple-200 transition-colors">{item.cmd}</code>
                  <p className="text-xs text-white/40 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commands reference */}
      <section id="commands" className="px-6 py-20 border-t border-white/8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-4">Slash commands</h2>
          <p className="text-white/40 text-center mb-14">Type these inside the interactive session</p>

          <div className="bg-[#0d0d0d] border border-white/8 rounded-2xl overflow-hidden">
            {SLASH_COMMANDS.map((item, i) => (
              <div
                key={item.cmd}
                className={`flex items-center justify-between px-6 py-4 hover:bg-white/4 transition-colors ${i !== SLASH_COMMANDS.length - 1 ? "border-b border-white/6" : ""}`}
              >
                <code className="font-mono text-sm text-purple-300">{item.cmd}</code>
                <span className="text-sm text-white/40 text-right">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 border-t border-white/8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">⚡</div>
          <h2 className="text-4xl font-black mb-4">Ready to code faster?</h2>
          <p className="text-white/40 mb-10">Install takes 10 seconds. No account required to start.</p>
          <button
            onClick={copy}
            className="inline-flex items-center gap-3 bg-purple-600 hover:bg-purple-500 transition-colors rounded-xl px-6 py-3.5 font-mono text-sm font-semibold"
          >
            <span className="text-purple-200">$</span>
            {INSTALL_CMD}
            <span className="text-purple-300 text-xs">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <span className="font-bold text-white/50">tatAI</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/upgrade" className="hover:text-white transition-colors">Upgrade to Pro</Link>
          </div>
          <span>© 2025 tatadev LLC</span>
        </div>
      </footer>
    </div>
  );
}
