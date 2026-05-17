import { getSupabaseAdmin } from "@/lib/supabase";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

export async function POST() {
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const db = getSupabaseAdmin();
  const { error } = await db.from("qr_sessions").insert({
    token,
    status: "pending",
    expires_at: expiresAt,
  });

  if (error) {
    console.error("qr/create error:", error);
    return Response.json({ error: "Failed to create QR session" }, { status: 500 });
  }

  return Response.json({ token });
}
