"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.tatadev.tatai";
const DISMISSED_KEY = "tatai_app_banner_dismissed";

export function AndroidAppBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isAndroid = /android/i.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (isAndroid && !dismissed) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
      {/* App icon */}
      <div className="shrink-0 w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <Image
          src="/apple-touch-icon.png"
          alt="tatAI"
          width={40}
          height={40}
          className="rounded-xl"
        />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight truncate">
          tatAI
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-tight">
          Official app by tatadev
        </p>
      </div>

      {/* Download button */}
      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-4 py-1.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold"
      >
        Download
      </a>

      {/* Close */}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xl leading-none"
      >
        ×
      </button>
    </div>
  );
}
