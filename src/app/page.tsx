import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhoSection from "@/components/WhoSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import VideoSection from "@/components/VideoSection";
import WhyDifferentSection from "@/components/WhyDifferentSection";
import Footer from "@/components/Footer";
import { SectionTracker } from "@/components/Analytics";

// Homepage-specific metadata
export const metadata: Metadata = {
  title: "Own Your Privacy | Tokamak zk-EVM",
  description:
    "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine. Your data, your control. Build private, scalable dApps on Ethereum with cutting-edge ZK technology.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Own Your Privacy | Tokamak zk-EVM",
    description:
      "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine. Your data, your control.",
    url: "/",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tokamak zk-EVM - Privacy-First Zero-Knowledge Ethereum",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Own Your Privacy | Tokamak zk-EVM",
    description:
      "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine.",
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
        "https://twitter.com/tokaborator",
        "https://discord.gg/tokamak",
        "https://github.com/tokamak-network",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://zkp.tokamak.network/#website",
      url: "https://zkp.tokamak.network",
      name: "Tokamak zk-EVM",
      description:
        "Privacy-First Zero-Knowledge Ethereum Virtual Machine by Tokamak Network",
      publisher: {
        "@id": "https://zkp.tokamak.network/#organization",
      },
    },
    {
      "@type": "WebPage",
      "@id": "https://zkp.tokamak.network/#webpage",
      url: "https://zkp.tokamak.network",
      name: "Own Your Privacy | Tokamak zk-EVM",
      description:
        "Experience true privacy with Tokamak Network's zero-knowledge Ethereum Virtual Machine. Your data, your control.",
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
      name: "Tokamak zk-EVM",
      applicationCategory: "BlockchainApplication",
      operatingSystem: "Ethereum",
      description:
        "Zero-knowledge Ethereum Virtual Machine for privacy-preserving smart contracts and transactions",
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
  "who-section", // Who This Is For
  "two-ways-section", // Three Ways Section
  "video-section", // Video Section
  "why-different-section", // Why Different Section
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
          <WhoSection />
          <ThreeWaysSection />
          <VideoSection />
          <WhyDifferentSection />
        </main>
        <Footer />
      </div>
    </>
  );
}