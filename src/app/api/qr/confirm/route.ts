import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  // Verify Firebase ID token
  let uid: string;
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }

  // Create a Firebase custom token so the web client can sign in
  let customToken: string;
  try {
    const { getAuth } = await import("firebase-admin/auth");
    customToken = await getAuth().createCustomToken(uid);
  } catch (e) {
    console.error("createCustomToken error:", e);
    return Response.json({ error: "Could not create custom token" }, { status: 500 });
  }

  const db = getSupabaseAdmin();
  const { error } = await db
    .from("qr_sessions")
    .update({ status: "confirmed", custom_token: customToken, uid })
    .eq("token", token)
    .eq("status", "pending");

  if (error) {
    console.error("qr/confirm db error:", error);
    return Response.json({ error: "Session not found or expired" }, { status: 404 });
  }

  return Response.json({ success: true });
}
