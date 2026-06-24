import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tonigma",
  description:
    "Validity-proven app channels with public proof boundaries, observable policy, and Ethereum-settled verification.",
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
