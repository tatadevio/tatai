import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const secret = process.env.ADMIN_SECRET;

  if (!secret || password !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    const { getAuth } = await import("firebase-admin/auth");
    initializeAdminApp();

    // List all Firebase users (paginate up to 1000)
    const result = await getAuth().listUsers(1000);
    const users = result.users.map((u) => ({
      uid: u.uid,
      email: u.email ?? "",
      name: u.displayName ?? "",
      provider: u.providerData?.[0]?.providerId ?? "unknown",
      createdAt: u.metadata.creationTime ?? "",
      lastLogin: u.metadata.lastSignInTime ?? "",
      disabled: u.disabled,
    }));

    // Supabase pro data (optional — only if configured)
    let proUids: string[] = [];
    let paymentData: { uid: string; orderId: string }[] = [];
    let platformMap: Record<string, string> = {};
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("your_")) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const db = createClient(supabaseUrl, supabaseKey);
        const { data } = await db.from("users").select("clerk_id, plan, paypal_order_id, platform");
        if (data) {
          proUids = data.filter((r) => r.plan === "pro").map((r) => r.clerk_id);
          paymentData = data
            .filter((r) => r.paypal_order_id)
            .map((r) => ({ uid: r.clerk_id, orderId: r.paypal_order_id }));
          platformMap = Object.fromEntries(data.map((r) => [r.clerk_id, r.platform ?? "web"]));
        }
      } catch { /* Supabase not set up */ }
    }

    const enriched = users.map((u) => ({
      ...u,
      plan: proUids.includes(u.uid) ? "pro" : "free",
      platform: platformMap[u.uid] ?? "web",
    }));

    return Response.json({
      users: enriched,
      proCount: proUids.length,
      payments: paymentData,
      total: users.length,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return Response.json({ error: "Failed to load data" }, { status: 500 });
  }
}
