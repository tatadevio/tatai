import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return Response.json({ error: "Missing token" }, { status: 400 });

  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("qr_sessions")
    .select("status, custom_token, expires_at")
    .eq("token", token)
    .single();

  if (error || !data) return Response.json({ status: "not_found" }, { status: 404 });

  if (new Date(data.expires_at) < new Date()) {
    return Response.json({ status: "expired" });
  }

  return Response.json({
    status: data.status,
    customToken: data.status === "confirmed" ? data.custom_token : undefined,
  });
}
