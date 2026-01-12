import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://zkp.tokamak.network";

  // Static pages - only include actual crawlable URLs (not hash fragments)
  // Google doesn't treat hash URLs as separate pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Fetch blog posts dynamically - these are the main SEO target
  let blogPosts: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts();
    blogPosts = posts.map((post, index) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: "weekly" as const, // Changed from monthly for better crawling
      // Higher priority for recent posts (first 5 get 0.9, rest get 0.8)
      priority: index < 5 ? 0.9 : 0.8,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    // Continue with static pages if blog fetch fails
  }

  return [...staticPages, ...blogPosts];
}

