import { upgradeToPro } from "@/lib/db";

const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = (process.env.PAYPAL_CLIENT_ID ?? "").trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET ?? "").trim();
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });

  let uid: string;
  try {
    const { getAuth } = await import("firebase-admin/auth");
    const { initializeAdminApp } = await import("@/lib/firebase-admin");
    initializeAdminApp();
    const decoded = await getAuth().verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch { return new Response("Unauthorized", { status: 401 }); }

  const { orderID } = await req.json();
  const token = await getAccessToken();

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (data.status === "COMPLETED") {
    await upgradeToPro(uid, orderID);
    return Response.json({ success: true });
  }

  return Response.json({ success: false, error: data }, { status: 400 });
}
