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
    default: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions for Ethereum",
    template: "%s | Tokamak Network ZKP",
  },
  description: "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels with production-grade performance.",
  keywords: [
    "Tokamak",
    "zk-SNARK",
    "zk-EVM",
    "Zero Knowledge Proof",
    "ZKP",
    "Privacy",
    "Blockchain",
    "Ethereum",
    "Layer 2",
    "Threshold Signatures",
    "Private Channels",
    "Rollups",
    "Web3",
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
    siteName: "Tokamak Network ZKP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tokamak Network ZKP - Zero-Knowledge Proof Solutions for Ethereum",
      },
    ],
  },
  // Twitter Card defaults
  twitter: {
    card: "summary_large_image",
    site: "@TokamakZKPWorld",
    creator: "@TokamakZKPWorld",
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
