import { initializeAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  try {
    initializeAdminApp();
    const db = getFirestore();
    const doc = await db.collection("qr_sessions").doc(token).get();

    if (!doc.exists) return Response.json({ status: "not_found" }, { status: 404 });

    const data = doc.data()!;
    if (data.expiresAt < Date.now()) return Response.json({ status: "expired" });

    return Response.json({
      status: data.status,
      customToken: data.status === "confirmed" ? data.customToken : undefined,
    });
  } catch (e) {
    console.error("qr/status error:", e);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
