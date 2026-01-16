import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/blog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogList from "@/components/BlogList";
import type { BlogPost } from "@/types/blog";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

const BASE_URL = "https://zkp.tokamak.network";

export const metadata: Metadata = {
  title: "Blog | Zero Knowledge Proof & zk-EVM Articles",
  description:
    "Expert insights on zero-knowledge proofs, zk-EVM development, Ethereum Layer 2 solutions, and blockchain privacy technology. Technical articles from Tokamak Network engineers.",
  keywords: [
    "tokamak blog",
    "zk-evm articles",
    "zero knowledge proofs tutorial",
    "blockchain technology blog",
    "privacy technology articles",
    "ethereum layer 2 blog",
    "web3 development tutorials",
    "zk-snark explained",
    "zkp blockchain",
    "crypto privacy solutions",
    "ethereum scalability",
    "rollup technology",
  ],
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
  openGraph: {
    title: "Blog | Tokamak zk-EVM - Zero Knowledge Proof Articles",
    description:
      "Expert insights on zero-knowledge proofs, zk-EVM development, and blockchain privacy technology from Tokamak Network.",
    url: `${BASE_URL}/blog`,
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tokamak zk-EVM Blog - Zero Knowledge Proof Articles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | Tokamak zk-EVM",
    description:
      "Expert insights on zero-knowledge proofs and blockchain privacy technology.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

// Generate comprehensive JSON-LD for blog listing with ItemList
function generateBlogListingJsonLd(posts: BlogPost[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList for navigation
      {
        "@type": "BreadcrumbList",
        "@id": `${BASE_URL}/blog#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${BASE_URL}/blog`,
          },
        ],
      },
      // Blog schema
      {
        "@type": "Blog",
        "@id": `${BASE_URL}/blog#blog`,
        mainEntityOfPage: `${BASE_URL}/blog`,
        name: "Tokamak zk-EVM Blog",
        description:
          "Expert insights on zero-knowledge proofs, zk-EVM development, and blockchain privacy technology from Tokamak Network.",
        url: `${BASE_URL}/blog`,
        inLanguage: "en-US",
        publisher: {
          "@type": "Organization",
          name: "Tokamak Network",
          url: "https://tokamak.network",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/assets/header/logo.svg`,
            width: 200,
            height: 60,
          },
          sameAs: [
            "https://twitter.com/tokaboratory",
            "https://t.me/tokamak_network",
            "https://github.com/tokamak-network",
          ],
        },
        // Link to individual blog posts
        blogPost: posts.slice(0, 10).map((post) => ({
          "@type": "BlogPosting",
          "@id": `${BASE_URL}/blog/${post.slug}#blogposting`,
          headline: post.title,
          url: `${BASE_URL}/blog/${post.slug}`,
          datePublished: post.publishDate,
          author: {
            "@type": "Person",
            name: post.author || "Tokamak Network",
          },
        })),
      },
      // ItemList for search engines to understand the collection
      {
        "@type": "ItemList",
        "@id": `${BASE_URL}/blog#itemlist`,
        name: "Tokamak Network Blog Posts",
        description: "Collection of articles about zero-knowledge proofs and blockchain technology",
        numberOfItems: posts.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: posts.slice(0, 20).map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: post.title,
          url: `${BASE_URL}/blog/${post.slug}`,
          item: {
            "@type": "BlogPosting",
            headline: post.title,
            description: post.description,
            url: `${BASE_URL}/blog/${post.slug}`,
            datePublished: post.publishDate,
            image: post.coverImage || `${BASE_URL}/og-image.png`,
            author: {
              "@type": "Person",
              name: post.author || "Tokamak Network",
            },
            keywords: post.tags.join(", "),
          },
        })),
      },
      // CollectionPage schema
      {
        "@type": "CollectionPage",
        "@id": `${BASE_URL}/blog`,
        url: `${BASE_URL}/blog`,
        name: "Tokamak zk-EVM Blog",
        description: "Expert insights on zero-knowledge proofs and blockchain technology",
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}#website`,
          name: "Tokamak Network ZKP",
          url: BASE_URL,
        },
        breadcrumb: {
          "@id": `${BASE_URL}/blog#breadcrumb`,
        },
        mainEntity: {
          "@id": `${BASE_URL}/blog#itemlist`,
        },
      },
    ],
  };
}

export default async function BlogPage() {
  console.log("\n🌐 [PAGE] ========== BLOG PAGE RENDERING ==========");
  console.log("🌐 [PAGE] Fetching blog posts...");

  const posts = await getBlogPosts();

  console.log("🌐 [PAGE] Received", posts.length, "posts");
  console.log("🌐 [PAGE] Posts:", posts.map(p => `"${p.title}"`).join(", "));
  console.log("🌐 [PAGE] ==========================================\n");

  // Generate dynamic JSON-LD with all blog posts for better indexing
  const blogListingJsonLd = generateBlogListingJsonLd(posts);

  return (
    <>
      {/* JSON-LD Structured Data with ItemList for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingJsonLd) }}
      />
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Cosmic Background with Stars */}
        <div
          className="relative overflow-hidden flex-grow"
          style={{
            background: "linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)",
          }}
        >
          {/* Cosmic Elements */}
          <div className="hidden md:block absolute text-white text-lg animate-pulse" style={{ top: "10%", left: "10%", animationDelay: "0s" }}>✦</div>
          <div className="hidden md:block absolute text-white text-sm animate-pulse" style={{ top: "20%", right: "15%", animationDelay: "1s" }}>✦</div>
          <div className="hidden md:block absolute text-white text-xl animate-pulse" style={{ top: "30%", left: "20%", animationDelay: "2s" }}>✦</div>
          <div className="hidden md:block absolute text-white text-lg animate-pulse" style={{ top: "15%", right: "25%", animationDelay: "0.5s" }}>+</div>
          <div className="hidden md:block absolute text-white text-sm animate-pulse" style={{ bottom: "40%", left: "15%", animationDelay: "1.5s" }}>+</div>

          {/* Header Section */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <h1
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] bg-clip-text text-transparent text-center"
              style={{
                fontFamily: '"Jersey 10", "Press Start 2P", monospace',
              }}
            >
              Blog
            </h1>
            <p
              className="text-white text-lg max-w-3xl mx-auto text-center"
              style={{
                fontFamily: '"IBM Plex Mono"',
                lineHeight: "1.6",
              }}
            >
              Latest insights, updates, and technical articles from Tokamak Network
            </p>
          </div>

          {/* Blog Posts with Filters */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            {posts.length === 0 ? (
              <div className="text-center py-20 min-h-[320px] flex items-center justify-center">
                <p
                  className="text-white text-lg"
                  style={{
                    fontFamily: '"IBM Plex Mono"',
                  }}
                >
                  No blog posts yet. Check back soon!
                </p>
              </div>
            ) : (
              <BlogList posts={posts} />
            )}
          </div>

          {/* Rainbow Stripe at bottom */}
          <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
        </div>

        <Footer />
      </div>
    </>
  );
}

