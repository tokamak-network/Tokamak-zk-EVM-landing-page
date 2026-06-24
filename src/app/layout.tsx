import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tonigma",
  description:
    "Proof-backed application channels with explicit public boundaries and channel-local private state.",
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
