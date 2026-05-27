import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { password, uid } = await req.json();
  const secret = process.env.ADMIN_SECRET;

  if (!secret || password !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!uid) return new Response("Missing uid", { status: 400 });

  try {
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    const { getAuth } = await import("firebase-admin/auth");
    initializeAdminApp();
    await getAuth().deleteUser(uid);

    // Also remove from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your_")) {
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(supabaseUrl, supabaseKey);
      await db.from("users").delete().eq("clerk_id", uid);
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("delete-user error:", err);
    return Response.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
