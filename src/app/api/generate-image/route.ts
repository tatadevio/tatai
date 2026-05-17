import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { prompt, size = "1024x1024" } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: "Prompt required" }, { status: 400 });

    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt.trim(),
      n: 1,
      size: size as "1024x1024" | "1536x1024" | "1024x1536",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "No image generated" }, { status: 500 });

    // Return as a data URL so the client can render it directly
    const dataUrl = `data:image/png;base64,${b64}`;
    return NextResponse.json({ url: dataUrl });
  } catch (e: any) {
    console.error("Image gen error:", e);
    const msg = e?.error?.message ?? e?.message ?? "Failed to generate image";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
