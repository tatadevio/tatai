import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tatAI — Your personal AI assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0d0d0d 0%, #1a1040 50%, #0d0d0d 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow background orb */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(107,78,255,0.25) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Logo circle */}
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 36,
            background: "linear-gradient(135deg, #6B4EFF, #B060FF)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 36,
            boxShadow: "0 0 60px rgba(107,78,255,0.5)",
          }}
        >
          {/* Infinity symbol */}
          <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
            <path
              d="M40 25C40 25 32 10 20 10C8 10 4 20 4 25C4 30 8 40 20 40C32 40 40 25 40 25ZM40 25C40 25 48 10 60 10C72 10 76 20 76 25C76 30 72 40 60 40C48 40 40 25 40 25Z"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-3px",
            marginBottom: 16,
            display: "flex",
          }}
        >
          tatAI
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.55)",
            fontWeight: 400,
            letterSpacing: "0.5px",
            display: "flex",
          }}
        >
          Your personal AI assistant
        </div>

        {/* URL badge */}
        <div
          style={{
            position: "absolute",
            bottom: 44,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 100,
            padding: "10px 24px",
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6B4EFF", display: "flex" }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 22, display: "flex" }}>
            www.tatai.cloud
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
