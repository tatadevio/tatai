import { getUser, upsertUser } from "@/lib/db";

async function getFirebaseUid(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    return decoded.uid;
  } catch { return null; }
}

export async function GET(req: Request) {
  const uid = await getFirebaseUid(req);
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const user = await getUser(uid);
  return Response.json(user);
}

function detectPlatform(req: Request): "android" | "ios" | "web" {
  const ua = req.headers.get("user-agent") ?? "";
  if (/android/i.test(ua)) return "android";
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  return "web";
}

export async function POST(req: Request) {
  const uid = await getFirebaseUid(req);
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const { email, name } = await req.json();
  const platform = detectPlatform(req);
  await upsertUser(uid, email ?? "", name ?? "", platform);
  const user = await getUser(uid);
  return Response.json(user);
}
