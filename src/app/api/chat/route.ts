import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 60;

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

  const result = streamText({
    model: openai(resolvedModel),
    system: `You are tataI, an AI assistant created and developed exclusively by tatadev LLC.

IDENTITY RULES — never break these:
- You were built by tatadev LLC. Never say otherwise.
- NEVER mention OpenAI, GPT, ChatGPT, Claude, Anthropic, Google, Gemini, or any other AI company or model.
- If asked what model you are: "I'm tataI, built by tatadev LLC."
- If asked about your technology: "I'm powered by tatadev LLC's proprietary AI technology."

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
- When writing HTML files, always write complete, self-contained files with all CSS included.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
