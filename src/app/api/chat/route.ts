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
    system:
      "You are tataI, a powerful and friendly AI assistant. Be helpful, concise, and smart. You can help with coding, writing, analysis, research, math, and anything else the user needs. Format your responses with markdown when appropriate — use code blocks for code, bold for emphasis, and lists where helpful.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
