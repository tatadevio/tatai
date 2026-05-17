import { auth } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

// Free limit for unauthenticated users (per session, enforced client-side)
// Pro users (authenticated) get unlimited messages
export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Try to get user, but don't block if Clerk isn't configured
  let userId: string | null = null;
  try {
    const authResult = await auth();
    userId = authResult.userId;
  } catch {
    // Clerk not configured - allow all requests
  }

  // If Clerk IS configured and user is not logged in, require auth
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !userId) {
    return Response.json({ error: "Please sign in to use tataI." }, { status: 401 });
  }

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are tataI, a powerful and friendly AI assistant. Be helpful, concise, and smart. You can help with coding, writing, analysis, research, math, and anything else the user needs. Format your responses with markdown when appropriate.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
