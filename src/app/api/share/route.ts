import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const { messages, title } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

    // Generate a short random ID
    const id = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

    await redis.set(`share:${id}`, JSON.stringify({ messages, title: title || "Shared Chat" }), { ex: 60 * 60 * 24 * 30 }); // 30 days

    return NextResponse.json({ id, url: `/share/${id}` });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

    const data = await redis.get(`share:${id}`);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(typeof data === "string" ? JSON.parse(data) : data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
