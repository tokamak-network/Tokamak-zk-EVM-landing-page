import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://zkp.tokamak.network";

  return {
    rules: [
      // General crawlers - allow most content
      {
        userAgent: "*",
        allow: ["/", "/blog", "/blog/*"],
        disallow: ["/api/", "/_next/", "/static/"],
      },
      // Google - full access with specific directives
      {
        userAgent: "Googlebot",
        allow: ["/", "/blog", "/blog/*"],
        disallow: ["/api/"],
      },
      // Bing
      {
        userAgent: "Bingbot",
        allow: ["/", "/blog", "/blog/*"],
        disallow: ["/api/"],
      },
      // Block AI training crawlers (optional - uncomment if desired)
      // {
      //   userAgent: "GPTBot",
      //   disallow: ["/"],
      // },
      // {
      //   userAgent: "CCBot",
      //   disallow: ["/"],
      // },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

