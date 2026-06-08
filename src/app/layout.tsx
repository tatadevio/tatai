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
  "tatAI",
  "tatai.cloud",
  "AI assistant",
  "free AI chat",
  "ChatGPT alternative free",
  "best AI assistant 2026",
  "AI chatbot online",
  "AI writing assistant",
  "AI code assistant",
  "write code with AI",
  "AI for productivity",
  "GPT-4 alternative",
  "Claude alternative",
  "free AI tool no login",
  "AI brainstorming tool",
  "AI content generator",
  "smart AI assistant",
  "AI research assistant",
  "talk to AI online free",
  "AI chat no subscription",
  "artificial intelligence assistant",
  "tatadev",
  "tatadev LLC",
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

  verification: { google: "kZQUZ7qQecY0QW8lmwfN7K2cbPwMmajT0u_pPW5vjy4" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: APP_NAME,
      description: APP_DESC,
      publisher: { "@id": `${APP_URL}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${APP_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "tatadev LLC",
      url: APP_URL,
      logo: {
        "@type": "ImageObject",
        url: `${APP_URL}/icon-512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      "@type": "SoftwareApplication",
      name: APP_NAME,
      url: APP_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web, Android, iOS",
      description: APP_DESC,
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free plan" },
        { "@type": "Offer", price: "9.99", priceCurrency: "USD", name: "Pro plan" },
      ],
    },
  ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
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
