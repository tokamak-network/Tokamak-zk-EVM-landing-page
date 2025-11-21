import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen">
      <Navbar />
      
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)",
        }}
      >
        
        {/* Back Button */}
        <div className="relative z-10  max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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
        {post.coverImage && (
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="aspect-video w-full overflow-hidden border-2 border-[#4fc3f7] relative">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Article Header */}
        <article className="relative z-10  max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            className="text-4xl md:text-6xl font-bold mb-6 text-[#4fc3f7]"
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

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none" style={{ fontFamily: '"IBM Plex Mono"' }}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1
                    className="text-4xl font-bold mt-12 mb-6 text-[#4fc3f7]"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2
                    className="text-3xl font-bold mt-10 mb-4 text-[#4fc3f7]"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    className="text-2xl font-bold mt-8 mb-3 text-[#4fc3f7]"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    className="text-white leading-relaxed mb-6"
                    style={{ fontFamily: '"IBM Plex Mono"', lineHeight: "1.8" }}
                  >
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-[#4fc3f7] hover:text-[#028bee] underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {children}
                  </a>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 mb-6 text-white" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 mb-6 text-white" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4">
                    {children}
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#4fc3f7] pl-6 py-2 my-6 bg-[#028bee]/10" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    {children}
                  </blockquote>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="px-2 py-1 bg-[#028bee] text-white text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={`${className} block p-4 bg-[#0a1930] border-2 border-[#4fc3f7] overflow-x-auto text-sm text-white`}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-[#0a1930] border-2 border-[#4fc3f7] p-4 overflow-x-auto my-6">
                    {children}
                  </pre>
                ),
                img: ({ src, alt }) => {
                  const imageSrc = typeof src === 'string' ? src : '';
                  return (
                    <span className="block relative w-full" style={{ minHeight: '400px' }}>
                      <Image
                        src={imageSrc}
                        alt={alt || ""}
                        width={1200}
                        height={600}
                        className="border-2 border-[#4fc3f7] my-8 w-full h-auto"
                      />
                    </span>
                  );
                },
                hr: () => (
                  <hr className="border-[#4fc3f7] my-8" />
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border-2 border-[#4fc3f7]" style={{ fontFamily: '"IBM Plex Mono"' }}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border border-[#4fc3f7] px-4 py-2 bg-[#028bee] text-left font-semibold text-white">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border border-[#4fc3f7] px-4 py-2 text-white">
                    {children}
                  </td>
                ),
              }}
            >
              {post.content || ""}
            </ReactMarkdown>
          </div>

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
  );
}

