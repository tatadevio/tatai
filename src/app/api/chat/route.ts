import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, UIMessage } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are tataAI, a powerful and friendly AI assistant. Be helpful, concise, and smart. You can help with coding, writing, analysis, research, math, and anything else the user needs.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
