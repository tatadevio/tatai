import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const maxDuration = 30;

async function getUid(req: NextRequest): Promise<string | null> {
  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return null;
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const { getAuth } = await import("firebase-admin/auth");
    const decoded = await getAuth().verifyIdToken(token);
    return decoded.uid;
  } catch { return null; }
}

// POST — upload avatar (multipart), store as base64 in Redis
export async function POST(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("avatar") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  // Limit to 2 MB
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: "Image too large (max 2 MB)" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const b64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${b64}`;

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: "Storage not configured" }, { status: 503 });

  await redis.set(`avatar:${uid}`, dataUrl, { ex: 60 * 60 * 24 * 365 }); // 1 year

  const url = `/api/user/avatar?uid=${uid}`;
  return NextResponse.json({ url });
}

// GET — serve avatar by UID
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "Missing uid" }, { status: 400 });

  const redis = getRedis();
  if (!redis) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const dataUrl = await redis.get<string>(`avatar:${uid}`);
  if (!dataUrl) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Parse data URL and serve as image
  const match = (dataUrl as string).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return NextResponse.json({ error: "Invalid data" }, { status: 500 });

  const [, mimeType, b64] = match;
  const imgBuffer = Buffer.from(b64, "base64");

  return new NextResponse(imgBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
