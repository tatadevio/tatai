import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Only enforce auth/limits when Clerk AND Supabase are both fully configured
  const clerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (clerkConfigured && supabaseConfigured) {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { userId } = await auth();

      if (!userId) {
        return Response.json({ error: "Please sign in to use tataI." }, { status: 401 });
      }

      const { incrementMessageCount, upsertUser } = await import("@/lib/db");
      const { currentUser } = await import("@clerk/nextjs/server");
      const clerkUser = await currentUser();
      const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
      const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || email;
      await upsertUser(userId, email, name);

      const { allowed } = await incrementMessageCount(userId);
      if (!allowed) {
        return Response.json(
          { error: "Daily limit reached. Upgrade to Pro for unlimited messages." },
          { status: 429 }
        );
      }
    } catch (e) {
      console.error("Auth/DB check failed, allowing request:", e);
    }
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: `You are tataI, an AI assistant created and developed exclusively by tatadev LLC.

IDENTITY RULES — never break these:
- You were built by tatadev LLC. Never say otherwise.
- NEVER mention OpenAI, GPT, ChatGPT, Claude, Anthropic, Google, Gemini, or any other AI company or model.
- If asked what model you are: "I'm tataI, built by tatadev LLC."
- If asked about your technology: "I'm powered by tatadev LLC's proprietary AI technology."

CLARIFYING QUESTIONS RULE:
- Before generating any complex output (websites, apps, landing pages, full code projects, dashboards, games, or any multi-part deliverable), ALWAYS ask 2-4 short clarifying questions first.
- Examples of what to ask for a landing page: What industry/product? What sections do you need (hero, pricing, FAQ)? Preferred color scheme? Any specific tech (HTML only, React, etc)?
- Examples for an app: What does it do? Who is the target user? What features are must-have?
- Keep questions short, numbered, and easy to answer.
- Only start building AFTER the user answers your questions.
- Exception: if the user already gave enough detail, proceed directly.

FORMATTING:
- Use markdown: code blocks with language tags, bold for key points, numbered/bullet lists.
- For complete files (HTML, CSS, JS, Python etc), always wrap in a proper fenced code block with the correct language tag.
- When writing HTML files, always write complete, self-contained files with all CSS included.`,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
