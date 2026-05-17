"use client";

import { useState } from "react";

interface Props {
  onSuccess: () => void;
}

export default function PayPalBox({ onSuccess }: Props) {
  const [error, setError] = useState("");
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  async function createOrder() {
    const res = await fetch("/api/paypal/create-order", { method: "POST" });
    const data = await res.json();
    return data.id;
  }

  async function onApprove(data: { orderID: string }) {
    const res = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID: data.orderID }),
    });
    const result = await res.json();
    if (result.success) {
      onSuccess();
    } else {
      setError("Payment failed. Please try again.");
    }
  }

  if (!clientId || clientId === "your_paypal_client_id" || clientId.length < 10) {
    return (
      <a
        href="mailto:support@tatai.cloud"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
      >
        Contact us to upgrade →
      </a>
    );
  }

  // Lazy import PayPal only when we know we have a valid client ID
  const PayPalContent = () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PayPalScriptProvider, PayPalButtons } = require("@paypal/react-paypal-js");
    return (
      <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
        {error && (
          <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 44 }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={() => setError("Payment error. Please try again.")}
        />
      </PayPalScriptProvider>
    );
  };

  return <PayPalContent />;
}
