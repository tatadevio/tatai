import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { WelcomeGate } from "@/components/WelcomeGate";
import { VisitorBeacon } from "@/components/VisitorBeacon";
import { AndroidAppBanner } from "@/components/AndroidAppBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const APP_URL = "https://www.tatai.cloud";
const APP_NAME = "tatAI";
const APP_TITLE = "tatAI — Your AI Assistant";
const APP_DESC =
  "tatAI is a powerful AI assistant built by tatadev LLC. Write code, research topics, draft content, and brainstorm ideas — all with one smart AI.";
const APP_KEYWORDS = [
  "AI assistant",
  "artificial intelligence",
  "chatbot",
  "AI chat",
  "ChatGPT alternative",
  "tatAI",
  "tatadev",
  "write code with AI",
  "AI for productivity",
  "smart AI",
  "AI brainstorm",
  "AI writing assistant",
  "free AI tool",
  "GPT alternative",
  "best AI assistant 2026",
].join(", ");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),

  title: {
    default: APP_TITLE,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESC,
  keywords: APP_KEYWORDS,
  authors: [{ name: "tatadev LLC", url: APP_URL }],
  creator: "tatadev LLC",
  publisher: "tatadev LLC",

  // Canonical + robots
  alternates: { canonical: APP_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  // Open Graph (Facebook, LinkedIn, WhatsApp previews)
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_TITLE,
    description: APP_DESC,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: APP_TITLE,
      },
    ],
    locale: "en_US",
  },

  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    site: "@tataicloud",
    creator: "@tataicloud",
    title: APP_TITLE,
    description: APP_DESC,
    images: ["/opengraph-image"],
  },

  // App metadata
  applicationName: APP_NAME,
  category: "technology",

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },

  manifest: "/manifest.webmanifest",

  // Verification (add your codes once you verify in Google Search Console etc.)
  // verification: { google: "YOUR_GOOGLE_SITE_VERIFICATION" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
      </head>
      <body className="h-full bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white transition-colors">
        <ThemeProvider>
          <AuthProvider>
            {children}
            <AndroidAppBanner />
            <AuthModal />
            <WelcomeGate />
            <VisitorBeacon />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
