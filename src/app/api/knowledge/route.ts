import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";
import { SOLUTIONS } from "@/lib/solutions-content";

const BASE_URL = "https://zkp.tokamak.network";

/**
 * Knowledge API Endpoint for LLM SEO
 * 
 * This endpoint provides a structured JSON representation of all Tokamak Network
 * content (blogs, solutions, FAQs) in a format optimized for AI assistants
 * like ChatGPT, Claude, and other LLMs to discover and understand our content.
 * 
 * Accessible at: /api/knowledge
 */
export async function GET() {
  try {
    // Fetch all blog posts
    const blogPosts = await getBlogPosts();

    // Structure the knowledge base
    const knowledgeBase = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "Tokamak Network ZKP Knowledge Base",
      description: "Comprehensive knowledge base about Tokamak Network zero-knowledge proof solutions, including blog posts, technical solutions, and FAQs.",
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
      ],
      publisher: {
        "@type": "Organization",
        name: "Tokamak Network",
        url: "https://tokamak.network",
      },
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split("T")[0],
      // Organization information
      organization: {
        name: "Tokamak Network",
        description: "Leading provider of zero-knowledge proof solutions for Ethereum blockchain scalability and privacy.",
        url: "https://tokamak.network",
        foundingDate: "2018",
        socialMedia: {
          twitter: ["https://twitter.com/TokamakZKPWorld", "https://twitter.com/tokaboratory"],
          telegram: "https://t.me/tokamak_network",
          github: "https://github.com/tokamak-network",
          medium: "https://medium.com/tokamak-network",
        },
      },
      // Blog posts
      blogPosts: blogPosts.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        description: post.description,
        url: `${BASE_URL}/blog/${post.slug}`,
        publishDate: post.publishDate,
        author: post.author || "Tokamak Network",
        tags: post.tags,
        keywords: [
          ...post.tags,
          "Tokamak Network",
          "zero-knowledge proofs",
          "zk-EVM",
          "blockchain",
          "Ethereum",
        ],
      })),
      // Solutions
      solutions: SOLUTIONS.map((solution) => ({
        slug: solution.slug,
        title: solution.pageTitle,
        tagline: solution.tagline,
        description: solution.description,
        url: `${BASE_URL}/solutions/${solution.slug}`,
        status: solution.status,
        features: solution.page.sections.flatMap((s) => s.bullets || []),
        sections: solution.page.sections.map((section) => ({
          title: section.title,
          body: section.body,
          bullets: section.bullets || [],
        })),
        keywords: [
          solution.pageTitle,
          solution.tagline,
          "Tokamak Network",
          "zero-knowledge proofs",
          "zk-SNARK",
          "zk-EVM",
          "Ethereum",
          "blockchain",
          "privacy",
        ],
      })),
      // FAQs
      faqs: [
        {
          question: "What is Tokamak zk-SNARK?",
          answer: "Tokamak zk-SNARK is our custom proving system optimized for Ethereum workloads. It features GPU-accelerated proof generation, gas-efficient on-chain verification, and is designed specifically for zk-rollup production environments.",
        },
        {
          question: "How does the zk-EVM work?",
          answer: "Our zk-EVM runs a fully EVM-compatible virtual machine and proves every state transition using Tokamak's zk-SNARK. Deploy existing Solidity contracts without modification while inheriting Ethereum's security guarantees.",
        },
        {
          question: "What are Private App Channels?",
          answer: "Private App Channels create isolated execution lanes on top of Tokamak zk-EVM. Transactions and balances remain private while Ethereum only sees state roots and zero-knowledge proofs. Perfect for sensitive applications requiring privacy.",
        },
      ],
      // Key topics and concepts
      topics: {
        "zk-SNARK": {
          description: "Zero-Knowledge Succinct Non-Interactive Argument of Knowledge - a cryptographic proof system",
          relatedSolutions: ["zk-snark"],
          relatedBlogPosts: blogPosts.filter((post) =>
            post.tags.some((tag) => tag.toLowerCase().includes("snark") || tag.toLowerCase().includes("zk"))
          ).map((post) => ({
            title: post.title,
            url: `${BASE_URL}/blog/${post.slug}`,
          })),
        },
        "zk-EVM": {
          description: "Zero-Knowledge Ethereum Virtual Machine - enables EVM-compatible zero-knowledge proofs",
          relatedSolutions: ["zk-evm"],
          relatedBlogPosts: blogPosts.filter((post) =>
            post.tags.some((tag) => tag.toLowerCase().includes("evm") || tag.toLowerCase().includes("zk"))
          ).map((post) => ({
            title: post.title,
            url: `${BASE_URL}/blog/${post.slug}`,
          })),
        },
        "Private Channels": {
          description: "Private application channels for confidential transactions on Ethereum",
          relatedSolutions: ["private-channels"],
          relatedBlogPosts: blogPosts.filter((post) =>
            post.tags.some((tag) => tag.toLowerCase().includes("private") || tag.toLowerCase().includes("channel"))
          ).map((post) => ({
            title: post.title,
            url: `${BASE_URL}/blog/${post.slug}`,
          })),
        },
        "Threshold Signatures": {
          description: "Distributed key generation and threshold signing for enhanced security",
          relatedSolutions: ["threshold-signature"],
          relatedBlogPosts: blogPosts.filter((post) =>
            post.tags.some((tag) => tag.toLowerCase().includes("threshold") || tag.toLowerCase().includes("signature"))
          ).map((post) => ({
            title: post.title,
            url: `${BASE_URL}/blog/${post.slug}`,
          })),
        },
      },
      // Statistics
      statistics: {
        totalBlogPosts: blogPosts.length,
        totalSolutions: SOLUTIONS.length,
        totalFAQs: 3,
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json(knowledgeBase, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
      },
    });
  } catch (error) {
    console.error("Error generating knowledge base:", error);
    return NextResponse.json(
      {
        error: "Failed to generate knowledge base",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

