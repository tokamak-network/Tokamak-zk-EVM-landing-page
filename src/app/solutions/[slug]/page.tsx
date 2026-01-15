import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SOLUTIONS, getSolutionBySlug } from "@/lib/solutions-content";
import SolutionVisualCard from "@/components/SolutionVisualCard";

const BASE_URL = "https://zkp.tokamak.network";

export function generateStaticParams() {
  return SOLUTIONS.map((s) => ({ slug: s.slug }));
}

// Generate comprehensive JSON-LD structured data for SEO
function generateSolutionJsonLd(solution: ReturnType<typeof getSolutionBySlug>) {
  if (!solution) return null;

  const solutionUrl = `${BASE_URL}/solutions/${solution.slug}`;
  const features = solution.page.sections.flatMap((s) => s.bullets || []);

  return {
    "@context": "https://schema.org",
    "@graph": [
      // BreadcrumbList for navigation
      {
        "@type": "BreadcrumbList",
        "@id": `${solutionUrl}#breadcrumb`,
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
            name: "Solutions",
            item: `${BASE_URL}/solutions`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: solution.pageTitle,
            item: solutionUrl,
          },
        ],
      },
      // SoftwareApplication schema
      {
        "@type": "SoftwareApplication",
        "@id": `${solutionUrl}#software`,
        name: solution.pageTitle,
        applicationCategory: "BlockchainApplication",
        applicationSubCategory: "Zero-Knowledge Proof Solution",
        operatingSystem: "Ethereum Virtual Machine",
        description: solution.seo.description,
        url: solutionUrl,
        featureList: features,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        provider: {
          "@type": "Organization",
          name: "Tokamak Network",
          url: "https://tokamak.network",
          logo: {
            "@type": "ImageObject",
            url: `${BASE_URL}/assets/header/logo.svg`,
            width: 200,
            height: 60,
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.8",
          ratingCount: "50",
          bestRating: "5",
          worstRating: "1",
        },
      },
      // WebPage schema
      {
        "@type": "WebPage",
        "@id": solutionUrl,
        url: solutionUrl,
        name: solution.seo.title,
        description: solution.seo.description,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${BASE_URL}#website`,
          name: "Tokamak Network ZKP",
          url: BASE_URL,
        },
        breadcrumb: {
          "@id": `${solutionUrl}#breadcrumb`,
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
          cssSelector: ["h1", ".hero-subheadline"],
        },
      },
      // Service schema
      {
        "@type": "Service",
        "@id": `${solutionUrl}#service`,
        name: solution.pageTitle,
        description: solution.seo.description,
        provider: {
          "@type": "Organization",
          name: "Tokamak Network",
          url: "https://tokamak.network",
        },
        serviceType: "Zero-Knowledge Proof Solution",
        areaServed: "Worldwide",
        availableChannel: {
          "@type": "ServiceChannel",
          serviceUrl: solution.page.links.primaryHref,
          serviceType: "GitHub Repository",
        },
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) return {};

  const canonical = `${BASE_URL}/solutions/${solution.slug}`;
  const keywords = [
    solution.pageTitle.toLowerCase(),
    solution.tagline.toLowerCase(),
    "tokamak network",
    "zero knowledge proof",
    "zkp",
    "ethereum",
    "blockchain",
    "privacy",
    "layer 2",
    ...solution.page.sections.flatMap((s) => 
      s.bullets?.map((b) => b.toLowerCase()) || []
    ),
  ].filter(Boolean);

  return {
    title: solution.seo.title,
    description: solution.seo.description,
    keywords: [...new Set(keywords)],
    authors: [{ name: "Tokamak Network", url: "https://tokamak.network" }],
    creator: "Tokamak Network",
    publisher: "Tokamak Network",
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: solution.seo.title,
      description: solution.seo.description,
      siteName: "Tokamak Network ZKP",
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${solution.pageTitle} - ${solution.tagline}`,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      site: "@TokamakZKPWorld",
      creator: "@TokamakZKPWorld",
      title: solution.seo.title,
      description: solution.seo.description,
      images: [`${BASE_URL}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    category: "Technology",
  };
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);
  if (!solution) notFound();

  const otherSolutions = SOLUTIONS.filter((s) => s.slug !== solution.slug).slice(0, 3);
  const solutionJsonLd = generateSolutionJsonLd(solution);

  return (
    <div className="min-h-screen">
      {/* JSON-LD Structured Data for SEO */}
      {solutionJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(solutionJsonLd) }}
        />
      )}
      <Navbar />

      <main>
        <section
          className="relative py-24 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, #0a1930 0%, #0d1f3c 55%, #0a1930 100%)",
            boxShadow: "0 -20px 60px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4fc3f7]/50 to-transparent" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #4fc3f7 1px, transparent 1px), linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          <div className="absolute top-1/4 left-1/4 w-[620px] h-[620px] bg-[#4fc3f7]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[520px] h-[520px] bg-[#029cdc]/6 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-10">
              <Link
                href="/solutions"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                <span aria-hidden="true">←</span>
                <span>Back to solutions</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-4 mb-5">
                  <span
                    className="text-[#4fc3f7] text-sm font-medium uppercase tracking-wider"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {solution.page.hero.eyebrow}
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#4fc3f7]/50 to-transparent" />
                </div>

                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
                  style={{
                    fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                  }}
                >
                  {solution.page.hero.headline}
                </h1>

                <p
                  className="text-lg md:text-xl text-white/70 leading-relaxed"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  {solution.page.hero.subheadline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <span
                    className="px-4 py-2 text-sm border border-white/15 bg-white/5 text-white/75"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    Zero knowledge
                  </span>
                  <span
                    className="px-4 py-2 text-sm border border-white/15 bg-white/5 text-white/75"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    Ethereum security
                  </span>
                  <span
                    className="px-4 py-2 text-sm border border-white/15 bg-white/5 text-white/75"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    Builder focused
                  </span>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <a
                    href={solution.page.links.primaryHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#028bee] hover:bg-[#0277d4] text-white font-semibold transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-[#028bee]/20 hover:shadow-xl hover:shadow-[#028bee]/30"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    <span>{solution.page.links.primaryLabel}</span>
                    <span aria-hidden="true">→</span>
                  </a>

                  {solution.page.links.secondaryHref &&
                  solution.page.links.secondaryLabel ? (
                    <a
                      href={solution.page.links.secondaryHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#4fc3f7]/45 text-white font-semibold transition-all duration-300"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      <span>{solution.page.links.secondaryLabel}</span>
                      <span aria-hidden="true">→</span>
                    </a>
                  ) : null}
                </div>

              </div>

              <div className="lg:col-span-5">
                <SolutionVisualCard
                  iconType={solution.iconType}
                  title={solution.pageTitle}
                  tagline={solution.tagline}
                />
              </div>
            </div>

            <div className="mt-16 space-y-6">
              {solution.page.sections.map((section) => (
                <section
                  key={section.title}
                  id={encodeURIComponent(section.title)}
                  className="relative bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] border border-white/10 p-8 md:p-10 overflow-hidden"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 md:opacity-100">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#4fc3f7]/7 rounded-full blur-3xl" />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#4fc3f7]" />
                      <h2
                        className="text-3xl md:text-4xl font-bold text-white"
                        style={{
                          fontFamily:
                            '"Jersey 10", "Press Start 2P", monospace',
                        }}
                      >
                        {section.title}
                      </h2>
                    </div>

                    <p
                      className="text-white/70 leading-relaxed max-w-4xl"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      {section.body}
                    </p>

                    {section.bullets && section.bullets.length > 0 ? (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {section.bullets.map((b) => (
                          <span
                            key={b}
                            className="px-4 py-2 text-sm border border-[#4fc3f7]/20 bg-[#4fc3f7]/8 text-white/85"
                            style={{ fontFamily: '"IBM Plex Mono"' }}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </section>
              ))}
            </div>

            {solution.page.video ? (
              <section className="mt-16">
                <div className="mb-8 text-center">
                  <h2
                    className="text-3xl md:text-4xl font-bold text-white mb-3"
                    style={{
                      fontFamily:
                        '"Jersey 10", "Press Start 2P", monospace',
                    }}
                  >
                    {solution.page.video.title}
                  </h2>
                  <p
                    className="text-white/70"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    Watch a quick walkthrough and see the workflow end to end.
                  </p>
                </div>

                <div className="w-full flex justify-center">
                  <div className="relative w-full max-w-5xl">
                    <div className="relative w-full pb-[56.25%] bg-[#0a1930] border-2 border-[#4fc3f7] shadow-lg hover:shadow-[#4fc3f7]/20 transition-all duration-300 overflow-hidden">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${solution.page.video.youtubeId}?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&playsinline=1&cc_load_policy=0&color=white&disablekb=1`}
                        title={solution.page.video.title}
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{
                          border: "none",
                          pointerEvents: "auto",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="mt-16">
              <div className="mb-10 text-center">
                <h2
                  className="text-3xl md:text-4xl font-bold text-white mb-3"
                  style={{
                    fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                  }}
                >
                  Explore more solutions
                </h2>
                <p
                  className="text-white/70"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Discover the rest of the Tokamak Network ZKP stack.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {otherSolutions.map((s) => (
                  <Link
                    key={s.slug}
                    href={`/solutions/${s.slug}`}
                    className="group bg-gradient-to-br from-[#0d1f3c] to-[#0a1628] border border-white/10 p-7 hover:border-[#4fc3f7]/45 hover:shadow-2xl hover:shadow-[#4fc3f7]/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span
                        className="text-[#4fc3f7] text-sm font-semibold"
                        style={{ fontFamily: '"IBM Plex Mono"' }}
                      >
                        {s.number}
                      </span>
                      <span className="text-[#4fc3f7] opacity-70 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3
                      className="text-2xl font-bold text-white mb-2"
                      style={{
                        fontFamily:
                          '"Jersey 10", "Press Start 2P", monospace',
                      }}
                    >
                      {s.pageTitle}
                    </h3>
                    <p
                      className="text-white/60 leading-relaxed"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      {s.description}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


