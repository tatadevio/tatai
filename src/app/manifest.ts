import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tatAI — Your AI Assistant",
    short_name: "tatAI",
    description: "tatAI is a powerful AI assistant built by tatadev LLC. Chat, code, research, and brainstorm with AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#7C3AED",
    orientation: "portrait",
    icons: [
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
    ],
    categories: ["productivity", "utilities"],
  };
}
