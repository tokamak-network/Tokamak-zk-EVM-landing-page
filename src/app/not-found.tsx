import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// SEO metadata for 404 page - important for crawl budget optimization
export const metadata: Metadata = {
  title: "Page Not Found | Tokamak Network ZKP",
  description:
    "The page you're looking for doesn't exist. Explore our zero-knowledge proof solutions, blog articles, and resources.",
  robots: {
    index: false, // Don't index 404 pages
    follow: true, // But follow links on the page
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="relative overflow-hidden flex-grow flex items-center justify-center"
        style={{
          background: "linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)",
        }}
      >
        {/* Cosmic Elements */}
        <div
          className="hidden md:block absolute text-white text-lg animate-pulse"
          style={{ top: "10%", left: "10%", animationDelay: "0s" }}
        >
          ✦
        </div>
        <div
          className="hidden md:block absolute text-white text-sm animate-pulse"
          style={{ top: "20%", right: "15%", animationDelay: "1s" }}
        >
          ✦
        </div>
        <div
          className="hidden md:block absolute text-white text-xl animate-pulse"
          style={{ top: "30%", left: "20%", animationDelay: "2s" }}
        >
          ✦
        </div>

        <div className="relative z-10 text-center px-4">
          <h1
            className="text-8xl md:text-9xl font-bold mb-4 bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] bg-clip-text text-transparent"
            style={{
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
            }}
          >
            404
          </h1>
          <h2
            className="text-2xl md:text-4xl font-bold mb-6 text-white"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            Page Not Found
          </h2>
          <p
            className="text-[#4fc3f7]/70 text-lg max-w-md mx-auto mb-8"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            The page you&apos;re looking for seems to have vanished into the
            zero-knowledge void.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-[#4fc3f7] hover:text-white transition-colors font-semibold border-2 border-[#4fc3f7] hover:border-[#028bee] hover:bg-[#028bee] px-6 py-3"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <span>←</span>
              <span>Back to Home</span>
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 text-white bg-[#028bee] hover:bg-[#0277bd] transition-colors font-semibold px-6 py-3"
              style={{
                fontFamily: '"IBM Plex Mono"',
              }}
            >
              <span>Explore Blog</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Rainbow Stripe at bottom */}
      <div className="w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>

      <Footer />
    </div>
  );
}
