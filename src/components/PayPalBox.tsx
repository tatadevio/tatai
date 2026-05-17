"use client";

import { Component, ReactNode } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Error boundary to catch any PayPal SDK crash
class PayPalErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { crashed: boolean }
> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) return this.props.fallback;
    return this.props.children;
  }
}

interface Props {
  onSuccess: () => void;
}

export default function PayPalBox({ onSuccess }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  async function createOrder() {
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST" });
      const data = await res.json();
      return data.id as string;
    } catch {
      throw new Error("Could not create order");
    }
  }

  async function onApprove(data: { orderID: string }) {
    try {
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const result = await res.json();
      if (result.success) onSuccess();
    } catch {}
  }

  const fallback = (
    <a
      href="mailto:support@tatai.cloud"
      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
    >
      Contact us to upgrade →
    </a>
  );

  if (!clientId || clientId.length < 10) return fallback;

  return (
    <PayPalErrorBoundary fallback={fallback}>
      <PayPalScriptProvider options={{ clientId, currency: "USD", intent: "capture" }}>
        <PayPalButtons
          style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 44 }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={() => {}}
        />
      </PayPalScriptProvider>
    </PayPalErrorBoundary>
  );
}
