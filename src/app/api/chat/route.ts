import { auth, currentUser } from "@clerk/nextjs/server";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { incrementMessageCount, upsertUser } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // Ensure user exists in DB
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
  const name = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || email;
  await upsertUser(userId, email, name);

  const { allowed, remaining } = await incrementMessageCount(userId);
  if (!allowed) {
    return Response.json(
      { error: "Daily limit reached. Upgrade to Pro for unlimited messages." },
      { status: 429 }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are tataAI, a powerful and friendly AI assistant. Be helpful, concise, and smart. You can help with coding, writing, analysis, research, math, and anything else the user needs.",
    messages: await convertToModelMessages(messages),
  });

  const response = result.toUIMessageStreamResponse();
  response.headers.set("X-Messages-Remaining", String(remaining));
  return response;
}
