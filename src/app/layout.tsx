import React from "react";
import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Jersey_10 } from "next/font/google";
import "./globals.css";
import RefreshButton from "@/components/RefreshButton";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const jersey10 = Jersey_10({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jersey-10",
});

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
        className={`${ibmPlexMono.variable} ${jersey10.variable} bg-gradient-to-b from-[#0a1930] to-[#1a2347] text-white antialiased`}
      >
        <div className="min-h-screen">{children}</div>
        {showRefreshButton && <RefreshButton />}
      </body>
    </html>
  );
}
