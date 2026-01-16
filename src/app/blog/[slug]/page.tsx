import type { Metadata } from "next";
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotionContent from "@/components/NotionContent";
import { BlogTracker } from "@/components/Analytics";
import VisualizationsSection from "@/components/VisualizationsSection";
import { BlogProvider } from "@/components/BlogContext";
import type { BlogPost } from "@/types/blog";

// SEO Helper: Extract meaningful keywords from title
function extractKeywordsFromTitle(title: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "by", "from", "as", "is", "was", "are", "were", "been", "be",
    "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
    "may", "might", "must", "shall", "can", "need", "dare", "ought", "used",
    "this", "that", "these", "those", "i", "you", "he", "she", "it", "we", "they",
    "what", "which", "who", "whom", "whose", "where", "when", "why", "how",
    "all", "each", "every", "both", "few", "more", "most", "other", "some", "such",
    "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very",
    "just", "also", "now", "here", "there", "then", "once", "about", "into", "over"
  ]);

  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ") // Remove special chars except hyphens
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .slice(0, 10); // Limit to 10 keywords
}

// SEO Helper: Estimate word count from Notion recordMap
function estimateWordCount(recordMap: BlogPost["recordMap"]): number {
  if (!recordMap?.block) return 0;

  let wordCount = 0;
  const blocks = Object.values(recordMap.block);

  for (const block of blocks) {
    const value = block?.value;
    if (!value) continue;

    // Extract text from various block types
    const textArrays = [
      value.properties?.title,
      value.properties?.caption,
    ].filter(Boolean);

    for (const textArray of textArrays) {
      if (Array.isArray(textArray)) {
        for (const segment of textArray) {
          if (Array.isArray(segment) && typeof segment[0] === "string") {
            wordCount += segment[0].split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
  }

  return wordCount || 500; // Default estimate if extraction fails
}

// SEO Helper: Calculate reading time in minutes
function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200; // Average reading speed
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO - Enhanced for better search ranking
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const fullUrl = `https://zkp.tokamak.network/blog/${slug}`;
  // Note: OG and Twitter images are dynamically generated via opengraph-image.tsx and twitter-image.tsx

  // Extract keywords from title for better relevance signals
  const titleKeywords = extractKeywordsFromTitle(post.title);

  // Combine title keywords with tags for comprehensive keyword coverage
  const allKeywords = [
    ...new Set([
      ...titleKeywords,
      ...post.tags.map(tag => tag.toLowerCase()),
      "tokamak network",
      "zk-evm",
      "zero knowledge",
      "blockchain",
      "ethereum",
      "layer 2",
    ]),
  ];

  // Generate optimized description that includes title keywords
  const optimizedDescription =
    post.description ||
    `${post.title} - Learn about ${titleKeywords.slice(0, 3).join(", ")} on the Tokamak zk-EVM blog. Expert insights on zero-knowledge proofs and privacy technology.`;

  return {
    title: post.title,
    description: optimizedDescription,
    keywords: allKeywords,
    authors: post.author ? [{ name: post.author }] : [{ name: "Tokamak Network" }],
    alternates: {
      canonical: fullUrl,
    },
    openGraph: {
      title: post.title,
      description: optimizedDescription,
      url: fullUrl,
      type: "article",
      publishedTime: post.publishDate,
      modifiedTime: post.publishDate,
      authors: post.author ? [post.author] : ["Tokamak Network"],
      section: "Technology",
      tags: post.tags,
      // Images are dynamically generated via opengraph-image.tsx
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: optimizedDescription,
      // Images are dynamically generated via twitter-image.tsx
    },
    // Additional robots directives for better indexing
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

// Generate comprehensive JSON-LD structured data for SEO
function generateBlogPostJsonLd(post: BlogPost, slug: string) {
  const postUrl = `https://zkp.tokamak.network/blog/${slug}`;
  const wordCount = estimateWordCount(post.recordMap);
  const readingTimeMinutes = calculateReadingTime(wordCount);
  const titleKeywords = extractKeywordsFromTitle(post.title);

  // Combine all keywords for schema
  const allKeywords = [...new Set([...titleKeywords, ...post.tags.map(t => t.toLowerCase())])].join(", ");

  return {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList for navigation - helps Google understand site structure
      {
        "@type": "BreadcrumbList",
        "@id": `${postUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://zkp.tokamak.network",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: "https://zkp.tokamak.network/blog",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: postUrl,
          },
        ],
      },
      // BlogPosting - more specific than Article for blog content
      {
        "@type": "BlogPosting",
        "@id": `${postUrl}#blogposting`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": postUrl,
        },
        headline: post.title,
        name: post.title,
        description: post.description || `${post.title} - Insights on zero-knowledge proofs and blockchain technology from Tokamak Network.`,
        image: {
          "@type": "ImageObject",
          url: post.coverImage || "https://zkp.tokamak.network/og-image.png",
          width: 1200,
          height: 630,
        },
        datePublished: post.publishDate,
        dateModified: post.publishDate,
        author: {
          "@type": "Person",
          name: post.author || "Tokamak Network",
          url: "https://tokamak.network",
        },
        publisher: {
          "@type": "Organization",
          name: "Tokamak Network",
          url: "https://tokamak.network",
          logo: {
            "@type": "ImageObject",
            url: "https://zkp.tokamak.network/assets/header/logo.svg",
            width: 200,
            height: 60,
          },
          sameAs: [
            "https://twitter.com/tokaboratory",
            "https://t.me/tokamak_network",
            "https://github.com/tokamak-network",
          ],
        },
        // SEO-critical fields for ranking
        keywords: allKeywords,
        wordCount: wordCount,
        timeRequired: `PT${readingTimeMinutes}M`, // ISO 8601 duration format
        articleSection: "Technology",
        articleBody: post.description,
        inLanguage: "en-US",
        // Enhanced fields for LLM SEO
        about: {
          "@type": "Thing",
          name: "Zero-Knowledge Proofs",
          description: "Cryptographic proof systems enabling privacy and scalability on Ethereum",
        },
        mentions: post.tags.map((tag) => ({
          "@type": "Thing",
          name: tag,
        })),
        // Content classification for better understanding
        genre: "Technical Article",
        educationalLevel: "Advanced",
        learningResourceType: "Article",
        // Related topics
        mainEntity: {
          "@type": "Thing",
          name: post.title,
          description: post.description,
        },
        isPartOf: {
          "@type": "Blog",
          "@id": "https://zkp.tokamak.network/blog#blog",
          name: "Tokamak zk-EVM Blog",
          url: "https://zkp.tokamak.network/blog",
        },
        // Speakable for voice search optimization
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".notion-page-content p:first-of-type"],
        },
        // Potential action for engagement
        potentialAction: {
          "@type": "ReadAction",
          target: postUrl,
        },
        // Creative work properties
        creativeWorkStatus: "Published",
        copyrightHolder: {
          "@type": "Organization",
          name: "Tokamak Network",
        },
        copyrightYear: new Date(post.publishDate).getFullYear().toString(),
      },
      // WebPage schema for the page itself
      {
        "@type": "WebPage",
        "@id": postUrl,
        url: postUrl,
        name: post.title,
        description: post.description,
        isPartOf: {
          "@type": "WebSite",
          "@id": "https://zkp.tokamak.network#website",
          name: "Tokamak Network ZKP",
          url: "https://zkp.tokamak.network",
        },
        breadcrumb: {
          "@id": `${postUrl}#breadcrumb`,
        },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: post.coverImage || "https://zkp.tokamak.network/og-image.png",
        },
      },
    ],
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const blogPostJsonLd = generateBlogPostJsonLd(post, slug);

  return (
    <BlogProvider
      slug={slug}
      title={post.title}
      authorEmail={post.authorEmail}
      author={post.author}
    >
      {/* JSON-LD Structured Data for BlogPosting with Breadcrumbs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostJsonLd) }}
      />
      <div className="min-h-screen">
        <Navbar />

        {/* Analytics: Track blog post engagement */}
        <BlogTracker
          slug={slug}
          title={post.title}
          tags={post.tags}
          author={post.author}
        />
        
        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)",
          }}
        >
          {/* Back Button */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#4fc3f7] hover:text-[#028bee] transition-colors font-semibold border-2 border-[#4fc3f7] hover:border-[#028bee] px-4 py-2"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <span>←</span>
              <span>Back to Blog</span>
            </Link>
          </div>

          {/* Cover Image */}

          {/* Article Header */}
          <article className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm bg-[#028bee] text-white"
                    style={{
                      fontFamily: '"IBM Plex Mono"',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl font-bold mb-6 text-white"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              {post.title}
            </h1>

            {/* Meta Information */}
            <div
              className="flex flex-wrap items-center gap-4 text-[#4fc3f7]/70 mb-8 pb-8 border-b-2 border-[#4fc3f7]"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>
                  {new Date(post.publishDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {post.author && (
                <>
                  <span>•</span>
                  <span>By {post.author}</span>
                </>
              )}
            </div>

            {/* Article Content - Rendered with react-notion-x */}
            {post.recordMap ? (
              <div className="notion-page-content">
                <NotionContent recordMap={post.recordMap} rootPageId={post.id} />
              </div>
            ) : (
              <div className="text-white text-center py-12">
                <p
                  className="text-lg mb-4"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Content is loading or temporarily unavailable.
                </p>
                <p
                  className="text-[#4fc3f7]/70"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Please refresh the page or try again later.
                </p>
              </div>
            )}

            {/* AI-Generated Visualizations */}
            <VisualizationsSection slug={slug} />

            {/* Back to Blog */}
            <div className="mt-16 pt-8 border-t-2 border-[#4fc3f7]">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-[#4fc3f7] hover:text-[#028bee] transition-colors font-semibold border-2 border-[#4fc3f7] hover:border-[#028bee] px-4 py-2"
                style={{
                  fontFamily: '"IBM Plex Mono"',
                }}
              >
                <span>←</span>
                <span>Back to all posts</span>
              </Link>
            </div>
          </article>

          {/* Rainbow Stripe at bottom */}
          <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
        </div>

        <Footer />
      </div>
    </BlogProvider>
  );
}

