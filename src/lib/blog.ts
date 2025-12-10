import { notion, notionAPI, DATABASE_ID } from "./notion";
import { BlogPost, NotionPage } from "@/types/blog";

// Type for Notion database response
interface NotionDatabase {
  title?: Array<{ plain_text?: string }>;
  data_sources?: Array<{ id: string }>;
}

// Get the blog environment from env variable (default to "Staging")
const BLOG_ENVIRONMENT = process.env.BLOG_ENVIRONMENT?.toLowerCase() === "prod" ? "Prod" : "Staging";

/**
 * Fetch all published blog posts from Notion
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  console.log("\n📚 [BLOG] ========== FETCHING BLOG POSTS ==========");
  console.log("📚 [BLOG] Database ID:", DATABASE_ID);
  console.log("📚 [BLOG] Environment:", BLOG_ENVIRONMENT);
  
  try {
    // First, retrieve the database to get data source IDs
    console.log("📚 [BLOG] Step 1: Retrieving database info...");
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    
    console.log("✅ [BLOG] Database retrieved:", (database as NotionDatabase).title?.[0]?.plain_text || "Untitled");
    console.log("📚 [BLOG] Data sources:", (database as NotionDatabase).data_sources?.length || 0);
    
    // Get the first data source ID
    const dataSourceId = (database as NotionDatabase).data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      console.error("❌ [BLOG] No data sources found in database");
      return [];
    }
    
    console.log("📚 [BLOG] Step 2: Querying data source:", dataSourceId);
    
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Published",
        select: {
          equals: BLOG_ENVIRONMENT,
        },
      },
      sorts: [
        {
          property: "PublishDate",
          direction: "descending",
        },
      ],
      page_size: 100, // Fetch up to 100 posts
    });

    console.log("✅ [BLOG] Query successful!");
    console.log("📚 [BLOG] Number of results:", response.results.length);

    const posts = response.results.map((page, index) => {
      console.log(`📄 [BLOG] Parsing post ${index + 1}...`);
      return parseNotionPage(page as unknown as NotionPage);
    });

    console.log("✅ [BLOG] Successfully fetched", posts.length, "blog posts");
    console.log("📚 [BLOG] ========================================\n");
    
    return posts;
  } catch (error) {
    console.error("\n❌ [BLOG] ERROR FETCHING BLOG POSTS:");
    console.error("❌ [BLOG] Error type:", error?.constructor?.name);
    console.error("❌ [BLOG] Error message:", error instanceof Error ? error.message : String(error));
    console.error("❌ [BLOG] Full error:", error);
    console.error("📚 [BLOG] ========================================\n");
    return [];
  }
}

/**
 * Helper function to fetch recordMap with retry logic
 */
async function fetchRecordMapWithRetry(pageId: string, maxRetries: number = 3): Promise<Awaited<ReturnType<typeof notionAPI.getPage>> | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📝 [BLOG] Fetching recordMap (attempt ${attempt}/${maxRetries})...`);
      const recordMap = await notionAPI.getPage(pageId);
      return recordMap;
    } catch (error) {
      console.error(`⚠️  [BLOG] RecordMap fetch attempt ${attempt} failed:`, error instanceof Error ? error.message : String(error));
      if (attempt < maxRetries) {
        const delay = attempt * 1000; // Exponential backoff: 1s, 2s, 3s
        console.log(`⏳ [BLOG] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return null;
}

/**
 * Fetch a single blog post by slug with full page content (recordMap)
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  console.log("\n📄 [BLOG] ========== FETCHING SINGLE POST ==========");
  console.log("📄 [BLOG] Slug:", slug);
  console.log("📄 [BLOG] Database ID:", DATABASE_ID);
  console.log("📄 [BLOG] Environment:", BLOG_ENVIRONMENT);
  
  try {
    // Retrieve database to get data source ID
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    
    const dataSourceId = (database as NotionDatabase).data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      console.error("❌ [BLOG] No data sources found");
      return null;
    }
    
    console.log("📄 [BLOG] Querying data source for slug...");
    
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        and: [
          {
            property: "Published",
            select: {
              equals: BLOG_ENVIRONMENT,
            },
          },
          {
            property: "Slug",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    console.log("📄 [BLOG] Query results:", response.results.length);

    if (response.results.length === 0) {
      console.log("⚠️  [BLOG] No post found with slug:", slug);
      console.log("📄 [BLOG] ================================================\n");
      return null;
    }

    const page = response.results[0] as unknown as NotionPage;
    console.log("📄 [BLOG] Parsing post metadata...");
    const post = parseNotionPage(page);

    // Fetch the page content as recordMap using unofficial client with retry
    const recordMap = await fetchRecordMapWithRetry(page.id);
    
    if (recordMap) {
      post.recordMap = recordMap;
      console.log("✅ [BLOG] Post fetched successfully!");
      console.log("📄 [BLOG] Title:", post.title);
      console.log("📄 [BLOG] RecordMap blocks:", Object.keys(recordMap.block || {}).length);
    } else {
      console.warn("⚠️  [BLOG] Could not fetch recordMap after retries, returning post without content");
    }
    
    console.log("📄 [BLOG] ================================================\n");
    return post;
  } catch (error) {
    console.error("\n❌ [BLOG] ERROR FETCHING SINGLE POST:");
    console.error("❌ [BLOG] Slug:", slug);
    console.error("❌ [BLOG] Error:", error);
    console.error("📄 [BLOG] ================================================\n");
    return null;
  }
}

/**
 * Get all slugs for static generation
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  console.log("\n🔗 [BLOG] ========== FETCHING ALL SLUGS ==========");
  console.log("🔗 [BLOG] Database ID:", DATABASE_ID);
  console.log("🔗 [BLOG] Environment:", BLOG_ENVIRONMENT);
  
  try {
    // Retrieve database to get data source ID
    const database = await notion.databases.retrieve({
      database_id: DATABASE_ID,
    });
    
    const dataSourceId = (database as NotionDatabase).data_sources?.[0]?.id;
    
    if (!dataSourceId) {
      console.error("❌ [BLOG] No data sources found");
      return [];
    }
    
    console.log("🔗 [BLOG] Querying data source...");
    
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: "Published",
        select: {
          equals: BLOG_ENVIRONMENT,
        },
      },
    });

    console.log("🔗 [BLOG] Found", response.results.length, "published posts");

    const slugs = response.results.map((page) => {
      const notionPage = page as unknown as NotionPage;
      const slug = notionPage.properties.Slug.rich_text[0]?.plain_text || "";
      console.log("🔗 [BLOG] Slug:", slug);
      return slug;
    });

    console.log("✅ [BLOG] Fetched", slugs.length, "slugs");
    console.log("🔗 [BLOG] ==========================================\n");
    
    return slugs;
  } catch (error) {
    console.error("\n❌ [BLOG] ERROR FETCHING SLUGS:");
    console.error("❌ [BLOG] Error:", error);
    console.error("🔗 [BLOG] ==========================================\n");
    return [];
  }
}

/**
 * Fetch recent blog posts (for homepage or sidebar)
 */
export async function getRecentBlogPosts(limit: number = 3): Promise<BlogPost[]> {
  console.log("\n📰 [BLOG] ========== FETCHING RECENT POSTS ==========");
  console.log("📰 [BLOG] Limit:", limit);
  
  const posts = await getBlogPosts();
  const recentPosts = posts.slice(0, limit);
  
  console.log("✅ [BLOG] Returning", recentPosts.length, "recent posts");
  console.log("📰 [BLOG] ==========================================\n");
  
  return recentPosts;
}

/**
 * Fetch blog posts filtered by tag
 */
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  console.log("\n🏷️  [BLOG] ========== FETCHING POSTS BY TAG ==========");
  console.log("🏷️  [BLOG] Tag:", tag);
  
  const posts = await getBlogPosts();
  const filteredPosts = posts.filter((post) => 
    post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
  
  console.log("✅ [BLOG] Found", filteredPosts.length, "posts with tag:", tag);
  console.log("🏷️  [BLOG] ==========================================\n");
  
  return filteredPosts;
}

/**
 * Parse Notion page to BlogPost
 */
function parseNotionPage(page: NotionPage): BlogPost {
  console.log("🔄 [PARSE] Parsing Notion page:", page.id);
  
  try {
    // Concatenate all title segments (fixes issue with colons and special characters)
    const title = page.properties.Title.title
      .map((text) => text.plain_text)
      .join("") || "Untitled";
    console.log("  📌 Title:", title);
    
    // Concatenate all slug segments
    const slug = page.properties.Slug.rich_text
      .map((text) => text.plain_text)
      .join("") || "";
    console.log("  📌 Slug:", slug);
    
    // Concatenate all description segments
    const description = page.properties.Description.rich_text
      .map((text) => text.plain_text)
      .join("") || "";
    console.log("  📌 Description:", description.substring(0, 50) + "...");
    
    const published = page.properties.Published.select?.name || "Staging";
    console.log("  📌 Published:", published);
    
    const publishDate = page.properties.PublishDate.date?.start || new Date().toISOString();
    console.log("  📌 Publish Date:", publishDate);
    
    const tags = page.properties.Tags.multi_select.map((tag) => tag.name);
    console.log("  📌 Tags:", tags.join(", "));
    
    // Concatenate all author segments
    const author = page.properties.Author?.rich_text
      ?.map((text) => text.plain_text)
      .join("") || "Tokamak Network";
    console.log("  📌 Author:", author);

    // Get cover image from property or page cover
    let coverImage = "";
    console.log("  🔍 Checking CoverImage property...");
    console.log("  🔍 CoverImage exists:", !!page.properties.CoverImage);
    console.log("  🔍 CoverImage.files:", page.properties.CoverImage?.files);
    
    if (page.properties.CoverImage?.files?.[0]) {
      const file = page.properties.CoverImage.files[0];
      console.log("  🔍 File object:", JSON.stringify(file, null, 2));
      coverImage = file.file?.url || file.external?.url || "";
      console.log("  📌 Cover Image (from property):", coverImage ? `✅ ${coverImage.substring(0, 50)}...` : "❌ Empty URL");
    } else if (page.cover) {
      console.log("  🔍 Page cover object:", JSON.stringify(page.cover, null, 2));
      coverImage = page.cover.file?.url || page.cover.external?.url || "";
      console.log("  📌 Cover Image (from page cover):", coverImage ? `✅ ${coverImage.substring(0, 50)}...` : "❌ Empty URL");
    } else {
      console.log("  📌 Cover Image: ❌ No image found in property or page cover");
    }

    console.log("✅ [PARSE] Successfully parsed page:", title);
    
    return {
      id: page.id,
      title,
      slug,
      description,
      published,
      publishDate,
      tags,
      coverImage,
      author,
    };
  } catch (error) {
    console.error("❌ [PARSE] Error parsing page:", error);
    throw error;
  }
}
