const PAYPAL_BASE = process.env.PAYPAL_MODE === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;
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

export async function POST() {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.error("PayPal: failed to get access token — check PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET and PAYPAL_MODE");
      return Response.json({ error: "auth_failed" }, { status: 500 });
    }

    const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ amount: { currency_code: "USD", value: "9.99" }, description: "tatAI Pro — Monthly" }],
      }),
    });

    const order = await res.json();
    if (!order.id) {
      console.error("PayPal create-order error:", JSON.stringify(order));
      return Response.json({ error: order.message ?? "order_failed", details: order }, { status: 400 });
    }

    return Response.json({ id: order.id });
  } catch (err) {
    console.error("PayPal create-order exception:", err);
    return Response.json({ error: "exception" }, { status: 500 });
  }
}
