import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "tatAI — Your Intelligent AI Assistant";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const iconPath = path.join(process.cwd(), "public", "icon-512.png");
  const icon = await readFile(iconPath);
  const iconBase64 = `data:image/png;base64,${icon.toString("base64")}`;

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
          background: "#0a0a0a",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradient blobs */}
        <div style={{
          position: "absolute", width: 800, height: 800, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)",
          top: "50%", left: "50%", transform: "translate(-50%, -50%)", display: "flex",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 65%)",
          top: "20%", right: "10%", display: "flex",
        }} />

        {/* Top badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 100,
          background: "rgba(37,99,235,0.12)",
          border: "1px solid rgba(37,99,235,0.25)",
          marginBottom: 36,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#22c55e", display: "flex",
          }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, fontWeight: 500 }}>
            by tatadev LLC
          </span>
        </div>

        {/* Logo + Name */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginBottom: 28 }}>
          <img src={iconBase64} width={100} height={100} style={{
            borderRadius: 24,
            boxShadow: "0 0 60px rgba(124,58,237,0.4), 0 20px 40px rgba(0,0,0,0.4)",
          }} />
          <span style={{
            fontSize: 96, fontWeight: 800, color: "white",
            letterSpacing: "-3px", lineHeight: 1, display: "flex",
          }}>
            tatAI
          </span>
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 30, color: "rgba(255,255,255,0.45)", fontWeight: 400,
          textAlign: "center", maxWidth: 640, lineHeight: 1.4, display: "flex",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          Your intelligent AI assistant — fast, smart, always ready
        </div>

        {/* Model chips */}
        <div style={{ display: "flex", gap: 14, marginTop: 52 }}>
          {[
            { emoji: "⚡", name: "Zara Flash", color: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", text: "rgba(245,158,11,0.9)" },
            { emoji: "✨", name: "Nova", color: "rgba(59,130,246,0.15)", border: "rgba(59,130,246,0.3)", text: "rgba(96,165,250,0.9)" },
            { emoji: "🧠", name: "Orion Pro", color: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)", text: "rgba(167,139,250,0.9)" },
          ].map((m) => (
            <div key={m.name} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 22px", borderRadius: 100,
              background: m.color, border: `1px solid ${m.border}`,
              color: m.text, fontSize: 20, fontWeight: 600,
            }}>
              {m.emoji} {m.name}
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{
          position: "absolute", bottom: 36,
          color: "rgba(255,255,255,0.2)", fontSize: 18,
          display: "flex", letterSpacing: "0.5px",
        }}>
          tatai.cloud
        </div>
      </div>
    ),
    { ...size }
  );
}
