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

function stripWhiteBg(el: HTMLElement) {
  const bg = el.style.backgroundColor || el.style.background;
  if (!bg) return;
  const isWhite = /^(white|#fff|#ffffff|rgb\(255,\s*255,\s*255\))$/i.test(bg.trim());
  if (isWhite) {
    el.style.setProperty("background", "transparent", "important");
    el.style.setProperty("background-color", "transparent", "important");
  }
}

function PayPalInner({ onSuccess }: Props) {
  const { user } = useAuth();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [payError, setPayError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [paypalFailed, setPaypalFailed] = useState(false);

  // MutationObserver — strip white backgrounds PayPal injects inline
  useEffect(() => {
    const patch = () => {
      wrapperRef.current?.querySelectorAll<HTMLElement>("*").forEach(stripWhiteBg);
    };
    patch();
    const observer = new MutationObserver(patch);
    if (wrapperRef.current) {
      observer.observe(wrapperRef.current, {
        childList: true, subtree: true,
        attributes: true, attributeFilter: ["style"],
      });
    }
    return () => observer.disconnect();
  }, []);

  async function createOrder() {
    setPayError("");
    setProcessing(true);
    try {
      const res = await fetch("/api/paypal/create-order", { method: "POST" });
      const data = await res.json();
      if (!data.id) {
        const msg = data.details?.[0]?.description ?? data.error ?? "Order creation failed";
        setPayError(msg);
        setPaypalFailed(true);
        throw new Error(msg);
      }
      return data.id as string;
    } catch (e) {
      setProcessing(false);
      throw e;
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
        setPayError("Payment capture failed — please contact support@tatai.cloud");
      }
    } catch {
      setPayError("Something went wrong — please contact support@tatai.cloud");
    } finally {
      setProcessing(false);
    }
  }

  if (paypalFailed) {
    return (
      <div className="space-y-3">
        <p className="text-red-400 text-xs text-center">PayPal isn&apos;t configured correctly. Use the option below:</p>
        <a
          href="mailto:support@tatai.cloud?subject=Pro Upgrade Request&body=Hi, I want to upgrade to tatAI Pro ($9.99/month). Please send me payment instructions."
          className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
        >
          ✉️ Email us to upgrade → support@tatai.cloud
        </a>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} style={{ background: "transparent" }}>
      {payError && (
        <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs text-center">{payError}</p>
        </div>
      )}
      {processing && (
        <p className="text-white/40 text-xs text-center mb-2">Processing…</p>
      )}
      <PayPalButtons
        style={{ layout: "vertical", color: "gold", shape: "pill", label: "pay", height: 48 }}
        createOrder={createOrder}
        onApprove={onApprove}
        onCancel={() => { setPayError(""); setProcessing(false); }}
        onError={() => {
          setPaypalFailed(true);
          setProcessing(false);
        }}
        forceReRender={[]}
      />
    </div>
  );
}

export default function PayPalBox({ onSuccess }: Props) {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  const fallback = (
    <a
      href="mailto:support@tatai.cloud?subject=Pro Upgrade Request&body=Hi, I want to upgrade to tatAI Pro ($9.99/month). Please send me payment instructions."
      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold text-center block hover:opacity-90 transition-opacity"
    >
      ✉️ Email us to upgrade → support@tatai.cloud
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
