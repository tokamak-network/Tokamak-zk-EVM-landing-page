import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SOLUTIONS } from "@/lib/solutions-content";

const BASE_URL = "https://zkp.tokamak.network";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Explore Tokamak Network zero knowledge solutions for Ethereum. Learn about private app channels, zk EVM tooling, threshold signatures, and zk SNARK foundations.",
  alternates: {
    canonical: `${BASE_URL}/solutions`,
  },
  openGraph: {
    url: `${BASE_URL}/solutions`,
  },
};

export default function SolutionsIndexPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <section
          className="relative py-24 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #0a1930 0%, #0d1f3c 50%, #0a1930 100%)",
            boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4fc3f7]/50 to-transparent" />

          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #4fc3f7 1px, transparent 1px), linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#4fc3f7]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#029cdc]/6 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-16 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#4fc3f7]" />
                <span
                  className="text-[#4fc3f7] text-sm font-medium uppercase tracking-wider"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Solutions
                </span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#4fc3f7]" />
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                style={{
                  fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                }}
              >
                Four Pillars of <span className="text-[#4fc3f7]">Privacy</span>
              </h1>

              <p
                className="text-lg text-white/60 max-w-3xl mx-auto"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                Explore detailed pages for each solution and learn how Tokamak
                Network brings scalable privacy and verification to Ethereum.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {SOLUTIONS.map((s) => (
                <Link
                  key={s.slug}
                  href={`/solutions/${s.slug}`}
                  className="group relative bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] border border-white/10 p-8 transition-all duration-300 hover:border-[#4fc3f7]/50 hover:shadow-2xl hover:shadow-[#4fc3f7]/10"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 50%, rgba(79, 195, 247, 0.08) 0%, transparent 70%)",
                    }}
                  />

                  <div className="relative z-10">
                    <div className="mb-4">
                      <span
                        className="text-[#4fc3f7] font-mono text-xl"
                        style={{ fontFamily: '"IBM Plex Mono"' }}
                      >
                        {s.number}
                      </span>
                    </div>

                    <h2
                      className="text-2xl md:text-3xl font-bold text-white mb-2"
                      style={{
                        fontFamily:
                          '"Jersey 10", "Press Start 2P", monospace',
                      }}
                    >
                      {s.pageTitle}
                    </h2>

                    <p
                      className="text-[#4fc3f7] text-base font-medium mb-5"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      {s.tagline}
                    </p>

                    <p
                      className="text-white/60 leading-relaxed"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      {s.description}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-[#4fc3f7] font-semibold"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      <span>View details</span>
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


