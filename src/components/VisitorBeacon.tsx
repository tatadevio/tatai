"use client";

import { useEffect, useRef } from "react";

function getSessionId(): string {
  let sid = localStorage.getItem("tatai_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("tatai_sid", sid);
  }
  return sid;
}

export function VisitorBeacon() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ping = () => {
      const sessionId = getSessionId();
      fetch("/api/analytics/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, path: window.location.pathname }),
      }).catch(() => {});
    };

    ping(); // ping immediately on load
    intervalRef.current = setInterval(ping, 30_000); // every 30s
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return null;
}
