import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tonigma",
  description:
    "A privacy channel platform for Ethereum apps: run locally, create proofs, and verify on Ethereum.",
  icons: {
    icon: "/brand/tonigma-square-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
