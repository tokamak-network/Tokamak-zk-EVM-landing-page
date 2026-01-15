import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://zkp.tokamak.network";

  return {
    rules: [
      // General crawlers - allow most content
      // Note: /api/knowledge is explicitly allowed for LLM SEO
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/check-new-posts", "/api/contact", "/api/generate-visuals", "/api/visualizations", "/_next/", "/static/"],
      },
      // Google - full access with specific directives
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*"],
        disallow: ["/api/"],
      },
      // Bing
      {
        userAgent: "Bingbot",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*"],
        disallow: ["/api/"],
      },
      // AI Training Crawlers - Explicitly allow for LLM SEO
      // These crawlers help ChatGPT, Claude, and other AI assistants discover and index content
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "Claude-Web",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/blog", "/blog/*", "/solutions", "/solutions/*", "/api/knowledge"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

