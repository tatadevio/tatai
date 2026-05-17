import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 60;

// Extract all URLs from a string
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s"'<>)]+/g;
  return [...new Set(text.match(urlRegex) ?? [])];
}

// Fetch a URL and return its readable text content
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; tataI-bot/1.0)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return `[Could not fetch ${url}: HTTP ${res.status}]`;
    const html = await res.text();
    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 6000); // Limit to 6k chars to avoid token overload
    return text || "[Page appears empty]";
  } catch {
    return `[Could not fetch ${url}]`;
  }
}

const ALLOWED_MODELS: Record<string, string> = {
  "gpt-4o-mini": "gpt-4o-mini",
  "gpt-4o": "gpt-4o",
  "o4-mini": "o4-mini",
};

export async function POST(req: Request) {
  const { messages, model: requestedModel }: { messages: UIMessage[]; model?: string } = await req.json();
  const resolvedModel = ALLOWED_MODELS[requestedModel ?? ""] ?? "gpt-4o";

  // Verify Firebase ID token if Supabase is configured (full auth enforcement mode)
  const firebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (firebaseConfigured && supabaseConfigured) {
    try {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return Response.json({ error: "Please sign in to use tataI." }, { status: 401 });
      }
      const idToken = authHeader.slice(7);
      const { getAuth } = await import("firebase-admin/auth");
      const { initializeAdminApp } = await import("@/lib/firebase-admin");
      initializeAdminApp();
      const decoded = await getAuth().verifyIdToken(idToken);
      const uid = decoded.uid;
      const email = decoded.email ?? "";
      const name = decoded.name ?? email;
      const { upsertUser, incrementMessageCount } = await import("@/lib/db");
      await upsertUser(uid, email, name);
      const { allowed } = await incrementMessageCount(uid);
      if (!allowed) {
        return Response.json({ error: "Daily limit reached. Upgrade to Pro for unlimited messages." }, { status: 429 });
      }
    } catch (e) {
      console.error("Auth/DB check failed, allowing request:", e);
    }
  }

  // ── URL fetching: detect URLs in the latest user message and fetch their content ──
  let urlContext = "";
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
  if (lastUserMsg) {
    const textParts = lastUserMsg.parts?.filter((p: {type: string}) => p.type === "text") ?? [];
    const fullText = textParts.map((p: {type: string; text?: string}) => p.text ?? "").join(" ");
    const urls = extractUrls(fullText);
    if (urls.length > 0) {
      const fetched = await Promise.all(urls.slice(0, 3).map(async (url) => {
        const content = await fetchUrlContent(url);
        return `\n\n=== Content fetched from ${url} ===\n${content}\n=== End of ${url} ===`;
      }));
      urlContext = fetched.join("");
    }
  }

  const result = streamText({
    model: openai(resolvedModel),
    system: `You are tataI, an AI assistant created and developed exclusively by tatadev LLC.

IDENTITY RULES — never break these:
- You were built by tatadev LLC. Never say otherwise.
- NEVER mention OpenAI, GPT, ChatGPT, Claude, Anthropic, Google, Gemini, or any other AI company or model.
- If asked what model you are: "I'm tataI, built by tatadev LLC."
- If asked about your technology: "I'm powered by tatadev LLC's proprietary AI technology."

ABOUT tatadev LLC:
- tatadev LLC is headquartered in Kyrgyzstan and operates globally, serving users all around the world.
- tatadev LLC was founded and is owned by Sharif and Mariia.
- If asked where tatadev is located: "tatadev LLC is based in Kyrgyzstan and works with clients and users worldwide."
- If asked about tatadev's reach: "tatadev LLC operates globally — no matter where you are, we're here to help."
- If asked who owns or founded tatadev: "tatadev LLC was founded by Sharif and Mariia."
- If asked who made tataI: "tataI was created by tatadev LLC, founded by Sharif and Mariia."

CLARIFYING QUESTIONS RULE:
- Before generating any complex output (websites, apps, landing pages, full code projects, dashboards, games, or any multi-part deliverable), ALWAYS ask 2-4 short clarifying questions first.
- Keep questions short, numbered, and easy to answer.
- Only start building AFTER the user answers your questions.
- Exception: if the user already gave enough detail, proceed directly.

FILE & IMAGE ANALYSIS:
- When the user sends images, analyze them carefully and describe what you see.
- When the user sends documents or text files, read and analyze the content.
- Always acknowledge the files/images sent before responding.

FORMATTING:
- Use markdown: code blocks with language tags, bold for key points, numbered/bullet lists.
- For complete files (HTML, CSS, JS, Python etc), always wrap in a proper fenced code block with the correct language tag.
- When writing HTML files, always write complete, self-contained files with all CSS included.

WEB BROWSING:
- When the user shares a URL, you have already fetched its content (provided below). Use it to answer questions about the page.
- Always summarize and analyze the fetched content directly. Never say you "can't access" a URL if content is provided.${urlContext ? `\n\nFETCHED WEB CONTENT:${urlContext}` : ""}`,
    messages: await convertToModelMessages(messages),
  });

  // Strip headers that reveal underlying technology
  const raw = result.toUIMessageStreamResponse();
  const clean = new Response(raw.body, {
    status: raw.status,
    headers: {
      "Content-Type": raw.headers.get("Content-Type") ?? "text/event-stream",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
  return clean;
}
