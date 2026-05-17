"use client";

import { useState } from "react";
import { Copy, Check, Download, Eye, X, ExternalLink } from "lucide-react";

function downloadFile(content: string, lang: string) {
  const extMap: Record<string, string> = {
    html: "html", css: "css", javascript: "js", js: "js",
    typescript: "ts", ts: "ts", tsx: "tsx", jsx: "jsx",
    python: "py", py: "py", bash: "sh", sh: "sh",
    json: "json", sql: "sql", markdown: "md", md: "md",
    yaml: "yaml", yml: "yml", rust: "rs", go: "go",
    java: "java", cpp: "cpp", c: "c",
  };
  const ext = extMap[lang.toLowerCase()] ?? "txt";
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tatAI-code.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

interface CodeBlockProps {
  children: string;
  lang: string;
}

export function CodeBlock({ children, lang }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState(false);
  const isHTML = lang.toLowerCase() === "html";

  function handleCopy() {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="my-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-white/[0.08]">
        {/* Header */}
        <div className="flex items-center justify-between bg-neutral-100 dark:bg-[#1e1e1e] px-4 py-2 border-b border-neutral-200 dark:border-white/[0.08]">
          <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400">{lang || "code"}</span>
          <div className="flex items-center gap-1">
            {isHTML && (
              <button
                onClick={() => setPreview(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            )}
            <button
              onClick={() => downloadFile(children, lang)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/[0.08] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Code */}
        <pre className="bg-neutral-50 dark:bg-[#1a1a1a] px-4 py-4 overflow-x-auto text-[13px] leading-relaxed">
          <code className="font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre">{children}</code>
        </pre>
      </div>

      {/* Preview modal */}
      {preview && isHTML && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-neutral-200 dark:border-white/[0.1]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 dark:border-white/[0.08] bg-neutral-50 dark:bg-[#111]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-sm text-neutral-800 dark:text-white">Live Preview</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const blob = new Blob([children], { type: "text/html" });
                    window.open(URL.createObjectURL(blob), "_blank");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open in tab
                </button>
                <button
                  onClick={() => downloadFile(children, "html")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <button
                  onClick={() => setPreview(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-white/[0.1] transition-colors text-neutral-500 dark:text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* iframe */}
            <iframe
              srcDoc={children}
              className="flex-1 w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Preview"
            />
          </div>
        </div>
      )}
    </>
  );
}
