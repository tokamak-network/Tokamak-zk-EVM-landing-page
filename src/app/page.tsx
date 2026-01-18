import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SolutionsSection from "@/components/SolutionsSection";
import ThreeWaysSection from "@/components/ThreeWaysSection";
import Footer from "@/components/Footer";
import { SectionTracker } from "@/components/Analytics";
import { SOLUTIONS } from "@/lib/solutions-content";

const BASE_URL = "https://zkp.tokamak.network";

// Homepage metadata - inherits most defaults from layout.tsx
// Only specifies what's unique to the homepage
export const metadata: Metadata = {
  // Use default title from layout (no override needed for homepage)
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    url: BASE_URL,
    // Other OG properties inherited from layout
  },
};

// JSON-LD Structured Data for Homepage - Comprehensive SEO Schema
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    // Organization Schema - Core identity
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Tokamak Network",
      url: "https://tokamak.network",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/assets/header/logo.svg`,
        width: 200,
        height: 60,
      },
      description: "Leading provider of zero-knowledge proof solutions for Ethereum blockchain scalability and privacy.",
      foundingDate: "2018",
      sameAs: [
        "https://twitter.com/TokamakZKPWorld",
        "https://twitter.com/tokaboratory",
        "https://t.me/tokamak_network",
        "https://github.com/tokamak-network",
        "https://medium.com/tokamak-network",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "technical support",
        url: `${BASE_URL}/#contact`,
      },
    },
    // WebSite Schema - Site-wide information
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "Tokamak Network ZKP",
      description: "High-throughput zero-knowledge proof solutions for Ethereum by Tokamak Network",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      inLanguage: "en-US",
      potentialAction: [
        {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        {
          "@type": "SiteNavigationElement",
          "@id": `${BASE_URL}/#sitenav`,
          name: "Main Navigation",
          url: BASE_URL,
        },
      ],
    },
    // SiteNavigationElement - Helps Google generate sitelinks
    // This schema helps Google understand the site structure for sitelink generation
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/#sitenav`,
      name: "Tokamak Network Solutions",
      description: "Zero-knowledge proof solutions for Ethereum",
      itemListElement: SOLUTIONS.map((solution, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "WebPage",
          "@id": `${BASE_URL}/solutions/${solution.slug}`,
          url: `${BASE_URL}/solutions/${solution.slug}`,
          name: solution.pageTitle,
          description: solution.description,
        },
      })),
    },
    // WebPage Schema - Homepage specific
    {
      "@type": "WebPage",
      "@id": `${BASE_URL}/#webpage`,
      url: BASE_URL,
      name: "Tokamak Network ZKP | Zero-Knowledge Proof Solutions for Ethereum",
      description: "High-throughput zero-knowledge proof solutions for Ethereum. Powering zk-EVM rollups, threshold signatures, and private application channels with production-grade performance.",
      isPartOf: {
        "@id": `${BASE_URL}/#website`,
      },
      about: {
        "@id": `${BASE_URL}/#organization`,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      inLanguage: "en-US",
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: ["h1", ".hero-description"],
      },
    },
    // BreadcrumbList - Navigation structure
    {
      "@type": "BreadcrumbList",
      "@id": `${BASE_URL}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BASE_URL,
        },
      ],
    },
    // SoftwareApplication Schema - Product information
    {
      "@type": "SoftwareApplication",
      "@id": `${BASE_URL}/#software`,
      name: "Tokamak ZKP",
      applicationCategory: "BlockchainApplication",
      applicationSubCategory: "Zero-Knowledge Proof Platform",
      operatingSystem: "Ethereum Virtual Machine",
      description: "Zero-knowledge proof solutions for Ethereum including zk-EVM rollups, threshold signatures, and private application channels. Build scalable, private decentralized applications.",
      featureList: [
        "zk-EVM Rollups",
        "Threshold Signatures",
        "Private Application Channels",
        "High-throughput Proof Generation",
        "EVM Compatibility",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      provider: {
        "@id": `${BASE_URL}/#organization`,
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "50",
        bestRating: "5",
        worstRating: "1",
      },
    },
    // Service Schema - What Tokamak offers
    {
      "@type": "Service",
      "@id": `${BASE_URL}/#service`,
      name: "Zero-Knowledge Proof Solutions",
      description: "Enterprise-grade zero-knowledge proof infrastructure for Ethereum scalability and privacy",
      provider: {
        "@id": `${BASE_URL}/#organization`,
      },
      serviceType: "Blockchain Infrastructure",
      areaServed: "Worldwide",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "ZKP Solutions",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "zk-EVM Rollups",
              description: "Scalable Ethereum Layer 2 solution with zero-knowledge proofs",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Threshold Signatures",
              description: "Distributed key generation and threshold signing for enhanced security",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Private Channels",
              description: "Privacy-preserving application channels for confidential transactions",
            },
          },
        ],
      },
    },
    // Dataset Schema - For LLM SEO and knowledge discovery
    {
      "@type": "Dataset",
      "@id": `${BASE_URL}/#dataset`,
      name: "Tokamak Network ZKP Knowledge Base",
      description: "Comprehensive dataset about Tokamak Network zero-knowledge proof solutions, technical documentation, blog articles, and FAQs",
      url: `${BASE_URL}/api/knowledge`,
      keywords: [
        "Tokamak Network",
        "zero-knowledge proofs",
        "zk-SNARK",
        "zk-EVM",
        "Ethereum",
        "blockchain",
        "privacy",
        "Layer 2",
        "rollups",
        "threshold signatures",
        "private channels",
        "cryptography",
        "Web3",
      ],
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      inLanguage: "en-US",
      distribution: {
        "@type": "DataDownload",
        contentUrl: `${BASE_URL}/api/knowledge`,
        encodingFormat: "application/json",
      },
      includedInDataCatalog: {
        "@type": "DataCatalog",
        name: "Tokamak Network Documentation",
        url: BASE_URL,
      },
    },
    // Knowledge Graph - Comprehensive entity relationships
    {
      "@type": "ItemList",
      "@id": `${BASE_URL}/#knowledge-graph`,
      name: "Tokamak Network Knowledge Graph",
      description: "Structured knowledge about Tokamak Network products, services, and content",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          item: {
            "@type": "Product",
            name: "Tokamak zk-EVM",
            description: "Ethereum compatible zero knowledge rollup with low proving overhead",
            url: `${BASE_URL}/solutions/zk-evm`,
            category: "Blockchain Infrastructure",
          },
        },
        {
          "@type": "ListItem",
          position: 2,
          item: {
            "@type": "Product",
            name: "Tokamak Private App Channels",
            description: "Autonomous, private, and independent Layer 2 channels with zero-knowledge proofs",
            url: `${BASE_URL}/solutions/private-channels`,
            category: "Privacy Solutions",
          },
        },
        {
          "@type": "ListItem",
          position: 3,
          item: {
            "@type": "Product",
            name: "Threshold Signature App",
            description: "Minimal signer interaction with threshold authorization for shared key control",
            url: `${BASE_URL}/solutions/threshold-signature`,
            category: "Security Solutions",
          },
        },
        {
          "@type": "ListItem",
          position: 4,
          item: {
            "@type": "Product",
            name: "Tokamak zk-SNARK",
            description: "Modular zk-SNARK circuits like FPGA with pre-verified building blocks",
            url: `${BASE_URL}/solutions/zk-snark`,
            category: "Cryptographic Tools",
          },
        },
      ],
    },
    // FAQPage Schema - Link to FAQ section
    {
      "@type": "FAQPage",
      "@id": `${BASE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Tokamak zk-SNARK?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Tokamak zk-SNARK is our custom proving system optimized for Ethereum workloads. It features GPU-accelerated proof generation, gas-efficient on-chain verification, and is designed specifically for zk-rollup production environments.",
          },
        },
        {
          "@type": "Question",
          name: "How does the zk-EVM work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Our zk-EVM runs a fully EVM-compatible virtual machine and proves every state transition using Tokamak's zk-SNARK. Deploy existing Solidity contracts without modification while inheriting Ethereum's security guarantees.",
          },
        },
        {
          "@type": "Question",
          name: "What are Private App Channels?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Private App Channels create isolated execution lanes on top of Tokamak zk-EVM. Transactions and balances remain private while Ethereum only sees state roots and zero-knowledge proofs. Perfect for sensitive applications requiring privacy.",
          },
        },
      ],
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