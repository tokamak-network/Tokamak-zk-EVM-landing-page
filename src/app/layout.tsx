import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";
import { PostHogProvider } from "@/components/Analytics";
import ChatWidget from "@/components/ChatWidget";
import { GlobalBlogProvider } from "@/components/BlogContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://zkp.tokamak.network"),
  title: {
    default: "Tokamak zk-EVM | Privacy-First Zero-Knowledge Ethereum",
    template: "%s | Tokamak zk-EVM",
  },
  description: "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine. Your data, your control. Build private, scalable dApps on Ethereum.",
  keywords: [
    "Tokamak",
    "zk-EVM",
    "Zero Knowledge",
    "Privacy",
    "Blockchain",
    "Ethereum",
    "Layer 2",
    "ZKP",
    "Private Transactions",
    "Web3",
    "Smart Contracts",
    "Tokamak Network",
  ],
  authors: [{ name: "Tokamak Network", url: "https://tokamak.network" }],
  creator: "Tokamak Network",
  publisher: "Tokamak Network",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // OpenGraph defaults
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tokamak zk-EVM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tokamak zk-EVM - Privacy-First Zero-Knowledge Ethereum",
      },
    ],
  },
  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    site: "@tokaborator",
    creator: "@tokaborator",
  },
  // Google Search Console verification (from env)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
  // Additional SEO
  category: "Technology",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showRefreshButton = process.env.NEXT_PUBLIC_BLOG_ENVIRONMENT === 'staging';

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head></head>
      <body
        className="bg-gradient-to-b from-[#0a1930] to-[#1a2347] text-white antialiased"
        style={{ fontFamily: '"IBM Plex Mono", monospace' }}
      >
        <Suspense fallback={null}>
          <PostHogProvider>
            <GlobalBlogProvider>
              <div className="min-h-screen">{children}</div>
              {showRefreshButton && <RefreshButton />}
              <ChatWidget />
            </GlobalBlogProvider>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
