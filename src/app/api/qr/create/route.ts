import { randomBytes } from "crypto";
import { initializeAdminApp } from "@/lib/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST() {
  const token = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 5 * 60 * 1000;

  try {
    initializeAdminApp();
    const db = getFirestore();
    await db.collection("qr_sessions").doc(token).set({
      status: "pending",
      expiresAt,
      createdAt: Date.now(),
    });
    return Response.json({ token });
  } catch (e) {
    console.error("qr/create error:", e);
    return Response.json({ error: "Failed to create QR session" }, { status: 500 });
  }
}
