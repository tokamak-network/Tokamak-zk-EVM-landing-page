import { getBlogPosts } from "@/lib/blog";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Revalidate every 30 minutes (1800 seconds)
export const revalidate = 1800;

export const metadata = {
  title: "Blog - Tokamak Network",
  description: "Latest insights, updates, and technical articles from Tokamak Network",
};

export default async function BlogPage() {
  console.log("\n🌐 [PAGE] ========== BLOG PAGE RENDERING ==========");
  console.log("🌐 [PAGE] Fetching blog posts...");
  
  const posts = await getBlogPosts();
  
  console.log("🌐 [PAGE] Received", posts.length, "posts");
  console.log("🌐 [PAGE] Posts:", posts.map(p => `"${p.title}"`).join(", "));
  console.log("🌐 [PAGE] ==========================================\n");

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Cosmic Background with Stars */}
      <div
        className="relative overflow-hidden"
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
            className="text-white text-lg max-w-2xl mx-auto text-center"
            style={{
              fontFamily: '"IBM Plex Mono"',
              lineHeight: "1.6",
            }}
          >
            Latest insights, updates, and technical articles from Tokamak Network
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {posts.length === 0 ? (
            <div className="text-center">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group relative bg-gradient-to-b from-[#0a1930] to-[#1a2347] border-2 border-[#4fc3f7] hover:border-[#029bee] transition-all duration-300 hover:shadow-lg hover:shadow-[#4fc3f7]/20 overflow-hidden"
                >
                  {/* Cover Image */}
                  {post.coverImage && (
                    <div className="w-full h-48 overflow-hidden border-b-2 border-[#4fc3f7]">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-[#028bee] text-white"
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
                    <h2
                      className="text-2xl font-bold mb-3 text-[#4fc3f7] group-hover:text-[#29b6f6] transition-colors"
                      style={{
                        fontFamily: '"IBM Plex Mono"',
                      }}
                    >
                      {post.title}
                    </h2>

                    {/* Description */}
                    <p
                      className="text-white mb-4 line-clamp-3"
                      style={{
                        fontFamily: '"IBM Plex Mono"',
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                      }}
                    >
                      {post.description}
                    </p>

                    {/* Meta */}
                    <div
                      className="flex items-center gap-4 text-sm text-[#4fc3f7]/70"
                      style={{
                        fontFamily: '"IBM Plex Mono"',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        {new Date(post.publishDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {post.author && (
                        <>
                          <span>•</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>

                    {/* Read More */}
                    <div className="mt-4 inline-flex items-center gap-2 text-[#4fc3f7] group-hover:text-[#028bee] transition-all font-semibold" style={{ fontFamily: '"IBM Plex Mono"' }}>
                      <span>Read more →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Rainbow Stripe at bottom */}
        <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
      </div>

      <Footer />
    </div>
  );
}

