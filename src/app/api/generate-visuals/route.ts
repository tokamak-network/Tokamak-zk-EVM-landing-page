import { NextRequest, NextResponse } from "next/server";
import { processBlogPost } from "@/lib/process-blog-post";
import { getVisualizationsBySlug } from "@/lib/visualizations";

/**
 * POST /api/generate-visuals
 * 
 * Manually trigger visualization generation for a specific blog post
 * Useful for testing and regenerating visualizations
 * 
 * Request body:
 * {
 *   "slug": "your-blog-post-slug",
 *   "postId": "optional-notion-page-id"
 * }
 */
export async function POST(request: NextRequest) {
  console.log("\n🔨 [MANUAL] ========== MANUAL TRIGGER ==========");
  
  try {
    // Parse request body
    const body = await request.json();
    const { slug, postId } = body;
    
    if (!slug) {
      return NextResponse.json(
        { error: "Missing required field: slug" },
        { status: 400 }
      );
    }
    
    console.log("🔨 [MANUAL] Triggering visualization generation for slug:", slug);
    if (postId) {
      console.log("🔨 [MANUAL] Using provided postId:", postId);
    }
    
    // Check if already generating or completed
    const existingMeta = await getVisualizationsBySlug(slug);
    if (existingMeta) {
      const hasVisuals = Object.keys(existingMeta.visualizations || {}).length > 0;
      
      console.log(`📊 [MANUAL] Existing metadata - status: ${existingMeta.status}, visuals count: ${Object.keys(existingMeta.visualizations || {}).length}`);
      
      // If completed WITH visualizations, don't regenerate
      if (existingMeta.status === "completed" && hasVisuals) {
        console.log("ℹ️  [MANUAL] Already completed with visuals for this slug");
        return NextResponse.json({
          success: true,
          message: "Visualizations already exist for this post",
          status: "completed",
          slug,
          visualizations: Object.keys(existingMeta.visualizations || {}),
        });
      }
      
      // If completed but NO visualizations (corrupted state), allow regeneration
      if (existingMeta.status === "completed" && !hasVisuals) {
        console.log("🔄 [MANUAL] Completed but no visuals (corrupted state), allowing regeneration...");
        // Continue to generate
      }
      
      // If generating and has visuals, don't start another generation
      if (existingMeta.status === "generating" && hasVisuals) {
        console.log("⚠️  [MANUAL] Already generating with visuals for this slug");
        return NextResponse.json({
          success: false,
          message: "Visualizations are already being generated for this post",
          status: "generating",
          slug,
        });
      }
      
      // If generating but no visuals (stuck state), allow retry
      if (existingMeta.status === "generating" && !hasVisuals) {
        console.log("🔄 [MANUAL] Retrying stuck generation (no visuals yet)");
        // Continue to generate - will override the stuck state
      }
    }
    
    // Check if required services are configured
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ [MANUAL] GEMINI_API_KEY not configured");
      return NextResponse.json(
        { error: "Gemini API not configured" },
        { status: 500 }
      );
    }
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("❌ [MANUAL] BLOB_READ_WRITE_TOKEN not configured");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }
    
    // Process the blog post
    console.log("🚀 [MANUAL] Starting visualization generation...");
    const result = await processBlogPost(slug, postId);
    
    if (result.success) {
      console.log("✅ [MANUAL] Successfully generated visualizations");
      console.log("🔨 [MANUAL] ==========================================\n");
      
      return NextResponse.json({
        success: true,
        message: "Visualizations generated successfully",
        slug,
      });
    } else {
      console.error("❌ [MANUAL] Failed to generate visualizations:", result.error);
      console.log("🔨 [MANUAL] ==========================================\n");
      
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          slug,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ [MANUAL] Error in manual trigger:", error);
    console.log("🔨 [MANUAL] ==========================================\n");
    
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
 * GET /api/generate-visuals
 * 
 * Show usage information
 */
export async function GET() {
  return NextResponse.json({
    message: "Manual visualization generation endpoint",
    usage: {
      method: "POST",
      contentType: "application/json",
      body: {
        slug: "your-blog-post-slug (required)",
        postId: "notion-page-id (optional)",
      },
      example: {
        slug: "introducing-tokamak-zkevm",
        postId: "abc123def456",
      },
    },
    endpoints: {
      post: "/api/generate-visuals",
      get_visualizations: "/api/visualizations/[slug]",
      cron_job: "/api/check-new-posts",
    },
  });
}
