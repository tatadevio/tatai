import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // Proxy all Firebase /__/ paths through tatai.cloud (auth handler + init files)
  async rewrites() {
    return [
      {
        source: "/__/:path*",
        destination: "https://tatai-d1fe3.firebaseapp.com/__/:path*",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Remove headers that reveal the tech stack
          { key: "X-Powered-By", value: "" },
          { key: "Server", value: "tatai" },
          // Security headers
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        // For API routes, remove all AI SDK / Vercel trace headers
        source: "/api/(.*)",
        headers: [
          { key: "X-Vercel-Ai-Ui-Message-Stream", value: "" },
          { key: "X-Matched-Path", value: "" },
          { key: "X-Vercel-Cache", value: "" },
          { key: "X-Vercel-Id", value: "" },
          { key: "X-Accel-Buffering", value: "" },
          { key: "Server", value: "tatai" },
        ],
      },
    ];
  },
};

export default nextConfig;
