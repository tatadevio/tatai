"use client";

import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useAuth } from "@/context/AuthContext";
import { X } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

function ModalContent({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const [{ isPending }] = usePayPalScriptReducer();
  const { user } = useAuth();
  const [error, setError] = useState("");

  async function createOrder() {
    setError("");
    const res = await fetch("/api/paypal/create-order", { method: "POST" });
    const data = await res.json();
    if (!data.id) throw new Error(data.error ?? "order_failed");
    return data.id as string;
  }

  async function onApprove(data: { orderID: string }) {
    try {
      const idToken = await user!.getIdToken();
      const res = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ orderID: data.orderID }),
      });
      const result = await res.json();
      if (result.success) { onClose(); onSuccess(); }
      else setError("Payment failed. Please try again.");
    } catch {
      setError("Payment failed. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.07]">
          <div>
            <p className="text-white font-semibold text-sm">Upgrade to Pro</p>
            <p className="text-white/40 text-xs mt-0.5">$9.99 / month · Cancel anytime</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors p-1 -mr-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {error && (
            <p className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 mb-4">
              {error}
            </p>
          )}

          {isPending && (
            <div className="space-y-2 mb-2">
              <div className="w-full h-11 rounded-xl bg-white/[0.06] animate-pulse" />
              <div className="w-full h-11 rounded-xl bg-white/[0.06] animate-pulse" />
            </div>
          )}

          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal", height: 45 }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={() => setError("Payment failed. Please try again.")}
            onCancel={onClose}
          />

          <p className="text-white/20 text-[11px] text-center mt-3">
            Secured by PayPal · No account required for card payments
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PayPalBox({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90 active:scale-[0.98]"
        style={{ background: "#FFC439", color: "#111" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.947.901C5.013.505 5.359.221 5.757.221h7.882c2.645 0 4.564.553 5.7 1.644 1.094 1.051 1.46 2.595 1.089 4.584-.016.085-.031.17-.049.256-.77 3.962-3.41 5.327-6.782 5.327H11.44a.79.79 0 0 0-.78.668l-.834 5.286-.143.906a.389.389 0 0 1-.385.33l-.222.115Z" fill="#003087"/>
          <path d="M20.14 7.27c-.056.353-.12.712-.196 1.079-1.008 5.18-4.451 6.97-8.847 6.97H8.94a1.09 1.09 0 0 0-1.077.922L6.5 22.87a.573.573 0 0 0 .565.659h3.967a.956.956 0 0 0 .944-.807l.039-.203.748-4.742.048-.26a.956.956 0 0 1 .944-.808h.595c3.853 0 6.869-1.565 7.749-6.093.369-1.894.178-3.474-.719-4.585a3.806 3.806 0 0 0-1.24-.76Z" fill="#0070E0"/>
          <path d="M19.198 6.9a7.85 7.85 0 0 0-.97-.215 12.33 12.33 0 0 0-1.961-.143h-5.95a.958.958 0 0 0-.944.808L8.13 14.8l-.044.28a1.09 1.09 0 0 1 1.077-.922h2.246c4.395 0 7.839-1.79 8.847-6.97.03-.148.057-.296.08-.443a5.26 5.26 0 0 0-.806-.294 7.87 7.87 0 0 0-.332-.55Z" fill="#001C64"/>
        </svg>
        Pay with PayPal or Card
      </button>

      {open && (
        <PayPalScriptProvider options={{ clientId, currency: "USD", intent: "capture" }}>
          <ModalContent onSuccess={onSuccess} onClose={() => setOpen(false)} />
        </PayPalScriptProvider>
      )}
    </>
  );
}
