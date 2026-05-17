import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "tataI — Your AI Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
        }} />

        {/* Logo */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: 28,
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
          boxShadow: "0 20px 60px rgba(37,99,235,0.4)",
        }}>
          <svg width="56" height="56" viewBox="0 0 32 32" fill="none">
            <path d="M8 10h16M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="22" cy="21" r="2.5" fill="white" opacity="0.9" />
          </svg>
        </div>

        {/* Title */}
        <div style={{
          fontSize: 72,
          fontWeight: 800,
          color: "white",
          letterSpacing: "-2px",
          marginBottom: 16,
          display: "flex",
        }}>
          tataI
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 28,
          color: "rgba(255,255,255,0.55)",
          fontWeight: 400,
          textAlign: "center",
          maxWidth: 600,
          display: "flex",
        }}>
          Your intelligent AI assistant — fast, smart, and always available
        </div>

        {/* Bottom badge */}
        <div style={{
          marginTop: 48,
          display: "flex",
          gap: 12,
        }}>
          {["⚡ Flash", "✨ Smart", "🧠 Think"].map((label) => (
            <div key={label} style={{
              padding: "8px 20px",
              borderRadius: 100,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)",
              fontSize: 18,
              display: "flex",
            }}>
              {label}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{
          position: "absolute",
          bottom: 36,
          color: "rgba(255,255,255,0.25)",
          fontSize: 18,
          display: "flex",
        }}>
          tatai.cloud
        </div>
      </div>
    ),
    { ...size }
  );
}
