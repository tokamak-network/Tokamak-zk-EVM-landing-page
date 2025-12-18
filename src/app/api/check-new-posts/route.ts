import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog";
import { getPostsWithoutVisualizations } from "@/lib/visualizations";
import { processBlogPosts } from "@/lib/process-blog-post";

/**
 * GET /api/check-new-posts
 * 
 * Cron job endpoint that checks for new blog posts and generates visualizations
 * This endpoint should be called periodically (e.g., every hour) by Vercel Cron
 * 
 * Security: Requires CRON_SECRET in Authorization header
 */
export async function GET(request: NextRequest) {
  console.log("\n⏰ [CRON] ========== CRON JOB STARTED ==========");
  console.log("⏰ [CRON] Time:", new Date().toISOString());
  
  try {
    // Step 1: Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error("❌ [CRON] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron job not configured" },
        { status: 500 }
      );
    }
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ [CRON] Unauthorized request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log("✅ [CRON] Authorization verified");
    
    // Step 2: Check if required services are configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ [CRON] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ [CRON] BLOB_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }
    
    console.log("✅ [CRON] All services configured");
    
    // Step 3: Fetch all published blog posts
    console.log("📚 [CRON] Fetching all blog posts...");
    const allPosts = await getBlogPosts();
    console.log("✅ [CRON] Found", allPosts.length, "published posts");
    
    if (allPosts.length === 0) {
      console.log("ℹ️  [CRON] No posts found, exiting");
      return NextResponse.json({
        message: "No blog posts found",
        processed: 0,
      });
    }
    
    // Step 4: Get posts without visualizations
    console.log("🔍 [CRON] Checking for posts without visualizations...");
    const allPostIds = allPosts.map((post) => post.id);
    const postsWithoutVisuals = await getPostsWithoutVisualizations(allPostIds);
    
    console.log("✅ [CRON] Found", postsWithoutVisuals.length, "posts without visualizations");
    
    if (postsWithoutVisuals.length === 0) {
      console.log("✅ [CRON] All posts already have visualizations");
      return NextResponse.json({
        message: "All posts already have visualizations",
        processed: 0,
        total: allPosts.length,
      });
    }
    
    // Step 5: Prepare posts for processing (limit to 5 per run to avoid timeouts and rate limits)
    const MAX_POSTS_PER_RUN = 5;
    const postsToProcess = postsWithoutVisuals.slice(0, MAX_POSTS_PER_RUN);
    
    console.log("🔄 [CRON] Processing", postsToProcess.length, "posts (max", MAX_POSTS_PER_RUN, "per run)");
    
    // Get full post details for processing
    const slugsWithIds = postsToProcess
      .map((postId) => {
        const post = allPosts.find((p) => p.id === postId);
        return post ? { slug: post.slug, postId: post.id } : null;
      })
      .filter((item): item is { slug: string; postId: string } => item !== null);
    
    // Step 6: Process posts
    console.log("🚀 [CRON] Starting visualization generation...");
    const results = await processBlogPosts(slugsWithIds);
    
    console.log("✅ [CRON] Processing complete!");
    console.log("📊 [CRON] Results:");
    console.log("   - Processed:", results.processed);
    console.log("   - Succeeded:", results.succeeded);
    console.log("   - Failed:", results.failed);
    console.log("⏰ [CRON] ==========================================\n");
    
    // Step 7: Return summary
    return NextResponse.json({
      message: "Cron job completed",
      totalPosts: allPosts.length,
      postsWithoutVisuals: postsWithoutVisuals.length,
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      errors: results.errors,
      remainingPosts: Math.max(0, postsWithoutVisuals.length - results.processed),
    });
  } catch (error) {
    console.error("❌ [CRON] Error in cron job:", error);
    console.error("⏰ [CRON] ==========================================\n");
    
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/check-new-posts
 * 
 * Manual trigger for testing (same as GET but with POST method)
 */
export async function POST(request: NextRequest) {
  return GET(request);
}
