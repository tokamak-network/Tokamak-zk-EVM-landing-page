import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotionContent from "@/components/NotionContent";
import { BlogTracker } from "@/components/Analytics";
import VisualizationsSection from "@/components/VisualizationsSection";
import { BlogProvider } from "@/components/BlogContext";

// Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found - Tokamak Network",
    };
  }

  return {
    title: `${post.title} - Tokamak Network Blog`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <BlogProvider
      slug={slug}
      title={post.title}
      authorEmail={post.authorEmail}
      author={post.author}
    >
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

