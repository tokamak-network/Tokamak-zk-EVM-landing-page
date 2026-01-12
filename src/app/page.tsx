import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SolutionsSection from "@/components/SolutionsSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import Footer from "@/components/Footer";
import { SectionTracker } from "@/components/Analytics";

// Homepage-specific metadata
export const metadata: Metadata = {
  title: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions",
  description:
    "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels with production-grade performance.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions",
    description:
      "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tokamak Network ZKP - Zero-Knowledge Proof Solutions for Ethereum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions",
    description:
      "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private channels.",
    images: ["/og-image.png"],
  },
};

// JSON-LD Structured Data for Homepage
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://zkp.tokamak.network/#organization",
      name: "Tokamak Network",
      url: "https://tokamak.network",
      logo: {
        "@type": "ImageObject",
        url: "https://zkp.tokamak.network/assets/header/logo.svg",
      },
      sameAs: [
        "https://twitter.com/TokamakZKPWorld",
        "https://t.me/+9My2ZmBemYs2YTFk",
        "https://github.com/tokamak-network",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://zkp.tokamak.network/#website",
      url: "https://zkp.tokamak.network",
      name: "Tokamak Network ZKP",
      description:
        "High-throughput zero-knowledge proof solutions for Ethereum by Tokamak Network",
      publisher: {
        "@id": "https://zkp.tokamak.network/#organization",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://zkp.tokamak.network/#webpage",
      url: "https://zkp.tokamak.network",
      name: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions",
      description:
        "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels.",
      isPartOf: {
        "@id": "https://zkp.tokamak.network/#website",
      },
      about: {
        "@id": "https://zkp.tokamak.network/#organization",
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: "https://zkp.tokamak.network/og-image.png",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Tokamak ZKP",
      applicationCategory: "BlockchainApplication",
      operatingSystem: "Ethereum",
      description:
        "Zero-knowledge proof solutions for Ethereum including zk-EVM rollups, threshold signatures, and private application channels",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

// Section IDs to track for analytics
const TRACKED_SECTIONS = [
  "overview", // Hero section
  "solutions-section", // Solutions Section
  "two-ways-section", // How to Use Section
];

export default function Home() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen">
        <Navbar />

        {/* Analytics: Track section views */}
        <SectionTracker sections={TRACKED_SECTIONS} />

        <main>
          <Hero />
          <SolutionsSection />
          <ThreeWaysSection />
        </main>
        <Footer />
      </div>
    </>
  );
}