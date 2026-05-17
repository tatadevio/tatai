"use client";

import { Component, ReactNode, useEffect, useRef, useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "@/context/AuthContext";

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

function PayPalInner({ onSuccess }: Props) {
  const { user } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [payError, setPayError] = useState("");
  const [processing, setProcessing] = useState(false);

  // Strip white backgrounds PayPal injects via inline styles
  useEffect(() => {
    function patchBg() {
      if (!wrapperRef.current) return;
      wrapperRef.current.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const bg = el.style.background || el.style.backgroundColor;
        if (bg && (bg.includes("white") || bg.includes("#fff") || bg.includes("rgb(255, 255, 255)"))) {
          el.style.background = "transparent";
          el.style.backgroundColor = "transparent";
        }
      });
    }
    const id = setInterval(patchBg, 150);
    return () => clearInterval(id);
  }, []);

  async function createOrder() {
    setPayError("");
    setProcessing(true);
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST" });
      const data = await res.json();
      if (!data.id) throw new Error("Order creation failed");
      return data.id as string;
    } catch {
      setPayError("Could not start payment. Please try again.");
      throw new Error("order failed");
    } finally {
      setProcessing(false);
    }
  }

  async function onApprove(data: { orderID: string }) {
    setProcessing(true);
    setPayError("");
    try {
      let authHeader = "";
      if (user) {
        const token = await user.getIdToken();
        authHeader = `Bearer ${token}`;
      }
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(authHeader ? { Authorization: authHeader } : {}) },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const result = await res.json();
      if (result.success) {
        onSuccess();
      } else {
        setPayError("Payment capture failed. Contact support@tatai.cloud");
      }
    } catch {
      setPayError("Something went wrong. Contact support@tatai.cloud");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div ref={wrapperRef} style={{ background: "transparent" }}>
      {payError && (
        <p className="text-red-400 text-xs text-center mb-2">{payError}</p>
      )}
      {processing && (
        <p className="text-white/40 text-xs text-center mb-2">Processing…</p>
      )}
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={() => setPayError("")}
        onError={() => setPayError("PayPal returned an error. Please try again or use a different payment method.")}
        forceReRender={[]}
      />
    </div>
  );
}

export default function PayPalBox({ onSuccess }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

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
        <PayPalInner onSuccess={onSuccess} />
      </PayPalScriptProvider>
    </PayPalErrorBoundary>
  );
}
