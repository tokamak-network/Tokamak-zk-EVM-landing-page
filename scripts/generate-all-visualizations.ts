/**
 * Script to generate visualizations for ALL blog posts
 * 
 * Usage: npm run generate-all-visualizations
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

// Now import the modules that need env vars
async function main() {
  console.log("🚀 Starting visualization generation for all blog posts...\n");

  // Check required env vars
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is required");
    process.exit(1);
  }
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ BLOB_READ_WRITE_TOKEN is required");
    process.exit(1);
  }

  // Dynamic imports after env is loaded
  const { getBlogPosts } = await import("../src/lib/blog");
  const { getPostsWithoutVisualizations } = await import("../src/lib/visualizations");
  const { processBlogPosts } = await import("../src/lib/process-blog-post");

  try {
    // Step 1: Get all blog posts
    console.log("📚 Fetching all blog posts...");
    const allPosts = await getBlogPosts();
    console.log(`✅ Found ${allPosts.length} published posts:\n`);
    
    allPosts.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title} (${post.slug})`);
    });
    console.log("");

    // Step 2: Check which posts need visualizations
    console.log("🔍 Checking for posts without visualizations...");
    const allPostIds = allPosts.map((post) => post.id);
    const postsWithoutVisuals = await getPostsWithoutVisualizations(allPostIds);
    
    if (postsWithoutVisuals.length === 0) {
      console.log("✅ All posts already have visualizations!");
      return;
    }

    console.log(`\n📋 Found ${postsWithoutVisuals.length} posts without visualizations:\n`);
    
    // Get full post details
    const slugsWithIds = postsWithoutVisuals
      .map((postId) => {
        const post = allPosts.find((p) => p.id === postId);
        return post ? { slug: post.slug, postId: post.id, title: post.title } : null;
      })
      .filter((item): item is { slug: string; postId: string; title: string } => item !== null);

    slugsWithIds.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title}`);
    });
    console.log("");

    // Step 3: Process each post (with delay between to avoid rate limits)
    console.log("🎨 Starting visualization generation...\n");
    
    let succeeded = 0;
    let failed = 0;
    
    for (let i = 0; i < slugsWithIds.length; i++) {
      const post = slugsWithIds[i];
      console.log(`\n📝 [${i + 1}/${slugsWithIds.length}] Processing: ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      
      try {
        // Import and process one at a time to manage memory
        const { processBlogPost } = await import("../src/lib/process-blog-post");
        const result = await processBlogPost(post.slug, post.postId);
        
        if (result.success) {
          console.log(`   ✅ Success!`);
          succeeded++;
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
          failed++;
        }
      } catch (error) {
        console.error(`   ❌ Error:`, error);
        failed++;
      }

      // Wait 30 seconds between posts to avoid rate limits
      if (i < slugsWithIds.length - 1) {
        console.log("\n   ⏳ Waiting 30 seconds before next post (rate limit protection)...");
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    }

    // Summary
    console.log("\n" + "=".repeat(50));
    console.log("📊 GENERATION COMPLETE");
    console.log("=".repeat(50));
    console.log(`   Total posts: ${slugsWithIds.length}`);
    console.log(`   ✅ Succeeded: ${succeeded}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

main();
