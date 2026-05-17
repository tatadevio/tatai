import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const TTL = 60 * 60 * 24 * 30; // 30 days

function getRedis() {
  return new Redis({
    url: (process.env.UPSTASH_REDIS_REST_URL ?? "").trim(),
    token: (process.env.UPSTASH_REDIS_REST_TOKEN ?? "").trim(),
  });
}

async function getUserId(req: NextRequest): Promise<string | null> {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

// GET — list all sessions, or load a specific one (?id=xxx)
export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const data = await getRedis().get(`conv:${uid}:${id}`);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  }

  // List all session metadata
  const keys = await getRedis().smembers(`conv-index:${uid}`);
  if (!keys.length) return NextResponse.json([]);

  const pipeline = getRedis().pipeline();
  keys.forEach(k => pipeline.get(`conv-meta:${uid}:${k}`));
  const results = await pipeline.exec();

  const sessions = results
    .map((r, i) => r ? { ...(r as object), id: keys[i] } : null)
    .filter(Boolean)
    .sort((a: any, b: any) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  return NextResponse.json(sessions);
}

// POST — save/update a conversation
export async function POST(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, messages, pinned } = await req.json();
  if (!id || !messages) return NextResponse.json({ error: "id and messages required" }, { status: 400 });

  const now = Date.now();

  // Save full messages
  await getRedis().set(`conv:${uid}:${id}`, { id, title, messages, pinned, updatedAt: now }, { ex: TTL });

  // Save meta (for listing)
  await getRedis().set(`conv-meta:${uid}:${id}`, { title, pinned, updatedAt: now, messageCount: messages.length }, { ex: TTL });

  // Add to index
  await getRedis().sadd(`conv-index:${uid}`, id);
  await getRedis().expire(`conv-index:${uid}`, TTL);

  return NextResponse.json({ ok: true });
}

// DELETE — remove a conversation
export async function DELETE(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await getRedis().del(`conv:${uid}:${id}`);
  await getRedis().del(`conv-meta:${uid}:${id}`);
  await getRedis().srem(`conv-index:${uid}`, id);

  return NextResponse.json({ ok: true });
}
