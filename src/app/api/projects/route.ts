import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";

const TTL = 60 * 60 * 24 * 90;

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

export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await getRedis().get(`projects:${uid}`);
  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, icon } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const redis = getRedis();
  const existing: any[] = (await redis.get(`projects:${uid}`)) ?? [];
  const project = { id: Date.now().toString(), name: name.trim(), icon: icon ?? "📁", createdAt: Date.now() };
  existing.push(project);
  await redis.set(`projects:${uid}`, existing, { ex: TTL });
  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, icon } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const redis = getRedis();
  const existing: any[] = (await redis.get(`projects:${uid}`)) ?? [];
  const updated = existing.map(p =>
    p.id === id ? { ...p, ...(name ? { name } : {}), ...(icon ? { icon } : {}) } : p
  );
  await redis.set(`projects:${uid}`, updated, { ex: TTL });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const redis = getRedis();
  const existing: any[] = (await redis.get(`projects:${uid}`)) ?? [];
  await redis.set(`projects:${uid}`, existing.filter(p => p.id !== id), { ex: TTL });
  return NextResponse.json({ ok: true });
}
