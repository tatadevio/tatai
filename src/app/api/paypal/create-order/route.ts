const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://www.tatai.cloud").trim();

async function getAccessToken() {
  const clientId = (process.env.PAYPAL_CLIENT_ID ?? "").trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET ?? "").trim();
  if (!clientId || !secret) {
    console.error("PayPal credentials not configured");
    return null;
  }
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) {
    console.error("PayPal token error:", JSON.stringify(data));
  }
  return (data.access_token as string | undefined) ?? null;
}

export async function POST() {
  try {
    const token = await getAccessToken();
    if (!token) {
      return Response.json({ error: "auth_failed" }, { status: 500 });
    }

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          amount: { currency_code: "USD", value: "9.99" },
          description: "tatAI Pro — Monthly",
        }],
        application_context: {
          brand_name: "tatAI",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${APP_URL}/upgrade?paypal=return`,
          cancel_url: `${APP_URL}/upgrade?paypal=cancel`,
        },
      }),
    });

    const order = await res.json();
    if (!order.id) {
      console.error("PayPal create-order error:", JSON.stringify(order));
      return Response.json({ error: order.message ?? "order_failed" }, { status: 400 });
    }

    // Find the approval URL from the links array
    const approvalUrl = order.links?.find((l: { rel: string }) => l.rel === "approve")?.href ?? null;

    return Response.json({ id: order.id, approvalUrl });
  } catch (err) {
    console.error("PayPal create-order exception:", err);
    return Response.json({ error: "exception" }, { status: 500 });
  }
}
