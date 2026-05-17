import { initializeAdminApp } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  try {
    initializeAdminApp();
    const auth = getAuth();
    const db = getFirestore();

    // Verify mobile user's Firebase ID token
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    const uid = decoded.uid;

    // Check session exists and is still pending
    const docRef = db.collection("qr_sessions").doc(token);
    const doc = await docRef.get();
    if (!doc.exists) return Response.json({ error: "Session not found" }, { status: 404 });

    const data = doc.data()!;
    if (data.expiresAt < Date.now()) return Response.json({ error: "QR expired" }, { status: 410 });
    if (data.status !== "pending") return Response.json({ error: "Already used" }, { status: 409 });

    // Create a Firebase custom token so the web client can sign in as this user
    const customToken = await auth.createCustomToken(uid);

    await docRef.update({ status: "confirmed", customToken, uid });

    return Response.json({ success: true });
  } catch (e: any) {
    console.error("qr/confirm error:", e);
    return Response.json({ error: e.message ?? "Server error" }, { status: 500 });
  }
}
