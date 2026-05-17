import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

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

export async function DELETE(req: NextRequest) {
  const uid = await getUid(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const redis = getRedis();

    if (redis) {
      // Delete all conversations
      const convIds = await redis.smembers(`conv-index:${uid}`);
      const pipeline = redis.pipeline();
      convIds.forEach((id: string) => {
        pipeline.del(`conv:${uid}:${id}`);
        pipeline.del(`conv-meta:${uid}:${id}`);
      });
      pipeline.del(`conv-index:${uid}`);
      // Delete avatar
      pipeline.del(`avatar:${uid}`);
      await pipeline.exec();
    }

    // Delete Firebase Auth account
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const { getAuth } = await import("firebase-admin/auth");
    await getAuth().deleteUser(uid);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
