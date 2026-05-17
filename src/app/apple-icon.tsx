import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
        }}
      >
        <svg width="108" height="108" viewBox="0 0 32 32" fill="none">
          <path d="M8 10h16M16 10v12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="22" cy="21" r="2.5" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
