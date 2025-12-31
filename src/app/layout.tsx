import React, { Suspense } from "react";
import type { Metadata } from "next";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";
import { PostHogProvider } from "@/components/Analytics";
import ChatWidget from "@/components/ChatWidget";
import { GlobalBlogProvider } from "@/components/BlogContext";

export const metadata: Metadata = {
  title: "Own Your Privacy - Tokamak zk-EVM",
  description: "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine. Your data, your control.",
  keywords: ["Tokamak", "ZK-EVM", "Privacy", "Blockchain", "Ethereum"],
  authors: [{ name: "Tokamak Network" }],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  // Google Search Console verification (from env)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
  },
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
    <html lang="ko" className="scroll-smooth" suppressHydrationWarning>
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
